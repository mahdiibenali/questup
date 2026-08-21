"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const categories = [
  { value: "fitness", label: "Fitness", emoji: "\uD83C\uDFCB" },
  { value: "learning", label: "Learning", emoji: "\uD83D\uDCDA" },
  { value: "health", label: "Health", emoji: "\u2764\uFE0F" },
  { value: "career", label: "Career", emoji: "\uD83D\uDCBC" },
  { value: "mindfulness", label: "Mindfulness", emoji: "\uD83E\uDDD8" },
  { value: "custom", label: "Custom", emoji: "\u2B50" },
];

export default function NewGoalPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("fitness");
  const [frequency, setFrequency] = useState("daily");
  const [difficulty, setDifficulty] = useState(3);

  const createGoal = trpc.goals.create.useMutation({
    onSuccess: (data) => router.push(`/goals/${data.goal.id}`),
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <Link href="/goals" className="p-2 rounded-lg hover:bg-bg-hover transition-colors">
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </Link>
        <h1 className="text-2xl font-display font-bold text-text">Create Goal</h1>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); createGoal.mutate({ title, description: description || undefined, category, frequency, difficulty: difficulty as 1|2|3|4|5 }); }} className="space-y-6">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Goal Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Run 5K training" required
            className="w-full h-11 px-4 bg-bg border border-border rounded-lg text-text placeholder:text-text-dim text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-elevated transition-all" />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Description (optional)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What do you want to achieve?"
            className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text placeholder:text-text-dim text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-elevated transition-all resize-none h-24" />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-2">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button key={cat.value} type="button" onClick={() => setCategory(cat.value)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-150 ${
                  category === cat.value
                    ? "border-primary bg-primary-muted text-primary"
                    : "border-border bg-bg-elevated text-text-dim hover:border-border-strong"
                }`}>
                <span className="text-xl">{cat.emoji}</span>
                <span className="text-xs font-medium">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Frequency</label>
          <select value={frequency} onChange={(e) => setFrequency(e.target.value)}
            className="w-full h-11 px-4 bg-bg border border-border rounded-lg text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-elevated transition-all appearance-none">
            <option value="daily">Daily</option>
            <option value="weekly:3">3x per week</option>
            <option value="weekly:5">5x per week</option>
            <option value="custom:1,3,5">Mon, Wed, Fri</option>
            <option value="custom:2,4,6">Tue, Thu, Sat</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-2">Difficulty</label>
          <div className="flex gap-2">
            {[1,2,3,4,5].map((d) => (
              <button key={d} type="button" onClick={() => setDifficulty(d)}
                className={`flex-1 h-11 rounded-lg border text-sm font-semibold transition-all duration-150 ${
                  difficulty === d
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-bg-elevated text-text-dim hover:border-border-strong"
                }`}>
                {d}
              </button>
            ))}
          </div>
          <p className="text-xs text-text-dim mt-2">
            {difficulty <= 2 ? "Easy" : difficulty === 3 ? "Medium" : difficulty === 4 ? "Hard" : "Extreme"}
          </p>
        </div>

        <button type="submit" disabled={createGoal.isPending || !title}
          className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]">
          {createGoal.isPending ? "Creating..." : "Create Goal"}
        </button>
      </form>
    </div>
  );
}
