"use client";

import Link from "next/link";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import EmptyOrgState from "@/components/layout/empty-org";
import { PageLoading } from "@/components/ui/loading";
import { getStatusColor } from "@/lib/utils";
import { isProvisional } from "@/lib/engine/client";
import type { AuditReportPayload } from "@/app/api/engine/audit-report/route";
import type { RequirementsPayload } from "@/app/api/engine/requirements/route";
import type { GroupStat, GroupSummary } from "@/lib/engine/client";
import {
  ShieldCheck, Flag, Layers, Gauge, Radio, AlertCircle, ArrowRight, Scale,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
const attrLabel = (a: string) =>
  a.replace(/^canonical_/, "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const groupLabel = (g: string) =>
  g.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function decisionLabel(d: string) {
  return d.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border text-[#0a7a49] bg-[#d7f2e4] border-[#a9e1c6]">
      <Radio className="w-2.5 h-2.5" /> Live from engine
    </span>
  );
}

export default function OverviewPage() {
  const { data: session } = useSession();
  const hasOrg = !!session?.user?.organizationId;

  const { data: engine, isLoading: l1 } = useSWR<AuditReportPayload>(
    "/api/engine/audit-report",
    fetcher,
  );
  const { data: reqPayload, isLoading: l2 } = useSWR<RequirementsPayload>(
    "/api/engine/requirements",
    fetcher,
  );

  if (session && !hasOrg) return <EmptyOrgState />;
  if (l1 || l2) return <PageLoading />;

  const report = engine?.report ?? null;
  const req = reqPayload?.requirements ?? null;
  const threshold = req?.governing_air_threshold ?? engine?.requirements?.governing_air_threshold ?? 0.8;

  // Flatten every measured group so the overview can summarise open reviews.
  const rows: { attribute: string; group: string; ratio: number }[] = [];
  if (report) {
    for (const attr of report.protected_attributes) {
      const metrics = report.group_metrics[attr];
      if (!metrics) continue;
      const summary = metrics._summary as GroupSummary;
      for (const [group, stat] of Object.entries(metrics)) {
        if (group === "_summary") continue;
        void (stat as GroupStat);
        const ratio = summary.impact_ratios?.[group];
        if (ratio !== undefined) rows.push({ attribute: attr, group, ratio });
      }
    }
  }
  const openReviews = rows.filter((r) => r.ratio < threshold).sort((a, b) => a.ratio - b.ratio);
  const withinTarget = rows.length - openReviews.length;
  const provisionalCount = req?.applicable_frameworks.filter(isProvisional).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Executive Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI governance status resolved live from the certification engine
          </p>
        </div>
        <LiveBadge />
      </div>

      {(!report || !req) && (
        <div className="flex items-start gap-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-700">
              {!report && !req ? "Governance data unavailable" : "Partial governance data"}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {engine?.engineError ??
                reqPayload?.engineError ??
                "The governance engine returned no results."}
            </p>
          </div>
        </div>
      )}

      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs">Certification Decision</span>
              </div>
              <p className="text-xl font-bold text-foreground">
                {decisionLabel(report.certification_decision)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Run {report.run_id}</p>
            </div>

            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Flag className="w-4 h-4 text-[#ae3c24]" />
                <span className="text-xs">Findings</span>
              </div>
              <p className="text-2xl font-bold text-[#ae3c24]">{report.count_finding}</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {report.count_critical} critical · {report.count_observation} observations
              </p>
            </div>

            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Scale className="w-4 h-4 text-[#ae3c24]" />
                <span className="text-xs">Open Reviews</span>
              </div>
              <p className="text-2xl font-bold text-[#ae3c24]">{openReviews.length}</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {withinTarget} of {rows.length} groups within target
              </p>
            </div>

            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Gauge className="w-4 h-4" />
                <span className="text-xs">Model Performance</span>
              </div>
              <p className="text-2xl font-bold">{pct(report.model_accuracy)}</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                AUC {report.model_auc.toFixed(3)} · {report.total_records.toLocaleString()} records
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Groups requiring review */}
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center justify-between gap-3 mb-1">
                <h3 className="text-sm font-semibold text-foreground">Groups Requiring Review</h3>
                <Link
                  href="/bias"
                  className="text-[11px] text-[#028090] hover:underline flex items-center gap-1"
                >
                  Bias &amp; Fairness <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Impact ratio below the governing threshold of {threshold.toFixed(2)}.
              </p>
              {openReviews.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  All measured groups are within the reference threshold.
                </p>
              ) : (
                <div className="space-y-2">
                  {openReviews.map((r) => (
                    <div
                      key={`${r.attribute}-${r.group}`}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-muted/30"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{groupLabel(r.group)}</p>
                        <p className="text-xs text-muted-foreground">{attrLabel(r.attribute)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-sm font-semibold text-[#ae3c24]">
                          {r.ratio.toFixed(3)}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border ${getStatusColor("Review Required")}`}
                        >
                          Review Required
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Regulatory posture */}
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center justify-between gap-3 mb-1">
                <h3 className="text-sm font-semibold text-foreground">Regulatory Posture</h3>
                <Link
                  href="/compliance"
                  className="text-[11px] text-[#028090] hover:underline flex items-center gap-1"
                >
                  Compliance <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Resolved for {reqPayload?.footprint?.us_states.join(", ") || "the configured footprint"}.
              </p>
              {!req ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  Requirements unavailable.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: "Frameworks", value: req.applicable_frameworks.length, cls: "" },
                      { label: "Provisional", value: provisionalCount, cls: "text-[#8a620a]" },
                      { label: "Protected Classes", value: req.protected_classes.length, cls: "" },
                    ].map((c) => (
                      <div key={c.label} className="text-center rounded-lg border border-border/60 p-3">
                        <p className={`text-xl font-bold ${c.cls}`}>{c.value}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{c.label}</p>
                      </div>
                    ))}
                  </div>
                  <dl className="space-y-1.5 text-xs">
                    {[
                      ["Impact ratio threshold", `${req.governing_air_operator} ${req.governing_air_threshold.toFixed(2)}`],
                      ["Candidate notice", req.candidate_notice_days ? `${req.candidate_notice_days} days` : "—"],
                      ["Human oversight", req.human_oversight_required ? "Required" : "Not required"],
                      ["Audit frequency", req.min_audit_frequency_days ? `${req.min_audit_frequency_days} days` : "—"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">{k}</dt>
                        <dd className="font-medium">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/audit-report"
              className="flex items-center gap-2 h-10 px-4 rounded-lg bg-[#1e2761] text-white text-sm font-medium hover:opacity-90"
            >
              <ShieldCheck className="w-4 h-4" /> View Certified Audit Report
            </Link>
            <Link
              href="/hiring"
              className="flex items-center gap-2 h-10 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted"
            >
              <Layers className="w-4 h-4" /> Hiring Impact Ratios
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
