# LevelUp — UX Flow Map

## Core User Journeys

### 1. First-Time User (Onboarding)
```
Landing → Sign Up → [Name, Email, Password]
  ↓
Welcome Screen ("Welcome to LevelUp, {name}!")
  ↓
Step 1: "What are your top 3 goals?" (select from presets or custom)
  ↓
Step 2: "Set your life context" (circumstances — simplified version)
  ↓
Step 3: "Invite friends" (optional — skip or search)
  ↓
Dashboard (empty state with guided first task)
  ↓
First Goal Created → Tasks Auto-Seeded → First Task Completion → XP Animation
```

**Key decisions:**
- Onboarding is max 3 screens after signup. Don't ask 20 questions.
- Circumstances can be skipped — they're optional and affect XP modifier.
- Friend invites are last and skippable — core value comes first.

### 2. Daily Usage (Returning User)
```
Open App → Today View
  ↓
See today's tasks (max 5-7 shown)
  ↓
Complete task → Submit proof → AI verifies → XP earned → Animation
  ↓
Check streak status → Maybe freeze if needed
  ↓
See friends' activity on leaderboard
  ↓
Close app
```

**Time budget:** Daily usage should take 2-5 minutes. The app respects your time.

### 3. Goal Creation
```
Goals Page → "+ New Goal"
  ↓
Step 1: Goal name + category (Health, Learning, Work, Personal, Social)
  ↓
Step 2: Task type (Daily, Weekly, Custom schedule)
  ↓
Step 3: AI suggests task breakdown (or manual)
  ↓
Review & Confirm → Tasks auto-seeded for 30 days
```

### 4. Proof Submission
```
Task card → "Complete" button
  ↓
Proof modal:
  - Photo upload (optional, drag & drop)
  - Text description (10-500 chars)
  - Location (optional, auto-detect)
  ↓
Submit → "Verifying..." (2-5 seconds)
  ↓
Result: ✓ Verified (+XP) or ✗ Rejected (with reason)
  ↓
If rejected: can retry once more with better proof
```

### 5. Social Interaction
```
Friends Page → Search by name/email
  ↓
Send request → Friend accepts
  ↓
Leaderboard updates → See friend's XP, level, streaks
  ↓
Daily Challenge comparison ("Jordan beat your score yesterday")
```

### 6. Recovery Flow (Missed Tasks)
```
Open app after missing a day
  ↓
"Yesterday you missed 2 tasks. Your streak is at risk."
  ↓
Option A: Use Shield (freeze token) → Streak preserved
  ↓
Option B: Accept miss → Streak resets to 0
  ↓
System adjusts today's difficulty based on circumstances
```

## Empty States

| Page | Empty State Message | CTA |
|------|-------------------|-----|
| Dashboard (no goals) | "Your adventure begins here. Create your first goal!" | "Create Goal" |
| Goals (none) | "No goals yet. What do you want to level up?" | "Create Goal" |
| Challenges | "No challenges active. Create a goal to unlock daily quests!" | "Go to Goals" |
| Leaderboard | "Add friends to compete!" | "Find Friends" |
| Habits | "Complete tasks to see your habit heatmap fill up." | — |
| Analytics | "Need at least 7 days of data for insights." | — |

## Loading States

| Pattern | Usage |
|---------|-------|
| **Skeleton cards** | Dashboard tasks, goal list, leaderboard |
| **Pulse animation** | XP bar, level indicator |
| **Spinner + text** | "Verifying your proof..." (takes 2-5s) |
| **Progress steps** | Onboarding, goal creation |
| **Optimistic update** | Task completion (show success immediately, revert on error) |

## Error States

| Error | User Message | Recovery |
|-------|-------------|----------|
| Network error | "You're offline. Changes will sync when you reconnect." | Auto-retry |
| Auth expired | "Your session expired. Please sign in again." | Redirect to login |
| Proof rejected | "The AI couldn't verify that proof. Reason: {reason}" | Retry or skip |
| Server error | "Something went wrong. We've been notified." | Retry button |
| Rate limit | "Too many requests. Please wait a moment." | Auto-retry in 30s |

## Accessibility Requirements

- All interactive elements minimum 44px touch target
- Color contrast ratio minimum 4.5:1 (AA compliance)
- All images have alt text
- Keyboard navigation through all flows
- Screen reader labels on all form inputs
- Focus visible on all focusable elements
- Reduced motion: disable animations for `prefers-reduced-motion`
