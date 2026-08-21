// ══════════════════════════════════════════════════════════════════════
// LevelUp Constants
// ══════════════════════════════════════════════════════════════════════

export const CATEGORY_BASE_XP: Record<string, number> = {
  fitness: 120,
  learning: 100,
  health: 110,
  career: 90,
  mindfulness: 80,
  custom: 95,
};

export const DIFFICULTY_MULTIPLIER: Record<number, number> = {
  1: 0.8,
  2: 1.0,
  3: 1.2,
  4: 1.5,
  5: 2.0,
};

export const XP_TO_LEVEL = (n: number): number => Math.floor(150 * Math.pow(n, 1.85));

export const getLevelTitle = (level: number): string => {
  if (level <= 5) return "Spark";
  if (level <= 15) return "Seeker";
  if (level <= 25) return "Apprentice";
  if (level <= 35) return "Adept";
  if (level <= 50) return "Skilled";
  if (level <= 65) return "Expert";
  if (level <= 80) return "Master";
  if (level <= 90) return "Grand Master";
  if (level <= 99) return "Legend";
  return "Mythic";
};

export const CATEGORIES = [
  { value: "fitness", label: "Fitness", icon: "Dumbbell" },
  { value: "learning", label: "Learning", icon: "BookOpen" },
  { value: "health", label: "Health", icon: "Heart" },
  { value: "career", label: "Career", icon: "Briefcase" },
  { value: "mindfulness", label: "Mindfulness", icon: "Brain" },
  { value: "custom", label: "Custom", icon: "Star" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export const CATEGORY_ICONS: Record<string, string> = {
  fitness: "Dumbbell",
  learning: "BookOpen",
  health: "Heart",
  career: "Briefcase",
  mindfulness: "Brain",
  custom: "Star",
};

export const STREAK_MILESTONES = [7, 30, 90, 365] as const;

export const FREEZE_TOKEN_EARN_INTERVAL_DAYS = 30;

export const MAX_PROOF_SUBMISSIONS_PER_HOUR = 20;
export const MAX_API_CALLS_PER_MINUTE = 100;
export const MAX_CHALLENGE_COMPLETIONS_PER_DAY = 5;
export const CIRCUMSTANCES_UPDATE_COOLDOWN_DAYS = 7;

export const VERIFICATION_TIERS = {
  VERIFIED: { min: 75, max: 100, xpMultiplier: 1.0 },
  PARTIAL: { min: 45, max: 74, xpMultiplier: 0.6 },
  REJECTED: { min: 0, max: 44, xpMultiplier: 0.0 },
} as const;

export const TIME_BONUS = {
  BEFORE_NOON: 0.1,
  FIRST_ATTEMPT: 0.05,
} as const;

export const PERFECT_DAY_XP_BONUS = 500;

export const PHASH_SIMILARITY_THRESHOLD = 0.95;
export const PHASH_LOOKBACK_DAYS = 7;

export const EXIF_STALENESS_WARNING_HOURS = 24;

export const MAX_TASK_PROOF_LENGTH = 500;
export const MIN_TASK_PROOF_LENGTH = 10;
