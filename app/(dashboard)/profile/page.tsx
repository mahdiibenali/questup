"use client";

import { trpc } from "@/lib/trpc-client";
import { useSession } from "next-auth/react";
import { XPBar } from "@/components/ui/xp-bar";
import { LevelBadge } from "@/components/ui/level-badge";
import { getLevelTitle, XP_TO_LEVEL } from "@/lib/constants";
import { Settings, Shield, Bell, UserPlus } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { data: user } = trpc.user.me.useQuery();

  if (!user) return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="h-8 w-32 bg-bg-hover rounded-lg animate-skeleton-pulse" />
      <div className="h-40 bg-bg-elevated border border-border rounded-xl animate-skeleton-pulse" />
    </div>
  );

  const xpToNext = XP_TO_LEVEL(user.level + 1);
  const levelTitle = getLevelTitle(user.level);

  return (
    <div className="space-y-6 stagger-children">
      <h1 className="text-2xl font-display font-bold text-text">Profile</h1>

      <div className="bg-bg-elevated border border-border rounded-xl p-6">
        <div className="flex items-center gap-4 mb-5">
          <LevelBadge level={user.level} size="lg" />
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-text">{user.name}</h2>
            <p className="text-sm text-text-secondary">{user.email}</p>
            <p className="text-xs text-text-dim mt-0.5">{levelTitle}</p>
          </div>
        </div>
        <XPBar currentXp={user.currentLevelXp} requiredXp={xpToNext} size="md" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-bg-elevated border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-display font-bold text-xp">{user.totalXp}</p>
          <p className="text-xs text-text-dim mt-0.5">Total XP</p>
        </div>
        <div className="bg-bg-elevated border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-display font-bold text-blue-400">{user.freezeTokens}</p>
          <p className="text-xs text-text-dim mt-0.5">Shields</p>
        </div>
      </div>

      <div className="space-y-2">
        {[
          { href: "/circumstances", icon: Settings, label: "Life Context & XP Modifier" },
          { href: "/friends", icon: UserPlus, label: "Friends & Privacy" },
          { href: "/habits", icon: Shield, label: "Habit Heatmap" },
        ].map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}
            className="flex items-center gap-3 bg-bg-elevated hover:bg-bg-hover border border-border rounded-xl p-4 transition-colors duration-150">
            <Icon className="w-5 h-5 text-text-dim" />
            <span className="text-sm text-text">{label}</span>
          </Link>
        ))}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 bg-bg-elevated hover:bg-streak-muted border border-border hover:border-streak rounded-xl p-4 transition-colors duration-150 text-left"
        >
          <span className="text-sm text-streak">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
