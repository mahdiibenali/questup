export interface CircumstancesInput {
  timeAvailability: "<1hr" | "1-3hr" | "3+hr";
  physicalCondition: "none" | "minor" | "chronic" | "disability" | "recovery";
  workLoad: "light" | "moderate" | "heavy" | "overwhelmed";
  ageBracket: "13-17" | "18-25" | "26-40" | "41-60" | "60+";
  resources: "full" | "partial" | "limited";
  lifeStressor: "none" | "mild" | "significant";
}

export interface CircumstancesBreakdown extends CircumstancesInput {
  modifier: number;
  timeModifier: number;
  physicalModifier: number;
  workloadModifier: number;
  ageModifier: number;
  resourceModifier: number;
  stressModifier: number;
}

const TIME_MODIFIERS: Record<CircumstancesInput["timeAvailability"], number> = {
  "<1hr": 0.7,
  "1-3hr": 1.0,
  "3+hr": 1.15,
};

const PHYSICAL_MODIFIERS: Record<
  CircumstancesInput["physicalCondition"],
  number
> = {
  none: 1.0,
  minor: 0.9,
  chronic: 0.75,
  disability: 0.65,
  recovery: 0.7,
};

const WORKLOAD_MODIFIERS: Record<CircumstancesInput["workLoad"], number> = {
  light: 1.1,
  moderate: 1.0,
  heavy: 0.85,
  overwhelmed: 0.7,
};

const AGE_MODIFIERS: Record<CircumstancesInput["ageBracket"], number> = {
  "13-17": 1.0,
  "18-25": 1.1,
  "26-40": 1.0,
  "41-60": 0.95,
  "60+": 0.85,
};

const RESOURCE_MODIFIERS: Record<CircumstancesInput["resources"], number> = {
  full: 1.1,
  partial: 1.0,
  limited: 0.8,
};

const STRESS_MODIFIERS: Record<CircumstancesInput["lifeStressor"], number> = {
  none: 1.0,
  mild: 0.9,
  significant: 0.75,
};

export function calculateCircumstancesModifier(
  input: CircumstancesInput,
): CircumstancesBreakdown {
  const timeModifier = TIME_MODIFIERS[input.timeAvailability];
  const physicalModifier = PHYSICAL_MODIFIERS[input.physicalCondition];
  const workloadModifier = WORKLOAD_MODIFIERS[input.workLoad];
  const ageModifier = AGE_MODIFIERS[input.ageBracket];
  const resourceModifier = RESOURCE_MODIFIERS[input.resources];
  const stressModifier = STRESS_MODIFIERS[input.lifeStressor];

  const raw =
    timeModifier *
    physicalModifier *
    workloadModifier *
    ageModifier *
    resourceModifier *
    stressModifier;

  const modifier = Math.round(Math.max(0.3, Math.min(1.5, raw)) * 100) / 100;

  return {
    ...input,
    modifier,
    timeModifier,
    physicalModifier,
    workloadModifier,
    ageModifier,
    resourceModifier,
    stressModifier,
  };
}
