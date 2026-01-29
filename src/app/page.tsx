/**
 * Home Page
 * 
 * Landing page with navigation and feature status.
 */

import Image from "next/image";
import Link from "next/link";

import { getAuthUser } from "@/lib/auth";
import {
  isClerkConfigured,
  isUpstashConfigured,
  isCloudinaryConfigured,
  isDatabaseConfigured,
} from "@/config/env";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getAuthUser();

  // Dynamically import SignOutButton only when needed
  const SignOutButton = user
    ? (await import("@clerk/nextjs")).SignOutButton
    : null;

  const featureStatus = [
    { name: "Database", configured: isDatabaseConfigured() },
    { name: "Clerk Auth", configured: isClerkConfigured() },
    { name: "Upstash Cache", configured: isUpstashConfigured() },
    { name: "Cloudinary Uploads", configured: isCloudinaryConfigured() },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between px-16 py-32 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            App Factory Template
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            A Next.js starter with Clerk authentication, Drizzle ORM, and
            Tailwind CSS. Ready to build your next project.
          </p>
        </div>

        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {featureStatus.map((feature) => (
              <span
                key={feature.name}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  feature.configured
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                }`}
              >
                {feature.configured ? "✓" : "⚠"} {feature.name}
              </span>
            ))}
          </div>
          {!featureStatus.every((f) => f.configured) && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Some services are not configured. Check your <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">.env</code> file.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
              >
                Dashboard
              </Link>
              {SignOutButton && (
                <SignOutButton>
                  <button className="flex h-12 w-full cursor-pointer items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]">
                    Sign Out
                  </button>
                </SignOutButton>
              )}
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
              >
                Sign Up
              </Link>
            </>
          )}
          <Link
            href="/demo/cache"
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[220px]"
          >
            Cache + Rate Limit Demo
          </Link>
          <Link
            href="/demo/media"
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[220px]"
          >
            Media Upload Demo
          </Link>
        </div>
      </main>
    </div>
  );
}
