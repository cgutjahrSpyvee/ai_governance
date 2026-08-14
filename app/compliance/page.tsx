"use client";

import useSWR from "swr";
import { useRegulations } from "@/lib/api-client";
import { PageLoading, PageError } from "@/components/ui/loading";
import DemoDataBanner from "@/components/layout/demo-data-banner";
import { SHOW_DEMO_DATA } from "@/lib/demo-mode";
import { getStatusColor, formatDate, vocab } from "@/lib/utils";
import { isProvisional } from "@/lib/engine/client";
import type { RequirementsPayload } from "@/app/api/engine/requirements/route";
import { Calendar, Clock, CheckCircle2, FileText, BarChart3, Radio, AlertCircle } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Progress-bar colors cycle through the brand palette per regulation row.
const BAR_COLORS = ["#1e2761", "#028090", "#02c39a"];

/** Marks a section whose content is resolved live from the governance engine. */
function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border text-[#0a7a49] bg-[#d7f2e4] border-[#a9e1c6]">
      <Radio className="w-2.5 h-2.5" /> Live from engine
    </span>
  );
}

export default function CompliancePage() {
  const { data: regulations, isLoading, error } = useRegulations();
  const { data: reqPayload } = useSWR<RequirementsPayload>("/api/engine/requirements", fetcher);

  if (isLoading) return <PageLoading />;
  if (error) return <PageError message={error.message} />;
  if (!regulations) return <PageError />;

  const req = reqPayload?.requirements ?? null;
  const footprint = reqPayload?.footprint;
  const compliant = regulations.filter((r) => r.status === "Compliant").length;
  const partial = regulations.filter((r) => r.status === "Partial").length;
  const avgCompliance = Math.round(
    regulations.reduce((s, r) => s + r.compliance, 0) / regulations.length,
  );
  const upcomingDeadlines = [...regulations]
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">HR Regulatory Compliance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Governing requirements resolved live from the engine · completion tracking is internal
        </p>
      </div>

      {/* ── LIVE: governing requirements ─────────────────────────────── */}
      <div className="bg-white rounded-xl border border-border p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
          <h3 className="text-sm font-semibold text-foreground">Governing Requirements</h3>
          <LiveBadge />
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Resolved for footprint{" "}
          <span className="font-medium text-foreground">
            {footprint?.us_states.join(", ") || "—"}
            {footprint?.countries.length ? `, ${footprint.countries.join(", ")}` : ""}
          </span>{" "}
          · category {footprint?.category.replace(/_/g, " ")}
        </p>

        {reqPayload?.engineError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600">
              <span className="font-medium">Requirements unavailable.</span>{" "}
              {reqPayload.engineError}
            </p>
          </div>
        )}

        {req && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
              {[
                ["Impact ratio threshold", `${req.governing_air_operator} ${req.governing_air_threshold.toFixed(2)}`],
                ["Candidate notice", req.candidate_notice_days ? `${req.candidate_notice_days} days` : "—"],
                ["Human oversight", req.human_oversight_required ? "Required" : "Not required"],
                ["Audit frequency", req.min_audit_frequency_days ? `${req.min_audit_frequency_days} days` : "—"],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{k}</p>
                  <p className="font-medium mt-0.5">{v}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-border pt-3">
              {req.governing_air_rationale}
            </p>
          </>
        )}
      </div>

      {/* ── LIVE: applicable frameworks ──────────────────────────────── */}
      {req && (
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Applicable Frameworks ({req.applicable_frameworks.length})
            </h3>
            <LiveBadge />
          </div>
          <div className="space-y-3">
            {req.applicable_frameworks.map((f) => (
              <div
                key={f.rulepack_id}
                className="p-3 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{f.framework_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {f.jurisdiction}
                      {f.effective_date ? ` · effective ${f.effective_date}` : ""}
                      {f.version ? ` · v${f.version}` : ""}
                    </p>
                  </div>
                  {isProvisional(f) && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded border text-[#8a620a] bg-[#fbeecd] border-[#eed18a] shrink-0">
                      Provisional
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-mono mt-1.5 break-words">
                  {f.statute_citation}
                </p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
            Frameworks marked provisional — including any carrying a CLO CONFIRM marker — are surfaced
            as diagnostic context pending counsel confirmation, not as settled law.
          </p>
        </div>
      )}

      {/* ── LIVE: protected classes + feature review flags ───────────── */}
      {req && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="text-sm font-semibold text-foreground">Protected Classes</h3>
              <LiveBadge />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {req.protected_classes.map((c) => (
                <span
                  key={c.code}
                  className="text-[11px] px-2 py-0.5 rounded border text-slate-600 bg-slate-100 border-slate-200"
                >
                  {c.label}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                Feature Review Flags ({req.feature_prohibitions.length})
              </h3>
              <LiveBadge />
            </div>
            <div className="space-y-1.5">
              {req.feature_prohibitions.map((p) => (
                <div key={p.feature_pattern} className="flex items-start gap-2">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${
                      p.prohibition_type === "prohibited"
                        ? "text-[#ae3c24] bg-[#f9e4de] border-[#efc5b8]"
                        : "text-[#8a620a] bg-[#fbeecd] border-[#eed18a]"
                    }`}
                  >
                    {p.prohibition_type?.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs font-mono text-foreground">{p.feature_pattern}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {SHOW_DEMO_DATA && (
        <>
        {/* ── INTERNAL: completion tracking (not engine-sourced) ───────── */}
        <div className="pt-2">
          <h2 className="text-sm font-semibold text-foreground mb-3">Internal Completion Tracking</h2>
          <DemoDataBanner detail="Requirement completion percentages are internal programme tracking seeded for demonstration. They are not produced by the governance engine and are not audit findings." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
            <FileText className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-muted-foreground">Regulations Tracked</p>
              <p className="text-xl font-bold">{regulations.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#0a7a49]" />
            <div>
              <p className="text-xs text-muted-foreground">Compliant</p>
              <p className="text-xl font-bold text-[#0a7a49]">{compliant}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#8a620a]" />
            <div>
              <p className="text-xs text-muted-foreground">Review in Progress</p>
              <p className="text-xl font-bold text-[#8a620a]">{partial}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-muted-foreground">Avg Completion</p>
              <p className="text-xl font-bold">{avgCompliance}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Completion by Regulation</h3>
          <div className="space-y-4">
            {regulations.map((reg, i) => {
              const openReqs = Math.max(0, reg.requirements - reg.completed);
              return (
                <div
                  key={reg.shortName}
                  className="p-4 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium">{reg.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {reg.category} &middot; Deadline:{" "}
                        {formatDate(new Date(reg.deadline).toISOString())}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(vocab(reg.status))}`}
                    >
                      {vocab(reg.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${reg.compliance}%`,
                          backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-12 text-right">{reg.compliance}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {reg.completed} of {reg.requirements} requirements completed
                    {openReqs > 0 && ` · ${openReqs} open requirement${openReqs === 1 ? "" : "s"}`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Upcoming Deadlines
          </h3>
          <div className="space-y-3">
            {upcomingDeadlines.map((reg) => {
              const days = Math.ceil(
                (new Date(reg.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
              );
              return (
                <div
                  key={reg.shortName}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20"
                >
                  <div>
                    <p className="text-sm font-medium">{reg.shortName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(new Date(reg.deadline).toISOString())}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded border ${
                      days <= 30
                        ? "text-[#ae3c24] bg-[#f9e4de] border-[#efc5b8]"
                        : days <= 90
                          ? "text-[#8a620a] bg-[#fbeecd] border-[#eed18a]"
                          : "text-[#0a7a49] bg-[#d7f2e4] border-[#a9e1c6]"
                    }`}
                  >
                    {days} days
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        </>
      )}

    </div>
  );
}
