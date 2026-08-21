import { PrismaClient, Streak } from "@prisma/client";
import { addDays, differenceInCalendarDays, startOfDay } from "date-fns";
import { STREAK_MILESTONES } from "@/lib/constants";

export async function updateStreakOnCompletion(
  db: PrismaClient,
  userId: string,
  goalId: string,
  completedDate: Date,
): Promise<{
  streak: Streak;
  milestoneReached: number | null;
  milestoneXp: number;
}> {
  const today = startOfDay(completedDate);
  const streak = await db.streak.findUnique({
    where: { userId_goalId: { userId, goalId } },
  });

  if (!streak) {
    const newStreak = await db.streak.create({
      data: {
        userId,
        goalId,
        currentStreak: 1,
        bestStreak: 1,
        lastCompleted: today,
      },
    });
    return { streak: newStreak, milestoneReached: null, milestoneXp: 0 };
  }

  const lastCompleted = streak.lastCompleted
    ? startOfDay(streak.lastCompleted)
    : null;

  if (lastCompleted && isSameDay(lastCompleted, today)) {
    return { streak, milestoneReached: null, milestoneXp: 0 };
  }

  let daysSinceLast: number;
  if (lastCompleted) {
    daysSinceLast = differenceInCalendarDays(today, lastCompleted);
  } else {
    daysSinceLast = 999;
  }

  const isFrozen = streak.freezeUsed && daysSinceLast <= 2;

  let newCurrentStreak: number;
  if (daysSinceLast === 1 || isFrozen) {
    newCurrentStreak = streak.currentStreak + 1;
  } else {
    newCurrentStreak = 1;
  }

  const newBestStreak = Math.max(streak.bestStreak, newCurrentStreak);

  const updatedStreak = await db.streak.update({
    where: { userId_goalId: { userId, goalId } },
    data: {
      currentStreak: newCurrentStreak,
      bestStreak: newBestStreak,
      lastCompleted: today,
      freezeUsed: false,
    },
  });

  let milestoneReached: number | null = null;
  let milestoneXp = 0;

  for (const ms of STREAK_MILESTONES) {
    if (
      newCurrentStreak >= ms &&
      streak.currentStreak < ms
    ) {
      milestoneReached = ms;
      milestoneXp = calculateMilestoneXp(ms);
      break;
    }
  }

  return { streak: updatedStreak, milestoneReached, milestoneXp };
}

function calculateMilestoneXp(milestone: number): number {
  const rewards: Record<number, number> = {
    7: 100,
    30: 300,
    90: 750,
    365: 2000,
  };
  return rewards[milestone] ?? 100;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export async function checkAndMissTasks(
  db: PrismaClient,
): Promise<number> {
  const yesterday = startOfDay(new Date());
  yesterday.setDate(yesterday.getDate() - 1);

  const result = await db.task.updateMany({
    where: {
      status: "pending",
      scheduledDate: { lt: yesterday },
    },
    data: {
      status: "missed",
    },
  });

  return result.count;
}
