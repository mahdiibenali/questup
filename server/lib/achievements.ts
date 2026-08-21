import { PrismaClient } from "@prisma/client";

interface AchievementCheck {
  key: string;
  condition: boolean;
}

export async function checkAndAwardAchievements(
  db: PrismaClient,
  userId: string,
): Promise<Array<{ key: string; title: string; xpReward: number }>> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      achievements: { select: { achievementId: true } },
      _count: {
        select: {
          tasks: { where: { status: "completed" } },
          achievements: true,
        },
      },
    },
  });

  if (!user) return [];

  const earnedIds = new Set(user.achievements.map((a) => a.achievementId));

  const checks: AchievementCheck[] = [
    { key: "first_task", condition: user._count.tasks >= 1 },
    { key: "tasks_10", condition: user._count.tasks >= 10 },
    { key: "tasks_50", condition: user._count.tasks >= 50 },
    { key: "tasks_100", condition: user._count.tasks >= 100 },
    { key: "level_5", condition: user.level >= 5 },
    { key: "level_10", condition: user.level >= 10 },
    { key: "level_25", condition: user.level >= 25 },
    { key: "level_50", condition: user.level >= 50 },
    { key: "xp_1000", condition: user.totalXp >= 1000 },
    { key: "xp_10000", condition: user.totalXp >= 10000 },
    { key: "xp_50000", condition: user.totalXp >= 50000 },
  ];

  const allAchievements = await db.achievement.findMany();
  const achievementMap = new Map(allAchievements.map((a) => [a.key, a]));

  const newlyEarned: Array<{ key: string; title: string; xpReward: number }> =
    [];

  for (const check of checks) {
    if (!check.condition) continue;

    const achievement = achievementMap.get(check.key);
    if (!achievement) continue;
    if (earnedIds.has(achievement.id)) continue;

    try {
      await db.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
        },
      });

      await db.xpTransaction.create({
        data: {
          userId,
          amount: achievement.xpReward,
          sourceType: "achievement",
          sourceId: achievement.id,
        },
      });

      await db.user.update({
        where: { id: userId },
        data: { totalXp: { increment: achievement.xpReward } },
      });

      newlyEarned.push({
        key: check.key,
        title: achievement.title,
        xpReward: achievement.xpReward,
      });
    } catch {
      // Duplicate key - already earned, ignore
    }
  }

  return newlyEarned;
}

export async function checkStreakAchievements(
  db: PrismaClient,
  userId: string,
): Promise<Array<{ key: string; title: string; xpReward: number }>> {
  const streaks = await db.streak.findMany({
    where: { userId },
    select: { bestStreak: true },
  });

  const maxStreak = Math.max(0, ...streaks.map((s) => s.bestStreak));

  const checks: AchievementCheck[] = [
    { key: "streak_7", condition: maxStreak >= 7 },
    { key: "streak_30", condition: maxStreak >= 30 },
    { key: "streak_90", condition: maxStreak >= 90 },
    { key: "streak_365", condition: maxStreak >= 365 },
  ];

  const allAchievements = await db.achievement.findMany();
  const achievementMap = new Map(allAchievements.map((a) => [a.key, a]));
  const userAchievements = await db.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });
  const earnedIds = new Set(userAchievements.map((a) => a.achievementId));

  const newlyEarned: Array<{ key: string; title: string; xpReward: number }> =
    [];

  for (const check of checks) {
    if (!check.condition) continue;
    const achievement = achievementMap.get(check.key);
    if (!achievement) continue;
    if (earnedIds.has(achievement.id)) continue;

    try {
      await db.userAchievement.create({
        data: { userId, achievementId: achievement.id },
      });

      await db.xpTransaction.create({
        data: {
          userId,
          amount: achievement.xpReward,
          sourceType: "achievement",
          sourceId: achievement.id,
        },
      });

      await db.user.update({
        where: { id: userId },
        data: { totalXp: { increment: achievement.xpReward } },
      });

      newlyEarned.push({
        key: check.key,
        title: achievement.title,
        xpReward: achievement.xpReward,
      });
    } catch {
      // Duplicate
    }
  }

  return newlyEarned;
}
