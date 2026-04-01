import NextAuth, { type DefaultSession } from "next-auth"
import authConfig from "../auth.config"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import type { UserRole } from "@prisma/client"

// Augment next-auth session and token to include our custom types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      tenantId: string | null
    } & DefaultSession["user"]
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // JWT is required when using Credentials provider
  ...authConfig,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.tenantId = (user as any).tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.tenantId = token.tenantId as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  }
})
