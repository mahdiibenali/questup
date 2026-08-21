import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import superjson from "superjson";
import { db } from "@/server/db/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export type Context = {
  db: typeof db;
  session: { user: { id: string; name?: string | null; email?: string | null; image?: string | null } } | null;
};

export async function createContext(): Promise<Context> {
  const rawSession = await auth();
  const session = rawSession?.user ? { user: { id: rawSession.user.id as string, ...rawSession.user } } : null;
  return { db, session };
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof z.ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: { ...ctx.session.user, id: ctx.session.user.id! } },
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceAuth);
