import { AuthCard, type AuthMode } from "@/components/auth/auth-card";
import ThemeToggle from "@/components/layout/themeToggle";

export function AuthScreen({
  mode,
  error,
}: {
  mode: AuthMode;
  error?: string;
}) {
  return (
    <main className="auth-screen-background relative grid min-h-screen place-items-center px-5 py-10">
      <div className="absolute right-5 top-5">
        <ThemeToggle compact />
      </div>
      <AuthCard mode={mode} error={error} />
    </main>
  );
}
