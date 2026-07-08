"use client";

import { useRegulations } from "@/lib/api-client";
import { PageLoading, PageError } from "@/components/ui/loading";
import { getStatusColor, formatDate, vocab } from "@/lib/utils";
import { rulePackByShortName } from "@/lib/rule-pack";
import { Calendar, Clock, CheckCircle2, FileText, BarChart3 } from "lucide-react";

// Progress-bar colors cycle through the brand palette per regulation row.
const BAR_COLORS = ["#1e2761", "#028090", "#02c39a"];

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
          Completion status across AI-related employment regulations · sourced from the active rule pack
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <FileText className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-xs text-muted-foreground">Regulations Tracked</p>
            <p className="text-xl font-bold">{regulations.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#0a7a49]" />
          <div>
            <p className="text-xs text-muted-foreground">Compliant</p>
            <p className="text-xl font-bold text-[#0a7a49]">{compliant}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-[#8a620a]" />
          <div>
            <p className="text-xs text-muted-foreground">Review in Progress</p>
            <p className="text-xl font-bold text-[#8a620a]">{partial}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-xs text-muted-foreground">Avg Completion</p>
            <p className="text-xl font-bold">{avgCompliance}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Compliance by Regulation</h3>
        <div className="space-y-4">
          {regulations.map((reg, i) => {
            const rp = rulePackByShortName[reg.shortName];
            const openReqs = Math.max(0, reg.requirements - reg.completed);
            return (
            <div key={reg.shortName} className="p-4 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium">{reg.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {reg.category} &middot; {rp?.effectiveDate ?? `Deadline: ${formatDate(new Date(reg.deadline).toISOString())}`}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(vocab(reg.status))}`}>
                  {vocab(reg.status)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${reg.compliance}%`,
                      backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                    }}
                  />
                </div>
                <span className="text-sm font-semibold w-12 text-right">{reg.compliance}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {reg.completed} of {reg.requirements} requirements completed
                {openReqs > 0 && ` · ${openReqs} open requirement${openReqs === 1 ? "" : "s"}`}
              </p>
              {rp?.note && (
                <p className="text-xs text-[#0a7a49] mt-1 flex items-center gap-1.5">
                  <FileText className="w-3 h-3 shrink-0" /> {rp.note}
                </p>
              )}
            </div>
          );})}
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
                <span className={`text-xs font-medium px-2 py-0.5 rounded border ${days <= 30 ? "text-[#ae3c24] bg-[#f9e4de] border-[#efc5b8]" : days <= 90 ? "text-[#8a620a] bg-[#fbeecd] border-[#eed18a]" : "text-[#0a7a49] bg-[#d7f2e4] border-[#a9e1c6]"}`}>
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
