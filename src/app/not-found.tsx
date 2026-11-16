import Link from "next/link";

import Logo from "@/components/layout/header/logo";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col bg-canvas text-primary">
            <header className="border-b border-border bg-surface">
                <div className="mx-auto flex h-19 w-full max-w-[120rem] items-center px-5 md:px-10">
                    <Logo src="/forma-logo.svg"/>
                </div>
            </header>

            <main className="grid flex-1 place-items-center px-5 py-12">
                <section className="w-full max-w-md rounded-card border border-border bg-surface p-7 text-center shadow-card sm:p-10">
                    <p className="font-display text-display font-bold text-brand" aria-hidden="true">
                        404
                    </p>
                    <h1 className="mt-3 font-display text-heading font-bold">
                        Page not found
                    </h1>
                    <p className="mx-auto mt-2 max-w-sm text-body text-secondary">
                        The page may have moved, been deleted, or the address may be incorrect.
                    </p>

                    <Link
                        href="/dashboard"
                        prefetch={true}
                        className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-control bg-surface-inverse px-5 text-small font-semibold text-inverse transition hover:bg-surface-inverse-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    >
                        Back to dashboard
                    </Link>
                </section>
            </main>
        </div>
    );
}
