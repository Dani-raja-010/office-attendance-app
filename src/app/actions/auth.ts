"use server";

import { signIn, signOut } from "@/auth";

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function devSignIn(formData: FormData) {
  await signIn("dev-login", {
    email: formData.get("email"),
    name: formData.get("name"),
    redirectTo: "/dashboard",
  });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
