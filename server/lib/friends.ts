import { PrismaClient } from "@prisma/client";

export async function getAcceptedFriendIds(
  db: PrismaClient,
  userId: string,
): Promise<string[]> {
  const friendships = await db.friendship.findMany({
    where: {
      OR: [
        { userId, status: "accepted" },
        { friendId: userId, status: "accepted" },
      ],
    },
  });

  return friendships.map((f) =>
    f.userId === userId ? f.friendId : f.userId,
  );
}

export async function areFriends(
  db: PrismaClient,
  userId: string,
  otherId: string,
): Promise<boolean> {
  const friendship = await db.friendship.findFirst({
    where: {
      OR: [
        { userId, friendId: otherId, status: "accepted" },
        { userId: otherId, friendId: userId, status: "accepted" },
      ],
    },
  });

  return friendship !== null;
}

export async function selectPeerReviewers(
  db: PrismaClient,
  taskId: string,
  taskOwnerId: string,
  count: number = 3,
): Promise<string[]> {
  const friendIds = await getAcceptedFriendIds(db, taskOwnerId);

  if (friendIds.length === 0) return [];

  const existingReviewers = await db.peerReview.findMany({
    where: { taskId },
    select: { reviewerId: true },
  });

  const existingIds = new Set(existingReviewers.map((r) => r.reviewerId));
  const eligible = friendIds.filter((id) => !existingIds.has(id));

  if (eligible.length === 0) return [];

  const shuffled = eligible.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export async function checkFriendAchievement(
  db: PrismaClient,
  userId: string,
): Promise<{ achievementKey: string; count: number } | null> {
  const friendCount = await db.friendship.count({
    where: {
      OR: [
        { userId, status: "accepted" },
        { friendId: userId, status: "accepted" },
      ],
    },
  });

  if (friendCount >= 5) {
    return { achievementKey: "friend_5", count: friendCount };
  }
  if (friendCount >= 1) {
    return { achievementKey: "friend_1", count: friendCount };
  }

  return null;
}
