"use client";

import { use } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  ShieldCheck, User, Bot, FileText, Award,
  CheckCircle2, XCircle, ArrowLeft, Lock,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface AuditEntry {
  id: string;
  eventType: string;
  actorEmail: string;
  actorRole: string;
  modelVersion?: string;
  promptVersion?: string;
  scoreSnapshot?: string;
  resumeHash?: string;
  decision?: string;
  notes?: string;
  certScore?: number;
  certPassed?: boolean;
  checksum: string;
  createdAt: string;
}

const EVENT_META: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  REQUISITION_CREATED: { label: "Requisition Opened",    icon: FileText,    color: "text-blue-600",  bg: "bg-blue-50 border-blue-200" },
  RESUME_SCORED:       { label: "AI Scored Resume",       icon: Bot,         color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
  HUMAN_REVIEWED:      { label: "Human Review Decision",  icon: User,        color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  CERTIFICATION_SAVED: { label: "Certification Saved",    icon: Award,       color: "text-green-600", bg: "bg-green-50 border-green-200" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    timeZoneName: "short",
  });
}

function EntryCard({ entry }: { entry: AuditEntry }) {
  const meta = EVENT_META[entry.eventType] ?? {
    label: entry.eventType, icon: FileText,
    color: "text-slate-600", bg: "bg-slate-50 border-slate-200",
  };
  const Icon = meta.icon;

  let score: Record<string, unknown> | null = null;
  try { if (entry.scoreSnapshot) score = JSON.parse(entry.scoreSnapshot); } catch {}

  return (
    <div className={`rounded-xl border p-4 ${meta.bg}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.bg}`}>
          <Icon className={`w-4 h-4 ${meta.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className={`text-sm font-semibold ${meta.color}`}>{meta.label}</p>
            <p className="text-[10px] text-muted-foreground font-mono">{formatDate(entry.createdAt)}</p>
          </div>

          {/* Actor */}
          <p className="text-xs text-muted-foreground mt-0.5">
            {entry.actorEmail === "system" ? "HumaniCore AI" : entry.actorEmail}
            {entry.actorRole !== "SYSTEM" && ` · ${entry.actorRole}`}
          </p>

          {/* Notes */}
          {entry.notes && (
            <p className="text-xs text-foreground/80 mt-1.5 leading-relaxed">{entry.notes}</p>
          )}

          {/* Score details */}
          {score && (
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px]">
              <span className="text-muted-foreground">Model</span>
              <span className="font-mono">{entry.modelVersion}</span>
              <span className="text-muted-foreground">Prompt version</span>
              <span className="font-mono">{entry.promptVersion}</span>
              <span className="text-muted-foreground">Overall score</span>
              <span className="font-semibold">{(score as any).overallScore}/100</span>
              <span className="text-muted-foreground">Recommendation</span>
              <span className="font-semibold">{(score as any).recommendation}</span>
              <span className="text-muted-foreground">Resume hash</span>
              <span className="font-mono text-[10px]">{entry.resumeHash}</span>
            </div>
          )}

          {/* Human decision */}
          {entry.decision && (
            <div className="mt-2 flex items-center gap-1.5">
              {entry.decision === "Approved"
                ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                : <XCircle className="w-4 h-4 text-red-500" />}
              <span className={`text-sm font-semibold ${entry.decision === "Approved" ? "text-green-700" : "text-red-700"}`}>
                {entry.decision}
              </span>
            </div>
          )}

          {/* Certification result */}
          {entry.certScore != null && (
            <div className="mt-2 flex items-center gap-2">
              {entry.certPassed
                ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                : <XCircle className="w-4 h-4 text-red-500" />}
              <span className="text-xs font-semibold">
                {entry.certPassed ? "Passed" : "Failed"} · {entry.certScore}% compliance
              </span>
            </div>
          )}

          {/* Checksum */}
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Lock className="w-2.5 h-2.5" />
            <span className="font-mono truncate">{entry.checksum.slice(0, 32)}…</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: trail, isLoading } = useSWR<AuditEntry[]>(
    `/api/screening/requisitions/${id}/audit`,
    fetcher
  );

  const events = trail ?? [];
  const scored = events.filter(e => e.eventType === "RESUME_SCORED").length;
  const reviewed = events.filter(e => e.eventType === "HUMAN_REVIEWED").length;
  const certified = events.filter(e => e.eventType === "CERTIFICATION_SAVED").length;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href="/screening" className="text-muted-foreground hover:text-primary">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold">Screening Audit Trail</h1>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-6 ml-7">
        Immutable chain of custody — every decision recorded with actor, timestamp, and checksum
      </p>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Events", value: events.length },
          { label: "Resumes Scored", value: scored },
          { label: "Human Reviews", value: reviewed },
          { label: "Certifications", value: certified },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-3 text-center">
            <p className="text-xl font-bold">{value}</p>
            <p className="text-[10px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Tamper-evident notice */}
      <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl mb-6">
        <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 leading-relaxed">
          Each entry includes a SHA-256 checksum of its material fields.
          Any post-hoc modification to a record will produce a checksum mismatch,
          providing evidence of tampering. This trail is append-only.
        </p>
      </div>

      {/* Timeline */}
      {isLoading && <p className="text-sm text-muted-foreground text-center py-12">Loading audit trail…</p>}
      {!isLoading && events.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">No audit entries yet for this requisition.</p>
      )}

      <div className="space-y-3">
        {events.map((entry) => <EntryCard key={entry.id} entry={entry} />)}
      </div>

      {/* Legal footer */}
      {events.length > 0 && (
        <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-400 text-center">
          HumaniCore AI · Screening Audit Trail · {events.length} entries · Generated {new Date().toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
