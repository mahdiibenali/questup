import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db/prisma";
import { redis } from "@/lib/redis";
import { anthropic } from "@/lib/anthropic";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const users = await db.user.findMany({
    where: {
      updatedAt: { gte: thirtyDaysAgo },
    },
    select: { id: true },
  });

  let insightsGenerated = 0;

  for (const user of users) {
    const today = new Date().toISOString().split("T")[0];
    const cacheKey = `insights:${user.id}:${today}`;
    const cached = await redis.get(cacheKey);
    if (cached) continue;

    const [xpTransactions, tasks, streaks] = await Promise.all([
      db.xpTransaction.findMany({
        where: { userId: user.id, createdAt: { gte: thirtyDaysAgo } },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      db.task.findMany({
        where: { userId: user.id, scheduledDate: { gte: thirtyDaysAgo } },
        select: { status: true, xpEarned: true, scheduledDate: true },
      }),
      db.streak.findMany({
        where: { userId: user.id },
        include: { goal: { select: { title: true } } },
      }),
    ]);

    const totalXp = xpTransactions.reduce((sum, t) => sum + t.amount, 0);
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const activeStreaks = streaks.filter((s) => s.currentStreak > 0);

    try {
      const message = await anthropic.messages.create({
        model: "claude-haiku-4-20250414",
        max_tokens: 256,
        messages: [
          {
            role: "user",
            content: `You are a motivational habit coach. Analyze this user's 30-day data and provide a brief, encouraging insight (2-3 sentences max).

Data:
- Total XP earned: ${totalXp}
- Tasks completed: ${completedTasks}/${totalTasks} (${completionRate}% completion)
- Active streaks: ${activeStreaks.length} (longest: ${Math.max(0, ...activeStreaks.map((s) => s.currentStreak))} days)
- Goals: ${streaks.map((s) => `${s.goal.title} (${s.currentStreak}d streak)`).join(", ") || "None"}

Be specific, encouraging, and actionable. Focus on one area for improvement.`,
          },
        ],
      });

      const textBlock = message.content.find((b) => b.type === "text");
      if (textBlock && textBlock.type === "text") {
        await redis.set(cacheKey, textBlock.text, { ex: 86400 });
        insightsGenerated++;
      }
    } catch {
      // Skip on error
    }
  }

  return NextResponse.json({ insightsGenerated });
}
