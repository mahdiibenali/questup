"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { cn } from "@/lib/utils";
import { Globe, Medal, Trophy, Users } from "lucide-react";

type Tab = "friends" | "global";

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>("friends");
  const { data: friendsData, isLoading: friendsLoading } = trpc.leaderboard.friends.useQuery();
  const { data: globalData, isLoading: globalLoading } = trpc.leaderboard.global.useQuery({ limit: 50 });
  const { data: myRank } = trpc.leaderboard.myRank.useQuery();

  const entries = tab === "friends" ? friendsData?.entries : globalData?.entries;
  const isLoading = tab === "friends" ? friendsLoading : globalLoading;

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return { text: "\u2605", color: "text-xp" };
    if (rank === 2) return { text: "\u2605\u2605", color: "text-text-secondary" };
    if (rank === 3) return { text: "\u2605\u2605\u2605", color: "text-amber-500" };
    return { text: `#${rank}`, color: "text-text-dim" };
  };

  return (
    <div className="space-y-6 stagger-children">
      <h1 className="text-2xl font-display font-bold text-text">Leaderboard</h1>

      {myRank && (
        <div className="bg-bg-elevated border border-primary rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-muted flex items-center justify-center">
              <Medal className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Your Rank</p>
              <p className="text-lg font-display font-bold text-text">
                {myRank.globalRank ? `#${myRank.globalRank} Global` : "Unranked"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-display font-bold text-xp">{myRank.weeklyXp} XP</p>
            <p className="text-xs text-text-dim">This week</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {([["friends", "Friends", Users], ["global", "Global", Globe]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium transition-all duration-150",
              tab === key ? "bg-primary text-white" : "bg-bg-elevated text-text-dim hover:bg-bg-hover border border-border"
            )}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-bg-elevated border border-border rounded-xl animate-skeleton-pulse" />
          ))}
        </div>
      ) : entries && entries.length > 0 ? (
        <div className="space-y-2">
          {entries.map((entry) => {
            const rank = getRankDisplay(entry.rank);
            return (
              <div key={entry.userId} className="bg-bg-elevated border border-border rounded-xl p-4 flex items-center gap-4 transition-all duration-200 hover:border-border-strong">
                <span className={`w-10 text-center font-display font-bold text-lg ${rank.color}`}>{rank.text}</span>
                <div className="w-10 h-10 rounded-full bg-primary-muted flex items-center justify-center text-primary font-semibold text-sm shrink-0 overflow-hidden">
                  {entry.image ? (
                    <img src={entry.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    entry.name?.charAt(0) || "?"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text truncate">{entry.name}</p>
                  <p className="text-xs text-text-dim">Level {entry.level}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold text-xp">{entry.weeklyXp} XP</p>
                  <p className="text-xs text-text-dim">this week</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-bg-elevated border border-border rounded-xl p-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-xp/10 flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-xp" />
          </div>
          <p className="text-text-secondary">
            {tab === "friends" ? "Add friends to see the leaderboard!" : "No global rankings yet."}
          </p>
        </div>
      )}
    </div>
  );
}
