"use client";

import { useState } from "react";
import { useModels } from "@/lib/api-client";
import { PageLoading, PageError } from "@/components/ui/loading";
import DemoDataBanner from "@/components/layout/demo-data-banner";
import { getPriorityColor, getPriorityLabel, getStatusColor, formatDate } from "@/lib/utils";
import { Bot, Filter } from "lucide-react";

const functions = ["All", "Hiring", "Performance", "Compensation", "Retention", "Workforce Planning"];
const reviewPriorities = [
  { value: "All", label: "All" },
  { value: "High", label: "Priority 1" },
  { value: "Medium", label: "Priority 2" },
  { value: "Low", label: "Standard Review Queue" },
];
const statuses = ["All", "Production", "Staging", "Under Review", "Retired"];

export default function ModelsPage() {
  const { data: models, isLoading, error } = useModels();
  const [fnFilter, setFnFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  if (isLoading) return <PageLoading />;
  if (error) return <PageError message={error.message} />;
  if (!models) return <PageError />;

  const filtered = models.filter((m) => {
    if (fnFilter !== "All" && m.function !== fnFilter) return false;
    if (riskFilter !== "All" && m.riskTier !== riskFilter) return false;
    if (statusFilter !== "All" && m.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">HR AI Model Inventory</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All AI models deployed across HR processes
        </p>
      </div>

      <DemoDataBanner />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["Production", "Staging", "Under Review", "Retired"].map((status) => {
          const count = models.filter((m) => m.status === status).length;
          return (
            <div key={status} className="bg-white rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground">{status}</p>
              <p className="text-xl font-bold mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Function</label>
            <select value={fnFilter} onChange={(e) => setFnFilter(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white">
              {functions.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Review Priority</label>
            <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white">
              {reviewPriorities.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white">
              {statuses.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-left text-muted-foreground">
                <th className="px-3 py-2.5 font-medium">ID</th>
                <th className="px-3 py-2.5 font-medium">Model Name</th>
                <th className="px-3 py-2.5 font-medium">Function</th>
                <th className="px-3 py-2.5 font-medium">Vendor</th>
                <th className="px-3 py-2.5 font-medium">Review Priority</th>
                <th className="px-3 py-2.5 font-medium">Fairness</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium">Last Audit</th>
                <th className="px-3 py-2.5 font-medium">Owner</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((model) => (
                <tr key={model.id} className="border-t border-border/50 hover:bg-muted/20">
                  <td className="px-3 py-2.5 text-muted-foreground font-mono text-xs">{model.id}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-medium">{model.name}</p>
                        <p className="text-xs text-muted-foreground">{model.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{model.function}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{model.vendor}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(model.riskTier)}`}>
                      {getPriorityLabel(model.riskTier)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      {/* Shaded target corridor (≥0.80) behind a single brand-teal bar */}
                      <div className="relative w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="absolute inset-y-0 right-0 bg-[#028090]/15" style={{ width: "20%" }} />
                        <div className="relative h-full rounded-full bg-[#028090]" style={{ width: `${model.fairnessScore * 100}%` }} />
                      </div>
                      <span className="text-xs font-medium">{model.fairnessScore.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(model.status)}`}>
                      {model.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">
                    {formatDate(new Date(model.lastAudit).toISOString())}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{model.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-3 py-2.5 border-t border-border bg-muted/30 text-xs text-muted-foreground">
          Showing {filtered.length} of {models.length} models
        </div>
      </div>
    </div>
  );
}
