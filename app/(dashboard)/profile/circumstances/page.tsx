"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";

const OPTIONS = {
  timeAvailability: ["<1hr", "1-3hr", "3+hr"] as const,
  physicalCondition: ["none", "minor", "chronic", "disability", "recovery"] as const,
  workLoad: ["light", "moderate", "heavy", "overwhelmed"] as const,
  ageBracket: ["13-17", "18-25", "26-40", "41-60", "60+"] as const,
  resources: ["full", "partial", "limited"] as const,
  lifeStressor: ["none", "mild", "significant"] as const,
} as const;

type Field = keyof typeof OPTIONS;

const LABELS: Record<string, string> = {
  "<1hr": "Less than 1 hour",
  "1-3hr": "1-3 hours",
  "3+hr": "3+ hours",
  none: "None",
  minor: "Minor",
  chronic: "Chronic",
  disability: "Disability",
  recovery: "Recovery",
  light: "Light",
  moderate: "Moderate",
  heavy: "Heavy",
  overwhelmed: "Overwhelmed",
  "13-17": "13-17",
  "18-25": "18-25",
  "26-40": "26-40",
  "41-60": "41-60",
  "60+": "60+",
  full: "Full access",
  partial: "Partial access",
  limited: "Limited access",
  mild: "Mild",
  significant: "Significant",
};

export default function CircumstancesPage() {
  const { data: user } = trpc.user.me.useQuery();
  const utils = trpc.useUtils();

  const profile = (user?.circumstancesProfile ?? {}) as Record<string, string>;

  const [form, setForm] = useState<Record<string, string>>({
    timeAvailability: profile.timeAvailability ?? "1-3hr",
    physicalCondition: profile.physicalCondition ?? "none",
    workLoad: profile.workLoad ?? "moderate",
    ageBracket: profile.ageBracket ?? "26-40",
    resources: profile.resources ?? "full",
    lifeStressor: profile.lifeStressor ?? "none",
  });

  const updateCircumstances = trpc.user.updateCircumstances.useMutation({
    onSuccess: () => {
      utils.user.me.invalidate();
      alert("Circumstances updated!");
    },
  });

  const handleSubmit = () => {
    updateCircumstances.mutate({
      timeAvailability: form.timeAvailability as "<1hr" | "1-3hr" | "3+hr",
      physicalCondition: form.physicalCondition as "none" | "minor" | "chronic" | "disability" | "recovery",
      workLoad: form.workLoad as "light" | "moderate" | "heavy" | "overwhelmed",
      ageBracket: form.ageBracket as "13-17" | "18-25" | "26-40" | "41-60" | "60+",
      resources: form.resources as "full" | "partial" | "limited",
      lifeStressor: form.lifeStressor as "none" | "mild" | "significant",
    });
  };

  const SelectGroup = ({
    field,
    label,
  }: {
    field: Field;
    label: string;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-text-muted">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS[field].map((opt) => (
          <button
            key={opt}
            onClick={() => setForm((prev) => ({ ...prev, [field]: opt }))}
            className={`px-3 py-2 rounded-card text-sm font-medium transition-colors ${
              form[field] === opt
                ? "bg-primary text-white"
                : "bg-surface-light text-text-muted hover:bg-surface"
            }`}
          >
            {LABELS[opt] ?? opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Circumstances</h1>
        <p className="text-sm text-text-muted mt-1">
          Help us personalize your XP modifier for fair play.
        </p>
      </div>

      <div className="bg-surface rounded-card p-4 flex items-center justify-between">
        <span className="text-sm text-text-muted">Current XP Modifier</span>
        <span className="text-lg font-bold text-primary">{user?.circumstancesModifier ?? 1.0}x</span>
      </div>

      <div className="space-y-5">
        <SelectGroup field="timeAvailability" label="Daily Time Availability" />
        <SelectGroup field="physicalCondition" label="Physical Condition" />
        <SelectGroup field="workLoad" label="Current Workload" />
        <SelectGroup field="ageBracket" label="Age Bracket" />
        <SelectGroup field="resources" label="Access to Resources" />
        <SelectGroup field="lifeStressor" label="Life Stressors" />
      </div>

      <button
        onClick={handleSubmit}
        disabled={updateCircumstances.isPending}
        className="w-full py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-medium rounded-card transition-colors"
      >
        {updateCircumstances.isPending ? "Saving..." : "Update Circumstances"}
      </button>
    </div>
  );
}
