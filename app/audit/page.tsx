"use client";

import { useAuditLogs } from "@/lib/api-client";
import { PageLoading, PageError } from "@/components/ui/loading";
import DemoDataBanner from "@/components/layout/demo-data-banner";
import {
  auditContext,
  getPriorityLabel,
  getPriorityColor,
  metricFrame,
  CHIP_SLATE,
} from "@/lib/utils";
import type { MetricTone } from "@/lib/utils";
import { FileText, Flag, Clock, Users } from "lucide-react";

export default function AuditPage() {
  const { data: logs, isLoading, error } = useAuditLogs();

  if (isLoading) return <PageLoading />;
  if (error) return <PageError message={error.message} />;
  if (!logs) return <PageError />;

  const priorityOne = logs.filter((l) => l.severity === "Critical").length;
  const pendingCalibrations = logs.filter((l) => l.severity === "Warning").length;

  const cards: {
    label: string;
    value: string | number;
    icon: typeof FileText;
    tone: MetricTone;
    cls: string;
  }[] = [
    { label: "Total Events", value: logs.length, icon: FileText, tone: "neutral", cls: "" },
    {
      label: "Priority 1",
      value: priorityOne,
      icon: Flag,
      tone: priorityOne > 0 ? "alarm" : "neutral",
      cls: "text-[#ae3c24]",
    },
    {
      label: "Pending Calibrations",
      value: pendingCalibrations,
      icon: Clock,
      tone: pendingCalibrations > 0 ? "warning" : "neutral",
      cls: "text-[#8a620a]",
    },
    {
      label: "People Affected",
      value: logs.reduce((s, l) => s + l.affectedCount, 0).toLocaleString(),
      icon: Users,
      tone: "neutral",
      cls: "",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complete audit trail of HR AI decisions, changes, and reviews · source event strings render verbatim
        </p>
      </div>

      <DemoDataBanner />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-xl p-4 ${metricFrame(c.tone)}`}>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <c.icon className={`w-4 h-4 ${c.cls}`} />
              <p className="text-xs">{c.label}</p>
            </div>
            <p className={`text-xl font-bold ${c.cls}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          {/* Body cells are uniformly text-xs; headers match that size so the
              column labels no longer outweigh the records they describe. */}
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/50 text-left text-foreground">
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-4 py-3 font-semibold">Event (Verbatim)</th>
                <th className="px-4 py-3 font-semibold">Context</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Review Priority</th>
                <th className="px-4 py-3 font-semibold">Affected</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-3 text-foreground whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  {/* Verbatim source event — immutable, never paraphrased */}
                  <td className="px-4 py-3 font-mono text-foreground">{log.event}</td>
                  {/* Plain-language context — presentation layer only. Section 3
                      requires it read as secondary to the verbatim event, so this
                      is the one column that stays muted while the rest is black;
                      the italic carries the distinction as much as the colour. */}
                  <td className="px-4 py-3 text-muted-foreground italic max-w-xs">
                    {auditContext(log.event, log.category)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded border ${CHIP_SLATE}`}>{log.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded border ${getPriorityColor(log.severity)}`}>
                      {getPriorityLabel(log.severity)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {log.affectedCount > 0 ? log.affectedCount.toLocaleString() : "—"}
                  </td>
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
