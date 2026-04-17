"use client";

import { useState } from "react";
import { useIncidents } from "@/lib/api-client";
import { PageLoading, PageError } from "@/components/ui/loading";
import { getRiskColor, getStatusColor, formatDate } from "@/lib/utils";
import { AlertTriangle, Filter, Clock } from "lucide-react";

const statusOptions = ["All", "Open", "Investigating", "Resolved", "Closed"];
const severityOptions = ["All", "Critical", "High", "Medium", "Low"];

export default function IncidentsPage() {
  const { data: incidents, isLoading, error } = useIncidents();
  const [statusFilter, setStatusFilter] = useState("All");
  const [sevFilter, setSevFilter] = useState("All");

  if (isLoading) return <PageLoading />;
  if (error) return <PageError message={error.message} />;
  if (!incidents) return <PageError />;

  const filtered = incidents.filter((i) => {
    if (statusFilter !== "All" && i.status !== statusFilter) return false;
    if (sevFilter !== "All" && i.severity !== sevFilter) return false;
    return true;
  });

  const resolved = incidents.filter((i) => i.resolvedDate);
  const avgDays =
    resolved.length > 0
      ? +(
          resolved.reduce((s, i) => {
            const diff =
              (new Date(i.resolvedDate!).getTime() - new Date(i.reportedDate).getTime()) /
              (1000 * 60 * 60 * 24);
            return s + diff;
          }, 0) / resolved.length
        ).toFixed(1)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Incident & Grievance Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-related incidents, bias reports, and employee grievances
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Total Incidents</p>
          <p className="text-xl font-bold mt-1">{incidents.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <p className="text-xs text-muted-foreground">Open / Investigating</p>
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">
            {incidents.filter((i) => i.status === "Open" || i.status === "Investigating").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Avg Resolution Time</p>
          </div>
          <p className="text-xl font-bold mt-1">{avgDays} days</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Resolved</p>
          <p className="text-xl font-bold text-green-600 mt-1">{resolved.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white">
              {statusOptions.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Severity</label>
            <select value={sevFilter} onChange={(e) => setSevFilter(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white">
              {severityOptions.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Reported</th>
                <th className="px-4 py-3 font-medium">Assigned</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inc) => (
                <tr key={inc.id} className="border-t border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{inc.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{inc.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{inc.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded border ${getRiskColor(inc.severity)}`}>{inc.severity}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(inc.status)}`}>{inc.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{inc.category}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(new Date(inc.reportedDate).toISOString())}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inc.assignedTo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border bg-muted/30 text-xs text-muted-foreground">
          Showing {filtered.length} of {incidents.length} incidents
        </div>
      </div>
    </div>
  );
}
