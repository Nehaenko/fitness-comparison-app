import { AuthScreen } from "@/components/auth/auth-screen";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{error?: string}>;
}) {
  const {error} = await searchParams;

  return <AuthScreen mode="login" error={error} />;
}
