import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import Header from "@/components/layout/header/header";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Header />
      {children}
    </div>
  );
}
