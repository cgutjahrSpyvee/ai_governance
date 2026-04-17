import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { Role } from "./rbac";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      organizationId: string | null;
      organizationSlug: string | null;
      organizationName: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    role: Role;
    organizationId: string | null;
    organizationSlug: string | null;
    organizationName: string | null;
  }
}

const googleConfigured = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const email = String(creds?.email || "").toLowerCase().trim();
        const password = String(creds?.password || "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { organization: true },
        });
        if (!user || !user.password) return null;

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          // Extra fields used by the jwt callback below
          role: user.role as Role,
          organizationId: user.organizationId,
          organizationSlug: user.organization?.slug ?? null,
          organizationName: user.organization?.name ?? null,
        } as unknown as import("next-auth").User;
      },
    }),
    ...(googleConfigured
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For Google sign-in, require that the user has already been invited
      // (i.e. a User row exists for this email). Prevents random Google users
      // from joining any org.
      if (account?.provider === "google") {
        const existing = await prisma.user.findUnique({
          where: { email: user.email! },
        });
        if (!existing) return false;
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      // Initial sign-in: populate from user
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { organization: true },
        });
        if (dbUser) {
          token.userId = dbUser.id;
          token.role = dbUser.role as Role;
          token.organizationId = dbUser.organizationId;
          token.organizationSlug = dbUser.organization?.slug ?? null;
          token.organizationName = dbUser.organization?.name ?? null;
          token.email = dbUser.email;
          token.name = dbUser.name;
        }
      }

      // Support super-admin impersonation updates via session.update()
      if (trigger === "update" && session) {
        if (session.impersonateOrganizationId !== undefined) {
          if (session.impersonateOrganizationId === null) {
            // Clear impersonation — restore super-admin's real identity
            const me = await prisma.user.findUnique({ where: { id: token.userId } });
            if (me && me.role === "SUPER_ADMIN") {
              token.organizationId = null;
              token.organizationSlug = null;
              token.organizationName = null;
              token.role = "SUPER_ADMIN";
            }
          } else {
            const me = await prisma.user.findUnique({ where: { id: token.userId } });
            if (me && me.role === "SUPER_ADMIN") {
              const org = await prisma.organization.findUnique({
                where: { id: session.impersonateOrganizationId },
              });
              if (org) {
                token.organizationId = org.id;
                token.organizationSlug = org.slug;
                token.organizationName = org.name;
                // Keep SUPER_ADMIN role so they retain edit rights
              }
            }
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId;
      session.user.role = token.role;
      session.user.organizationId = token.organizationId;
      session.user.organizationSlug = token.organizationSlug;
      session.user.organizationName = token.organizationName;
      return session;
    },
  },
});
