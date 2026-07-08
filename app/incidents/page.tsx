"use client";

import { useIncidents } from "@/lib/api-client";
import { PageLoading, PageError } from "@/components/ui/loading";
import { getPriorityColor, getPriorityLabel, getStatusColor, formatDate, vocab } from "@/lib/utils";
import { ClipboardList, Clock, MessageSquare, CheckCircle2 } from "lucide-react";

export default function IncidentsPage() {
  const { data: incidents, isLoading, error } = useIncidents();

  if (isLoading) return <PageLoading />;
  if (error) return <PageError message={error.message} />;
  if (!incidents) return <PageError />;

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
        <h1 className="text-2xl font-bold text-foreground">Governance Cases & Feedback</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-related cases, bias reviews, and employee grievance intake
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <MessageSquare className="w-4 h-4" />
            <p className="text-xs">Total Cases</p>
          </div>
          <p className="text-xl font-bold">{incidents.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[#ae3c24]" />
            <p className="text-xs text-muted-foreground">Open / Investigating</p>
          </div>
          <p className="text-xl font-bold text-[#ae3c24] mt-1">
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
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CheckCircle2 className="w-4 h-4 text-[#0a7a49]" />
            <p className="text-xs">Resolved</p>
          </div>
          <p className="text-xl font-bold text-[#0a7a49]">{resolved.length}</p>
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
              {incidents.map((inc) => (
                <tr key={inc.id} className="border-t border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{inc.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{inc.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{inc.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(inc.severity)}`}>{getPriorityLabel(inc.severity)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(inc.status)}`}>{inc.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{vocab(inc.category)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(new Date(inc.reportedDate).toISOString())}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inc.assignedTo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Case titles are authored by people and are never rewritten by the system. Employee grievance intake is a retained finding source.
      </p>
    </div>
  );
}
