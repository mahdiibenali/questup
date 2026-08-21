import { z } from "zod";
import { router, protectedProcedure } from "@/lib/trpc";
import { TRPCError } from "@trpc/server";
import { XP_TO_LEVEL, getLevelTitle } from "@/lib/constants";
import { processXpGain } from "@/server/lib/xp-engine";
import { calculateCircumstancesModifier } from "@/server/lib/circumstances";

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      include: {
        streaks: { include: { goal: { select: { title: true, category: true } } } },
        achievements: { include: { achievement: true } },
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const nextLevelXp = XP_TO_LEVEL(user.level + 1);
    const currentStreaks = user.streaks.filter((s) => s.currentStreak > 0);

    return {
      ...user,
      nextLevelXp,
      currentStreaks,
    };
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        image: z.string().url().optional(),
        timezone: z.string().optional(),
        privacyPreference: z.enum(["public", "friends", "private"]).optional(),
        friendDiscovery: z.boolean().optional(),
        emailNotifications: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      });
    }),

  updateCircumstances: protectedProcedure
    .input(
      z.object({
        timeAvailability: z.enum(["<1hr", "1-3hr", "3+hr"]),
        physicalCondition: z.enum(["none", "minor", "chronic", "disability", "recovery"]),
        workLoad: z.enum(["light", "moderate", "heavy", "overwhelmed"]),
        ageBracket: z.enum(["13-17", "18-25", "26-40", "41-60", "60+"]),
        resources: z.enum(["full", "partial", "limited"]),
        lifeStressor: z.enum(["none", "mild", "significant"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const breakdown = calculateCircumstancesModifier(input);

      const user = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          circumstancesProfile: JSON.stringify(input),
          circumstancesModifier: breakdown.modifier,
        },
      });

      return {
        user,
        circumstancesModifier: breakdown.modifier,
        breakdown,
      };
    }),

  freezeStreak: protectedProcedure
    .input(z.object({ goalId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user || user.freezeTokens <= 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No freeze tokens available" });
      }

      const streak = await ctx.db.streak.findUnique({
        where: { userId_goalId: { userId: ctx.session.user.id, goalId: input.goalId } },
      });

      if (!streak || streak.currentStreak <= 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No active streak to freeze" });
      }

      const updatedStreak = await ctx.db.streak.update({
        where: { userId_goalId: { userId: ctx.session.user.id, goalId: input.goalId } },
        data: { freezeUsed: true },
      });

      const updatedUser = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { freezeTokens: { decrement: 1 } },
      });

      return { streak: updatedStreak, tokensRemaining: updatedUser.freezeTokens };
    }),

  searchFriends: protectedProcedure
    .input(z.object({ q: z.string().min(2) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.user.findMany({
        where: {
          id: { not: ctx.session.user.id },
          friendDiscovery: true,
          OR: [
            { email: { contains: input.q } },
            { name: { contains: input.q } },
          ],
        },
        select: { id: true, name: true, image: true },
        take: 20,
      });
    }),

  sendFriendRequest: protectedProcedure
    .input(z.object({ friendId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      if (input.friendId === ctx.session.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot friend yourself" });
      }

      const existing = await ctx.db.friendship.findUnique({
        where: {
          userId_friendId: { userId: input.friendId, friendId: ctx.session.user.id },
        },
      });

      if (existing && existing.status === "pending") {
        await ctx.db.friendship.update({
          where: {
            userId_friendId: { userId: input.friendId, friendId: ctx.session.user.id },
          },
          data: { status: "accepted" },
        });

        return { friendship: { userId: input.friendId, friendId: ctx.session.user.id, status: "accepted" } };
      }

      const current = await ctx.db.friendship.findUnique({
        where: {
          userId_friendId: { userId: ctx.session.user.id, friendId: input.friendId },
        },
      });

      if (current) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Friend request already exists" });
      }

      const friendship = await ctx.db.friendship.create({
        data: {
          userId: ctx.session.user.id,
          friendId: input.friendId,
          status: "pending",
        },
      });

      return { friendship };
    }),

  acceptFriendRequest: protectedProcedure
    .input(z.object({ friendId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const friendship = await ctx.db.friendship.findUnique({
        where: {
          userId_friendId: { userId: input.friendId, friendId: ctx.session.user.id },
        },
      });

      if (!friendship || friendship.status !== "pending") {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const updated = await ctx.db.friendship.update({
        where: {
          userId_friendId: { userId: input.friendId, friendId: ctx.session.user.id },
        },
        data: { status: "accepted" },
      });

      return { friendship: updated };
    }),

  rejectFriendRequest: protectedProcedure
    .input(z.object({ friendId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.friendship.delete({
        where: {
          userId_friendId: { userId: input.friendId, friendId: ctx.session.user.id },
        },
      });

      return {};
    }),

  removeFriend: protectedProcedure
    .input(z.object({ friendId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.friendship.deleteMany({
        where: {
          OR: [
            { userId: ctx.session.user.id, friendId: input.friendId },
            { userId: input.friendId, friendId: ctx.session.user.id },
          ],
        },
      });

      return {};
    }),

  myFriends: protectedProcedure.query(async ({ ctx }) => {
    const friendships = await ctx.db.friendship.findMany({
      where: {
        OR: [
          { userId: ctx.session.user.id, status: "accepted" },
          { friendId: ctx.session.user.id, status: "accepted" },
        ],
      },
      include: {
        user: { select: { id: true, name: true, image: true, level: true, totalXp: true } },
        friend: { select: { id: true, name: true, image: true, level: true, totalXp: true } },
      },
    });

    return friendships.map((f) => ({
      user: f.userId === ctx.session.user.id ? f.friend : f.user,
      since: f.createdAt,
    }));
  }),

  pendingRequests: protectedProcedure.query(async ({ ctx }) => {
    const requests = await ctx.db.friendship.findMany({
      where: {
        friendId: ctx.session.user.id,
        status: "pending",
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return requests.map((r) => ({
      from: r.user,
      createdAt: r.createdAt,
    }));
  }),

  achievements: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.userAchievement.findMany({
      where: { userId: ctx.session.user.id },
      include: { achievement: true },
      orderBy: { earnedAt: "desc" },
    });
  }),
});
