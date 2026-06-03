"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import {
  Briefcase,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Heart,
  ShieldCheck,
  FileText,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import type { CertificationMetrics } from "@/lib/certification-engine";

// ── Types ────────────────────────────────────────────────────────────────────

interface Requisition {
  id: string;
  title: string;
  department: string;
  description: string;
  requirements: string;
  status: string;
  createdAt: string;
  _count?: { screeningResults: number };
}

interface ScreeningResult {
  id: string;
  fileName: string;
  candidateName?: string;
  overallScore: number;
  technicalFit: number;
  experienceFit: number;
  educationFit: number;
  recommendation: string;
  summary: string;
  strengths: string;
  gaps: string;
  biasFlags: string;
  reviewRequired: boolean;
  humanDecision?: string;
  status: string;
  createdAt: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function scoreColor(score: number) {
  if (score >= 80) return "text-green-600";
  if (score >= 65) return "text-blue-600";
  if (score >= 45) return "text-amber-600";
  return "text-red-600";
}

function recommendationBadge(rec: string) {
  const map: Record<string, string> = {
    "Strong Yes": "bg-green-100 text-green-700",
    Yes: "bg-blue-100 text-blue-700",
    Maybe: "bg-amber-100 text-amber-700",
    No: "bg-red-100 text-red-700",
  };
  return map[rec] ?? "bg-slate-100 text-slate-600";
}

// ── New Requisition Modal ────────────────────────────────────────────────────

function NewRequisitionModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    title: "",
    department: "",
    description: "",
    requirements: "",
  });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/screening/requisitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    mutate("/api/screening/requisitions");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold">New Job Requisition</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input required className="w-full h-9 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" placeholder="Job title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input required className="w-full h-9 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <textarea required rows={3} className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary resize-none" placeholder="Job description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <textarea required rows={4} className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary resize-none" placeholder="Requirements (skills, experience, education...)" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
          <button type="submit" disabled={loading} className="w-full h-10 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
            {loading ? "Creating…" : "Create Requisition"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Upload Panel ──────────────────────────────────────────────────────────────

function UploadPanel({ requisitionId, onDone }: { requisitionId: string; onDone: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("requisitionId", requisitionId);
    if (name) fd.append("candidateName", name);
    const res = await fetch("/api/screening/upload", { method: "POST", body: fd });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Upload failed"); return; }
    setResult(data);
    mutate("/api/screening/requisitions");
  }

  if (result) {
    // API returns already-parsed arrays; DB results return JSON strings — handle both
    const parseField = (v: unknown): string[] => {
      if (Array.isArray(v)) return v as string[];
      try { return JSON.parse((v as string) || "[]"); } catch { return []; }
    };
    const strengths = parseField(result.strengths);
    const gaps      = parseField(result.gaps);
    const biasFlags = parseField(result.biasFlags);

    return (
      <div className="bg-muted/30 rounded-xl p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium">{result.fileName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{result.candidateName ?? "Anonymous"}</p>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${recommendationBadge(result.recommendation)}`}>{result.recommendation}</span>
        </div>

        {/* Score bar */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Overall Score</span>
            <span className={`font-semibold ${scoreColor(result.overallScore)}`}>{result.overallScore}/100</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${result.overallScore}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          {[["Technical", result.technicalFit], ["Experience", result.experienceFit], ["Education", result.educationFit]].map(([label, val]) => (
            <div key={label} className="bg-white rounded-lg p-2 text-center">
              <p className={`text-base font-bold ${scoreColor(Number(val))}`}>{val}</p>
              <p className="text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-foreground/80 leading-relaxed">{result.summary}</p>

        {strengths.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-green-700 mb-1">Strengths</p>
            <ul className="space-y-1">{strengths.map((s, i) => <li key={i} className="text-xs flex gap-1.5"><CheckCircle2 className="w-3 h-3 mt-0.5 text-green-500 shrink-0" />{s}</li>)}</ul>
          </div>
        )}

        {gaps.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 mb-1">Gaps</p>
            <ul className="space-y-1">{gaps.map((g, i) => <li key={i} className="text-xs flex gap-1.5"><AlertCircle className="w-3 h-3 mt-0.5 text-amber-500 shrink-0" />{g}</li>)}</ul>
          </div>
        )}

        {result.reviewRequired && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-800">Human Review Required</p>
              {biasFlags.length > 0 && <p className="text-xs text-amber-700 mt-0.5">{biasFlags.join("; ")}</p>}
            </div>
          </div>
        )}

        <button onClick={() => { setResult(null); setFile(null); setName(""); onDone(); }} className="w-full h-8 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted">Screen another resume</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input className="w-full h-9 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" placeholder="Candidate name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
      <label className="flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed border-border cursor-pointer hover:bg-muted/30 transition-colors">
        <Upload className="w-5 h-5 text-muted-foreground mb-1" />
        <span className="text-xs text-muted-foreground">{file ? file.name : "Upload PDF or DOCX"}</span>
        <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </label>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button type="submit" disabled={!file || loading} className="w-full h-9 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
        {loading ? "Scoring with Claude…" : "Screen Resume"}
      </button>
    </form>
  );
}

// ── Mini certification scorecard ─────────────────────────────────────────────

function CertScorecard({ reqId, screened }: { reqId: string; screened: number }) {
  const { data: cert } = useSWR<CertificationMetrics>(
    screened > 0 ? `/api/screening/requisitions/${reqId}/certification` : null,
    fetcher
  );

  if (screened === 0 || !cert) return null;

  return (
    <div className={`rounded-lg border p-3 ${cert.passed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {cert.passed
            ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            : <XCircle className="w-3.5 h-3.5 text-red-500" />}
          <span className={`text-xs font-semibold ${cert.passed ? "text-green-700" : "text-red-700"}`}>
            {cert.passed ? "Certified" : "Not Certified"} · {cert.score}% compliant
          </span>
        </div>
        <Link
          href={`/screening/${reqId}/report`}
          className="flex items-center gap-1 text-[10px] text-primary hover:underline"
        >
          <FileText className="w-3 h-3" /> Full Report
        </Link>
      </div>
      <div className="grid grid-cols-5 gap-1">
        {cert.metrics.map((m, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5" title={m.label}>
            {m.passed
              ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              : <XCircle className="w-3.5 h-3.5 text-red-400" />}
            <span className="text-[9px] text-center text-muted-foreground leading-tight">{m.label.split(" ")[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Requisition Card ──────────────────────────────────────────────────────────

function RequisitionCard({ req }: { req: Requisition }) {
  const [expanded, setExpanded] = useState(false);
  const screened = req._count?.screeningResults ?? 0;

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{req.title}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${req.status === "Active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{req.status}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{req.department} · {screened} screened</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </div>

      {/* Inline scorecard always visible when there's data */}
      {screened > 0 && (
        <div className="mt-3">
          <CertScorecard reqId={req.id} screened={screened} />
        </div>
      )}

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-border pt-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Description</p>
            <p className="text-xs text-foreground/80 leading-relaxed">{req.description}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Requirements</p>
            <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-line">{req.requirements}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">Screen a Resume</p>
            <UploadPanel requisitionId={req.id} onDone={() => {}} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ScreeningPage() {
  const { data: requisitions, isLoading } = useSWR<Requisition[]>(
    "/api/screening/requisitions",
    fetcher
  );
  const [showModal, setShowModal] = useState(false);

  const total = requisitions?.reduce((n, r) => n + (r._count?.screeningResults ?? 0), 0) ?? 0;
  const active = requisitions?.filter((r) => r.status === "Active").length ?? 0;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {showModal && <NewRequisitionModal onClose={() => setShowModal(false)} />}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-4 h-4 text-destructive" />
            <h1 className="text-2xl font-bold">Certified Resume Screening</h1>
          </div>
          <p className="text-sm text-muted-foreground">AI-powered, bias-audited candidate screening · Powered by Claude</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90">
          <Plus className="w-4 h-4" /> New Requisition
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Active Requisitions", value: active, icon: Briefcase },
          { label: "Resumes Screened", value: total, icon: Upload },
          { label: "Avg. Screening Time", value: "~8s", icon: Clock },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold text-primary">HumaniCore Certified Screening</p>
        </div>
        <p className="text-xs text-foreground/70 leading-relaxed">
          Each resume is anonymized (name, email, phone stripped) before AI scoring.
          Claude Opus 4.8 evaluates technical fit, experience, and education against your requirements.
          Bias flags are surfaced automatically — any demographic signals trigger mandatory human review.
        </p>
      </div>

      {/* Requisitions */}
      {isLoading && <p className="text-sm text-muted-foreground text-center py-12">Loading requisitions…</p>}
      {!isLoading && (!requisitions || requisitions.length === 0) && (
        <div className="text-center py-16">
          <Briefcase className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No requisitions yet</p>
          <button onClick={() => setShowModal(true)} className="mt-3 text-sm text-primary hover:underline">Create your first requisition →</button>
        </div>
      )}
      <div className="space-y-3">
        {requisitions?.map((req) => <RequisitionCard key={req.id} req={req} />)}
      </div>
    </div>
  );
}
