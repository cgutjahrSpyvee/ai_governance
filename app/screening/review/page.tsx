"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ReviewResult {
  id: string;
  fileName: string;
  candidateName?: string;
  overallScore: number;
  recommendation: string;
  summary: string;
  strengths: string;
  gaps: string;
  biasFlags: string;
  humanDecision?: string;
  humanReviewedBy?: string;
  humanReviewedAt?: string;
  status: string;
  createdAt: string;
  requisition: { title: string; department: string };
}

function scoreColor(s: number) {
  if (s >= 80) return "text-green-600";
  if (s >= 65) return "text-blue-600";
  if (s >= 45) return "text-amber-600";
  return "text-red-600";
}

function recBadge(rec: string) {
  const m: Record<string, string> = {
    "Strong Yes": "bg-green-100 text-green-700",
    Yes: "bg-blue-100 text-blue-700",
    Maybe: "bg-amber-100 text-amber-700",
    No: "bg-red-100 text-red-700",
  };
  return m[rec] ?? "bg-slate-100 text-slate-600";
}

function ReviewCard({ r, onDecide }: { r: ReviewResult; onDecide: (id: string, decision: "Approved" | "Rejected") => void }) {
  const [open, setOpen] = useState(false);
  const flags: string[] = JSON.parse(r.biasFlags || "[]");
  const strengths: string[] = JSON.parse(r.strengths || "[]");
  const gaps: string[] = JSON.parse(r.gaps || "[]");

  return (
    <div className="bg-card rounded-xl border border-amber-200 p-5">
      <div className="flex items-start justify-between cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-medium">{r.candidateName ?? r.fileName}</p>
            <p className="text-xs text-muted-foreground">{r.requisition.title} · {r.requisition.department}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-semibold ${scoreColor(r.overallScore)}`}>{r.overallScore}/100</span>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${recBadge(r.recommendation)}`}>{r.recommendation}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            <AlertCircle className="w-3 h-3" /> Bias flagged
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t border-border space-y-3">
          <p className="text-xs text-foreground/80 leading-relaxed">{r.summary}</p>

          {flags.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs font-semibold text-amber-800 mb-1">Bias Flags Detected</p>
              <ul className="space-y-0.5">
                {flags.map((f, i) => <li key={i} className="text-xs text-amber-700">• {f}</li>)}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {strengths.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-green-700 mb-1">Strengths</p>
                <ul className="space-y-0.5">{strengths.slice(0, 3).map((s, i) => <li key={i} className="text-xs text-foreground/70">• {s}</li>)}</ul>
              </div>
            )}
            {gaps.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 mb-1">Gaps</p>
                <ul className="space-y-0.5">{gaps.slice(0, 3).map((g, i) => <li key={i} className="text-xs text-foreground/70">• {g}</li>)}</ul>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onDecide(r.id, "Approved")}
              className="flex-1 h-9 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Approve
            </button>
            <button
              onClick={() => onDecide(r.id, "Rejected")}
              className="flex-1 h-9 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DecidedCard({ r }: { r: ReviewResult }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-medium">{r.candidateName ?? r.fileName}</p>
        <p className="text-xs text-muted-foreground">{r.requisition.title}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold ${scoreColor(r.overallScore)}`}>{r.overallScore}/100</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.humanDecision === "Approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {r.humanDecision}
        </span>
        <span className="text-[10px] text-muted-foreground">{r.humanReviewedBy}</span>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  const { data, isLoading } = useSWR<{ pending: ReviewResult[]; decided: ReviewResult[] }>(
    "/api/screening/review", fetcher
  );

  async function decide(id: string, decision: "Approved" | "Rejected") {
    await fetch(`/api/screening/results/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ humanDecision: decision }),
    });
    mutate("/api/screening/review");
  }

  const pending = data?.pending ?? [];
  const decided = data?.decided ?? [];

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Human Review Queue</h1>
          <p className="text-sm text-muted-foreground">Candidates flagged for bias risk — review required before advancing</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Pending Review", value: pending.length, color: "text-amber-600" },
          { label: "Reviewed Today", value: decided.filter(d => new Date(d.humanReviewedAt!).toDateString() === new Date().toDateString()).length, color: "text-green-600" },
          { label: "Total Reviewed", value: decided.length, color: "text-blue-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-4">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Pending */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-semibold">Awaiting Review</h2>
          {pending.length > 0 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">{pending.length}</span>
          )}
        </div>

        {isLoading && <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>}
        {!isLoading && pending.length === 0 && (
          <div className="text-center py-12 bg-green-50 border border-green-100 rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-700">All caught up!</p>
            <p className="text-xs text-green-600">No candidates pending review</p>
          </div>
        )}
        <div className="space-y-3">
          {pending.map((r) => <ReviewCard key={r.id} r={r} onDecide={decide} />)}
        </div>
      </div>

      {/* Decided history */}
      {decided.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3">Review History</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            {decided.map((r) => <DecidedCard key={r.id} r={r} />)}
          </div>
        </div>
      )}
    </div>
  );
}
