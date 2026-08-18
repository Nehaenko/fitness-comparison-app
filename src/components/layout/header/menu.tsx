"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
            <Image
              src="/forma-logo.svg"
              alt="Forma"
              width={124}
              height={42}
              priority
            />
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
                    className={`flex min-h-14 items-center gap-4 rounded-control px-4 text-[17px] font-semibold transition ${
                      isActive
                        ? "bg-brand-soft text-brand"
                        : "text-primary hover:bg-surface-subtle"
                    }`}
                  >
                    <Icon
                      name={item.icon}
                      className={`size-6 ${isActive ? "text-brand" : "text-secondary"}`}
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
            <div className="grid size-12 shrink-0 place-items-center rounded-control bg-brand font-display text-xl text-inverse">
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
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex min-h-12 items-center gap-4 rounded-control px-3 font-semibold text-primary transition hover:bg-surface-subtle"
            >
              <Icon name="profile" className="size-6 text-secondary" />
              Profile &amp; settings
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="flex min-h-12 w-full items-center gap-4 rounded-control px-3 text-left font-semibold text-secondary transition hover:bg-surface-subtle hover:text-primary"
              >
                <Icon name="logout" className="size-6" />
                Log out
              </button>
            </form>

            <Link
              href="/profile#delete-account"
              onClick={() => setIsOpen(false)}
              className="flex min-h-12 items-center gap-4 rounded-control px-3 font-semibold text-danger transition hover:bg-danger-soft"
            >
              <Icon name="delete" className="size-6" />
              Delete account
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

type IconName =
  | "close"
  | "dashboard"
  | "routines"
  | "history"
  | "progress"
  | "measurements"
  | "profile"
  | "logout"
  | "delete";

function Icon({ name, className }: { name: IconName; className?: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.7,
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} {...common}>
      {name === "close" && <path d="m6 6 12 12M18 6 6 18" />}
      {name === "dashboard" && (
        <>
          <rect x="3.5" y="3.5" width="6" height="6" rx="1" />
          <rect x="14.5" y="3.5" width="6" height="6" rx="1" />
          <rect x="3.5" y="14.5" width="6" height="6" rx="1" />
          <rect x="14.5" y="14.5" width="6" height="6" rx="1" />
        </>
      )}
      {name === "routines" && (
        <>
          <rect x="5" y="4.5" width="14" height="16" rx="2" />
          <path d="M9 4.5v-1h6v1M9 9h6M9 13h6M9 17h4" />
        </>
      )}
      {name === "history" && (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3.25 2" />
        </>
      )}
      {name === "progress" && <path d="m3.5 15 4-4 3 3 4.5-5 5.5 5.5M3.5 20l4-4 3 3 4.5-5 5.5 5.5" />}
      {name === "measurements" && (
        <>
          <path d="M3 7h7M14 7h7M3 17h7M14 17h7M3 12h3M10 12h11" />
          <circle cx="12" cy="7" r="2" />
          <circle cx="8" cy="17" r="2" />
        </>
      )}
      {name === "profile" && (
        <>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5.5 20v-1.5a6.5 6.5 0 0 1 13 0V20" />
        </>
      )}
      {name === "logout" && (
        <>
          <path d="M10 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20H10M13 8l4 4-4 4M8 12h9" />
        </>
      )}
      {name === "delete" && (
        <>
          <path d="M4.5 7h15M9 7V4.5h6V7M7 7l.75 13h8.5L17 7M10 10.5v6M14 10.5v6" />
        </>
      )}
    </svg>
  );
}
