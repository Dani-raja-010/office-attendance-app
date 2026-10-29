import type { DefaultSession } from "next-auth";

export type Role = "employee" | "admin";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      employeeId: string;
      role: Role;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    uid: string;
    employeeId: string;
    role: Role;
  }
}
