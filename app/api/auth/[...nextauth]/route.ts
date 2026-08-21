import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import { hash, compare } from "bcryptjs";
import { db } from "@/server/db/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const providers: any[] = [
  CredentialsProvider({
    name: "email",
    credentials: {
      email: { label: "Email", type: "email", placeholder: "you@example.com" },
      password: { label: "Password", type: "password" },
      name: { label: "Name", type: "text" },
      isSignUp: { label: "Sign Up", type: "boolean" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      const isSignUp = credentials.isSignUp === "true";

      if (isSignUp) {
        const existing = await db.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (existing) return null;

        const hashedPassword = await hash(credentials.password as string, 12);
        const user = await db.user.create({
          data: {
            email: credentials.email as string,
            name:
              (credentials.name as string) ||
              (credentials.email as string).split("@")[0],
            emailVerified: new Date(),
          },
        });

        await db.account.create({
          data: {
            userId: user.id,
            type: "credentials",
            provider: "email",
            providerAccountId: user.email,
          },
        });

        await db.account.update({
          where: {
            provider_providerAccountId: {
              provider: "email",
              providerAccountId: user.email,
            },
          },
          data: { access_token: hashedPassword },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      }

      const user = await db.user.findUnique({
        where: { email: credentials.email as string },
      });
      if (!user) return null;

      const account = await db.account.findFirst({
        where: {
          userId: user.id,
          provider: "email",
        },
      });

      if (account?.access_token) {
        const valid = await compare(
          credentials.password as string,
          account.access_token,
        );
        if (!valid) return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    },
  }),
];

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  providers.push(
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
  },
});

export const GET = handlers.GET;
export const POST = handlers.POST;
