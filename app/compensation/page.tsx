"use client";

import { usePayEquity } from "@/lib/api-client";
import { PageLoading, PageError } from "@/components/ui/loading";
import { formatNumber } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";
import { DollarSign, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react";

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
          <p className="text-xl font-bold text-amber-600">{avgGender}%</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingDown className="w-4 h-4" />
            <span className="text-xs">Avg Ethnic Pay Gap</span>
          </div>
          <p className="text-xl font-bold text-amber-600">{avgEthnic}%</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-xs">High Gap Roles</span>
          </div>
          <p className="text-xl font-bold text-red-600">{highGap}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-xs">Total Roles Analyzed</span>
          </div>
          <p className="text-xl font-bold">{payEquity.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Gender Pay Gap by Role</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={payEquity.map((d) => ({ role: `${d.role} ${d.level}`, gap: d.gapPercent }))}>
            <XAxis dataKey="role" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={70} />
            <YAxis tick={{ fontSize: 11 }} unit="%" />
            <Tooltip />
            <ReferenceLine y={3} stroke="#10b981" strokeDasharray="5 5" />
            <ReferenceLine y={5} stroke="#ef4444" strokeDasharray="5 5" />
            <Bar dataKey="gap" fill="#ec4899" radius={[4, 4, 0, 0]} />
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
                <tr key={d.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="py-2.5 font-medium">{d.role}</td>
                  <td className="py-2.5 text-muted-foreground">{d.level}</td>
                  <td className="py-2.5">${formatNumber(d.maleMedian)}</td>
                  <td className="py-2.5">${formatNumber(d.femaleMedian)}</td>
                  <td className={`py-2.5 font-semibold ${d.gapPercent > 5 ? "text-red-600" : d.gapPercent > 3 ? "text-amber-600" : "text-green-600"}`}>
                    {d.gapPercent}%
                  </td>
                  <td className="py-2.5">${formatNumber(d.whiteMedian)}</td>
                  <td className="py-2.5">${formatNumber(d.bipocMedian)}</td>
                  <td className={`py-2.5 font-semibold ${d.ethnicGapPercent > 5 ? "text-red-600" : d.ethnicGapPercent > 3 ? "text-amber-600" : "text-green-600"}`}>
                    {d.ethnicGapPercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
