import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

const primaryDomain = process.env.ALLOWED_EMAIL_DOMAINS?.split(",")[0]?.trim();

/**
 * Database-free Auth.js config shared by the proxy and the full server config.
 */
export const authConfig = {
  trustHost: true,
  providers: [
    Google({
      authorization: {
        params: {
          prompt: "select_account",
          // Hint Google to show only accounts from the company Workspace domain
          ...(primaryDomain ? { hd: primaryDomain } : {}),
        },
      },
    }),
  ],
  pages: { signIn: "/login", error: "/login" },
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = Boolean(auth?.user?.id);
      const { pathname } = request.nextUrl;
      if (pathname === "/login") {
        return isLoggedIn ? Response.redirect(new URL("/dashboard", request.nextUrl)) : true;
      }
      return isLoggedIn;
    },
    session({ session, token }) {
      if (token.uid) {
        session.user.id = token.uid;
        session.user.employeeId = token.employeeId;
        session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
