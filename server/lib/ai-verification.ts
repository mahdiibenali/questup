import { anthropic } from "@/lib/anthropic";
import { calculateTaskXp, processXpGain } from "./xp-engine";
import { updateStreakOnCompletion } from "./streaks";
import { checkAndAwardAchievements } from "./achievements";
import { PrismaClient } from "@prisma/client";

interface VerificationResult {
  aiConfidence: number;
  aiVerified: boolean;
  aiRejectionReason: string | null;
  aiRationale: string;
  xpMultiplier: number;
}

export async function verifyProof(
  proofUrl: string,
  proofText: string | null,
  goalTitle: string,
  goalCategory: string,
): Promise<VerificationResult> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "url",
                url: proofUrl,
              },
            },
            {
              type: "text",
              text: `You are verifying proof of task completion for a gamified habit tracker.

Goal: "${goalTitle}"
Category: "${goalCategory}"
User's description: "${proofText ?? "No description provided."}"

Analyze this image and determine:
1. Does the image plausibly show completion of the stated goal?
2. Rate your confidence from 0-100
3. Provide a brief rationale

Respond in JSON format:
{
  "confidence": <number 0-100>,
  "verified": <boolean>,
  "rejectionReason": <string or null>,
  "rationale": <string>
}`,
            },
          ],
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text in AI response");
    }

    const parsed = JSON.parse(textBlock.text);

    let xpMultiplier: number;
    if (parsed.confidence >= 75) {
      xpMultiplier = 1.0;
    } else if (parsed.confidence >= 45) {
      xpMultiplier = 0.6;
    } else {
      xpMultiplier = 0.0;
    }

    return {
      aiConfidence: parsed.confidence,
      aiVerified: parsed.verified,
      aiRejectionReason: parsed.rejectionReason,
      aiRationale: parsed.rationale,
      xpMultiplier,
    };
  } catch {
    return {
      aiConfidence: 50,
      aiVerified: false,
      aiRejectionReason: "AI verification temporarily unavailable",
      aiRationale: "Verification could not be completed at this time",
      xpMultiplier: 0.6,
    };
  }
}

export async function completeTaskWithVerification(
  db: PrismaClient,
  taskId: string,
): Promise<{
  xpEarned: number;
  levelsGained: number;
  levelUps: Array<{ level: number; title: string }>;
  milestoneReached: number | null;
  milestoneXp: number;
  achievementIds: string[];
}> {
  const task = await db.task.findUnique({
    where: { id: taskId },
    include: {
      goal: true,
      user: true,
    },
  });

  if (!task || !task.goal || !task.user) {
    throw new Error("Task, goal, or user not found");
  }

  const now = new Date();
  const submittedBeforeNoon = now.getHours() < 12;
  const isFirstAttempt = task.submissionCount <= 1;

  const xpCalc = calculateTaskXp({
    category: task.goal.category,
    difficulty: task.goal.difficulty,
    aiConfidence: task.aiConfidence ?? 50,
    submittedBeforeNoon,
    isFirstAttempt,
    circumstancesModifier: task.user.circumstancesModifier,
  });

  const levelProgress = processXpGain(
    task.user.totalXp,
    task.user.level,
    task.user.currentLevelXp,
    xpCalc.finalXp,
  );

  await db.user.update({
    where: { id: task.userId },
    data: {
      totalXp: levelProgress.newTotalXp,
      level: levelProgress.newLevel,
      currentLevelXp: levelProgress.newCurrentLevelXp,
    },
  });

  await db.xpTransaction.create({
    data: {
      userId: task.userId,
      amount: xpCalc.finalXp,
      sourceType: "task",
      sourceId: task.id,
    },
  });

  await db.task.update({
    where: { id: taskId },
    data: {
      xpEarned: xpCalc.finalXp,
      aiXpMultiplier: xpCalc.verificationMultiplier,
      aiRationale: `Base: ${xpCalc.baseXp}, Difficulty: x${xpCalc.difficultyMultiplier}, Verification: x${xpCalc.verificationMultiplier}`,
    },
  });

  const streakResult = await updateStreakOnCompletion(
    db,
    task.userId,
    task.goalId,
    now,
  );

  let milestoneXp = 0;
  if (streakResult.milestoneReached) {
    milestoneXp = streakResult.milestoneXp;

    await db.milestone.upsert({
      where: {
        goalId_type_threshold: {
          goalId: task.goalId,
          type: `streak_${streakResult.milestoneReached}` as never,
          threshold: streakResult.milestoneReached,
        },
      },
      update: { achievedAt: now },
      create: {
        goalId: task.goalId,
        type: `streak_${streakResult.milestoneReached}` as never,
        threshold: streakResult.milestoneReached,
        xpReward: streakResult.milestoneXp,
        achievedAt: now,
      },
    });

    if (milestoneXp > 0) {
      const bonusLevelProgress = processXpGain(
        levelProgress.newTotalXp,
        levelProgress.newLevel,
        levelProgress.newCurrentLevelXp,
        milestoneXp,
      );

      await db.user.update({
        where: { id: task.userId },
        data: {
          totalXp: bonusLevelProgress.newTotalXp,
          level: bonusLevelProgress.newLevel,
          currentLevelXp: bonusLevelProgress.newCurrentLevelXp,
        },
      });

      await db.xpTransaction.create({
        data: {
          userId: task.userId,
          amount: milestoneXp,
          sourceType: "bonus",
          metadata: JSON.stringify({
            type: "streak_milestone",
            streak: streakResult.milestoneReached,
          }),
        },
      });

      levelProgress.levelsGained += bonusLevelProgress.levelsGained;
      levelProgress.levelUps.push(...bonusLevelProgress.levelUps);
    }
  }

  const achievements = await checkAndAwardAchievements(db, task.userId);

  return {
    xpEarned: xpCalc.finalXp + milestoneXp,
    levelsGained: levelProgress.levelsGained,
    levelUps: levelProgress.levelUps,
    milestoneReached: streakResult.milestoneReached,
    milestoneXp,
    achievementIds: achievements.map((a) => a.key),
  };
}
