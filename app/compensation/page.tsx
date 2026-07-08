"use client";

import { usePayEquity } from "@/lib/api-client";
import { PageLoading, PageError } from "@/components/ui/loading";
import { formatNumber } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine, LabelList,
} from "recharts";
import { DollarSign, TrendingDown, Activity, CheckCircle2 } from "lucide-react";

export default function CompensationPage() {
  const { data: payEquity, isLoading, error } = usePayEquity();

  if (isLoading) return <PageLoading />;
  if (error) return <PageError message={error.message} />;
  if (!payEquity) return <PageError />;

  const avgGender = +(payEquity.reduce((s, d) => s + d.gapPercent, 0) / payEquity.length).toFixed(1);
  const avgEthnic = +(payEquity.reduce((s, d) => s + d.ethnicGapPercent, 0) / payEquity.length).toFixed(1);
  const highGap = payEquity.filter((d) => d.gapPercent > 5).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Compensation & Pay Equity AI</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-driven pay equity analysis and gap monitoring
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs">Avg Gender Pay Gap</span>
          </div>
          <p className="text-xl font-bold text-foreground">{avgGender}%</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingDown className="w-4 h-4" />
            <span className="text-xs">Avg Ethnic Pay Gap</span>
          </div>
          <p className="text-xl font-bold text-foreground">{avgEthnic}%</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Activity className="w-4 h-4 text-[#8a620a]" />
            <span className="text-xs">Roles Prioritized for Pay Analysis</span>
          </div>
          <p className="text-xl font-bold text-[#8a620a]">{highGap}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CheckCircle2 className="w-4 h-4 text-[#0a7a49]" />
            <span className="text-xs">Total Roles Analyzed</span>
          </div>
          <p className="text-xl font-bold">{payEquity.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Gender Pay Gap by Role</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={payEquity.map((d) => ({ role: `${d.role} ${d.level}`, gap: d.gapPercent }))} margin={{ top: 20 }}>
            {/* Translucent target corridor (≤3%) replaces the red/green threshold lines */}
            <ReferenceArea y1={0} y2={3} fill="#02c39a" fillOpacity={0.1} label={{ value: "Target Corridor (≤ 3%)", position: "insideTopRight", fontSize: 10, fill: "#0a7a49" }} />
            {/* Teal dashed line marks the top edge of the target corridor (3%) */}
            <ReferenceLine y={3} stroke="#02c39a" strokeDasharray="4 4" strokeWidth={1} />
            <XAxis dataKey="role" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={70} />
            <YAxis tick={{ fontSize: 11 }} unit="%" />
            <Tooltip />
            <Bar dataKey="gap" fill="#1e2761" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              <LabelList dataKey="gap" position="top" formatter={(v: number) => `${v}%`} style={{ fontSize: 10, fill: "#475569" }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Pay Equity Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium">Level</th>
                <th className="pb-2 font-medium">Male Median</th>
                <th className="pb-2 font-medium">Female Median</th>
                <th className="pb-2 font-medium">Gender Gap</th>
                <th className="pb-2 font-medium">White Median</th>
                <th className="pb-2 font-medium">BIPOC Median</th>
                <th className="pb-2 font-medium">Ethnic Gap</th>
              </tr>
            </thead>
            <tbody>
              {payEquity.map((d) => (
                <tr key={`${d.role}-${d.level}`} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="py-2.5 font-medium">{d.role}</td>
                  <td className="py-2.5 text-muted-foreground">{d.level}</td>
                  <td className="py-2.5">${formatNumber(d.maleMedian)}</td>
                  <td className="py-2.5">${formatNumber(d.femaleMedian)}</td>
                  <td className="py-2.5 font-semibold text-foreground">
                    {d.gapPercent}%
                  </td>
                  <td className="py-2.5">${formatNumber(d.whiteMedian)}</td>
                  <td className="py-2.5">${formatNumber(d.bipocMedian)}</td>
                  <td className="py-2.5 font-semibold text-foreground">
                    {d.ethnicGapPercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Section 6 — small-group suppression banner */}
        <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
          <Activity className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-700">Non-Binary × role intersections withheld.</span> Data volume
            insufficient for statistical impact modeling; continuous tracking remains active and the underlying record is
            preserved in the audit log.
          </p>
        </div>
      </div>
    </div>
  );
}
