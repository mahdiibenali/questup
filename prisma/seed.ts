import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ACHIEVEMENTS = [
  // Level achievements
  { key: "level_5", title: "First Spark", description: "Reach Level 5", icon: "spark", xpReward: 100 },
  { key: "level_10", title: "Dedicated Seeker", description: "Reach Level 10", icon: "seeker", xpReward: 250 },
  { key: "level_25", title: "Rising Apprentice", description: "Reach Level 25", icon: "apprentice", xpReward: 500 },
  { key: "level_50", title: "Skilled Veteran", description: "Reach Level 50", icon: "skilled", xpReward: 1000 },
  { key: "level_100", title: "Mythic Legend", description: "Reach Level 100", icon: "mythic", xpReward: 5000 },

  // Streak achievements
  { key: "streak_7", title: "Week Warrior", description: "7-day streak on any goal", icon: "streak_7", xpReward: 100 },
  { key: "streak_30", title: "Monthly Momentum", description: "30-day streak", icon: "streak_30", xpReward: 300 },
  { key: "streak_90", title: "Quarter Champion", description: "90-day streak", icon: "streak_90", xpReward: 750 },
  { key: "streak_365", title: "Year of Growth", description: "365-day streak", icon: "streak_365", xpReward: 2000 },

  // Completion achievements
  { key: "tasks_100", title: "Century Club", description: "Complete 100 tasks total", icon: "tasks_100", xpReward: 200 },
  { key: "tasks_1000", title: "Powerhouse", description: "Complete 1,000 tasks", icon: "tasks_1000", xpReward: 1000 },
  { key: "first_task", title: "First Step", description: "Complete your first task", icon: "first", xpReward: 50 },

  // Challenge achievements
  { key: "perfect_day_1", title: "Perfect Day", description: "Complete all 3 daily challenges in one day", icon: "perfect_day", xpReward: 500 },
  { key: "perfect_week", title: "Flawless Week", description: "Get Perfect Day 7 days in a row", icon: "perfect_week", xpReward: 2000 },

  // Social achievements
  { key: "first_friend", title: "Social Butterfly", description: "Add your first friend", icon: "friend", xpReward: 50 },
  { key: "friends_10", title: "Inner Circle", description: "Have 10 friends on LevelUp", icon: "friends_10", xpReward: 150 },

  // Category mastery
  { key: "master_fitness", title: "Fitness Guru", description: "Complete 500 fitness tasks", icon: "master_fitness", xpReward: 500, category: "fitness" },
  { key: "master_learning", title: "Knowledge Seeker", description: "Complete 500 learning tasks", icon: "master_learning", xpReward: 500, category: "learning" },
  { key: "master_mindfulness", title: "Zen Master", description: "Complete 500 mindfulness tasks", icon: "master_mindfulness", xpReward: 500, category: "mindfulness" },
];

async function main() {
  console.log("Seeding achievements...");

  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: {},
      create: achievement,
    });
  }

  console.log(`Seeded ${ACHIEVEMENTS.length} achievements`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
