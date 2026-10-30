import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { getUserByEmail, isAllowedEmail, upsertUserOnLogin } from "@/lib/users";
import { verifyLogin } from "@/lib/passwords";

/** Local-only sign-in that bypasses Google. Never enabled in production builds. */
export const devLoginEnabled = process.env.NODE_ENV !== "production" && process.env.DEV_LOGIN === "true";

const devProvider = Credentials({
  id: "dev-login",
  name: "Development login",
  credentials: { email: {}, name: {} },
  async authorize(credentials) {
    if (!devLoginEnabled) return null;
    const email = String(credentials?.email ?? "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+$/.test(email) || !(await isAllowedEmail(email))) return null;
    const name = String(credentials?.name ?? "").trim() || email.split("@")[0]!;
    const user = await upsertUserOnLogin({ email, name });
    return user.is_active ? { id: user.id, email: user.email, name: user.name } : null;
  },
});

/** Email + password sign-in; passwords are set on /setup with a code from an admin. */
const passwordProvider = Credentials({
  id: "password",
  name: "Email and password",
  credentials: { email: {}, password: {} },
  async authorize(credentials) {
    const email = String(credentials?.email ?? "").trim().toLowerCase();
    const password = String(credentials?.password ?? "");
    if (!email || !password || !(await isAllowedEmail(email))) return null;
    const user = await verifyLogin(email, password);
    return user ? { id: user.id, email: user.email, name: user.name } : null;
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [...authConfig.providers, passwordProvider, ...(devLoginEnabled ? [devProvider] : [])],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account, profile }) {
      if (account?.provider === "dev-login") return devLoginEnabled;
      if (account?.provider === "password") return true; // checked in authorize()
      if (account?.provider !== "google" || !profile?.email) return false;
      if (profile.email_verified === false) return false;
      if (!(await isAllowedEmail(profile.email))) return false;

      const user = await upsertUserOnLogin({
        email: profile.email,
        name: profile.name ?? profile.email,
        image: typeof profile.picture === "string" ? profile.picture : null,
      });
      return user.is_active;
    },
    async jwt({ token, account, profile, user: authUser }) {
      // On sign-in, bind the token to our own user record.
      const email = profile?.email ?? authUser?.email;
      if (account && email) {
        const user = await getUserByEmail(email);
        if (!user) throw new Error("User record missing after sign-in");
        token.uid = user.id;
        token.employeeId = user.employee_id;
        token.role = user.role;
      }
      return token;
    },
  },
});
