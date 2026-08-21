import { z } from "zod";
import { router, protectedProcedure } from "@/lib/trpc";
import { redis } from "@/lib/redis";
import { XP_TO_LEVEL } from "@/lib/constants";

export const analyticsRouter = router({
  xpTimeline: protectedProcedure
    .input(
      z.object({
        days: z.number().min(7).max(365).default(30),
        granularity: z.enum(["day", "week", "month"]).default("day"),
      })
    )
    .query(async ({ ctx, input }) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const transactions = await ctx.db.xpTransaction.findMany({
        where: {
          userId: ctx.session.user.id,
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: "asc" },
      });

      // Group by date bucket
      const buckets: Record<string, { xp: number; taskCount: number; cumulativeXp: number }> = {};
      let cumulative = 0;

      for (const tx of transactions) {
        const date = tx.createdAt.toISOString().split("T")[0];
        if (!buckets[date]) {
          buckets[date] = { xp: 0, taskCount: 0, cumulativeXp: 0 };
        }
        buckets[date].xp += tx.amount;
        buckets[date].taskCount += 1;
      }

      // Calculate cumulative
      const data = Object.entries(buckets).map(([date, bucket]) => {
        cumulative += bucket.xp;
        return { date, xp: bucket.xp, cumulativeXp: cumulative, taskCount: bucket.taskCount };
      });

      return { data };
    }),

  habitHeatmap: protectedProcedure
    .input(z.object({ year: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const year = input.year ?? new Date().getFullYear();
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year + 1, 0, 1);

      const tasks = await ctx.db.task.findMany({
        where: {
          userId: ctx.session.user.id,
          scheduledDate: { gte: startDate, lt: endDate },
        },
        select: {
          scheduledDate: true,
          status: true,
          xpEarned: true,
        },
      });

      // Group by date
      const dayMap: Record<string, { xp: number; taskCount: number; completionCount: number }> = {};

      for (const task of tasks) {
        const date = task.scheduledDate.toISOString().split("T")[0];
        if (!dayMap[date]) {
          dayMap[date] = { xp: 0, taskCount: 0, completionCount: 0 };
        }
        dayMap[date].taskCount += 1;
        if (task.status === "completed") {
          dayMap[date].completionCount += 1;
          dayMap[date].xp += task.xpEarned ?? 0;
        }
      }

      const data = Object.entries(dayMap).map(([date, stats]) => ({
        date,
        ...stats,
      }));

      return { data };
    }),

  categoryRadar: protectedProcedure
    .input(z.object({ days: z.number().min(7).max(90).default(30) }))
    .query(async ({ ctx, input }) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const goals = await ctx.db.goal.findMany({
        where: { userId: ctx.session.user.id, status: { not: "archived" } },
        include: {
          tasks: {
            where: { scheduledDate: { gte: startDate } },
            select: { status: true, xpEarned: true },
          },
        },
      });

      const data = goals.map((goal) => {
        const total = goal.tasks.length;
        const completed = goal.tasks.filter((t) => t.status === "completed").length;
        const xpEarned = goal.tasks.reduce((sum, t) => sum + (t.xpEarned ?? 0), 0);

        return {
          category: goal.category,
          completionRate: total > 0 ? completed / total : 0,
          totalTasks: total,
          completedTasks: completed,
          xpEarned,
        };
      });

      return { data };
    }),

  streakStats: protectedProcedure.query(async ({ ctx }) => {
    const streaks = await ctx.db.streak.findMany({
      where: { userId: ctx.session.user.id },
      include: { goal: { select: { title: true, category: true } } },
    });

    return {
      streaks: streaks.map((s) => ({
        goalId: s.goalId,
        goalTitle: s.goal.title,
        category: s.goal.category,
        currentStreak: s.currentStreak,
        bestStreak: s.bestStreak,
        lastCompleted: s.lastCompleted,
      })),
      overall: {
        longestStreak: Math.max(...streaks.map((s) => s.bestStreak), 0),
        activeStreaks: streaks.filter((s) => s.currentStreak > 0).length,
        totalFreezeTokens: 0, // Will be fetched from user
      },
    };
  }),

  trajectory: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
    });

    if (!user) {
      return { currentLevel: 1, currentXp: 0, xpToNext: 0, dailyAverageXp: 0, estimatedDaysToNext: 0 };
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await ctx.db.xpTransaction.aggregate({
      where: {
        userId: ctx.session.user.id,
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { amount: true },
    });

    const totalXpLast30Days = result._sum.amount ?? 0;
    const dailyAverageXp = totalXpLast30Days / 30;

    const xpToNext = XP_TO_LEVEL(user.level + 1);
    const xpRemaining = xpToNext - user.currentLevelXp;
    const estimatedDaysToNext = dailyAverageXp > 0 ? Math.ceil(xpRemaining / dailyAverageXp) : 0;

    return {
      currentLevel: user.level,
      currentXp: user.totalXp,
      xpToNext,
      dailyAverageXp: Math.round(dailyAverageXp),
      estimatedDaysToNext,
    };
  }),

  aiInsights: protectedProcedure.query(async ({ ctx }) => {
    const cacheKey = `insights:${ctx.session.user.id}:${new Date().toISOString().split("T")[0]}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return { insight: cached as string, generatedAt: new Date(), isCached: true };
    }

    // TODO: Generate AI insight via Claude Haiku
    const insight = "Track your progress for a week to receive personalized insights!";

    return { insight, generatedAt: new Date(), isCached: false };
  }),
});
