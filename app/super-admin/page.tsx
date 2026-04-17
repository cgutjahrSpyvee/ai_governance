"use client";

import useSWR from "swr";
import { PageLoading, PageError } from "@/components/ui/loading";
import { Building2, Users, Bot, AlertTriangle, Crown } from "lucide-react";
import StatCard from "@/components/dashboard/stat-card";
import { formatNumber } from "@/lib/utils";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Org = {
  id: string;
  slug: string;
  name: string;
  _count: { users: number; hrModels: number; incidents: number; auditLogs: number };
};

export default function SuperAdminHome() {
  const { data: orgs, isLoading, error } = useSWR<Org[]>("/api/admin/organizations", fetcher);
  if (isLoading) return <PageLoading />;
  if (error) return <PageError message={error.message} />;
  if (!orgs) return <PageError />;

  const totalUsers = orgs.reduce((s, o) => s + o._count.users, 0);
  const totalModels = orgs.reduce((s, o) => s + o._count.hrModels, 0);
  const totalIncidents = orgs.reduce((s, o) => s + o._count.incidents, 0);
  const totalEvents = orgs.reduce((s, o) => s + o._count.auditLogs, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Crown className="w-6 h-6 text-amber-500" /> Platform Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cross-tenant metrics and operational status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Organizations" value={orgs.length} icon={Building2} subtitle="Active tenants" />
        <StatCard title="Total Users" value={formatNumber(totalUsers)} icon={Users} subtitle="Across all orgs" />
        <StatCard title="AI Models Tracked" value={formatNumber(totalModels)} icon={Bot} subtitle="All tenants combined" />
        <StatCard title="Total Incidents" value={formatNumber(totalIncidents)} icon={AlertTriangle} subtitle={`${formatNumber(totalEvents)} audit events`} />
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Organizations</h3>
          <Link
            href="/super-admin/organizations"
            className="text-xs text-primary hover:underline"
          >
            Manage organizations →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Slug</th>
                <th className="pb-2 font-medium">Users</th>
                <th className="pb-2 font-medium">Models</th>
                <th className="pb-2 font-medium">Incidents</th>
                <th className="pb-2 font-medium">Audit Events</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr key={org.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="py-2.5 font-medium">{org.name}</td>
                  <td className="py-2.5 font-mono text-xs text-muted-foreground">{org.slug}</td>
                  <td className="py-2.5">{org._count.users}</td>
                  <td className="py-2.5">{org._count.hrModels}</td>
                  <td className="py-2.5">{org._count.incidents}</td>
                  <td className="py-2.5">{org._count.auditLogs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
