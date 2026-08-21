"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/lib/trpc-client";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [circumstances, setCircumstances] = useState({
    timeAvailability: "1-3hr" as const,
    physicalCondition: "none" as const,
    workLoad: "moderate" as const,
    ageBracket: "18-25" as const,
    resources: "full" as const,
    lifeStressor: "none" as const,
  });

  const updateCircumstances = trpc.user.updateCircumstances.useMutation({
    onSuccess: () => {
      router.push("/");
    },
  });

  const handleSubmit = () => {
    updateCircumstances.mutate(circumstances);
  };

  const questions = [
    {
      key: "timeAvailability" as const,
      question: "How much free time do you have each day?",
      options: [
        { value: "<1hr", label: "Less than 1 hour" },
        { value: "1-3hr", label: "1-3 hours" },
        { value: "3+hr", label: "3+ hours" },
      ],
    },
    {
      key: "physicalCondition" as const,
      question: "What's your physical condition?",
      options: [
        { value: "none", label: "No limitations" },
        { value: "minor", label: "Minor limitations" },
        { value: "chronic", label: "Chronic condition" },
        { value: "disability", label: "Disability" },
        { value: "recovery", label: "Recovering from injury" },
      ],
    },
    {
      key: "workLoad" as const,
      question: "How's your work/study load?",
      options: [
        { value: "light", label: "Light" },
        { value: "moderate", label: "Moderate" },
        { value: "heavy", label: "Heavy" },
        { value: "overwhelmed", label: "Overwhelmed" },
      ],
    },
    {
      key: "ageBracket" as const,
      question: "What's your age bracket?",
      options: [
        { value: "13-17", label: "13-17" },
        { value: "18-25", label: "18-25" },
        { value: "26-40", label: "26-40" },
        { value: "41-60", label: "41-60" },
        { value: "60+", label: "60+" },
      ],
    },
    {
      key: "resources" as const,
      question: "Access to resources?",
      options: [
        { value: "full", label: "Full (gym, equipment, fast internet)" },
        { value: "partial", label: "Partial" },
        { value: "limited", label: "Limited" },
      ],
    },
    {
      key: "lifeStressor" as const,
      question: "Any significant life stressors right now?",
      options: [
        { value: "none", label: "None" },
        { value: "mild", label: "Mild" },
        { value: "significant", label: "Significant (bereavement, illness, relocation)" },
      ],
    },
  ];

  const currentQuestion = questions[step];

  return (
    <div className="text-center">
      <h1 className="text-3xl font-display font-bold text-primary mb-2">Welcome to LevelUp!</h1>
      <p className="text-text-muted mb-8">Let&apos;s personalize your experience</p>

      <div className="mb-6">
        <div className="flex justify-center gap-2 mb-4">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i <= step ? "bg-primary" : "bg-surface-light"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-surface rounded-card p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{currentQuestion.question}</h2>
        <div className="space-y-3">
          {currentQuestion.options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setCircumstances({ ...circumstances, [currentQuestion.key]: option.value });
                if (step < questions.length - 1) {
                  setStep(step + 1);
                }
              }}
              className={`w-full py-3 px-4 rounded-card border transition-colors text-left ${
                circumstances[currentQuestion.key] === option.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-surface-light bg-surface hover:border-surface-light text-text-primary"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 py-3 bg-surface hover:bg-surface-light text-text-primary font-semibold rounded-card transition-colors"
          >
            Back
          </button>
        )}
        {step === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={updateCircumstances.isPending}
            className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-card transition-colors disabled:opacity-50"
          >
            {updateCircumstances.isPending ? "Setting up..." : "Get Started"}
          </button>
        ) : (
          <button
            onClick={() => setStep(step + 1)}
            className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-card transition-colors"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
