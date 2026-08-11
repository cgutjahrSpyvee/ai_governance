"use client";

import useSWR from "swr";
import { Printer, ShieldCheck, Activity, AlertCircle } from "lucide-react";
import { getStatusColor } from "@/lib/utils";
import type { AuditReportPayload } from "@/app/api/engine/audit-report/route";
import { isProvisional } from "@/lib/engine/client";
import type { GroupStat, GroupSummary } from "@/lib/engine/client";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/** Engine decisions are already neutral, non-conclusory terms (Directive §4). */
function decisionLabel(d: string): string {
  return d
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
const attrLabel = (a: string) =>
  a.replace(/^canonical_/, "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const groupLabel = (g: string) =>
  g.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function AuditReportPage() {
  const { data, isLoading } = useSWR<AuditReportPayload>("/api/engine/audit-report", fetcher);

  if (isLoading) {
    return <p className="p-8 text-sm text-muted-foreground">Loading certified audit report…</p>;
  }

  if (data?.engineError || !data?.report) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-foreground">Certified Audit Report</h1>
        <div className="mt-4 flex items-start gap-2 p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-2xl">
          <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-700">Report unavailable</p>
            <p className="text-xs text-slate-600 mt-1">
              {data?.engineError ?? "The governance engine returned no report."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const r = data.report;
  const req = data.requirements;
  const threshold = req?.governing_air_threshold ?? 0.8;
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="p-8 max-w-5xl mx-auto print:p-0">
      {/* Toolbar — hidden when printing */}
      <div className="print:hidden flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Certified Audit Report</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sourced live from the HumaniCore governance engine · methodology {r.methodology}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#1e2761] text-white text-xs font-medium hover:opacity-90"
        >
          <Printer className="w-3.5 h-3.5" /> Print / Save PDF
        </button>
      </div>

      {/* Certification decision */}
      <div className="rounded-2xl border border-border bg-white p-6 mb-6">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#1e2761]/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7 text-[#1e2761]" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Certification Decision
              </p>
              <p className="text-2xl font-bold text-foreground">
                {decisionLabel(r.certification_decision)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Run {r.run_id} · engine {r.engine_version} · {reportDate}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              { label: "Critical", value: r.count_critical, cls: "text-[#ae3c24]" },
              { label: "Findings", value: r.count_finding, cls: "text-[#ae3c24]" },
              { label: "Observations", value: r.count_observation, cls: "text-[#8a620a]" },
              { label: "Compliant", value: r.count_compliant, cls: "text-[#0a7a49]" },
            ].map((c) => (
              <div key={c.label} className="px-3">
                <p className={`text-2xl font-bold ${c.cls}`}>{c.value}</p>
                <p className="text-[10px] text-muted-foreground">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scope + model performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-3">Scope</p>
          <dl className="space-y-2 text-sm">
            {[
              ["Functional category", r.functional_category.replace(/_/g, " ")],
              ["Records analyzed", r.total_records.toLocaleString()],
              ["Outcome column", r.outcome_column],
              ["Deployment footprint", r.vendor_footprint.join(", ")],
              ["Methodology", r.methodology],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-3">
            Model Performance
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              ["Accuracy", pct(r.model_accuracy)],
              ["AUC", r.model_auc.toFixed(3)],
              ["Selection rate", pct(r.overall_selection_rate)],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-xl font-bold text-foreground">{v}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{k}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
            Model features: {r.model_features.join(", ")}
          </p>
        </div>
      </div>

      {/* Impact ratio analysis per protected attribute */}
      <div className="bg-white rounded-xl border border-border p-5 mb-6">
        <div className="flex items-start justify-between gap-4 mb-1">
          <h2 className="text-sm font-semibold text-foreground">
            Impact Ratio Analysis (Four-Fifths Rule)
          </h2>
          <span className="text-[11px] text-[#0a7a49] whitespace-nowrap">
            Governing threshold {req?.governing_air_operator ?? ">="} {threshold.toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          {req?.governing_air_rationale ??
            "Values below the governing threshold fall outside the four-fifths reference threshold and open a review."}
        </p>

        <div className="space-y-5">
          {r.protected_attributes.map((attr) => {
            const metrics = r.group_metrics[attr];
            if (!metrics) return null;
            const summary = metrics._summary as GroupSummary;
            const groups = Object.entries(metrics).filter(
              ([k]) => k !== "_summary",
            ) as [string, GroupStat][];

            return (
              <div key={attr}>
                <div className="flex items-baseline justify-between gap-3 mb-1.5">
                  <p className="text-sm font-medium">{attrLabel(attr)}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Reference group: {groupLabel(summary.reference_group)} · disparity{" "}
                    {pct(summary.disparity)}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="pb-1.5 font-medium text-xs">Group</th>
                        <th className="pb-1.5 font-medium text-xs">Count</th>
                        <th className="pb-1.5 font-medium text-xs">Selection Rate</th>
                        <th className="pb-1.5 font-medium text-xs">Impact Ratio</th>
                        <th className="pb-1.5 font-medium text-xs">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groups
                        .sort((a, b) => b[1].selection_rate - a[1].selection_rate)
                        .map(([g, stat]) => {
                          const ratio = summary.impact_ratios[g];
                          const within = ratio === undefined || ratio >= threshold;
                          const label = within ? "Within reference" : "Review Required";
                          return (
                            <tr key={g} className="border-b border-border/50">
                              <td className="py-2 font-medium">
                                {groupLabel(g)}
                                {g === summary.reference_group && (
                                  <span className="ml-1.5 text-[10px] text-muted-foreground">(ref)</span>
                                )}
                              </td>
                              <td className="py-2 text-muted-foreground">
                                {stat.count.toLocaleString()}
                              </td>
                              <td className="py-2">{pct(stat.selection_rate)}</td>
                              <td
                                className={`py-2 font-mono ${
                                  !within ? "text-[#ae3c24] font-semibold" : ""
                                }`}
                              >
                                {ratio === undefined ? "—" : ratio.toFixed(3)}
                              </td>
                              <td className="py-2">
                                <span
                                  className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(label)}`}
                                >
                                  {label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Governing requirements */}
      {req && (
        <div className="bg-white rounded-xl border border-border p-5 mb-6">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-3">
            Governing Requirements
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
            {[
              ["Rule pack", req.governing_air_rulepack],
              ["Candidate notice", req.candidate_notice_days ? `${req.candidate_notice_days} days` : "—"],
              ["Human oversight", req.human_oversight_required ? "Required" : "Not required"],
              ["Audit frequency", req.min_audit_frequency_days ? `${req.min_audit_frequency_days} days` : "—"],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{k}</p>
                <p className="font-medium mt-0.5">{v}</p>
              </div>
            ))}
          </div>

          {req.applicable_frameworks?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">
                Applicable frameworks ({req.applicable_frameworks.length})
              </p>
              {req.applicable_frameworks.map((f) => (
                <div key={f.rulepack_id} className="text-xs">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="font-medium text-foreground">{f.framework_name}</span>
                    {isProvisional(f) && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded border text-[#8a620a] bg-[#fbeecd] border-[#eed18a] shrink-0">
                        Provisional
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-0.5">
                    {f.jurisdiction}
                    {f.effective_date ? ` · effective ${f.effective_date}` : ""}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{f.statute_citation}</p>
                </div>
              ))}
            </div>
          )}

          {req.feature_prohibitions?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-foreground mb-1.5">
                Feature review flags ({req.feature_prohibitions.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {req.feature_prohibitions.map((p) => (
                  <span
                    key={p.feature_pattern}
                    title={p.rationale ?? p.legal_basis}
                    className={`text-[10px] px-2 py-0.5 rounded border ${
                      p.prohibition_type === "prohibited"
                        ? "text-[#ae3c24] bg-[#f9e4de] border-[#efc5b8]"
                        : "text-[#8a620a] bg-[#fbeecd] border-[#eed18a]"
                    }`}
                  >
                    {p.feature_pattern}
                    {p.prohibition_type ? ` · ${p.prohibition_type.replace(/_/g, " ")}` : ""}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Methodology footer */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
        <Activity className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 leading-relaxed">
          Impact ratios are computed against the highest-selected group per protected attribute and
          compared to the governing threshold resolved for this deployment footprint. Frameworks marked
          provisional are surfaced as diagnostic context, not settled law. This report is generated by
          the HumaniCore engine ({r.engine_version}, methodology {r.methodology}) and is retained as
          part of the AI governance record.
        </p>
      </div>
    </div>
  );
}
