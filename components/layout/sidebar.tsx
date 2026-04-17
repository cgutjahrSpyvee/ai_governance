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
} from "lucide-react";
import { useState } from "react";
import type { SessionUser } from "@/lib/rbac";

const mainNav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/models", label: "AI Models", icon: Bot },
  { href: "/hiring", label: "Hiring AI", icon: UserSearch },
  { href: "/bias", label: "Bias & Fairness", icon: Scale },
  { href: "/compliance", label: "Compliance", icon: ShieldCheck },
  { href: "/performance", label: "Performance", icon: BarChart3 },
  { href: "/compensation", label: "Pay Equity", icon: DollarSign },
  { href: "/audit", label: "Audit Logs", icon: FileText },
  { href: "/incidents", label: "Incidents", icon: AlertTriangle },
];

const adminNav = [
  { href: "/admin/users", label: "Users", icon: Users },
];

const superAdminNav = [
  { href: "/super-admin", label: "Platform", icon: Crown },
  { href: "/super-admin/organizations", label: "Organizations", icon: Building2 },
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
        "fixed left-0 top-0 z-40 h-screen bg-sidebar-bg text-sidebar-foreground transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white font-bold text-sm shrink-0">
          AI
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-semibold text-white whitespace-nowrap">AI Governance</h1>
            <p className="text-[10px] text-slate-400 whitespace-nowrap">
              {session?.organizationName || "HR Dashboard"}
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {hasOrgContext && (
          <Section label="Governance" collapsed={collapsed}>
            {mainNav.map((item) => (
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

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center py-3 border-t border-white/10 text-slate-400 hover:text-white transition-colors"
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
    <div className="mb-3">
      {!collapsed && (
        <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
          {label}
        </div>
      )}
      <div className="space-y-1">{children}</div>
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
  const isActive =
    pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-white"
          : "text-slate-400 hover:text-white hover:bg-white/5",
      )}
    >
      <Icon className="w-5 h-5 shrink-0" />
      {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
    </Link>
  );
}
