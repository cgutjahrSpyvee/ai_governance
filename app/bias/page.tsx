"use client";

import useSWR from "swr";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea, LabelList, Cell,
} from "recharts";
import { CheckCircle2, Flag, BarChart3, Layers, Radio, AlertCircle } from "lucide-react";
import { getStatusColor } from "@/lib/utils";
import type { AuditReportPayload } from "@/app/api/engine/audit-report/route";
import type { GroupStat, GroupSummary } from "@/lib/engine/client";

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

interface Row {
  attribute: string;
  group: string;
  count: number;
  selectionRate: number;
  impactRatio: number | undefined;
  isReference: boolean;
}

export default function BiasPage() {
  const { data, isLoading } = useSWR<AuditReportPayload>("/api/engine/audit-report", fetcher);

  if (isLoading) {
    return <p className="p-8 text-sm text-muted-foreground">Loading fairness metrics…</p>;
  }

  // Never fall back to seeded metrics — an unavailable engine must read as unavailable.
  if (data?.engineError || !data?.report) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bias & Fairness Monitoring</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Demographic parity and impact ratios across protected attributes
          </p>
        </div>
        <div className="flex items-start gap-2 p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-2xl">
          <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-700">Fairness metrics unavailable</p>
            <p className="text-xs text-slate-600 mt-1">
              {data?.engineError ?? "The governance engine returned no audit run."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const r = data.report;
  const threshold = data.requirements?.governing_air_threshold ?? 0.8;

  // Flatten the engine's per-attribute group metrics into one row set.
  const rows: Row[] = [];
  for (const attr of r.protected_attributes) {
    const metrics = r.group_metrics[attr];
    if (!metrics) continue;
    const summary = metrics._summary as GroupSummary;
    for (const [group, stat] of Object.entries(metrics)) {
      if (group === "_summary") continue;
      const s = stat as GroupStat;
      rows.push({
        attribute: attr,
        group,
        count: s.count,
        selectionRate: s.selection_rate,
        impactRatio: summary.impact_ratios?.[group],
        isReference: group === summary.reference_group,
      });
    }
  }

  const scored = rows.filter((x) => x.impactRatio !== undefined);
  const withinTarget = scored.filter((x) => (x.impactRatio as number) >= threshold).length;
  const needsReview = scored.length - withinTarget;

  const chartData = scored
    .filter((x) => !x.isReference)
    .map((x) => ({
      name: `${groupLabel(x.group)}`,
      attr: attrLabel(x.attribute),
      ratio: +(x.impactRatio as number).toFixed(3),
    }))
    .sort((a, b) => a.ratio - b.ratio);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bias & Fairness Monitoring</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Impact ratios across protected attributes · run {r.run_id} ·{" "}
            {r.total_records.toLocaleString()} records
          </p>
        </div>
        <LiveBadge />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <Layers className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-xs text-muted-foreground">Attributes Analyzed</p>
            <p className="text-xl font-bold">{r.protected_attributes.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-xs text-muted-foreground">Groups Measured</p>
            <p className="text-xl font-bold">{scored.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#0a7a49]" />
          <div>
            <p className="text-xs text-muted-foreground">Within Target</p>
            <p className="text-xl font-bold text-[#0a7a49]">{withinTarget}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <Flag className="w-5 h-5 text-[#ae3c24]" />
          <div>
            <p className="text-xs text-muted-foreground">Open Reviews</p>
            <p className="text-xl font-bold text-[#ae3c24]">{needsReview}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
          <h3 className="text-sm font-semibold text-foreground">
            Impact Ratio by Group (vs. reference)
          </h3>
          <span className="text-[11px] text-[#0a7a49]">
            Target Corridor ({threshold.toFixed(2)}–1.00)
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Values below {threshold.toFixed(2)} fall outside the four-fifths reference threshold and open a review.
        </p>
        <ResponsiveContainer width="100%" height={Math.max(220, chartData.length * 34)}>
          <BarChart data={chartData} layout="vertical" margin={{ right: 48, left: 8 }}>
            <ReferenceArea x1={threshold} x2={1} fill="#02c39a" fillOpacity={0.1} />
            <XAxis type="number" domain={[0, 1]} tick={{ fontSize: 11 }} />
            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: any, _n, p: any) => [v, p?.payload?.attr ?? "Impact ratio"]} />
            <Bar dataKey="ratio" radius={[0, 4, 4, 0]} isAnimationActive={false}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.ratio < threshold ? "#ae3c24" : "#1e2761"} />
              ))}
              <LabelList
                dataKey="ratio"
                position="right"
                formatter={(v: any) => Number(v).toFixed(3)}
                style={{ fontSize: 11, fontWeight: 600, fill: "#334155" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">All Group Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 font-medium">Protected Attribute</th>
                <th className="pb-2 font-medium">Group</th>
                <th className="pb-2 font-medium">Count</th>
                <th className="pb-2 font-medium">Selection Rate</th>
                <th className="pb-2 font-medium">Impact Ratio</th>
                <th className="pb-2 font-medium">Target</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((x) => {
                const within = x.impactRatio === undefined || x.impactRatio >= threshold;
                const label = within ? "Within Target" : "Review Required";
                return (
                  <tr key={`${x.attribute}-${x.group}`} className="border-b border-border/50 hover:bg-muted/20">
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
                    <td className="py-2.5 font-mono text-muted-foreground">{threshold.toFixed(2)}</td>
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
      </div>
    </div>
  );
}
