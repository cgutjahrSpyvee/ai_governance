"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Bot,
  UserSearch,
  Scale,
  ShieldCheck,
  BarChart3,
  DollarSign,
  FileText,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Users,
  Crown,
  Building2,
  ServerCog,
  ShieldCheck as ShieldCheckIcon,
} from "lucide-react";
import { useState } from "react";
import type { SessionUser } from "@/lib/rbac";
import { HumaniCoreBrandMark, HumaniCoreWordmark } from "@/components/layout/humanicore-logo";
import { SHOW_DEMO_DATA, DEMO_ONLY_ROUTES } from "@/lib/demo-mode";

const mainNav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/models", label: "AI Models", icon: Bot },
  { href: "/hiring", label: "Hiring AI", icon: UserSearch },
  { href: "/bias", label: "Bias & Fairness", icon: Scale },
  { href: "/compliance", label: "Compliance", icon: ShieldCheck },
  { href: "/performance", label: "Performance", icon: BarChart3 },
  { href: "/compensation", label: "Pay Equity", icon: DollarSign },
  { href: "/audit", label: "Audit Logs", icon: FileText },
  { href: "/audit-report", label: "Audit Report", icon: ShieldCheckIcon },
  { href: "/incidents", label: "Governance Cases", icon: AlertTriangle },
];

const adminNav = [
  { href: "/admin/users", label: "Users", icon: Users },
];

const superAdminNav = [
  { href: "/super-admin", label: "Platform", icon: Crown },
  { href: "/super-admin/organizations", label: "Organizations", icon: Building2 },
  { href: "/super-admin/engine-log", label: "Engine Call Log", icon: ServerCog },
];

export default function Sidebar({ session }: { session: SessionUser | null }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = session?.role === "ADMIN" || session?.role === "SUPER_ADMIN";
  const isSuper = session?.role === "SUPER_ADMIN";
  const hasOrgContext = !!session?.organizationId;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-white/10 transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-60",
      )}
      style={{
        background: "linear-gradient(165deg, #1a2150 0%, #12163a 62%, #0e1230 100%)",
      }}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center border-b border-white/10 shrink-0",
        collapsed ? "justify-center px-2 py-[18px]" : "px-4 py-[18px]"
      )}>
        {collapsed ? (
          <HumaniCoreBrandMark className="w-8 h-8" />
        ) : (
          <HumaniCoreWordmark
            light
            subtitle={session?.organizationName || "Human Centered Governance"}
          />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
        {hasOrgContext && (
          <Section label="Governance" collapsed={collapsed}>
            {mainNav
              // Screens with no live engine source stay hidden unless demo mode is on.
              .filter(
                (item) =>
                  SHOW_DEMO_DATA ||
                  !(DEMO_ONLY_ROUTES as readonly string[]).includes(item.href),
              )
              .map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
              ))}
          </Section>
        )}

        {isAdmin && hasOrgContext && (
          <Section label="Admin" collapsed={collapsed}>
            {adminNav.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
            ))}
          </Section>
        )}

        {isSuper && (
          <Section label="Super Admin" collapsed={collapsed}>
            {superAdminNav.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
            ))}
          </Section>
        )}
      </nav>

      {/* Positioning pill — "diagnostic, not prescriptive" identity (reference mockup) */}
      {!collapsed && (
        <div className="px-3 pb-2 shrink-0">
          <div className="flex items-start gap-2 rounded-xl px-3 py-2.5 bg-white/5 border border-white/10">
            <ShieldCheckIcon className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#02c39a" }} />
            <p className="text-[11.5px] leading-snug" style={{ color: "#b7c0de" }}>
              Diagnostic engine · findings routed to human review
            </p>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center py-3 border-t border-white/10 text-white/30 hover:text-white transition-colors shrink-0"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}

function Section({
  label,
  collapsed,
  children,
}: {
  label: string;
  collapsed: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      {!collapsed && (
        <p className="px-2 mb-1 text-[11px] font-semibold uppercase tracking-widest text-white/40">
          {label}
        </p>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function NavLink({
  item,
  pathname,
  collapsed,
}: {
  item: { href: string; label: string; icon: React.ComponentType<{ className?: string }> };
  pathname: string;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  // Match on segment boundaries so /audit-report doesn't also activate /audit.
  const isActive =
    pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-2.5 px-2 py-2 rounded-md text-[13px] transition-colors border-l-2",
        isActive
          ? "bg-white/10 text-white font-medium border-[#02c39a]"
          : "text-white/60 font-normal border-transparent hover:bg-white/5 hover:text-white",
        collapsed && "justify-center",
      )}
    >
      <Icon className={cn("shrink-0 w-[17px] h-[17px]", isActive ? "text-[#02c39a]" : "text-white/40")} />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}
