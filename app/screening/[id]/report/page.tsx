"use client";

import { use, useState } from "react";
import useSWR from "swr";
import { CheckCircle2, XCircle, Printer, Download, Heart, ShieldCheck } from "lucide-react";
import type { CertificationMetrics } from "@/lib/certification-engine";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

function MetricRow({ m }: { m: CertificationMetrics["metrics"][number] }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-slate-100 last:border-0">
      <div className="shrink-0 mt-0.5">
        {m.passed
          ? <CheckCircle2 className="w-5 h-5 text-green-500" />
          : <XCircle className="w-5 h-5 text-red-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold">{m.label}</p>
          <div className="text-right shrink-0">
            <span className={`text-sm font-bold ${m.passed ? "text-green-600" : "text-red-600"}`}>
              {m.value}{m.unit}
            </span>
            <span className="text-xs text-muted-foreground ml-1">/ {m.threshold}{m.unit}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
        <p className="text-xs text-foreground/70 mt-1 italic">{m.detail}</p>
      </div>
    </div>
  );
}

export default function CertificationReportPage({ params }: ReportPageProps) {
  const { id } = use(params);
  const { data: cert, isLoading } = useSWR<CertificationMetrics>(
    `/api/screening/requisitions/${id}/certification`,
    fetcher
  );
  const [saving, setSaving] = useState(false);

  async function saveSnapshot() {
    setSaving(true);
    await fetch(`/api/screening/requisitions/${id}/certification`, { method: "POST" });
    setSaving(false);
    window.alert("Certification snapshot saved to compliance record.");
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Computing certification metrics…</p>
      </div>
    );
  }

  if (!cert) return null;

  const passedCount = cert.metrics.filter((m) => m.passed).length;
  const reportDate = new Date(cert.generatedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      {/* Print toolbar — hidden when printing */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-border px-8 py-3 flex items-center justify-between">
        <p className="text-sm font-medium">Certification Report — {cert.requisitionTitle}</p>
        <div className="flex gap-2">
          <a
            href={`/screening/${id}/audit`}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-xs font-medium hover:bg-muted"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Audit Trail
          </a>
          <button
            onClick={saveSnapshot}
            disabled={saving}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-xs font-medium hover:bg-muted disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {saving ? "Saving…" : "Save to Record"}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Report body */}
      <div className="max-w-3xl mx-auto px-8 py-10 print:p-0 print:max-w-none">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-xl font-bold" style={{ fontFamily: "Georgia, serif" }}>
                HumaniCore <span className="font-normal italic">AI</span>
              </p>
              <p className="text-xs text-slate-500">Human Centered Governance for AI</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase tracking-wide">AI Governance Certification</p>
            <p className="text-xs text-slate-500 mt-0.5">{reportDate}</p>
          </div>
        </div>

        {/* Certification status */}
        <div className={`rounded-2xl border-2 p-6 mb-8 ${cert.passed ? "border-green-300 bg-green-50" : "border-red-200 bg-red-50"}`}>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${cert.passed ? "bg-green-100" : "bg-red-100"}`}>
              {cert.passed
                ? <CheckCircle2 className="w-9 h-9 text-green-600" />
                : <XCircle className="w-9 h-9 text-red-500" />}
            </div>
            <div>
              <p className={`text-2xl font-bold ${cert.passed ? "text-green-700" : "text-red-700"}`}>
                {cert.passed ? "Certified — All Metrics Pass" : "Not Certified — Action Required"}
              </p>
              <p className={`text-sm mt-0.5 ${cert.passed ? "text-green-600" : "text-red-600"}`}>
                {passedCount} of {cert.metrics.length} fairness metrics passed · Compliance score: {cert.score}%
              </p>
            </div>
          </div>
        </div>

        {/* Requisition info */}
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-2">Requisition</p>
          <div className="grid grid-cols-2 gap-4 bg-white rounded-xl border border-border p-4">
            <div>
              <p className="text-xs text-muted-foreground">Job Title</p>
              <p className="text-sm font-medium">{cert.requisitionTitle}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Requisition ID</p>
              <p className="text-sm font-mono text-xs">{cert.requisitionId}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Screened</p>
              <p className="text-sm font-medium">{cert.totalScreened} candidates</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Report Date</p>
              <p className="text-sm font-medium">{reportDate}</p>
            </div>
          </div>
        </div>

        {/* Fairness metrics */}
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-2">Fairness Metrics</p>
          <div className="bg-white rounded-xl border border-border p-4">
            {cert.metrics.map((m, i) => <MetricRow key={i} m={m} />)}
          </div>
        </div>

        {/* Recommendation distribution */}
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-2">Outcome Distribution</p>
          <div className="bg-white rounded-xl border border-border p-4 grid grid-cols-4 gap-3">
            {(["Strong Yes", "Yes", "Maybe", "No"] as const).map((label) => {
              const count = cert.recommendationDist[label] ?? 0;
              const pct = cert.totalScreened > 0 ? Math.round(count / cert.totalScreened * 100) : 0;
              const colorMap: Record<string, string> = {
                "Strong Yes": "text-green-600",
                Yes: "text-blue-600",
                Maybe: "text-amber-600",
                No: "text-red-600",
              };
              return (
                <div key={label} className="text-center">
                  <p className={`text-2xl font-bold ${colorMap[label]}`}>{count}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-[10px] text-slate-400">{pct}%</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Methodology note */}
        <div className="bg-slate-100 rounded-xl p-4 text-xs text-slate-500 leading-relaxed">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
            <div>
              <p className="font-semibold text-slate-600 mb-1">Methodology</p>
              <p>All resumes were anonymized (name, email, phone, social profiles stripped) before AI evaluation.
              Scoring used Claude Opus 4.8 with HumaniCore&apos;s certified scoring rubric: technical fit (50%), experience fit (40%), education fit (10%).
              The Four-Fifths Rule proxy computes adverse impact on score-based pass rates across the candidate pool.
              This report constitutes a point-in-time compliance snapshot and should be retained as part of your AI governance record.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between text-[10px] text-slate-400">
          <span>HumaniCore AI · Human Centered Governance for AI · humanicoreai.com</span>
          <span>Generated {reportDate}</span>
        </div>
      </div>
    </div>
  );
}
