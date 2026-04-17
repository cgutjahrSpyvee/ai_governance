"use client";

import { useState } from "react";
import { useAuditLogs } from "@/lib/api-client";
import { PageLoading, PageError } from "@/components/ui/loading";
import { Filter } from "lucide-react";

const severities = ["All", "Info", "Warning", "Critical"];

export default function AuditPage() {
  const { data: logs, isLoading, error } = useAuditLogs();
  const [sevFilter, setSevFilter] = useState("All");
  const [catFilter, setCatFilter] = useState("All");

  if (isLoading) return <PageLoading />;
  if (error) return <PageError message={error.message} />;
  if (!logs) return <PageError />;

  const categories = ["All", ...Array.from(new Set(logs.map((l) => l.category)))];
  const filtered = logs.filter((l) => {
    if (catFilter !== "All" && l.category !== catFilter) return false;
    if (sevFilter !== "All" && l.severity !== sevFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complete audit trail of HR AI decisions, changes, and reviews
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Total Events</p>
          <p className="text-xl font-bold mt-1">{logs.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Critical</p>
          <p className="text-xl font-bold text-red-600 mt-1">{logs.filter((l) => l.severity === "Critical").length}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Warnings</p>
          <p className="text-xl font-bold text-amber-600 mt-1">{logs.filter((l) => l.severity === "Warning").length}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">People Affected</p>
          <p className="text-xl font-bold mt-1">{logs.reduce((s, l) => s + l.affectedCount, 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Category</label>
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white">
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Severity</label>
            <select value={sevFilter} onChange={(e) => setSevFilter(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white">
              {severities.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">Affected</th>
                <th className="px-4 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="border-t border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3 font-medium">{log.event}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">{log.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded border ${log.severity === "Critical" ? "text-red-700 bg-red-50 border-red-200" : log.severity === "Warning" ? "text-amber-700 bg-amber-50 border-amber-200" : "text-slate-600 bg-slate-50 border-slate-200"}`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{log.affectedCount > 0 ? log.affectedCount.toLocaleString() : "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border bg-muted/30 text-xs text-muted-foreground">
          Showing {filtered.length} of {logs.length} events
        </div>
      </div>
    </div>
  );
}
