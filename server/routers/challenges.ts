import { z } from "zod";
import { router, protectedProcedure } from "@/lib/trpc";
import { TRPCError } from "@trpc/server";
import { processXpGain } from "@/server/lib/xp-engine";
import { checkAndAwardAchievements } from "@/server/lib/achievements";
import { PERFECT_DAY_XP_BONUS } from "@/lib/constants";

export const challengesRouter = router({
  today: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const challenges = await ctx.db.challenge.findMany({
      where: {
        userId: ctx.session.user.id,
        date: today,
      },
      orderBy: { createdAt: "asc" },
    });

    return challenges;
  }),

  complete: protectedProcedure
    .input(z.object({ challengeId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const challenge = await ctx.db.challenge.findUnique({
        where: { id: input.challengeId },
      });

      if (!challenge || challenge.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (challenge.status !== "pending") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Challenge already completed or missed" });
      }

      const updated = await ctx.db.challenge.update({
        where: { id: input.challengeId },
        data: {
          status: "completed",
          completedAt: new Date(),
        },
      });

      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      const xpProgress = processXpGain(
        user.totalXp,
        user.level,
        user.currentLevelXp,
        challenge.xpReward,
      );

      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          totalXp: xpProgress.newTotalXp,
          level: xpProgress.newLevel,
          currentLevelXp: xpProgress.newCurrentLevelXp,
        },
      });

      await ctx.db.xpTransaction.create({
        data: {
          userId: ctx.session.user.id,
          amount: challenge.xpReward,
          sourceType: "challenge",
          sourceId: challenge.id,
        },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayChallenges = await ctx.db.challenge.findMany({
        where: {
          userId: ctx.session.user.id,
          date: today,
        },
      });

      const allCompleted =
        todayChallenges.length === 3 &&
        todayChallenges.every((c) => c.status === "completed");

      let perfectDayXp = 0;
      let perfectDayProgress = null;

      if (allCompleted) {
        perfectDayProgress = processXpGain(
          xpProgress.newTotalXp,
          xpProgress.newLevel,
          xpProgress.newCurrentLevelXp,
          PERFECT_DAY_XP_BONUS,
        );

        await ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data: {
            totalXp: perfectDayProgress.newTotalXp,
            level: perfectDayProgress.newLevel,
            currentLevelXp: perfectDayProgress.newCurrentLevelXp,
          },
        });

        await ctx.db.xpTransaction.create({
          data: {
            userId: ctx.session.user.id,
            amount: PERFECT_DAY_XP_BONUS,
            sourceType: "bonus",
            metadata: JSON.stringify({ type: "perfect_day" }),
          },
        });

        perfectDayXp = PERFECT_DAY_XP_BONUS;
      }

      const achievements = await checkAndAwardAchievements(ctx.db, ctx.session.user.id);

      const allLevelUps = [
        ...xpProgress.levelUps,
        ...(perfectDayProgress?.levelUps ?? []),
      ];

      return {
        challenge: updated,
        xpEarned: challenge.xpReward + perfectDayXp,
        perfectDay: allCompleted,
        levelUps: allLevelUps,
        levelsGained: xpProgress.levelsGained + (perfectDayProgress?.levelsGained ?? 0),
        achievementIds: achievements.map((a) => a.key),
      };
    }),

  history: protectedProcedure
    .input(z.object({ days: z.number().max(30).default(7) }).optional())
    .query(async ({ ctx, input }) => {
      const days = input?.days ?? 7;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const challenges = await ctx.db.challenge.findMany({
        where: {
          userId: ctx.session.user.id,
          date: { gte: startDate },
        },
        orderBy: { date: "desc" },
      });

      return {
        completed: challenges.filter((c) => c.status === "completed").length,
        missed: challenges.filter((c) => c.status === "missed").length,
        total: challenges.length,
        challenges,
      };
    }),
});
