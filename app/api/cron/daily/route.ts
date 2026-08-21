import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db/prisma";
import { checkAndMissTasks } from "@/server/lib/streaks";
import { addDays, startOfDay, subDays } from "date-fns";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const missedCount = await checkAndMissTasks(db);

  const yesterday = startOfDay(subDays(new Date(), 1));
  const activeGoals = await db.goal.findMany({
    where: { status: "active" },
    select: { id: true, userId: true, difficulty: true },
  });

  let challengesGenerated = 0;

  for (const goal of activeGoals) {
    const today = startOfDay(new Date());

    const existingTypes = await db.challenge.findMany({
      where: {
        userId: goal.userId,
        date: today,
      },
      select: { type: true },
    });

    const existingTypesSet = new Set(existingTypes.map((e) => e.type));
    const challengeTypes: Array<"recovery" | "momentum" | "wildcard"> = ["recovery", "momentum", "wildcard"];

    const missingTypes = challengeTypes.filter((t) => !existingTypesSet.has(t));

    for (const type of missingTypes) {
      let title: string;
      let description: string;
      let xpReward: number;

      switch (type) {
        case "recovery":
          title = `Redo: ${goal.difficulty > 3 ? "Intense" : "Standard"} Session`;
          description = `Complete an extra session for your goal today.`;
          xpReward = 75 + goal.difficulty * 15;
          break;
        case "momentum":
          title = "3-Day Streak Push";
          description = "Complete today's task and keep your momentum going.";
          xpReward = 50 + goal.difficulty * 10;
          break;
        case "wildcard":
          title = "Bonus Challenge";
          description = "Try something new related to your goal category.";
          xpReward = 100 + goal.difficulty * 20;
          break;
      }

      await db.challenge.create({
        data: {
          userId: goal.userId,
          date: today,
          type,
          title: title!,
          description: description!,
          category: "custom",
          xpReward: xpReward!,
          difficulty: Math.min(goal.difficulty + 1, 5),
        },
      });

      challengesGenerated++;
    }
  }

  return NextResponse.json({
    missedTasks: missedCount,
    challengesGenerated,
  });
}
