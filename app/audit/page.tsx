"use client";

import { useAuditLogs } from "@/lib/api-client";
import { PageLoading, PageError } from "@/components/ui/loading";
import { auditContext } from "@/lib/utils";
import { FileText, Flag, Clock, Users } from "lucide-react";

// Severity values map to neutral display labels (chips only, never the record).
const severityLabel = (s: string) =>
  s === "Critical" ? "Priority 1" : s === "Warning" ? "Pending Calibration" : "Info";

const severityChip = (s: string) =>
  s === "Critical"
    ? "text-[#ae3c24] bg-[#f9e4de] border-[#efc5b8]"
    : s === "Warning"
    ? "text-[#8a620a] bg-[#fbeecd] border-[#eed18a]"
    : "text-slate-500 bg-slate-50 border-slate-200";

export default function AuditPage() {
  const { data: logs, isLoading, error } = useAuditLogs();

  if (isLoading) return <PageLoading />;
  if (error) return <PageError message={error.message} />;
  if (!logs) return <PageError />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complete audit trail of HR AI decisions, changes, and reviews · source event strings render verbatim
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <FileText className="w-4 h-4" />
            <p className="text-xs">Total Events</p>
          </div>
          <p className="text-xl font-bold">{logs.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Flag className="w-4 h-4 text-[#ae3c24]" />
            <p className="text-xs">Priority 1</p>
          </div>
          <p className="text-xl font-bold text-[#ae3c24]">{logs.filter((l) => l.severity === "Critical").length}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-4 h-4 text-[#8a620a]" />
            <p className="text-xs">Pending Calibrations</p>
          </div>
          <p className="text-xl font-bold text-[#8a620a]">{logs.filter((l) => l.severity === "Warning").length}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="w-4 h-4" />
            <p className="text-xs">People Affected</p>
          </div>
          <p className="text-xl font-bold">{logs.reduce((s, l) => s + l.affectedCount, 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 font-medium">Event (Verbatim)</th>
                <th className="px-4 py-3 font-medium">Context</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">Affected</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  {/* Verbatim source event — immutable, never paraphrased */}
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{log.event}</td>
                  {/* Plain-language context — presentation layer only, visually secondary */}
                  <td className="px-4 py-3 text-xs text-muted-foreground font-normal italic max-w-xs">{auditContext(log.event, log.category)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">{log.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded border ${severityChip(log.severity)}`}>
                      {severityLabel(log.severity)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{log.affectedCount > 0 ? log.affectedCount.toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Event strings are immutable and never paraphrased. The Context column is generated at the presentation layer and is not part of the record.
      </p>
    </div>
  );
}
