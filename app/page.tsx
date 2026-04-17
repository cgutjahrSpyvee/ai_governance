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
import { formatNumber, getRiskColor, getStatusColor } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";

const RISK_COLORS = { high: "#ef4444", medium: "#f59e0b", low: "#10b981" };

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
  const openInc = incidents.filter((i) => i.status !== "Closed" && i.status !== "Resolved").length;
  const criticalInc = incidents.filter(
    (i) => i.severity === "Critical" && i.status !== "Closed" && i.status !== "Resolved",
  ).length;
  const candidatesProcessed = models.reduce((s, m) => s + (m.candidatesProcessed || 0), 0);
  const totalEmployees = performance.reduce((s, d) => s + d.employeeCount, 0);

  const pieData = [
    { name: "High Risk", value: models.filter((m) => m.riskTier === "High").length, color: "#ef4444" },
    { name: "Medium Risk", value: models.filter((m) => m.riskTier === "Medium").length, color: "#f59e0b" },
    { name: "Low Risk", value: models.filter((m) => m.riskTier === "Low").length, color: "#10b981" },
  ];

  const riskByFunction = Array.from(new Set(models.map((m) => m.function))).map((fn) => ({
    domain: fn,
    high: models.filter((m) => m.function === fn && m.riskTier === "High").length,
    medium: models.filter((m) => m.function === fn && m.riskTier === "Medium").length,
    low: models.filter((m) => m.function === fn && m.riskTier === "Low").length,
  }));

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
          title="Compliance"
          value={`${avgCompliance}%`}
          subtitle={`Across ${regulations.length} regulations`}
          icon={ShieldCheck}
          variant={avgCompliance >= 85 ? "success" : "warning"}
        />
        <StatCard
          title="Open Incidents"
          value={openInc}
          subtitle={`${criticalInc} critical`}
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
          <h3 className="text-sm font-semibold text-foreground mb-4">Risk Distribution by Function</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={riskByFunction}>
              <XAxis dataKey="domain" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="high" name="High" fill={RISK_COLORS.high} radius={[2, 2, 0, 0]} />
              <Bar dataKey="medium" name="Medium" fill={RISK_COLORS.medium} radius={[2, 2, 0, 0]} />
              <Bar dataKey="low" name="Low" fill={RISK_COLORS.low} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Model Risk Tiers</h3>
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
                      backgroundColor: reg.compliance >= 90 ? "#10b981" : reg.compliance >= 75 ? "#f59e0b" : "#ef4444",
                    }}
                  />
                </div>
                <span className="text-xs font-semibold w-10 text-right">{reg.compliance}%</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getStatusColor(reg.status)}`}>
                  {reg.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Incidents</h3>
          <div className="space-y-3">
            {incidents.slice(0, 5).map((inc) => (
              <div key={inc.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium shrink-0 ${getRiskColor(inc.severity)}`}>
                  {inc.severity}
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

      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Top Flagged Models</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 font-medium">Model</th>
                <th className="pb-2 font-medium">Function</th>
                <th className="pb-2 font-medium">Risk Tier</th>
                <th className="pb-2 font-medium">Fairness Score</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Owner</th>
              </tr>
            </thead>
            <tbody>
              {models
                .filter((m) => m.riskTier === "High")
                .sort((a, b) => a.fairnessScore - b.fairnessScore)
                .map((model) => (
                  <tr key={model.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2.5 font-medium">{model.name}</td>
                    <td className="py-2.5 text-muted-foreground">{model.function}</td>
                    <td className="py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded border ${getRiskColor(model.riskTier)}`}>
                        {model.riskTier}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className={model.fairnessScore < 0.80 ? "text-red-600 font-semibold" : ""}>
                        {model.fairnessScore.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(model.status)}`}>
                        {model.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-muted-foreground">{model.owner}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
