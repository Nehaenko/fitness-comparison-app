import { AuthCard, type AuthMode } from "@/components/auth/auth-card";

export function AuthScreen({ mode }: { mode: AuthMode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#6e716f] px-5 py-10">
      <AuthCard mode={mode} />
    </main>
  );
}
