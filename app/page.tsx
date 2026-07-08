"use client";

import StatCard from "@/components/dashboard/stat-card";
import { PageLoading, PageError } from "@/components/ui/loading";
import EmptyOrgState from "@/components/layout/empty-org";
import { useSession } from "next-auth/react";
import {
  Bot,
  ShieldCheck,
  AlertTriangle,
  Users,
  TrendingUp,
  Scale,
} from "lucide-react";
import {
  useModels,
  useRegulations,
  useIncidents,
  usePerformance,
} from "@/lib/api-client";
import {
  formatNumber, getPriorityColor, getPriorityLabel, getStatusColor, vocab, PRIORITY_CHART,
} from "@/lib/utils";
import {
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

export default function OverviewPage() {
  const { data: session } = useSession();
  const hasOrg = !!session?.user?.organizationId;

  const { data: models, isLoading: loadingModels, error: modelsError } = useModels();
  const { data: regulations, isLoading: loadingRegs } = useRegulations();
  const { data: incidents, isLoading: loadingInc } = useIncidents();
  const { data: performance, isLoading: loadingPerf } = usePerformance();

  // Super admin without org context sees the platform welcome
  if (session && !hasOrg) return <EmptyOrgState />;

  const loading = loadingModels || loadingRegs || loadingInc || loadingPerf;
  if (loading) return <PageLoading />;
  if (modelsError) return <PageError message={modelsError.message} />;
  if (!models || !regulations || !incidents || !performance) return <PageError />;

  const activeModels = models.filter((m) => m.status === "Production").length;
  const avgFairness = Math.round(
    (models.reduce((s, m) => s + m.fairnessScore, 0) / models.length) * 100,
  ) / 100;
  const avgCompliance = Math.round(
    regulations.reduce((s, r) => s + r.compliance, 0) / regulations.length,
  );
  const openReqs = regulations.reduce((s, r) => s + Math.max(0, r.requirements - r.completed), 0);
  const openInc = incidents.filter((i) => i.status !== "Closed" && i.status !== "Resolved").length;
  const criticalInc = incidents.filter(
    (i) => i.severity === "Critical" && i.status !== "Closed" && i.status !== "Resolved",
  ).length;
  const candidatesProcessed = models.reduce((s, m) => s + (m.candidatesProcessed || 0), 0);
  const totalEmployees = performance.reduce((s, d) => s + d.employeeCount, 0);

  const pieData = [
    { name: "Priority 1", value: models.filter((m) => m.riskTier === "High").length, color: PRIORITY_CHART.p1 },
    { name: "Priority 2", value: models.filter((m) => m.riskTier === "Medium").length, color: PRIORITY_CHART.p2 },
    { name: "Standard Review Queue", value: models.filter((m) => m.riskTier === "Low").length, color: PRIORITY_CHART.standard },
  ];

  const activityByFunction = Array.from(new Set(models.map((m) => m.function)))
    .map((fn) => ({ domain: fn, count: models.filter((m) => m.function === fn).length }))
    .sort((a, b) => b.count - a.count);
  const maxActivity = Math.max(1, ...activityByFunction.map((a) => a.count));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Executive Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI governance status across HR processes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total AI Models" value={models.length} subtitle={`${activeModels} active`} icon={Bot} />
        <StatCard
          title="Avg Fairness Score"
          value={avgFairness}
          subtitle="Target: 0.85"
          icon={Scale}
          variant={avgFairness >= 0.85 ? "success" : "warning"}
        />
        <StatCard
          title="Requirements Completed"
          value={`${avgCompliance}%`}
          subtitle={`${openReqs} open requirement${openReqs === 1 ? "" : "s"} across ${regulations.length} regulations`}
          icon={ShieldCheck}
          variant={avgCompliance >= 85 ? "success" : "warning"}
        />
        <StatCard
          title="Open Cases"
          value={openInc}
          subtitle={`${criticalInc} Priority 1`}
          icon={AlertTriangle}
          variant={criticalInc > 0 ? "danger" : "success"}
        />
        <StatCard
          title="Candidates Processed"
          value={formatNumber(candidatesProcessed)}
          subtitle="By AI this year"
          icon={Users}
        />
        <StatCard
          title="Employees Monitored"
          value={formatNumber(totalEmployees)}
          subtitle="AI-assisted reviews"
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Review Activity by HR Function</h3>
              <p className="text-xs text-muted-foreground mb-4">Activity density, shaded by volume — not a danger rating.</p>
            </div>
            <span className="text-[11px] text-muted-foreground whitespace-nowrap">Open reviews · last 90 days</span>
          </div>
          <div className="space-y-2.5">
            {activityByFunction.map((a) => (
              <div key={a.domain} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-right text-xs text-muted-foreground truncate">{a.domain}</span>
                <div className="flex-1 h-5 bg-muted rounded-md overflow-hidden">
                  <div
                    className="h-full rounded-md transition-all"
                    style={{
                      width: `${(a.count / maxActivity) * 100}%`,
                      backgroundColor: "#1e2761",
                      opacity: 0.4 + 0.6 * (a.count / maxActivity),
                    }}
                  />
                </div>
                <span className="w-4 shrink-0 text-sm font-semibold text-foreground text-right">{a.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground">Review Priority Tiers</h3>
          <p className="text-xs text-muted-foreground mb-4">Prioritization for review scheduling.</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Regulatory Compliance</h3>
          <div className="space-y-3">
            {regulations.map((reg) => (
              <div key={reg.shortName} className="flex items-center gap-3">
                <span className="text-xs font-medium w-20 text-muted-foreground">{reg.shortName}</span>
                <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${reg.compliance}%`,
                      backgroundColor: "#1e2761",
                    }}
                  />
                </div>
                <span className="text-xs font-semibold w-10 text-right">{reg.compliance}%</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getStatusColor(vocab(reg.status))}`}>
                  {vocab(reg.status)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Cases</h3>
          <div className="space-y-3">
            {incidents.slice(0, 5).map((inc) => (
              <div key={inc.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium shrink-0 ${getPriorityColor(inc.severity)}`}>
                  {getPriorityLabel(inc.severity)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{inc.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {inc.affectedModel ? (typeof inc.affectedModel === "string" ? inc.affectedModel : "Model") : "—"} &middot;{" "}
                    {new Date(inc.reportedDate).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getStatusColor(inc.status)}`}>
                  {inc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
