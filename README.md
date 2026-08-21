# 🎮 QuestUp

**Turn your goals into quests.** A gamified productivity platform where habits, goals and challenges earn you XP, build streaks, unlock achievements — and an AI verifier keeps you honest.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![tRPC](https://img.shields.io/badge/tRPC-v11-2596BE?logo=trpc)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?logo=tailwindcss)
![Expo](https://img.shields.io/badge/Mobile-Expo_React_Native-000020?logo=expo)

## ✨ Features

- **XP engine** — every completed task awards experience; levels, XP transactions and level badges are first-class entities
- **Streaks & achievements** — daily-streak tracking with 12+ unlockable achievement types
- **Challenges** — time-boxed quests, optionally **verified by AI** (Claude) from photo evidence
- **Leaderboards** — friend-scoped and global rankings with scheduled recalculation jobs
- **Social** — friendships, peer reviews and accountability partners
- **Circumstances engine** — goals adapt to your life situation (travel, illness, exams) instead of breaking your streak
- **Analytics** — completion trends, category breakdowns, momentum scores
- **Cron jobs** — daily rollover, streak decay, leaderboard recompute, AI insights (QStash-scheduled)
- **Mobile app** — Expo React Native client sharing the same tRPC API
- **Dynamic OG images** — personalized share cards generated at the edge

## 🏗️ Architecture

```
Next.js App Router ──► tRPC v11 routers ──► Prisma ──► PostgreSQL
        │                     │                ▲
   NextAuth.js          server/lib:         seeders &
   middleware           xp-engine · streaks  cron jobs
        │               achievements · ai-verification
   Cloudinary ◄── uploads            QStash + Redis + Resend + Pusher
```

**Data model (15 models):** User, Goal, Task, Challenge, XpTransaction, Streak, Milestone, Achievement, UserAchievement, Friendship, LeaderboardEntry, PeerReview…

## 🚀 Quick start

```bash
npm install
cp .env.example .env      # DATABASE_URL, NEXTAUTH_SECRET, ANTHROPIC_API_KEY…
npx prisma migrate dev
npm run dev               # http://localhost:3000
```

Mobile:

```bash
cd mobile && npm install && npx expo start
```

## 🧪 Engineering highlights

- End-to-end type safety: Prisma → tRPC → React (shared router types with mobile)
- Server-side XP/streak invariants enforced in a single engine module
- AI verification pipeline with structured output parsing and abuse limits
- Scheduled jobs decoupled via QStash (HTTP cron) with Redis-backed caching

## 📄 License

MIT — see [LICENSE](LICENSE).
