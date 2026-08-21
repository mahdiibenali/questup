"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc-client";
import { Badge } from "@/components/ui/badge";
import { Flame, Pause, Play, Plus } from "lucide-react";

export default function GoalsPage() {
  const { data: goals, isLoading } = trpc.goals.list.useQuery();
  const utils = trpc.useUtils();

  const pauseGoal = trpc.goals.pause.useMutation({ onSuccess: () => utils.goals.list.invalidate() });
  const resumeGoal = trpc.goals.resume.useMutation({ onSuccess: () => utils.goals.list.invalidate() });

  return (
    <div className="space-y-6 stagger-children">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-text">My Goals</h1>
        <Link
          href="/goals/new"
          className="h-9 px-4 flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          New Goal
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-bg-elevated border border-border rounded-xl animate-skeleton-pulse" />
          ))}
        </div>
      ) : goals && goals.length > 0 ? (
        <div className="space-y-3">
          {goals.map((goal) => {
            const streak = goal.streaks?.[0];
            const isActive = goal.status === "active";
            const isPaused = goal.status === "paused";

            return (
              <div key={goal.id} className="bg-bg-elevated border border-border rounded-xl p-5 transition-all duration-200 hover:border-border-strong">
                <div className="flex items-start justify-between mb-3">
                  <Link href={`/goals/${goal.id}`} className="flex-1">
                    <h3 className="font-semibold text-text">{goal.title}</h3>
                    <p className="text-sm text-text-secondary mt-0.5">
                      {goal.category} &middot; {goal.frequency}
                    </p>
                  </Link>
                  <div className="flex items-center gap-2">
                    {streak && streak.currentStreak > 0 && (
                      <span className="flex items-center gap-1 text-sm text-streak font-medium">
                        <Flame className="w-4 h-4" />
                        {streak.currentStreak}
                      </span>
                    )}
                    {isPaused ? (
                      <button
                        onClick={() => resumeGoal.mutate({ id: goal.id })}
                        className="p-1.5 rounded-md text-text-dim hover:text-success hover:bg-success-muted transition-colors"
                        title="Resume"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    ) : isActive ? (
                      <button
                        onClick={() => pauseGoal.mutate({ id: goal.id })}
                        className="p-1.5 rounded-md text-text-dim hover:text-xp hover:bg-xp/10 transition-colors"
                        title="Pause"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <Badge variant={isActive ? "success" : isPaused ? "xp" : "default"}>
                    {goal.status}
                  </Badge>
                  <span className="text-text-dim">{goal._count?.tasks ?? 0} tasks</span>
                  {streak && <span className="text-text-dim">Best: {streak.bestStreak}d</span>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-bg-elevated border border-border rounded-xl p-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary-muted flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-primary" />
          </div>
          <p className="text-text-secondary mb-1">No goals yet</p>
          <p className="text-sm text-text-dim mb-4">Start your journey!</p>
          <Link
            href="/goals/new"
            className="inline-flex h-10 px-5 items-center gap-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-all duration-150"
          >
            Create Your First Goal
          </Link>
        </div>
      )}
    </div>
  );
}
