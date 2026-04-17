"use client";

import { useRegulations } from "@/lib/api-client";
import { PageLoading, PageError } from "@/components/ui/loading";
import { getStatusColor, formatDate } from "@/lib/utils";
import { Calendar, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function CompliancePage() {
  const { data: regulations, isLoading, error } = useRegulations();

  if (isLoading) return <PageLoading />;
  if (error) return <PageError message={error.message} />;
  if (!regulations) return <PageError />;

  const compliant = regulations.filter((r) => r.status === "Compliant").length;
  const partial = regulations.filter((r) => r.status === "Partial").length;
  const avgCompliance = Math.round(regulations.reduce((s, r) => s + r.compliance, 0) / regulations.length);
  const upcomingDeadlines = [...regulations]
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">HR Regulatory Compliance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Compliance status across AI-related employment regulations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Regulations Tracked</p>
          <p className="text-xl font-bold mt-1">{regulations.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-xs text-muted-foreground">Compliant</p>
            <p className="text-xl font-bold text-green-600">{compliant}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <div>
            <p className="text-xs text-muted-foreground">Partial</p>
            <p className="text-xl font-bold text-amber-600">{partial}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Avg Compliance</p>
          <p className="text-xl font-bold mt-1">{avgCompliance}%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Compliance by Regulation</h3>
        <div className="space-y-4">
          {regulations.map((reg) => (
            <div key={reg.shortName} className="p-4 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium">{reg.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {reg.category} &middot; Deadline: {formatDate(new Date(reg.deadline).toISOString())}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(reg.status)}`}>
                  {reg.status}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${reg.compliance}%`,
                      backgroundColor: reg.compliance >= 90 ? "#10b981" : reg.compliance >= 75 ? "#f59e0b" : "#ef4444",
                    }}
                  />
                </div>
                <span className="text-sm font-semibold w-12 text-right">{reg.compliance}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{reg.completed} of {reg.requirements} requirements completed</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Upcoming Deadlines
        </h3>
        <div className="space-y-3">
          {upcomingDeadlines.map((reg) => {
            const days = Math.ceil((new Date(reg.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return (
              <div key={reg.shortName} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20">
                <div>
                  <p className="text-sm font-medium">{reg.shortName}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(new Date(reg.deadline).toISOString())}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${days <= 30 ? "bg-red-50 text-red-700" : days <= 90 ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>
                  {days} days
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
