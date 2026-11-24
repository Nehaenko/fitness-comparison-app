import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import LegalLinks from "@/components/legal/legalLinks";
import ThemeToggle from "@/components/layout/themeToggle";

type LegalPageShellProps = {
  title: string;
  description: string;
  updatedOn: string;
  children: ReactNode;
};

export default function LegalPageShell({
  title,
  description,
  updatedOn,
  children,
}: LegalPageShellProps) {
  return (
    <main className="min-h-screen bg-canvas px-5 py-6 text-primary sm:px-8 md:py-10">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between gap-4">
          <Link href="/login" aria-label="Return to Forma login">
            <span className="relative block h-[42px] w-[124px]">
              <Image
                src="/forma-logo.svg"
                alt="Forma"
                width={124}
                height={42}
                priority
                className="theme-logo-light"
              />
              <Image
                src="/forma-logo-dark.svg"
                alt=""
                width={124}
                height={42}
                priority
                className="theme-logo-dark"
              />
            </span>
          </Link>
          <ThemeToggle compact />
        </header>

        <article className="mt-6 rounded-panel border border-border bg-surface px-6 py-8 shadow-card sm:px-10 sm:py-10">
          <header className="border-b border-divider pb-7">
            <h1 className="font-display text-title font-bold sm:text-display">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-secondary">
              {description}
            </p>
            <p className="mt-4 text-small font-medium text-primary">
              Last updated: {updatedOn}
            </p>
          </header>

          <div className="legal-content mt-8">{children}</div>
        </article>

        <LegalLinks className="px-4 py-8" />
      </div>
    </main>
  );
}
