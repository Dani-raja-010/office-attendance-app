import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { SetupAccountForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Set up your account" };

export default async function SetupPage({ searchParams }: PageProps<"/setup">) {
  const { email } = await searchParams;

  return (
    <AuthShell
      title="Set up your account"
      subtitle="Enter the setup code your admin sent you and choose a password. Codes work once and expire after 7 days."
    >
      <SetupAccountForm defaultEmail={typeof email === "string" ? email : undefined} />
      <p className="text-center text-sm text-muted-foreground">
        Already have a password?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
