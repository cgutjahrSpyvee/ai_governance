"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./sidebar";
import Header from "./header";
import type { SessionUser } from "@/lib/rbac";

export default function Shell({
  session,
  children,
}: {
  session: SessionUser | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Bare layout for auth pages
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/accept-invite");
  if (isAuthPage) return <>{children}</>;

  return (
    <>
      <Sidebar session={session} />
      <div className="pl-60 min-h-screen flex flex-col">
        <Header session={session} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </>
  );
}
