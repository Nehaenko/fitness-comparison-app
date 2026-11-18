"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import Icon from "@/components/layout/actionComponents/iconComponent";
import ThemeToggle from "@/components/layout/themeToggle";

type MenuProps = {
  user: {
    name?: string | null;
    email?: string | null;
  };
  logoutAction: () => Promise<void>;
};

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Routines", href: "/routines", icon: "routines" },
  { label: "History", href: "/history", icon: "history" },
  { label: "Progress", href: "/progress", icon: "progress" },
  { label: "Measurements", href: "/measurements", icon: "measurements" },
] as const;

export default function Menu({ user, logoutAction }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const name = user.name?.trim() || "Forma user";
  const initial = name.charAt(0).toUpperCase();

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-controls="app-menu"
        onClick={() => setIsOpen(true)}
        className="grid size-11 place-items-center rounded-control text-primary transition hover:bg-surface-subtle"
      >
        <span aria-hidden="true" className="flex w-7 flex-col gap-1.25">
          <span className="h-0.5 w-full rounded-pill bg-current" />
          <span className="h-0.5 w-full rounded-pill bg-current" />
          <span className="h-0.5 w-5 rounded-pill bg-current" />
        </span>
      </button>

      <button
        type="button"
        aria-label="Close menu"
        tabIndex={isOpen ? 0 : -1}
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 bg-backdrop backdrop-blur-[3px] transition-opacity duration-200 ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        id="app-menu"
        aria-label="Main menu"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={`fixed inset-y-0 right-0 z-50 flex w-[min(82vw,25rem)] flex-col bg-surface shadow-drawer transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-19 shrink-0 items-center justify-between border-b border-divider px-5">
          <Link
            href="/dashboard"
            aria-label="Forma dashboard"
            onClick={() => setIsOpen(false)}
          >
            <span className="relative block h-[42px] w-[124px]">
              <Image src="/forma-logo.svg" alt="Forma" width={124} height={42} priority className="theme-logo-light" />
              <Image src="/forma-logo-dark.svg" alt="" width={124} height={42} priority className="theme-logo-dark" />
            </span>
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsOpen(false)}
            className="grid size-11 place-items-center rounded-control text-secondary transition hover:bg-surface-subtle hover:text-primary"
          >
            <Icon name="close" className="size-6" />
          </button>
        </div>

        <nav aria-label="Primary navigation" className="flex-1 px-4 py-4 sm:px-6">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setIsOpen(false)}
                    className={`flex min-h-14 items-center gap-4 rounded-control px-4 text-base font-semibold transition ${
                      isActive
                        ? "bg-brand-soft text-brand"
                        : "text-primary hover:bg-surface-subtle"
                    }`}
                  >
                    <Icon
                      name={item.icon}
                      className={`size-6 ${isActive ? "text-brand" : "text-primary"}`}
                      strokeWidth={1.25}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-divider px-6 py-5">
          <div className="mb-4 flex items-center gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-control bg-brand font-display text-xl text-on-accent">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-primary">{name}</p>
              {user.email ? (
                <p className="truncate text-small text-secondary">{user.email}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1">
            <ThemeToggle />

            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex min-h-12 items-center gap-4 rounded-control px-3 font-semibold text-primary transition hover:bg-surface-subtle"
            >
              <Icon
                name="profile"
                className="size-6 text-primary"
                strokeWidth={1.25}
              />
              Profile &amp; settings
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="flex min-h-12 w-full items-center gap-4 rounded-control px-3 text-left font-semibold text-secondary transition hover:bg-surface-subtle hover:text-primary"
              >
                <Icon
                  name="logout"
                  className="size-6 text-primary"
                  strokeWidth={1.25}
                />
                Log out
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
