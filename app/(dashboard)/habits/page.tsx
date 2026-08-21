"use client";

import { trpc } from "@/lib/trpc-client";

export default function HabitsPage() {
  const { data: heatmap, isLoading } = trpc.analytics.habitHeatmap.useQuery({ year: new Date().getFullYear() });

  const getColor = (rate: number) => {
    if (rate === 0) return "bg-bg-hover";
    if (rate < 0.3) return "bg-primary/20";
    if (rate < 0.6) return "bg-primary/40";
    if (rate < 0.8) return "bg-primary/70";
    return "bg-primary";
  };

  const year = new Date().getFullYear();
  const allDays: string[] = [];
  const d = new Date(year, 0, 1);
  while (d.getFullYear() === year) {
    allDays.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }
  const dayMap = new Map((heatmap?.data ?? []).map((dd) => [dd.date, dd]));

  const totalCompleted = heatmap?.data?.reduce((sum, dd) => sum + dd.completionCount, 0) ?? 0;
  const totalTasks = heatmap?.data?.reduce((sum, dd) => sum + dd.taskCount, 0) ?? 0;
  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
  const activeDays = allDays.filter((dd) => dayMap.has(dd) && (dayMap.get(dd)?.completionCount ?? 0) > 0).length;

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h1 className="text-2xl font-display font-bold text-text">Habits</h1>
        <p className="text-sm text-text-secondary mt-0.5">Your {year} activity heatmap</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-bg-elevated border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-display font-bold text-primary">{totalCompleted}</p>
          <p className="text-xs text-text-dim mt-0.5">Tasks Done</p>
        </div>
        <div className="bg-bg-elevated border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-display font-bold text-success">{completionRate}%</p>
          <p className="text-xs text-text-dim mt-0.5">Completion</p>
        </div>
        <div className="bg-bg-elevated border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-display font-bold text-xp">{activeDays}</p>
          <p className="text-xs text-text-dim mt-0.5">Active Days</p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-40 bg-bg-elevated border border-border rounded-xl animate-skeleton-pulse" />
      ) : (
        <div className="bg-bg-elevated border border-border rounded-xl p-5">
          <div className="flex flex-wrap gap-[3px]">
            {allDays.map((day) => {
              const data = dayMap.get(day);
              const completed = data?.completionCount ?? 0;
              const taskCount = data?.taskCount ?? 0;
              const rate = taskCount > 0 ? completed / taskCount : 0;
              return (
                <div key={day} className={`w-[10px] h-[10px] rounded-[2px] ${getColor(rate)} cursor-default transition-colors`} title={`${day}: ${completed}/${taskCount}`} />
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="text-xs text-text-dim">Less</span>
            {[0, 0.3, 0.6, 0.8, 1].map((r, i) => (
              <div key={i} className={`w-[10px] h-[10px] rounded-[2px] ${getColor(r)}`} />
            ))}
            <span className="text-xs text-text-dim">More</span>
          </div>
        </div>
      )}
    </div>
  );
}
