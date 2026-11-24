import Link from "next/link";

type LegalLinksProps = {
  className?: string;
};

export default function LegalLinks({ className = "" }: LegalLinksProps) {
  return (
    <div className={`text-small text-secondary ${className}`.trim()}>
      <nav aria-label="Legal">
        <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <li>
            <Link
              href="/privacy"
              className="underline-offset-4 transition hover:text-primary hover:underline"
            >
              Privacy policy
            </Link>
          </li>
          <li>
            <Link
              href="/terms"
              className="underline-offset-4 transition hover:text-primary hover:underline"
            >
              Terms of use
            </Link>
          </li>
        </ul>
      </nav>
      <p className="mt-3 text-center">
        © 2026 Alla Nekhaienko. All rights reserved.
      </p>
    </div>
  );
}
