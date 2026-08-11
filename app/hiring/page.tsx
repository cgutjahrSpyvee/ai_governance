"use client";

import useSWR from "swr";
import { useHiringFunnel } from "@/lib/api-client";
import { PageLoading, PageError } from "@/components/ui/loading";
import DemoDataBanner from "@/components/layout/demo-data-banner";
import { formatNumber, getStatusColor, GENDER_COLORS, ETHNICITY_COLORS } from "@/lib/utils";
import type { AuditReportPayload } from "@/app/api/engine/audit-report/route";
import type { GroupStat, GroupSummary } from "@/lib/engine/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { UserSearch, ShieldCheck, TrendingUp, MessageSquare, Radio, AlertCircle } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
const attrLabel = (a: string) =>
  a.replace(/^canonical_/, "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const groupLabel = (g: string) =>
  g.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border text-[#0a7a49] bg-[#d7f2e4] border-[#a9e1c6]">
      <Radio className="w-2.5 h-2.5" /> Live from engine
    </span>
  );
}

/** Hiring-relevant attributes drawn from the engine's audit run. */
const HIRING_ATTRS = ["canonical_gender", "canonical_race", "canonical_age_band"];

export default function HiringPage() {
  const { data: funnel, isLoading: l1, error: e1 } = useHiringFunnel();
  const { data: engine, isLoading: l2 } = useSWR<AuditReportPayload>(
    "/api/engine/audit-report",
    fetcher,
  );

  if (l1 || l2) return <PageLoading />;
  if (e1 || !funnel) return <PageError />;

  const report = engine?.report ?? null;
  const threshold = engine?.requirements?.governing_air_threshold ?? 0.8;

  const firstStage = funnel[0];
  const totalCandidates = firstStage
    ? firstStage.male + firstStage.female + firstStage.nonBinary
    : 0;

  const genderFunnelData = funnel.map((s) => ({
    stage: s.stage,
    Male: s.male,
    Female: s.female,
    "Non-Binary": s.nonBinary,
  }));
  const ethnicityFunnelData = funnel.map((s) => ({
    stage: s.stage,
    White: s.white,
    Black: s.black,
    Hispanic: s.hispanic,
    Asian: s.asian,
    Other: s.other,
  }));

  // Live impact ratios for hiring-relevant protected attributes.
  const liveRows: {
    attribute: string;
    group: string;
    count: number;
    selectionRate: number;
    impactRatio?: number;
    isReference: boolean;
  }[] = [];
  if (report) {
    for (const attr of HIRING_ATTRS) {
      const metrics = report.group_metrics[attr];
      if (!metrics) continue;
      const summary = metrics._summary as GroupSummary;
      for (const [group, stat] of Object.entries(metrics)) {
        if (group === "_summary") continue;
        const s = stat as GroupStat;
        liveRows.push({
          attribute: attr,
          group,
          count: s.count,
          selectionRate: s.selection_rate,
          impactRatio: summary.impact_ratios?.[group],
          isReference: group === summary.reference_group,
        });
      }
    }
  }
  const scored = liveRows.filter((x) => x.impactRatio !== undefined);
  const openReviews = scored.filter((x) => (x.impactRatio as number) < threshold).length;
  const withinTarget = scored.length - openReviews;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hiring &amp; Recruitment AI Governance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fairness monitoring across the AI-assisted hiring pipeline
        </p>
      </div>

      {/* ── LIVE: impact ratio analysis from the engine ──────────────── */}
      <div className="bg-white rounded-xl border border-border p-5">
        <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
          <h3 className="text-sm font-semibold text-foreground">
            Impact Ratio Analysis (Four-Fifths Rule)
          </h3>
          <LiveBadge />
        </div>

        {!report ? (
          <div className="flex items-start gap-2 p-3 mt-3 rounded-lg bg-slate-50 border border-slate-200">
            <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600">
              <span className="font-medium">Impact ratios unavailable.</span>{" "}
              {engine?.engineError ?? "The governance engine returned no audit run."}
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-4">
              Run {report.run_id} · {report.total_records.toLocaleString()} records · values below{" "}
              {threshold.toFixed(2)} fall outside the four-fifths reference threshold and open a review.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              {[
                { label: "Records Analyzed", value: report.total_records.toLocaleString(), icon: UserSearch, cls: "" },
                { label: "Overall Selection Rate", value: pct(report.overall_selection_rate), icon: TrendingUp, cls: "" },
                { label: "Groups Within Target", value: withinTarget, icon: ShieldCheck, cls: "text-[#0a7a49]" },
                { label: "Open Reviews", value: openReviews, icon: MessageSquare, cls: "text-[#ae3c24]" },
              ].map((c) => (
                <div key={c.label} className="rounded-lg border border-border/60 p-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <c.icon className={`w-4 h-4 ${c.cls}`} />
                    <span className="text-xs">{c.label}</span>
                  </div>
                  <p className={`text-xl font-bold ${c.cls}`}>{c.value}</p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Protected Attribute</th>
                    <th className="pb-2 font-medium">Group</th>
                    <th className="pb-2 font-medium">Count</th>
                    <th className="pb-2 font-medium">Selection Rate</th>
                    <th className="pb-2 font-medium">Impact Ratio</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {liveRows.map((x) => {
                    const within = x.impactRatio === undefined || x.impactRatio >= threshold;
                    const label = within ? "Within reference" : "Review Required";
                    return (
                      <tr
                        key={`${x.attribute}-${x.group}`}
                        className="border-b border-border/50 hover:bg-muted/20"
                      >
                        <td className="py-2.5 font-medium">{attrLabel(x.attribute)}</td>
                        <td className="py-2.5 text-muted-foreground">
                          {groupLabel(x.group)}
                          {x.isReference && (
                            <span className="ml-1.5 text-[10px] text-muted-foreground">(ref)</span>
                          )}
                        </td>
                        <td className="py-2.5 text-muted-foreground">{x.count.toLocaleString()}</td>
                        <td className="py-2.5 font-mono">{pct(x.selectionRate)}</td>
                        <td className={`py-2.5 font-mono ${!within ? "text-[#ae3c24] font-semibold" : ""}`}>
                          {x.impactRatio === undefined ? "—" : x.impactRatio.toFixed(3)}
                        </td>
                        <td className="py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(label)}`}>
                            {label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── DEMO: candidate funnel (no engine source) ────────────────── */}
      <div className="pt-2">
        <h2 className="text-sm font-semibold text-foreground mb-3">Candidate Pipeline</h2>
        <DemoDataBanner detail="The candidate funnel below is seeded pipeline data for demonstration. The engine exposes audit-run metrics, not stage-by-stage pipeline counts, so these stage figures are not audit findings." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <UserSearch className="w-4 h-4" />
            <span className="text-xs">Total Candidates (seeded)</span>
          </div>
          <p className="text-xl font-bold">{formatNumber(totalCandidates)}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Pipeline Stages (seeded)</span>
          </div>
          <p className="text-xl font-bold">{funnel.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Candidate Funnel by Gender</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={genderFunnelData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="stage" type="category" width={90} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Male" fill={GENDER_COLORS[0]} radius={[0, 2, 2, 0]} isAnimationActive={false} />
              <Bar dataKey="Female" fill={GENDER_COLORS[1]} radius={[0, 2, 2, 0]} isAnimationActive={false} />
              <Bar dataKey="Non-Binary" fill={GENDER_COLORS[2]} radius={[0, 2, 2, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Candidate Funnel by Ethnicity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ethnicityFunnelData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="stage" type="category" width={90} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="White" fill={ETHNICITY_COLORS[0]} radius={[0, 2, 2, 0]} isAnimationActive={false} />
              <Bar dataKey="Black" fill={ETHNICITY_COLORS[1]} radius={[0, 2, 2, 0]} isAnimationActive={false} />
              <Bar dataKey="Hispanic" fill={ETHNICITY_COLORS[2]} radius={[0, 2, 2, 0]} isAnimationActive={false} />
              <Bar dataKey="Asian" fill={ETHNICITY_COLORS[3]} radius={[0, 2, 2, 0]} isAnimationActive={false} />
              <Bar dataKey="Other" fill={ETHNICITY_COLORS[4]} radius={[0, 2, 2, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
