import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db/prisma";
import { seedFutureTasksForGoal } from "@/server/lib/task-seeder";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const activeGoals = await db.goal.findMany({
    where: { status: "active" },
    select: { id: true },
  });

  let totalSeeded = 0;

  for (const goal of activeGoals) {
    const count = await seedFutureTasksForGoal(db, goal.id);
    totalSeeded += count;
  }

  return NextResponse.json({
    goalsProcessed: activeGoals.length,
    tasksCreated: totalSeeded,
  });
}
