"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc-client";
import { XPBar } from "@/components/ui/xp-bar";
import { LevelBadge } from "@/components/ui/level-badge";
import { Badge } from "@/components/ui/badge";
import { getLevelTitle, XP_TO_LEVEL } from "@/lib/constants";
import { CheckCircle, Camera, X, Flame, Trophy, Snowflake } from "lucide-react";
import Link from "next/link";

export default function TodayView() {
  const { data: session } = useSession();
  const { data: user, isLoading: userLoading } = trpc.user.me.useQuery();
  const { data: tasksData, isLoading: tasksLoading, refetch: refetchTasks } = trpc.tasks.today.useQuery();
  const utils = trpc.useUtils();

  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [proofText, setProofText] = useState("");
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [completionResult, setCompletionResult] = useState<{
    xpEarned: number;
    levelsGained: number;
    levelUps: Array<{ level: number; title: string }>;
    milestoneReached: number | null;
    achievementIds: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitProof = trpc.tasks.submitProof.useMutation({
    onSuccess: (data) => {
      setCompletionResult({
        xpEarned: data.xpEarned ?? 0,
        levelsGained: data.levelsGained ?? 0,
        levelUps: (data as { levelUps?: Array<{ level: number; title: string }> }).levelUps ?? [],
        milestoneReached: data.milestoneReached ?? null,
        achievementIds: (data as { achievementIds?: string[] }).achievementIds ?? [],
      });
      setCompletingTaskId(null);
      setProofText("");
      setProofPreview(null);
      setSelectedFile(null);
      refetchTasks();
      utils.user.me.invalidate();
    },
    onError: (error) => {
      alert(error.message);
      setCompletingTaskId(null);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setProofPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = async (taskId: string) => {
    if (!selectedFile && !proofText) return;

    let proofUrl = "";

    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        alert("Photo upload failed. Please try again.");
        return;
      }

      const { url } = await uploadRes.json();
      proofUrl = url;
    } else {
      proofUrl = "text-only-submission";
    }

    submitProof.mutate({
      taskId,
      proofUrl,
      proofText: proofText || undefined,
    });
  };

  if (userLoading || tasksLoading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-bg-hover rounded-lg animate-skeleton-pulse" />
          <div className="h-4 w-32 bg-bg-hover rounded-lg animate-skeleton-pulse" />
        </div>
        <div className="bg-bg-elevated border border-border rounded-xl p-5">
          <div className="h-2.5 w-full bg-bg-hover rounded-full animate-skeleton-pulse" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-bg-elevated border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-bg-hover rounded-full animate-skeleton-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-bg-hover rounded animate-skeleton-pulse" />
                <div className="h-3 w-1/2 bg-bg-hover rounded animate-skeleton-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-text-secondary">Please sign in to continue.</p>
      </div>
    );
  }

  const xpToNext = XP_TO_LEVEL(user.level + 1);
  const levelTitle = getLevelTitle(user.level);
  const todayTasks = tasksData ?? [];
  const completedCount = todayTasks.filter((t) => t.status === "completed").length;

  if (completionResult) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center animate-fade-in-up">
        <div className="bg-bg-elevated border border-border rounded-xl p-10 text-center max-w-md w-full space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-xp/10 flex items-center justify-center animate-xp-gain">
            <Trophy className="w-10 h-10 text-xp" />
          </div>
          <div>
            <p className="text-sm text-text-secondary mb-1">Task completed!</p>
            <p className="text-4xl font-display font-bold text-xp">+{completionResult.xpEarned} XP</p>
          </div>
          {completionResult.levelsGained > 0 && (
            <div className="space-y-2">
              {completionResult.levelUps.map((lu) => (
                <div key={lu.level} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-muted rounded-full">
                  <LevelBadge level={lu.level} size="sm" />
                  <span className="text-sm font-semibold text-primary">
                    Level {lu.level} — {lu.title}
                  </span>
                </div>
              ))}
            </div>
          )}
          {completionResult.milestoneReached && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-streak-muted rounded-full">
              <Flame className="w-4 h-4 text-streak" />
              <span className="text-sm font-semibold text-streak">
                {completionResult.milestoneReached} day streak milestone!
              </span>
            </div>
          )}
          <button
            onClick={() => setCompletionResult(null)}
            className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 stagger-children">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text">
            Welcome back, {user.name?.split(" ")[0]}
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <LevelBadge level={user.level} size="md" />
      </div>

      {/* XP Progress */}
      <div className="bg-bg-elevated border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-text-secondary">
            Level {user.level} — {levelTitle}
          </span>
          <span className="text-xs font-mono text-primary font-semibold">
            {user.currentLevelXp} / {xpToNext} XP
          </span>
        </div>
        <XPBar currentXp={user.currentLevelXp} requiredXp={xpToNext} size="md" showLabel={false} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total XP"
          value={user.totalXp.toLocaleString()}
          color="text-xp"
          icon={<Trophy className="w-4 h-4" />}
        />
        <StatCard
          label="Active Streaks"
          value={String(user.currentStreaks?.length ?? 0)}
          color="text-streak"
          icon={<Flame className="w-4 h-4" />}
        />
        <StatCard
          label="Achievements"
          value={String(user.achievements?.length ?? 0)}
          color="text-xp"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
        />
        <StatCard
          label="Shields"
          value={String(user.freezeTokens)}
          color="text-blue-400"
          icon={<Snowflake className="w-4 h-4" />}
        />
      </div>

      {/* Tasks Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-display font-semibold text-text">Today&apos;s Tasks</h2>
          <span className="text-xs font-mono text-text-secondary">
            {completedCount}/{todayTasks.length} done
          </span>
        </div>

        {todayTasks.length > 0 ? (
          <div className="space-y-3">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className="bg-bg-elevated border border-border rounded-xl p-4 transition-all duration-200 hover:border-border-strong"
              >
                {completingTaskId === task.id ? (
                  <ProofSubmissionForm
                    task={task}
                    proofText={proofText}
                    setProofText={setProofText}
                    proofPreview={proofPreview}
                    setProofPreview={setProofPreview}
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                    fileInputRef={fileInputRef}
                    handleFileSelect={handleFileSelect}
                    handleComplete={() => handleComplete(task.id)}
                    onCancel={() => {
                      setCompletingTaskId(null);
                      setProofText("");
                      setProofPreview(null);
                      setSelectedFile(null);
                    }}
                    isPending={submitProof.isPending}
                  />
                ) : (
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      task.status === "completed"
                        ? "bg-success-muted"
                        : "bg-bg-hover"
                    }`}>
                      {task.status === "completed" ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <span className="text-xs font-mono text-text-dim">
                          {task.goal.category.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text truncate">{task.goal.title}</p>
                      <p className="text-xs text-text-dim">{task.goal.category}</p>
                    </div>
                    {task.status === "completed" ? (
                      <Badge variant="success" size="sm">Done</Badge>
                    ) : (
                      <button
                        onClick={() => setCompletingTaskId(task.id)}
                        className="h-9 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-bg-elevated border border-border rounded-xl p-10 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary-muted flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <p className="text-text-secondary mb-1">No tasks for today</p>
            <p className="text-sm text-text-dim mb-4">Create a goal to start earning XP</p>
            <Link
              href="/goals/new"
              className="inline-flex h-10 px-5 items-center gap-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            >
              Create a Goal
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="bg-bg-elevated border border-border rounded-xl p-4 text-center transition-all duration-200 hover:border-border-strong">
      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-bg-hover mb-2 ${color}`}>
        {icon}
      </div>
      <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
      <p className="text-xs text-text-dim mt-0.5">{label}</p>
    </div>
  );
}

function ProofSubmissionForm({
  task,
  proofText,
  setProofText,
  proofPreview,
  setProofPreview,
  selectedFile,
  setSelectedFile,
  fileInputRef,
  handleFileSelect,
  handleComplete,
  onCancel,
  isPending,
}: {
  task: { goal: { title: string; category: string } };
  proofText: string;
  setProofText: (text: string) => void;
  proofPreview: string | null;
  setProofPreview: (preview: string | null) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleComplete: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-medium text-text">{task.goal.title}</p>
        <button onClick={onCancel} className="p-1 rounded-lg hover:bg-bg-hover transition-colors">
          <X className="w-5 h-5 text-text-dim" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {proofPreview ? (
        <div className="relative rounded-xl overflow-hidden">
          <img src={proofPreview} alt="Proof" className="w-full h-48 object-cover" />
          <button
            onClick={() => { setProofPreview(null); setSelectedFile(null); }}
            className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2 text-text-dim hover:border-primary/50 hover:text-text-secondary transition-colors"
        >
          <Camera className="w-8 h-8" />
          <span className="text-sm">Add photo proof</span>
        </button>
      )}

      <textarea
        value={proofText}
        onChange={(e) => setProofText(e.target.value)}
        placeholder="Describe what you did (min 10 characters)"
        className="w-full bg-bg border border-border rounded-lg p-3 text-sm text-text placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-elevated transition-all resize-none"
        rows={3}
      />

      <button
        onClick={handleComplete}
        disabled={isPending || (!selectedFile && proofText.length < 10)}
        className="w-full h-11 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
      >
        {isPending ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
            </svg>
            Verifying...
          </span>
        ) : (
          "Submit Proof"
        )}
      </button>
    </div>
  );
}
