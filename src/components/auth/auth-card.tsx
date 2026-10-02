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

export function AuthCard({ mode }: { mode: AuthMode }) {
  const content = copy[mode];

  return (
    <section className="w-full max-w-95 rounded-2xl bg-white px-8 py-8 shadow-[0_24px_70px_rgba(16,24,20,0.18)] sm:px-9 sm:py-9">
      <div className="mb-8 flex items-center gap-2.5">
        <span className="grid size-7 place-items-center rounded-lg bg-[#287052] text-white">
          <Icon name="brand" className="size-4" />
        </span>
        <span className="font-serif text-lg font-bold tracking-tight text-[#181a19]">
          Forma
        </span>
      </div>

      <div className="mb-7">
        <h1 className="font-serif text-[28px] font-bold leading-tight tracking-[-0.02em] text-[#181a19]">
          {content.title}
        </h1>
        <p className="mt-1.5 text-sm leading-6 text-[#757a77]">
          {content.description}
        </p>
      </div>

      <GoogleAuthButton />

      <p className="mt-5 text-center text-xs leading-5 text-[#8a8e8b]">
        Your fitness data stays private and belongs to you.
      </p>

      <p className="mt-7 text-center text-sm text-[#747875]">
        {content.question}{" "}
        <Link
          href={content.linkHref}
          className="font-semibold text-[#1f5f45] underline-offset-4 hover:underline"
        >
          {content.linkLabel}
        </Link>
      </p>
    </section>
  );
}
