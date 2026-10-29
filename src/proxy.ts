import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Lightweight session gate; fine-grained authorization happens in the Data Access Layer.
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"],
};
