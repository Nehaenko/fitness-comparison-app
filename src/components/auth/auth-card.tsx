import Link from "next/link";

import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import Icon from "@/components/layout/actionComponents/iconComponent";

export type AuthMode = "login" | "create-account";

const copy = {
  login: {
    title: "Welcome back",
    description: "Log in to continue your training.",
    question: "Don’t have an account?",
    linkLabel: "Create account",
    linkHref: "/create-account",
  },
  "create-account": {
    title: "Create your account",
    description: "Start planning workouts and tracking progress.",
    question: "Already have an account?",
    linkLabel: "Log in",
    linkHref: "/login",
  },
} as const;

export function AuthCard({
  mode,
  error,
}: {
  mode: AuthMode;
  error?: string;
}) {
  const content = copy[mode];

  return (
    <section className="w-full max-w-95 rounded-2xl bg-surface px-8 py-8 shadow-floating sm:px-9 sm:py-9">
      <div className="mb-8 flex items-center gap-2.5">
        <span className="grid size-7 place-items-center rounded-lg bg-brand text-on-accent">
          <Icon name="brand" className="size-4" />
        </span>
        <span className="font-serif text-lg font-bold tracking-tight text-primary">
          Forma
        </span>
      </div>

      <div className="mb-7">
        <h1 className="font-serif text-[28px] font-bold leading-tight tracking-[-0.02em] text-primary">
          {content.title}
        </h1>
        <p className="mt-1.5 text-sm leading-6 text-secondary">
          {content.description}
        </p>
      </div>

      <GoogleAuthButton />

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-center text-xs leading-5 text-danger"
        >
          Private testing is currently full, or this account could not be granted access.
          You can still explore Forma using prototype mode.
        </div>
      ) : null}

      <div className="my-5 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-divider" />
        <span className="text-xs text-secondary">or</span>
        <span className="h-px flex-1 bg-divider" />
      </div>

      <Link
        href="/prototype"
        prefetch={true}
        className="flex h-12 w-full items-center justify-center rounded-xl border border-border-strong bg-surface px-5 text-sm font-semibold text-primary transition hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        Enter prototype
      </Link>

      <p className="mt-5 text-center text-xs leading-5 text-secondary">
        Your fitness data stays private and belongs to you.
      </p>

      <p className="mt-3 text-center text-xs leading-5 text-secondary">
        By continuing, you agree to the{" "}
        <Link href="/terms" className="underline underline-offset-2 hover:text-primary">
          Terms of use
        </Link>{" "}
        and acknowledge the{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-primary">
          Privacy policy
        </Link>
        .
      </p>

      <p className="mt-7 text-center text-sm text-secondary">
        {content.question}{" "}
        <Link
          href={content.linkHref}
          className="font-semibold text-brand underline-offset-4 hover:underline"
        >
          {content.linkLabel}
        </Link>
      </p>

      <p className="mt-7 border-t border-divider pt-5 text-center text-xs text-secondary">
        © 2026 Alla Nekhaienko. All rights reserved.
      </p>
    </section>
  );
}
