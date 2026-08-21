"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { trpc } from "@/lib/trpc-client";
import { cn } from "@/lib/utils";
import { LevelBadge } from "@/components/ui/level-badge";
import { getLevelTitle } from "@/lib/constants";
import {
  Home,
  Target,
  Zap,
  Trophy,
  BarChart3,
  User,
  Flame,
  LogOut,
  Users,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Today", icon: Home },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/challenges", label: "Quests", icon: Zap },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/circumstances", label: "Context", icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { data: user } = trpc.user.me.useQuery();

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-bg-elevated border-r border-border">
        {/* Logo */}
        <div className="px-5 py-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                <path d="M16 4L24 16H20V28H12V16H8L16 4Z" fill="white" />
                <circle cx="16" cy="8" r="2" fill="#FDCB6E" />
              </svg>
            </div>
            <span className="text-lg font-display font-bold text-text">LevelUp</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary-muted text-primary"
                    : "text-text-secondary hover:text-text hover:bg-bg-hover"
                )}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        {session?.user && (
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-bg-hover/50">
              <div className="w-9 h-9 rounded-full bg-primary-muted flex items-center justify-center overflow-hidden shrink-0">
                {session.user.image ? (
                  <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold text-primary">
                    {session.user.name?.charAt(0) || "?"}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">
                  {session.user.name}
                </p>
                <p className="text-xs text-text-dim flex items-center gap-1">
                  <Flame className="w-3 h-3 text-streak" />
                  Lvl {user?.level ?? 1} {getLevelTitle(user?.level ?? 1)}
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="p-1.5 rounded-md text-text-dim hover:text-streak hover:bg-streak-muted transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-elevated/95 backdrop-blur-xl border-t border-border z-50 safe-bottom">
        <div className="flex justify-around px-2 py-1.5">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-150 min-w-[52px]",
                  isActive
                    ? "text-primary"
                    : "text-text-dim active:text-text-secondary"
                )}
              >
                <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
