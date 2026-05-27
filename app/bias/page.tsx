"use client";

import { useBiasMetrics } from "@/lib/api-client";
import { PageLoading, PageError } from "@/components/ui/loading";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

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
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Total Metrics Tracked</p>
          <p className="text-xl font-bold mt-1">{biasMetrics.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-xs text-muted-foreground">Passing</p>
            <p className="text-xl font-bold text-green-600">{passCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <div>
            <p className="text-xs text-muted-foreground">Warnings</p>
            <p className="text-xl font-bold text-amber-600">{warnCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-600" />
          <div>
            <p className="text-xs text-muted-foreground">Failures</p>
            <p className="text-xl font-bold text-red-600">{failCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Average Fairness Score by Model</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={modelSummary} layout="vertical">
            <XAxis type="number" domain={[0, 1]} tick={{ fontSize: 11 }} />
            <YAxis dataKey="model" type="category" width={130} tick={{ fontSize: 11 }} />
            <Tooltip />
            <ReferenceLine x={0.8} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "Threshold", position: "top", fontSize: 10 }} />
            <Bar dataKey="avgValue" name="Avg Score" fill="#2563eb" radius={[0, 4, 4, 0]} />
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
                <th className="pb-2 font-medium">Threshold</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {biasMetrics.map((b) => (
                <tr key={`${b.model}-${b.metric}-${b.group}`} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="py-2.5 font-medium">{b.model}</td>
                  <td className="py-2.5 text-muted-foreground">{b.metric}</td>
                  <td className="py-2.5 text-muted-foreground">{b.group}</td>
                  <td className={`py-2.5 font-mono ${b.value < b.threshold ? "text-red-600 font-semibold" : ""}`}>
                    {b.value.toFixed(2)}
                  </td>
                  <td className="py-2.5 font-mono text-muted-foreground">{b.threshold.toFixed(2)}</td>
                  <td className="py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded border ${b.status === "Pass" ? "text-green-700 bg-green-50 border-green-200" : b.status === "Warning" ? "text-amber-700 bg-amber-50 border-amber-200" : "text-red-700 bg-red-50 border-red-200"}`}>
                      {b.status}
                    </span>
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
