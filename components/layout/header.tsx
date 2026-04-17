"use client";

import { Bell, ChevronDown, LogOut, Search, User, Building2, UserCog } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import type { SessionUser } from "@/lib/rbac";
import { useRouter } from "next/navigation";

export default function Header({ session }: { session: SessionUser | null }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const nextAuth = useSession();

  // Prefer the live session from useSession (reflects impersonation updates)
  const live = nextAuth.data?.user;
  const displayName = live?.name || session?.name || "User";
  const displayOrg = live?.organizationName || session?.organizationName;
  const role = live?.role || session?.role || "VIEWER";

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function endImpersonation() {
    await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: null }),
    });
    await nextAuth.update({ impersonateOrganizationId: null });
    router.push("/super-admin/organizations");
    router.refresh();
  }

  // Detect impersonation: super admin currently has an org context
  const isImpersonating = role === "SUPER_ADMIN" && !!live?.organizationId;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b border-border">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search models, incidents, policies..."
            className="h-9 w-80 rounded-lg border border-border bg-muted/50 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
        </div>
        {isImpersonating && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
            <UserCog className="w-3.5 h-3.5" />
            <span>Impersonating: {displayOrg}</span>
            <button
              onClick={endImpersonation}
              className="ml-2 underline hover:no-underline"
            >
              Exit
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        {displayOrg && !isImpersonating && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 className="w-3.5 h-3.5" />
            <span>{displayOrg}</span>
          </div>
        )}
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="text-sm text-left">
              <p className="font-medium text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground">
                <RoleBadge role={role} />
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-white shadow-lg py-1 z-50">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{live?.email || session?.email}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function RoleBadge({ role }: { role: string }) {
  const label = role === "SUPER_ADMIN" ? "Super Admin" : role === "ADMIN" ? "Admin" : "Viewer";
  return <span>{label}</span>;
}
