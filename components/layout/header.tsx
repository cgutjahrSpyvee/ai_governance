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
            placeholder="Search models, cases, policies..."
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
        <CertifiedSeal />
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

/** Gold certification seal — HumaniCore AI Audit Passed (2026). */
function CertifiedSeal() {
  return (
    <div className="shrink-0" title="HumaniCore AI Audit Passed (2026)">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="46" height="46" aria-labelledby="hc-seal-t hc-seal-d" role="img">
        <title id="hc-seal-t">HumaniCore AI Audit Passed (2026)</title>
        <desc id="hc-seal-d">Toothed gold metallic seal with the HumaniCore AI wordmark, a balance scale, and an &quot;AI Audit Passed&quot; banner dated 2026.</desc>
        <defs>
          <linearGradient id="hc-rim-gold" x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#f4d56a" /><stop offset="22%" stopColor="#fbecae" />
            <stop offset="55%" stopColor="#c1881a" /><stop offset="100%" stopColor="#5d3e08" />
          </linearGradient>
          <linearGradient id="hc-plate-gold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbf3ce" /><stop offset="100%" stopColor="#e6cf90" />
          </linearGradient>
          <linearGradient id="hc-band-gold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5d3e08" /><stop offset="100%" stopColor="#2e1f04" />
          </linearGradient>
          <path id="hc-arc-gold" d="M 84 200 A 116 116 0 0 1 316 200" fill="none" />
        </defs>
        <path d="M200.00,14.00 L216.07,36.79 L236.29,17.57 L247.61,43.06 L271.18,28.16 L277.31,55.36 L303.34,45.35 L304.04,73.23 L331.52,68.48 L326.77,95.96 L354.65,96.66 L344.64,122.69 L371.84,128.82 L356.94,152.39 L382.43,163.71 L363.21,183.93 L386.00,200.00 L363.21,216.07 L382.43,236.29 L356.94,247.61 L371.84,271.18 L344.64,277.31 L354.65,303.34 L326.77,304.04 L331.52,331.52 L304.04,326.77 L303.34,354.65 L277.31,344.64 L271.18,371.84 L247.61,356.94 L236.29,382.43 L216.07,363.21 L200.00,386.00 L183.93,363.21 L163.71,382.43 L152.39,356.94 L128.82,371.84 L122.69,344.64 L96.66,354.65 L95.96,326.77 L68.48,331.52 L73.23,304.04 L45.35,303.34 L55.36,277.31 L28.16,271.18 L43.06,247.61 L17.57,236.29 L36.79,216.07 L14.00,200.00 L36.79,183.93 L17.57,163.71 L43.06,152.39 L28.16,128.82 L55.36,122.69 L45.35,96.66 L73.23,95.96 L68.48,68.48 L95.96,73.23 L96.66,45.35 L122.69,55.36 L128.82,28.16 L152.39,43.06 L163.71,17.57 L183.93,36.79 Z" fill="url(#hc-rim-gold)" />
        <circle cx="200" cy="200" r="156" fill="none" stroke="#5d3e08" strokeWidth="1.5" opacity="0.55" />
        <circle cx="200" cy="200" r="154" fill="url(#hc-plate-gold)" />
        <circle cx="200" cy="200" r="148" fill="none" stroke="#c1881a" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="142" fill="none" stroke="#5d3e08" strokeWidth="0.5" opacity="0.45" />
        <text fill="#4a2f06" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontWeight="700" fontSize="26" letterSpacing="4.5">
          <textPath href="#hc-arc-gold" startOffset="50%" textAnchor="middle">HUMANICORE AI</textPath>
        </text>
        <g transform="translate(200 175)">
          <line x1="0" y1="-30" x2="0" y2="48" stroke="#4a2f06" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="0" cy="-36" r="4.5" fill="#4a2f06" />
          <polygon points="-8,-22 0,-32 8,-22 0,-14" fill="#4a2f06" />
          <line x1="-62" y1="-22" x2="62" y2="-22" stroke="#4a2f06" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="-62" cy="-22" r="3.5" fill="#4a2f06" />
          <circle cx="62" cy="-22" r="3.5" fill="#4a2f06" />
          <line x1="-62" y1="-20" x2="-80" y2="8" stroke="#4a2f06" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="-62" y1="-20" x2="-44" y2="8" stroke="#4a2f06" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="62" y1="-20" x2="44" y2="8" stroke="#4a2f06" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="62" y1="-20" x2="80" y2="8" stroke="#4a2f06" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M -82 8 Q -62 28 -42 8 Q -62 14 -82 8 Z" fill="#4a2f06" />
          <path d="M 42 8 Q 62 28 82 8 Q 62 14 42 8 Z" fill="#4a2f06" />
          <path d="M -26 48 L 26 48 L 22 57 L -22 57 Z" fill="#4a2f06" />
        </g>
        <path d="M 80 238 L 66 256 L 80 274 L 320 274 L 334 256 L 320 238 Z" fill="url(#hc-band-gold)" />
        <path d="M 84 242 L 72 256 L 84 270 L 316 270 L 328 256 L 316 242 Z" fill="none" stroke="#f4d56a" strokeWidth="0.6" opacity="0.35" />
        <text x="200" y="262" fill="#fbf3ce" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontWeight="700" fontSize="16" letterSpacing="2.5" textAnchor="middle">AI AUDIT PASSED</text>
        <text x="200" y="312" fill="#4a2f06" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontWeight="800" fontSize="26" letterSpacing="8" textAnchor="middle">2026</text>
      </svg>
    </div>
  );
}
