/**
 * Sign In Page
 * 
 * Shows Clerk sign-in component if configured.
 */

import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

import { isClerkPublishableConfigured } from "@/config/public-env";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  const clerkConfigured = isClerkPublishableConfigured();

  if (!clerkConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="flex max-w-md flex-col gap-4 rounded-2xl bg-white p-8 text-center shadow-lg dark:bg-zinc-900">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Authentication Not Configured
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Clerk is not configured. Please set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in your .env file.
          </p>
          <Link
            href="/"
            className="flex h-10 items-center justify-center rounded-full border border-zinc-200 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <SignIn />
    </div>
  );
}
