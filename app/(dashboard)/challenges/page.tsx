"use client";

import { trpc } from "@/lib/trpc-client";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Zap } from "lucide-react";

export default function ChallengesPage() {
  const { data: challenges, isLoading, refetch } = trpc.challenges.today.useQuery();
  const { data: history } = trpc.challenges.history.useQuery({ days: 7 });
  const utils = trpc.useUtils();

  const completeChallenge = trpc.challenges.complete.useMutation({
    onSuccess: () => { refetch(); utils.user.me.invalidate(); },
  });

  return (
    <div className="space-y-6 stagger-children">
      <h1 className="text-2xl font-display font-bold text-text">Daily Quests</h1>

      {history && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-bg-elevated border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-display font-bold text-success">{history.completed}</p>
            <p className="text-xs text-text-dim mt-0.5">Done (7d)</p>
          </div>
          <div className="bg-bg-elevated border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-display font-bold text-streak">{history.missed}</p>
            <p className="text-xs text-text-dim mt-0.5">Missed (7d)</p>
          </div>
          <div className="bg-bg-elevated border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-display font-bold text-primary">{history.total}</p>
            <p className="text-xs text-text-dim mt-0.5">Total (7d)</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-bg-elevated border border-border rounded-xl animate-skeleton-pulse" />
          ))}
        </div>
      ) : challenges && challenges.length > 0 ? (
        <div className="space-y-3">
          {challenges.map((challenge) => {
            const isCompleted = challenge.status === "completed";
            return (
              <div key={challenge.id} className="bg-bg-elevated border border-border rounded-xl p-5 transition-all duration-200 hover:border-border-strong">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isCompleted ? "bg-success-muted" : "bg-xp/10"}`}>
                      <Zap className={`w-4 h-4 ${isCompleted ? "text-success" : "text-xp"}`} />
                    </div>
                    <h3 className="font-semibold text-text">{challenge.title}</h3>
                  </div>
                  <span className="text-sm font-mono text-xp font-semibold">+{challenge.xpReward} XP</span>
                </div>
                <p className="text-sm text-text-secondary mb-3">{challenge.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-dim capitalize">{challenge.type} &middot; {challenge.category}</span>
                  {isCompleted ? (
                    <Badge variant="success">Completed</Badge>
                  ) : (
                    <button
                      onClick={() => completeChallenge.mutate({ challengeId: challenge.id })}
                      disabled={completeChallenge.isPending}
                      className="h-8 px-3 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-all duration-150"
                    >
                      {completeChallenge.isPending ? "..." : "Complete"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-bg-elevated border border-border rounded-xl p-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-xp/10 flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-xp" />
          </div>
          <p className="text-text-secondary">No quests for today yet</p>
          <p className="text-sm text-text-dim mt-1">Complete tasks to unlock daily challenges</p>
        </div>
      )}
    </div>
  );
}
