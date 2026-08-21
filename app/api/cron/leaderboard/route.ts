import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db/prisma";
import { redis } from "@/lib/redis";
import { getWeekStartUTC } from "@/lib/utils";
import { startOfDay, subWeeks } from "date-fns";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weekStart = getWeekStartUTC();
  const prevWeekStart = startOfDay(subWeeks(weekStart, 1));

  const xpAggregates = await db.xpTransaction.groupBy({
    by: ["userId"],
    where: {
      createdAt: { gte: weekStart },
      sourceType: { in: ["task", "challenge", "bonus"] },
    },
    _sum: { amount: true },
  });

  for (const agg of xpAggregates) {
    const weeklyXp = agg._sum.amount ?? 0;

    await db.leaderboardEntry.upsert({
      where: {
        userId_weekStart: { userId: agg.userId, weekStart },
      },
      update: { weeklyXp },
      create: {
        userId: agg.userId,
        weekStart,
        weeklyXp,
      },
    });

    await redis.zadd("leaderboard:global", { score: weeklyXp, member: `user:${agg.userId}` });
  }

  const top50 = await redis.zrange("leaderboard:global", 0, 49, { withScores: true });
  for (let i = 0; i < top50.length; i += 2) {
    const member = top50[i] as string;
    const score = top50[i + 1] as number;
    const userId = member.replace("user:", "");

    await db.leaderboardEntry.updateMany({
      where: {
        userId,
        weekStart,
      },
      data: {
        rank: Math.floor(i / 2) + 1,
      },
    });
  }

  const staleKeys = await redis.keys("leaderboard:friends:*");
  if (staleKeys.length > 0) {
    await redis.del(...staleKeys);
  }

  const staleInsights = await redis.keys("insights:*");
  const today = startOfDay(new Date()).toISOString().split("T")[0];
  for (const key of staleInsights) {
    if (!key.includes(today)) {
      await redis.del(key);
    }
  }

  return NextResponse.json({
    leaderboardUpdated: xpAggregates.length,
    weekStart: weekStart.toISOString(),
  });
}
