import { z } from "zod";
import { router, protectedProcedure } from "@/lib/trpc";
import { TRPCError } from "@trpc/server";
import { seedTasksForGoal, seedFutureTasksForGoal } from "@/server/lib/task-seeder";

export const goalsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const goals = await ctx.db.goal.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        streaks: true,
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return goals;
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const goal = await ctx.db.goal.findUnique({
        where: { id: input.id },
        include: {
          tasks: { orderBy: { scheduledDate: "desc" }, take: 30 },
          streaks: true,
          milestones: true,
        },
      });

      if (!goal || goal.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return goal;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        category: z.string(),
        frequency: z.string().regex(/^(daily|weekly:[1-7]|custom:[0-9,]+)$/),
        estimatedMinutes: z.number().min(1).max(180).optional(),
        difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const goal = await ctx.db.goal.create({
        data: {
          userId: ctx.session.user.id,
          ...input,
        },
      });

      await ctx.db.streak.create({
        data: {
          userId: ctx.session.user.id,
          goalId: goal.id,
        },
      });

      const taskCount = await seedTasksForGoal(ctx.db, goal);

      return { goal, tasksCreated: taskCount.length };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        title: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional(),
        category: z.string().optional(),
        frequency: z.string().regex(/^(daily|weekly:[1-7]|custom:[0-9,]+)$/).optional(),
        estimatedMinutes: z.number().min(1).max(180).optional(),
        difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional(),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const existing = await ctx.db.goal.findUnique({ where: { id } });
      if (!existing || existing.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (updates.frequency && updates.frequency !== existing.frequency) {
        await ctx.db.task.deleteMany({
          where: {
            goalId: id,
            status: "pending",
            scheduledDate: { gt: new Date() },
          },
        });

        const updatedGoal = await ctx.db.goal.update({
          where: { id },
          data: updates,
        });

        await seedTasksForGoal(ctx.db, updatedGoal);

        return updatedGoal;
      }

      return ctx.db.goal.update({
        where: { id },
        data: updates,
      });
    }),

  pause: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.goal.findUnique({ where: { id: input.id } });
      if (!existing || existing.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return ctx.db.goal.update({
        where: { id: input.id },
        data: { status: "paused" },
      });
    }),

  resume: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.goal.findUnique({ where: { id: input.id } });
      if (!existing || existing.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await seedFutureTasksForGoal(ctx.db, input.id);

      return ctx.db.goal.update({
        where: { id: input.id },
        data: { status: "active" },
      });
    }),

  complete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.goal.findUnique({ where: { id: input.id } });
      if (!existing || existing.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return ctx.db.goal.update({
        where: { id: input.id },
        data: { status: "completed" },
      });
    }),

  archive: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.goal.findUnique({ where: { id: input.id } });
      if (!existing || existing.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return ctx.db.goal.update({
        where: { id: input.id },
        data: { status: "archived" },
      });
    }),
});
