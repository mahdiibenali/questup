import {
  CATEGORY_BASE_XP,
  DIFFICULTY_MULTIPLIER,
  VERIFICATION_TIERS,
  TIME_BONUS,
  XP_TO_LEVEL,
  getLevelTitle,
} from "@/lib/constants";

export interface XpCalculation {
  baseXp: number;
  difficultyMultiplier: number;
  verificationMultiplier: number;
  timeBonus: number;
  finalXp: number;
}

export function calculateTaskXp(params: {
  category: string;
  difficulty: number;
  aiConfidence: number;
  submittedBeforeNoon: boolean;
  isFirstAttempt: boolean;
  circumstancesModifier: number;
}): XpCalculation {
  const baseXp = CATEGORY_BASE_XP[params.category] ?? CATEGORY_BASE_XP.custom;
  const difficultyMultiplier = DIFFICULTY_MULTIPLIER[params.difficulty] ?? 1.2;

  let verificationMultiplier: number;
  if (params.aiConfidence >= VERIFICATION_TIERS.VERIFIED.min) {
    verificationMultiplier = VERIFICATION_TIERS.VERIFIED.xpMultiplier;
  } else if (params.aiConfidence >= VERIFICATION_TIERS.PARTIAL.min) {
    verificationMultiplier = VERIFICATION_TIERS.PARTIAL.xpMultiplier;
  } else {
    verificationMultiplier = VERIFICATION_TIERS.REJECTED.xpMultiplier;
  }

  let timeBonus = 0;
  if (params.submittedBeforeNoon) timeBonus += TIME_BONUS.BEFORE_NOON;
  if (params.isFirstAttempt) timeBonus += TIME_BONUS.FIRST_ATTEMPT;

  const rawXp = baseXp * difficultyMultiplier * verificationMultiplier;
  const withTimeBonus = rawXp * (1 + timeBonus);
  const finalXp = Math.round(withTimeBonus * params.circumstancesModifier);

  return {
    baseXp,
    difficultyMultiplier,
    verificationMultiplier,
    timeBonus,
    finalXp: Math.max(finalXp, 0),
  };
}

export function xpToNextLevel(level: number): number {
  return XP_TO_LEVEL(level);
}

export function calculateLevelProgress(
  currentLevelXp: number,
  level: number,
): { percentage: number; xpRemaining: number; xpToNext: number } {
  const xpToNext = XP_TO_LEVEL(level + 1);
  const xpAtStart = XP_TO_LEVEL(level);
  const xpNeeded = xpToNext - xpAtStart;
  const xpEarned = currentLevelXp - xpAtStart;
  const percentage = Math.min((xpEarned / xpNeeded) * 100, 100);

  return {
    percentage,
    xpRemaining: Math.max(xpToNext - currentLevelXp, 0),
    xpToNext,
  };
}

export function processXpGain(
  currentTotalXp: number,
  currentLevel: number,
  currentLevelXp: number,
  xpGain: number,
): {
  newTotalXp: number;
  newLevel: number;
  newCurrentLevelXp: number;
  levelsGained: number;
  levelUps: Array<{ level: number; title: string }>;
} {
  const newTotalXp = currentTotalXp + xpGain;
  let newLevel = currentLevel;
  let newCurrentLevelXp = currentLevelXp + xpGain;
  const levelUps: Array<{ level: number; title: string }> = [];

  while (newCurrentLevelXp >= XP_TO_LEVEL(newLevel + 1)) {
    const threshold = XP_TO_LEVEL(newLevel + 1);
    newCurrentLevelXp -= threshold;
    newLevel++;
    levelUps.push({ level: newLevel, title: getLevelTitle(newLevel) });
  }

  return {
    newTotalXp,
    newLevel,
    newCurrentLevelXp,
    levelsGained: levelUps.length,
    levelUps,
  };
}
