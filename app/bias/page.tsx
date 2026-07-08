"use client";

import { useBiasMetrics } from "@/lib/api-client";
import { PageLoading, PageError } from "@/components/ui/loading";
import { getStatusColor } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceArea, LabelList,
} from "recharts";
import { CheckCircle2, Clock, Flag, BarChart3 } from "lucide-react";

export default function BiasPage() {
  const { data: biasMetrics, isLoading, error } = useBiasMetrics();

  if (isLoading) return <PageLoading />;
  if (error) return <PageError message={error.message} />;
  if (!biasMetrics) return <PageError />;

  const passCount = biasMetrics.filter((b) => b.status === "Pass").length;
  const warnCount = biasMetrics.filter((b) => b.status === "Warning").length;
  const failCount = biasMetrics.filter((b) => b.status === "Fail").length;

  const modelSummary = Array.from(new Set(biasMetrics.map((b) => b.model))).map((model) => {
    const metrics = biasMetrics.filter((b) => b.model === model);
    const avgValue = metrics.reduce((s, m) => s + m.value, 0) / metrics.length;
    const fails = metrics.filter((m) => m.status === "Fail").length;
    return { model, avgValue: +avgValue.toFixed(3), fails, total: metrics.length };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bias & Fairness Monitoring</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Demographic parity, disparate impact, and fairness metrics across all HR AI models
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-xs text-muted-foreground">Total Metrics Tracked</p>
            <p className="text-xl font-bold">{biasMetrics.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#0a7a49]" />
          <div>
            <p className="text-xs text-muted-foreground">Within Target</p>
            <p className="text-xl font-bold text-[#0a7a49]">{passCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-[#8a620a]" />
          <div>
            <p className="text-xs text-muted-foreground">Pending Calibrations</p>
            <p className="text-xl font-bold text-[#8a620a]">{warnCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <Flag className="w-5 h-5 text-[#ae3c24]" />
          <div>
            <p className="text-xs text-muted-foreground">Open Reviews</p>
            <p className="text-xl font-bold text-[#ae3c24]">{failCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Average Fairness Score by Model</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={modelSummary} layout="vertical" margin={{ right: 44 }}>
            {/* Translucent target corridor (0.80–1.00) replaces the red threshold line */}
            <ReferenceArea x1={0.8} x2={1} fill="#02c39a" fillOpacity={0.1} label={{ value: "Target Corridor (0.80–1.00)", position: "insideTopRight", fontSize: 10, fill: "#028090" }} />
            <XAxis type="number" domain={[0, 1]} tick={{ fontSize: 11 }} />
            <YAxis dataKey="model" type="category" width={130} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="avgValue" name="Avg Score" fill="#1e2761" radius={[0, 4, 4, 0]} isAnimationActive={false}>
              <LabelList
                dataKey="avgValue"
                position="right"
                formatter={(v: any) => Number(v).toFixed(2)}
                style={{ fontSize: 11, fontWeight: 600, fill: "#334155" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">All Bias Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 font-medium">Model</th>
                <th className="pb-2 font-medium">Metric</th>
                <th className="pb-2 font-medium">Protected Group</th>
                <th className="pb-2 font-medium">Value</th>
                <th className="pb-2 font-medium">Target</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {biasMetrics.map((b) => (
                <tr key={`${b.model}-${b.metric}-${b.group}`} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="py-2.5 font-medium">{b.model}</td>
                  <td className="py-2.5 text-muted-foreground">{b.metric}</td>
                  <td className="py-2.5 text-muted-foreground">{b.group}</td>
                  <td className={`py-2.5 font-mono ${b.value < b.threshold ? "text-[#ae3c24] font-semibold" : ""}`}>
                    {b.value.toFixed(2)}
                  </td>
                  <td className="py-2.5 font-mono text-muted-foreground">{b.threshold.toFixed(2)}</td>
                  <td className="py-2.5">
                    {(() => {
                      const label = b.status === "Pass" ? "Within Target" : b.status === "Warning" ? "Pending Calibration" : "Review Required";
                      return (
                        <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(label)}`}>
                          {label}
                        </span>
                      );
                    })()}
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
