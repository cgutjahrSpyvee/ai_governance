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
import { HumaniCoreMark, HumaniCoreWordmark } from "@/components/layout/humanicore-logo";

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
        "fixed left-0 top-0 z-40 h-screen bg-white border-r border-slate-200 transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center border-b border-slate-100 shrink-0",
        collapsed ? "justify-center px-2 py-[18px]" : "px-4 py-[18px]"
      )}>
        {collapsed ? (
          <HumaniCoreMark className="w-8 h-8" />
        ) : (
          <HumaniCoreWordmark
            subtitle={session?.organizationName || "Human Centered Governance"}
          />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
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

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center py-3 border-t border-slate-100 text-slate-300 hover:text-primary transition-colors shrink-0"
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
        <p className="px-2 mb-1 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
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
  const isActive =
    pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-2.5 px-2 py-2 rounded-md text-[13px] transition-colors",
        isActive
          ? "bg-primary text-white/90 font-normal"
          : "text-slate-600 font-normal hover:bg-slate-50 hover:text-primary",
        collapsed && "justify-center",
      )}
    >
      <Icon className={cn("shrink-0", isActive ? "w-[17px] h-[17px]" : "w-[17px] h-[17px] text-slate-400 group-hover:text-primary")} />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}
