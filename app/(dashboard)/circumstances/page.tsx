"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { cn } from "@/lib/utils";

const factors = [
  {
    key: "timeAvailability",
    label: "Time Availability",
    description: "How much time can you dedicate daily?",
    options: [
      { value: "<1hr", label: "< 1hr" },
      { value: "1-3hr", label: "1-3 hours" },
      { value: "3+hr", label: "3+ hours" },
    ],
  },
  {
    key: "physicalCondition",
    label: "Physical Condition",
    description: "Any physical limitations?",
    options: [
      { value: "none", label: "None" },
      { value: "minor", label: "Minor" },
      { value: "chronic", label: "Chronic" },
      { value: "disability", label: "Disability" },
      { value: "recovery", label: "Recovery" },
    ],
  },
  {
    key: "workLoad",
    label: "Work/School Load",
    description: "How demanding is your current workload?",
    options: [
      { value: "light", label: "Light" },
      { value: "moderate", label: "Moderate" },
      { value: "heavy", label: "Heavy" },
      { value: "overwhelmed", label: "Overwhelmed" },
    ],
  },
  {
    key: "ageBracket",
    label: "Age Bracket",
    options: [
      { value: "13-17", label: "13-17" },
      { value: "18-25", label: "18-25" },
      { value: "26-40", label: "26-40" },
      { value: "41-60", label: "41-60" },
      { value: "60+", label: "60+" },
    ],
  },
  {
    key: "resources",
    label: "Resources & Equipment",
    description: "Access to tools, gym, equipment?",
    options: [
      { value: "full", label: "Full access" },
      { value: "partial", label: "Partial" },
      { value: "limited", label: "Limited" },
    ],
  },
  {
    key: "lifeStressor",
    label: "Current Life Stress",
    description: "Any major stressors right now?",
    options: [
      { value: "none", label: "None" },
      { value: "mild", label: "Mild" },
      { value: "significant", label: "Significant" },
    ],
  },
];

export default function CircumstancesPage() {
  const { data: user } = trpc.user.me.useQuery();
  const updateCircumstances = trpc.user.updateCircumstances.useMutation();

  const saved = user?.circumstancesProfile ? JSON.parse(user.circumstancesProfile as string) : {};

  const [form, setForm] = useState<Record<string, string>>({
    timeAvailability: saved.timeAvailability || "1-3hr",
    physicalCondition: saved.physicalCondition || "none",
    workLoad: saved.workLoad || "moderate",
    ageBracket: saved.ageBracket || "26-40",
    resources: saved.resources || "full",
    lifeStressor: saved.lifeStressor || "none",
  });

  const [saved2, setSaved2] = useState(false);

  const handleSave = () => {
    updateCircumstances.mutate(form as any, {
      onSuccess: () => {
        setSaved2(true);
        setTimeout(() => setSaved2(false), 2000);
      },
    });
  };

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h1 className="text-2xl font-display font-bold text-text">Life Context</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Help the system adapt XP requirements to your situation
        </p>
      </div>

      {user?.circumstancesModifier && (
        <div className="bg-bg-elevated border border-primary rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-text-secondary">Current XP Modifier</p>
            <p className="text-2xl font-display font-bold text-primary">
              {user.circumstancesModifier.toFixed(2)}x
            </p>
          </div>
          <p className="text-xs text-text-dim max-w-[200px] text-right">
            {user.circumstancesModifier < 1 ? "Easier requirements — taking care of you" : user.circumstancesModifier > 1 ? "Harder requirements — you've got this" : "Standard requirements"}
          </p>
        </div>
      )}

      {factors.map((factor) => (
        <div key={factor.key} className="bg-bg-elevated border border-border rounded-xl p-5">
          <h3 className="font-medium text-text mb-1">{factor.label}</h3>
          {factor.description && <p className="text-xs text-text-dim mb-3">{factor.description}</p>}
          <div className="flex flex-wrap gap-2">
            {factor.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setForm({ ...form, [factor.key]: opt.value })}
                className={cn(
                  "h-9 px-4 rounded-lg text-sm font-medium border transition-all duration-150",
                  form[factor.key] === opt.value
                    ? "border-primary bg-primary-muted text-primary"
                    : "border-border bg-bg text-text-dim hover:border-border-strong"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={updateCircumstances.isPending}
        className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-all duration-150 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
      >
        {updateCircumstances.isPending ? "Saving..." : saved2 ? "Saved!" : "Save Context"}
      </button>
    </div>
  );
}
