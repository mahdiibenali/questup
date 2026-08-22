# 🎮 QuestUp

**Turn your goals into quests.** A gamified productivity platform where habits, goals and challenges earn you XP, build streaks, unlock achievements — and an AI verifier keeps you honest.

![CI](https://github.com/mahdiibenali/questup/actions/workflows/ci.yml/badge.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![tRPC](https://img.shields.io/badge/tRPC-v11-2596BE?logo=trpc)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?logo=tailwindcss)
![Expo](https://img.shields.io/badge/Mobile-Expo_React_Native-000020?logo=expo)

## 🎯 The problem

Habit trackers break the moment real life happens: one sick week and your 90-day streak is gone, so people quit the app instead of the habit. QuestUp flips the model — goals become quests with **XP payouts scaled by AI-verified proof**, and a circumstances engine bends the rules (XP modifiers, streak freeze tokens) when life gets in the way.

## ✨ Features

- **AI proof verification** — upload photo evidence; Claude returns structured `{confidence, verified, rejectionReason}` and XP payout scales with confidence tiers, plus peer-review escalation and abuse limits
- **Composable XP engine** — base XP × difficulty multiplier × verification tier × time bonuses × circumstances modifier (`server/lib/xp-engine.ts`)
- **Streaks & achievements** — per-goal streak tracking, freeze tokens, 17+ seedable achievements
- **Circumstances engine** — declare travel/illness/exams and goals adapt instead of breaking
- **Challenges** — three daily challenge types per user, generated on schedule
- **Leaderboards** — friend-scoped and global weekly rankings with scheduled recomputation
- **Social** — friendships, friend requests and peer reviews for accountability
- **Analytics** — XP timeline, habit heatmap, category radar, trajectory and AI insights
- **Scheduled jobs** — daily rollover, streak decay, weekly leaderboard recompute, AI insights (Vercel Cron / QStash + Redis caching)
- **Mobile app** — Expo React Native client sharing the exact same tRPC router types
- **Dynamic OG images** — personalized share cards generated at the edge (satori)

## 🏗️ Architecture

```
Next.js App Router ──► tRPC v11 routers ──► Prisma ──► SQLite (swap provider for Postgres)
        │                     │                ▲
   NextAuth v5           server/lib:         seeders &
   middleware            xp-engine · streaks  cron jobs (/api/cron/*)
         │               achievements · ai-verification · circumstances
    Cloudinary ◄── signed uploads     QStash + Redis + Resend email + Pusher realtime
```

**Data model (15 models):** User, Goal, Task, Challenge, XpTransaction, Streak, Milestone, Achievement, UserAchievement, Friendship, LeaderboardEntry, PeerReview + NextAuth tables — well-indexed with composite uniques like `[goalId, scheduledDate]` and `[userId, weekStart]`.

**API surface** — 6 tRPC routers (`goals`, `tasks`, `challenges`, `user`, `leaderboard`, `analytics`), all behind `protectedProcedure`; REST routes for auth, uploads (`/api/upload/sign`), OG images and 4 Bearer-guarded cron endpoints.

## 🚀 Getting started

### Prerequisites

- Node.js ≥ 20

### Web

```bash
npm install
cp .env.example .env
npx prisma migrate dev       # or: npm run db:push
npm run db:seed              # optional: seeds achievements
npm run dev                  # http://localhost:3000
```

Key env vars (full list in [.env.example](.env.example)):

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ | SQLite file by default (schema provider); Postgres URL works after switching the provider |
| `NEXTAUTH_SECRET` / `NEXTAUTH_URL` | ✅ | Auth |
| `ANTHROPIC_API_KEY` | ✅ | AI proof verification |
| `CRON_SECRET` | ⚙️ | Bearer secret enforced by `/api/cron/*` routes |
| Cloudinary / QStash / Redis / Pusher / Resend keys | ⚙️ | Uploads, jobs, realtime, email |

### Mobile

```bash
cd mobile && npm install && npx expo start
```

## 🧪 Testing

Vitest is configured (`tests/unit/**`) but the suite is still greenfield — CI currently gates ESLint + strict TypeScript ([workflow](.github/workflows/ci.yml)). Playwright e2e is planned next.

## 🔭 Roadmap

- [ ] Unit test suite for the XP/streak/verification engines
- [ ] Playwright e2e flows (onboarding → proof → XP payout)
- [ ] First-class Postgres provider option
- [ ] PWA icons + installable experience
- [ ] Push notifications via Expo

## 📄 License

MIT — see [LICENSE](LICENSE).
