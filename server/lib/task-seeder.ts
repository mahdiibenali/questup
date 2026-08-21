import { PrismaClient, Goal, Task } from "@prisma/client";
import { addDays, startOfDay, isSameDay } from "date-fns";

function getDaysOfWeek(frequency: string): number[] {
  if (frequency === "daily") return [0, 1, 2, 3, 4, 5, 6];

  if (frequency.startsWith("weekly:")) {
    const day = parseInt(frequency.split(":")[1], 10);
    return [day];
  }

  if (frequency.startsWith("custom:")) {
    const days = frequency
      .split(":")[1]
      .split(",")
      .map((d) => parseInt(d, 10));
    return days;
  }

  return [0, 1, 2, 3, 4, 5, 6];
}

export async function seedTasksForGoal(
  db: PrismaClient,
  goal: Goal,
): Promise<Task[]> {
  const days = getDaysOfWeek(goal.frequency);
  const today = startOfDay(new Date());
  const seedEndDate = addDays(today, 30);

  const tasksToCreate: Array<{
    goalId: string;
    userId: string;
    scheduledDate: Date;
  }> = [];

  let current = today;

  while (current <= seedEndDate) {
    const dayOfWeek = current.getDay();

    if (days.includes(dayOfWeek)) {
      tasksToCreate.push({
        goalId: goal.id,
        userId: goal.userId,
        scheduledDate: current,
      });
    }

    current = addDays(current, 1);
  }

  if (tasksToCreate.length === 0) return [];

  const created = await Promise.all(
    tasksToCreate.map((t) =>
      db.task.create({
        data: {
          goalId: t.goalId,
          userId: t.userId,
          scheduledDate: t.scheduledDate,
        },
      }),
    ),
  );

  return created;
}

export async function seedFutureTasksForGoal(
  db: PrismaClient,
  goalId: string,
): Promise<number> {
  const goal = await db.goal.findUnique({ where: { id: goalId } });
  if (!goal || goal.status !== "active") return 0;

  const days = getDaysOfWeek(goal.frequency);
  const today = startOfDay(new Date());

  const lastTask = await db.task.findFirst({
    where: { goalId },
    orderBy: { scheduledDate: "desc" },
  });

  const startDate = lastTask
    ? addDays(lastTask.scheduledDate, 1)
    : today;

  const seedEndDate = addDays(today, 30);

  const tasksToCreate: Array<{
    goalId: string;
    userId: string;
    scheduledDate: Date;
  }> = [];

  let current = startDate;

  while (current <= seedEndDate) {
    const dayOfWeek = current.getDay();

    if (days.includes(dayOfWeek)) {
      tasksToCreate.push({
        goalId: goal.id,
        userId: goal.userId,
        scheduledDate: current,
      });
    }

    current = addDays(current, 1);
  }

  if (tasksToCreate.length === 0) return 0;

  const result = await db.task.createMany({
    data: tasksToCreate,
  });

  return result.count;
}
