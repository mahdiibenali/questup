import { z } from "zod";
import { router, protectedProcedure } from "@/lib/trpc";
import { TRPCError } from "@trpc/server";
import { verifyProof, completeTaskWithVerification } from "@/server/lib/ai-verification";
import { selectPeerReviewers } from "@/server/lib/friends";

export const tasksRouter = router({
  today: protectedProcedure
    .input(
      z
        .object({
          sortBy: z.enum(["time", "category", "priority"]).optional(),
          category: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const where: Record<string, unknown> = {
        userId: ctx.session.user.id,
        scheduledDate: { gte: today, lt: tomorrow },
      };

      if (input?.category) {
        where.goal = { category: input.category };
      }

      const tasks = await ctx.db.task.findMany({
        where,
        include: { goal: { select: { title: true, category: true, difficulty: true } } },
        orderBy:
          input?.sortBy === "category"
            ? { goal: { category: "asc" } }
            : { scheduledDate: "asc" },
      });

      return tasks;
    }),

  byGoal: protectedProcedure
    .input(
      z.object({
        goalId: z.string().cuid(),
        cursor: z.string().optional(),
        limit: z.number().max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const goal = await ctx.db.goal.findUnique({ where: { id: input.goalId } });
      if (!goal || goal.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const tasks = await ctx.db.task.findMany({
        where: { goalId: input.goalId },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { scheduledDate: "desc" },
      });

      let nextCursor: string | undefined;
      if (tasks.length > input.limit) {
        const next = tasks.pop();
        nextCursor = next?.id;
      }

      return { tasks, nextCursor };
    }),

  submitProof: protectedProcedure
    .input(
      z.object({
        taskId: z.string().cuid(),
        proofUrl: z.string().url().refine((url) => url.includes("cloudinary.com"), {
          message: "Must be a Cloudinary URL",
        }),
        proofText: z
          .string()
          .min(10, "Proof text must be at least 10 characters")
          .max(500, "Proof text must be at most 500 characters")
          .optional(),
        proofGps: z
          .object({
            lat: z.number().min(-90).max(90),
            lng: z.number().min(-180).max(180),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.task.findUnique({
        where: { id: input.taskId },
        include: { goal: true, user: true },
      });

      if (!task || task.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (task.status !== "pending" && task.status !== "rejected") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Task cannot receive proof in current status" });
      }

      const updatedTask = await ctx.db.task.update({
        where: { id: input.taskId },
        data: {
          status: "completed",
          completedAt: new Date(),
          proofUrl: input.proofUrl,
          proofText: input.proofText,
          proofGps: input.proofGps ? JSON.stringify(input.proofGps) : undefined,
          submissionCount: { increment: 1 },
        },
      });

      const verification = await verifyProof(
        input.proofUrl,
        input.proofText ?? null,
        task.goal.title,
        task.goal.category,
      );

      await ctx.db.task.update({
        where: { id: input.taskId },
        data: {
          aiConfidence: verification.aiConfidence,
          aiVerified: verification.aiVerified,
          aiRejectionReason: verification.aiRejectionReason,
          aiRationale: verification.aiRationale,
        },
      });

      if (!verification.aiVerified) {
        await ctx.db.task.update({
          where: { id: input.taskId },
          data: { status: "rejected" },
        });

        return {
          task: updatedTask,
          verificationStatus: "rejected" as const,
          aiConfidence: verification.aiConfidence,
          aiRejectionReason: verification.aiRejectionReason,
          xpEarned: 0,
        };
      }

      const result = await completeTaskWithVerification(ctx.db, input.taskId);

      return {
        task: await ctx.db.task.findUnique({ where: { id: input.taskId } }),
        verificationStatus: "verified" as const,
        aiConfidence: verification.aiConfidence,
        xpEarned: result.xpEarned,
        levelsGained: result.levelsGained,
        levelUps: result.levelUps,
        milestoneReached: result.milestoneReached,
        achievementIds: result.achievementIds,
      };
    }),

  resubmitProof: protectedProcedure
    .input(
      z.object({
        taskId: z.string().cuid(),
        proofUrl: z.string().url(),
        proofText: z.string().min(10).max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.task.findUnique({
        where: { id: input.taskId },
        include: { goal: true },
      });

      if (!task || task.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (task.submissionCount !== 1 || task.status !== "rejected") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only resubmit once after rejection",
        });
      }

      await ctx.db.task.update({
        where: { id: input.taskId },
        data: {
          status: "completed",
          completedAt: new Date(),
          proofUrl: input.proofUrl,
          proofText: input.proofText,
          submissionCount: { increment: 1 },
          aiRejectionReason: null,
          aiConfidence: null,
        },
      });

      const verification = await verifyProof(
        input.proofUrl,
        input.proofText ?? null,
        task.goal.title,
        task.goal.category,
      );

      await ctx.db.task.update({
        where: { id: input.taskId },
        data: {
          aiConfidence: verification.aiConfidence,
          aiVerified: verification.aiVerified,
          aiRejectionReason: verification.aiRejectionReason,
          aiRationale: verification.aiRationale,
        },
      });

      if (!verification.aiVerified) {
        await ctx.db.task.update({
          where: { id: input.taskId },
          data: { status: "rejected" },
        });

        return {
          task: await ctx.db.task.findUnique({ where: { id: input.taskId } }),
          verificationStatus: "rejected" as const,
          aiConfidence: verification.aiConfidence,
          xpEarned: 0,
          peerReviewAvailable: true,
        };
      }

      const result = await completeTaskWithVerification(ctx.db, input.taskId);

      return {
        task: await ctx.db.task.findUnique({ where: { id: input.taskId } }),
        verificationStatus: "verified" as const,
        aiConfidence: verification.aiConfidence,
        xpEarned: result.xpEarned,
        levelsGained: result.levelsGained,
        levelUps: result.levelUps,
        milestoneReached: result.milestoneReached,
        achievementIds: result.achievementIds,
      };
    }),

  requestPeerReview: protectedProcedure
    .input(z.object({ taskId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.task.findUnique({ where: { id: input.taskId } });

      if (!task || task.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (task.submissionCount < 2 || task.peerReviewRequested) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Peer review requires 2+ rejections and no prior request",
        });
      }

      const reviewerIds = await selectPeerReviewers(
        ctx.db,
        input.taskId,
        ctx.session.user.id,
        3,
      );

      if (reviewerIds.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No eligible friends available for peer review",
        });
      }

      await ctx.db.peerReview.createMany({
        data: reviewerIds.map((reviewerId) => ({
          taskId: input.taskId,
          reviewerId,
          verdict: null,
        })),
      });

      await ctx.db.task.update({
        where: { id: input.taskId },
        data: { peerReviewRequested: true },
      });

      return { peerReviewCount: reviewerIds.length };
    }),

  submitPeerReview: protectedProcedure
    .input(
      z.object({
        taskId: z.string().cuid(),
        verdict: z.enum(["verified", "rejected"]),
        comment: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.task.findUnique({ where: { id: input.taskId } });
      if (!task) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (task.userId === ctx.session.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot review your own task" });
      }

      const existingReview = await ctx.db.peerReview.findFirst({
        where: {
          taskId: input.taskId,
          reviewerId: ctx.session.user.id,
        },
      });

      if (!existingReview) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not assigned to review this task" });
      }

      if (existingReview.verdict !== null) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Already submitted review" });
      }

      await ctx.db.peerReview.update({
        where: { id: existingReview.id },
        data: {
          verdict: input.verdict,
          comment: input.comment,
        },
      });

      const allReviews = await ctx.db.peerReview.findMany({
        where: { taskId: input.taskId, verdict: { not: null } },
      });

      const totalAssigned = await ctx.db.peerReview.count({
        where: { taskId: input.taskId },
      });

      const verifiedCount = allReviews.filter((r) => r.verdict === "verified").length;
      const majority = Math.ceil(totalAssigned / 2);
      const canFinalize = allReviews.length >= totalAssigned || verifiedCount >= majority || (totalAssigned - verifiedCount) >= majority;

      if (canFinalize) {
        const finalVerdict = verifiedCount >= majority ? "verified" : "rejected";

        await ctx.db.task.update({
          where: { id: input.taskId },
          data: {
            peerReviewVerdict: finalVerdict,
            aiVerified: finalVerdict === "verified",
          },
        });

        if (finalVerdict === "verified") {
          const result = await completeTaskWithVerification(ctx.db, input.taskId);
          return {
            task: await ctx.db.task.findUnique({ where: { id: input.taskId } }),
            finalized: true,
            finalVerdict,
            xpEarned: result.xpEarned,
            levelsGained: result.levelsGained,
          };
        }
      }

      return {
        task: await ctx.db.task.findUnique({ where: { id: input.taskId } }),
        finalized: false,
        finalVerdict: null as string | null,
      };
    }),
});
