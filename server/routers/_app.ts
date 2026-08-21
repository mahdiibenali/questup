import { router } from "@/lib/trpc";
import { goalsRouter } from "./goals";
import { tasksRouter } from "./tasks";
import { challengesRouter } from "./challenges";
import { userRouter } from "./user";
import { leaderboardRouter } from "./leaderboard";
import { analyticsRouter } from "./analytics";

export const appRouter = router({
  goals: goalsRouter,
  tasks: tasksRouter,
  challenges: challengesRouter,
  user: userRouter,
  leaderboard: leaderboardRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
