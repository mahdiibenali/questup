"use client";

import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc-client";
import { CheckCircle, XCircle, Clock, Flame, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function GoalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const goalId = params.goalId as string;

  const { data: goal, isLoading } = trpc.goals.byId.useQuery({ id: goalId });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-surface animate-pulse rounded-card w-48" />
        <div className="h-48 bg-surface animate-pulse rounded-card" />
        <div className="h-32 bg-surface animate-pulse rounded-card" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted mb-4">Goal not found.</p>
        <Link href="/goals" className="text-primary hover:underline">Back to Goals</Link>
      </div>
    );
  }

  const streak = goal.streaks?.[0];
  const recentTasks = goal.tasks?.slice(0, 14) ?? [];
  const completedTasks = recentTasks.filter((t) => t.status === "completed").length;

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-text-muted hover:text-text-primary">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-surface rounded-card p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-2xl font-display font-bold">{goal.title}</h1>
            {goal.description && (
              <p className="text-text-muted mt-1">{goal.description}</p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            goal.status === "active" ? "bg-success/20 text-success" :
            goal.status === "paused" ? "bg-gold/20 text-gold" :
            "bg-surface-light text-text-muted"
          }`}>
            {goal.status}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{goal.category}</p>
            <p className="text-xs text-text-muted">Category</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-secondary">{goal.difficulty}/5</p>
            <p className="text-xs text-text-muted">Difficulty</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gold">{goal.frequency}</p>
            <p className="text-xs text-text-muted">Frequency</p>
          </div>
        </div>
      </div>

      {streak && (
        <div className="bg-surface rounded-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-secondary" />
            <div>
              <p className="font-semibold">{streak.currentStreak} Day Streak</p>
              <p className="text-sm text-text-muted">Best: {streak.bestStreak} days</p>
            </div>
          </div>
          {streak.lastCompleted && (
            <p className="text-xs text-text-muted">
              Last: {new Date(streak.lastCompleted).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      <div>
        <h2 className="text-lg font-display font-semibold mb-3">Recent Tasks</h2>
        {recentTasks.length > 0 ? (
          <div className="space-y-2">
            {recentTasks.map((task) => (
              <div key={task.id} className="bg-surface rounded-card p-3 flex items-center gap-3">
                {task.status === "completed" ? (
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                ) : task.status === "missed" ? (
                  <XCircle className="w-5 h-5 text-error flex-shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 text-text-muted flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {new Date(task.scheduledDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </p>
                  {task.xpEarned && (
                    <p className="text-xs text-primary">+{task.xpEarned} XP</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  task.status === "completed" ? "bg-success/20 text-success" :
                  task.status === "missed" ? "bg-error/20 text-error" :
                  "bg-surface-light text-text-muted"
                }`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface rounded-card p-6 text-center">
            <p className="text-text-muted">No tasks yet. Tasks are generated based on your goal frequency.</p>
          </div>
        )}
      </div>

      {goal.milestones && goal.milestones.length > 0 && (
        <div>
          <h2 className="text-lg font-display font-semibold mb-3">Milestones</h2>
          <div className="space-y-2">
            {goal.milestones.map((m) => (
              <div key={m.id} className="bg-surface rounded-card p-3 flex items-center justify-between">
                <span className="text-sm font-medium">{m.type.replace("_", " ")} ({m.threshold})</span>
                {m.achievedAt ? (
                  <span className="text-xs text-success">Achieved!</span>
                ) : (
                  <span className="text-xs text-text-muted">Locked</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
