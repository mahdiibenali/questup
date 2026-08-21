"use client";

import React, { useState, lazy, Suspense } from "react";
import { trpc } from "@/lib/trpc-client";
import { cn } from "@/lib/utils";

const LineChart = lazy(() => import("recharts").then(m => ({ default: m.LineChart })));
const Line = lazy(() => import("recharts").then(m => ({ default: m.Line })));
const XAxis = lazy(() => import("recharts").then(m => ({ default: m.XAxis })));
const YAxis = lazy(() => import("recharts").then(m => ({ default: m.YAxis })));
const CartesianGrid = lazy(() => import("recharts").then(m => ({ default: m.CartesianGrid })));
const Tooltip = lazy(() => import("recharts").then(m => ({ default: m.Tooltip })));
const ResponsiveContainer = lazy(() => import("recharts").then(m => ({ default: m.ResponsiveContainer })));
const RadarChart = lazy(() => import("recharts").then(m => ({ default: m.RadarChart })));
const PolarGrid = lazy(() => import("recharts").then(m => ({ default: m.PolarGrid })));
const PolarAngleAxis = lazy(() => import("recharts").then(m => ({ default: m.PolarAngleAxis })));
const PolarRadiusAxis = lazy(() => import("recharts").then(m => ({ default: m.PolarRadiusAxis })));
const Radar = lazy(() => import("recharts").then(m => ({ default: m.Radar as unknown as React.ComponentType<any> })));

type TimeRange = 7 | 14 | 30;

function ChartFallback() {
  return <div className="h-[200px] bg-bg-hover rounded-lg animate-skeleton-pulse" />;
}

export default function AnalyticsPage() {
  const [days, setDays] = useState<TimeRange>(30);
  const { data: xpData } = trpc.analytics.xpTimeline.useQuery({ days, granularity: "day" });
  const { data: radarData } = trpc.analytics.categoryRadar.useQuery({ days });
  const { data: streakStats } = trpc.analytics.streakStats.useQuery();
  const { data: trajectory } = trpc.analytics.trajectory.useQuery();
  const { data: insight } = trpc.analytics.aiInsights.useQuery();

  const chartData = xpData?.data?.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    xp: d.xp,
  })) ?? [];

  const radarChartData = radarData?.data?.map((d) => ({
    category: d.category,
    rate: Math.round(d.completionRate * 100),
  })) ?? [];

  return (
    <div className="space-y-6 stagger-children">
      <h1 className="text-2xl font-display font-bold text-text">Analytics</h1>

      {trajectory && (
        <div className="bg-bg-elevated border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-text-secondary">Level {trajectory.currentLevel}</span>
            <span className="text-xs font-mono text-primary font-semibold">
              ~{trajectory.estimatedDaysToNext}d to next level
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-xp">{trajectory.currentXp}</p>
              <p className="text-xs text-text-dim">Total XP</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-success">{trajectory.dailyAverageXp}</p>
              <p className="text-xs text-text-dim">Avg XP/Day</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {([7, 14, 30] as TimeRange[]).map((d) => (
          <button key={d} onClick={() => setDays(d)}
            className={cn(
              "h-9 px-4 rounded-lg text-sm font-medium transition-all duration-150",
              days === d ? "bg-primary text-white" : "bg-bg-elevated text-text-dim hover:bg-bg-hover border border-border"
            )}>
            {d}d
          </button>
        ))}
      </div>

      <div className="bg-bg-elevated border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">XP Over Time</h2>
        {chartData.length > 0 ? (
          <Suspense fallback={<ChartFallback />}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6A6A80" }} />
                <YAxis tick={{ fontSize: 10, fill: "#6A6A80" }} />
                <Tooltip contentStyle={{ background: "#16161E", border: "1px solid #2A2A3A", borderRadius: 10, fontSize: 12 }} />
                <Line type="monotone" dataKey="xp" stroke="#6C5CE7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Suspense>
        ) : (
          <p className="text-text-dim text-sm text-center py-8">No XP data yet. Complete some tasks!</p>
        )}
      </div>

      {radarChartData.length > 0 && (
        <div className="bg-bg-elevated border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-text-secondary mb-3">Category Performance</h2>
          <Suspense fallback={<ChartFallback />}>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarChartData}>
                <PolarGrid stroke="#2A2A3A" />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: "#A0A0B8" }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: "#6A6A80" }} />
                <Radar name="Completion" dataKey="rate" stroke="#6C5CE7" fill="#6C5CE7" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </Suspense>
        </div>
      )}

      {streakStats && streakStats.streaks.length > 0 && (
        <div className="bg-bg-elevated border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-text-secondary mb-3">Streaks</h2>
          <div className="space-y-2">
            {streakStats.streaks.map((s) => (
              <div key={s.goalId} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-text">{s.goalTitle}</span>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono text-streak font-medium">{s.currentStreak}d</span>
                  <span className="text-text-dim text-xs">best: {s.bestStreak}d</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {insight && (
        <div className="bg-bg-elevated border-l-4 border-primary rounded-xl p-5">
          <h2 className="text-sm font-semibold text-primary mb-2">AI Insight</h2>
          <p className="text-sm text-text-secondary">{insight.insight}</p>
          {insight.isCached && <p className="text-xs text-text-dim mt-2 opacity-50">Cached</p>}
        </div>
      )}
    </div>
  );
}
