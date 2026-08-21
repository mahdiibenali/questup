import { z } from "zod";
import { router, protectedProcedure } from "@/lib/trpc";
import { redis } from "@/lib/redis";
import { getWeekStartUTC } from "@/lib/utils";

export const leaderboardRouter = router({
  friends: protectedProcedure.query(async ({ ctx }) => {
    const cacheKey = `leaderboard:friends:${ctx.session.user.id}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return cached as { entries: Array<{ rank: number; userId: string; name: string; image: string | null; weeklyXp: number; level: number }>; generatedAt: Date };
    }

    // Get all accepted friends
    const friendships = await ctx.db.friendship.findMany({
      where: {
        OR: [
          { userId: ctx.session.user.id, status: "accepted" },
          { friendId: ctx.session.user.id, status: "accepted" },
        ],
      },
    });

    const friendIds = friendships.map((f) =>
      f.userId === ctx.session.user.id ? f.friendId : f.userId
    );
    friendIds.push(ctx.session.user.id); // Include self

    const weekStart = getWeekStartUTC();

    const entries = await ctx.db.leaderboardEntry.findMany({
      where: {
        userId: { in: friendIds },
        weekStart,
      },
      include: { user: { select: { name: true, image: true, level: true } } },
      orderBy: { weeklyXp: "desc" },
    });

    const result = {
      entries: entries.map((e, i) => ({
        rank: i + 1,
        userId: e.userId,
        name: e.user.name,
        image: e.user.image,
        weeklyXp: e.weeklyXp,
        level: e.user.level,
      })),
      generatedAt: new Date(),
    };

    await redis.set(cacheKey, result, { ex: 300 }); // 5 min TTL

    return result;
  }),

  global: protectedProcedure
    .input(z.object({ limit: z.number().max(100).default(50) }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 50;
      const cacheKey = "leaderboard:global";

      const cached = await redis.zrange(cacheKey, 0, limit - 1, { withScores: true });
      if (cached && cached.length > 0) {
        // Parse sorted set results
        const entries: Array<{ rank: number; userId: string; name: string; image: string | null; weeklyXp: number; level: number }> = [];
        for (let i = 0; i < cached.length; i += 2) {
          const member = cached[i] as string;
          const score = cached[i + 1] as number;
          const userId = member.replace("user:", "");
          entries.push({
            rank: entries.length + 1,
            userId,
            name: "",
            image: null,
            weeklyXp: score,
            level: 0,
          });
        }

        // Fetch user details
        const userIds = entries.map((e) => e.userId);
        const users = await ctx.db.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, image: true, level: true },
        });

        const userMap = new Map(users.map((u) => [u.id, u]));

        return {
          entries: entries.map((e) => ({
            ...e,
            name: userMap.get(e.userId)?.name ?? "",
            image: userMap.get(e.userId)?.image ?? null,
            level: userMap.get(e.userId)?.level ?? 0,
          })),
          generatedAt: new Date(),
        };
      }

      return { entries: [], generatedAt: new Date() };
    }),

  myRank: protectedProcedure.query(async ({ ctx }) => {
    const weekStart = getWeekStartUTC();

    const entry = await ctx.db.leaderboardEntry.findUnique({
      where: {
        userId_weekStart: { userId: ctx.session.user.id, weekStart },
      },
    });

    // Get global rank from Redis
    const globalRank = await redis.zrevrank("leaderboard:global", `user:${ctx.session.user.id}`);

    // Get friends rank (simplified — full implementation would query the cached friend leaderboard)
    const friendsRank = null;

    return {
      friendsRank,
      globalRank: globalRank !== null ? globalRank + 1 : null,
      weeklyXp: entry?.weeklyXp ?? 0,
    };
  }),
});
