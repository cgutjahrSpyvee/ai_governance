"use client";

import useSWR from "swr";
import { Activity, RefreshCw, ServerCog } from "lucide-react";
import type { EngineLogPayload } from "@/app/api/admin/engine-log/route";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function outcomeChip(ok: boolean, outcome: string) {
  if (ok) return "text-[#0a7a49] bg-[#d7f2e4] border-[#a9e1c6]";
  if (outcome === "TIMEOUT" || outcome === "UNREACHABLE")
    return "text-[#ae3c24] bg-[#f9e4de] border-[#efc5b8]";
  return "text-[#8a620a] bg-[#fbeecd] border-[#eed18a]";
}

export default function EngineLogPage() {
  // Poll so the log updates as other screens make engine calls.
  const { data, isLoading, mutate } = useSWR<EngineLogPayload>(
    "/api/admin/engine-log",
    fetcher,
    { refreshInterval: 5000 },
  );

  const calls = data?.calls ?? [];
  const failures = calls.filter((c) => !c.ok).length;
  const avgMs = calls.length
    ? Math.round(calls.reduce((s, c) => s + c.ms, 0) / calls.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ServerCog className="w-5 h-5 text-primary" /> Engine Call Log
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Outbound web-service calls from this server to the governance engine
            {data?.baseUrl ? ` · ${data.baseUrl}` : ""}
          </p>
        </div>
        <button
          onClick={() => mutate()}
          className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-xs font-medium hover:bg-muted"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
        <Activity className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 leading-relaxed">
          These calls are made server-to-server, so they never appear in your browser&apos;s network
          log — the API key stays on the server. This buffer holds the most recent 200 calls for the
          process serving this request and is not persisted.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Calls Recorded", value: calls.length, cls: "" },
          { label: "Failures", value: failures, cls: failures > 0 ? "text-[#ae3c24]" : "" },
          { label: "Avg Duration", value: `${avgMs}ms`, cls: "" },
          {
            label: "Engine",
            value: data?.configured ? "Configured" : "Not configured",
            cls: data?.configured ? "text-[#0a7a49]" : "text-[#ae3c24]",
          },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className={`text-xl font-bold mt-1 ${c.cls}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 font-medium">Endpoint</th>
                <th className="px-4 py-3 font-medium">Outcome</th>
                <th className="px-4 py-3 font-medium">Duration</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((c) => (
                <tr key={c.id} className="border-t border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(c.at).toLocaleTimeString("en-US", {
                      hour: "2-digit", minute: "2-digit", second: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs">{c.method}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-foreground break-all">
                    {c.path}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${outcomeChip(c.ok, c.outcome)}`}
                    >
                      {c.outcome}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{c.ms}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && calls.length === 0 && (
          <p className="px-4 py-8 text-sm text-muted-foreground text-center">
            No engine calls recorded yet. Visit Compliance, Bias &amp; Fairness, Hiring AI or the
            Audit Report to generate traffic.
          </p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Request and response bodies are never recorded, and the API key is never logged or returned
        by this endpoint. Sub-millisecond entries are served from the Next.js fetch cache rather than
        a fresh network round trip.
      </p>
    </div>
  );
}
