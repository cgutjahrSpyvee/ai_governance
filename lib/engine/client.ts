// ------------------------------------------------------------------
// HumaniCore governance engine — server-side HTTP client.
//
// SERVER ONLY. ENGINE_API_KEY must never reach the browser, so this
// module is imported exclusively from route handlers under app/api/**.
// Never expose the key via NEXT_PUBLIC_ or import this from a
// "use client" component.
//
// The engine is demo-grade: single-tenant, synchronous, file-backed.
// ------------------------------------------------------------------

const BASE_URL = process.env.ENGINE_BASE_URL ?? "";
const API_KEY = process.env.ENGINE_API_KEY ?? "";

/** True when the engine is configured; lets callers fall back to seeded data. */
export function engineConfigured(): boolean {
  return Boolean(BASE_URL && API_KEY);
}

export class EngineError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "EngineError";
  }
}

interface EngineRequestInit {
  method?: "GET" | "POST";
  body?: unknown;
  /** Abort after this many ms so a dead tunnel can't hang a page render. */
  timeoutMs?: number;
  /** Seconds to cache the response; 0 disables caching. */
  revalidate?: number;
}

/**
 * One-line server-side trace of every engine call. Never logs the API key or
 * response bodies — only method, path, outcome and timing. These calls are
 * server-to-server, so this is the only place they are observable (they do
 * not appear in the browser network log by design).
 */
function traceEngineCall(method: string, path: string, outcome: string, ms: number) {
  console.log(`[engine] ${method} ${path} → ${outcome} in ${ms}ms`);
}

async function engineFetch<T>(path: string, init: EngineRequestInit = {}): Promise<T> {
  if (!engineConfigured()) {
    throw new EngineError("Engine is not configured (ENGINE_BASE_URL / ENGINE_API_KEY)", 503);
  }

  const { method = "GET", body, timeoutMs = 20_000, revalidate = 0 } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        "X-API-Key": API_KEY,
        // Harmless off ngrok; required on it to avoid the HTML interstitial.
        "ngrok-skip-browser-warning": "true",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      ...(revalidate > 0 ? { next: { revalidate } } : { cache: "no-store" as RequestCache }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      traceEngineCall(method, path, `${res.status} ${res.statusText}`, Date.now() - startedAt);
      throw new EngineError(
        `Engine ${method} ${path} failed (${res.status})${text ? `: ${text.slice(0, 200)}` : ""}`,
        res.status,
      );
    }
    const json = (await res.json()) as T;
    traceEngineCall(method, path, `${res.status} OK`, Date.now() - startedAt);
    return json;
  } catch (e) {
    if (e instanceof EngineError) throw e;
    if (e instanceof Error && e.name === "AbortError") {
      traceEngineCall(method, path, "TIMEOUT", Date.now() - startedAt);
      throw new EngineError(`Engine ${method} ${path} timed out after ${timeoutMs}ms`, 504);
    }
    traceEngineCall(method, path, "UNREACHABLE", Date.now() - startedAt);
    throw new EngineError(
      `Engine ${method} ${path} unreachable: ${e instanceof Error ? e.message : String(e)}`,
      502,
    );
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------------------------------------------ *
 * Types — shaped from the live demo API responses.
 * ------------------------------------------------------------------ */

export interface GroupStat {
  count: number;
  selection_rate: number;
}

export interface GroupSummary {
  reference_group: string;
  max_selection_rate: number;
  min_selection_rate: number;
  disparity: number;
  impact_ratios: Record<string, number>;
}

/** Per attribute: one entry per group plus a `_summary`. */
export type AttributeMetrics = Record<string, GroupStat | GroupSummary> & {
  _summary: GroupSummary;
};

export interface AuditReport {
  run_id: string;
  engine_version: string;
  methodology: string;
  functional_category: string;
  vendor_footprint: string[];
  outcome_column: string;
  protected_attributes: string[];
  total_records: number;
  model_features: string[];
  agep_range?: { min: number; max: number };
  overall_selection_rate: number;
  model_accuracy: number;
  model_auc: number;
  certification_decision: string;
  count_critical: number;
  count_finding: number;
  count_observation: number;
  count_compliant: number;
  group_metrics: Record<string, AttributeMetrics>;
}

export interface ReportListing {
  reports: { run_id: string; file: string }[];
}

export interface ApplicableFramework {
  statute_citation?: string;
  effective_date?: string;
  version?: string;
  status?: string;
  provisional?: boolean;
  [k: string]: unknown;
}

export interface FeatureProhibition {
  feature_pattern: string;
  /** proxy_concern | flag_required | prohibited */
  type?: string;
  legal_basis?: string;
  [k: string]: unknown;
}

export interface ResolvedRequirements {
  footprint: Record<string, unknown>;
  governing_air_threshold: number;
  governing_air_operator: string;
  governing_air_rulepack: string;
  governing_air_rationale: string;
  candidate_notice_days?: number;
  candidate_notice_rulepack?: string;
  human_oversight_required?: boolean;
  min_audit_frequency_days?: number;
  applicable_frameworks: ApplicableFramework[];
  protected_classes: unknown[];
  feature_prohibitions: FeatureProhibition[];
}

/* ------------------------------------------------------------------ *
 * Endpoint wrappers
 * ------------------------------------------------------------------ */

export function listReports() {
  return engineFetch<ReportListing>("/v1/reports", { revalidate: 60 });
}

export function getReport(runId: string) {
  return engineFetch<AuditReport>(`/v1/reports/${encodeURIComponent(runId)}`, { revalidate: 60 });
}

/** Resolve governing requirements for a deployment footprint. */
export function resolveRequirements(params: {
  us_states?: string[];
  countries?: string[];
  category?: string;
  affects_applicants?: boolean;
}) {
  const q = new URLSearchParams();
  if (params.us_states?.length) q.set("us_states", params.us_states.join(","));
  if (params.countries?.length) q.set("countries", params.countries.join(","));
  if (params.category) q.set("category", params.category);
  if (params.affects_applicants !== undefined) {
    q.set("affects_applicants", String(params.affects_applicants));
  }
  return engineFetch<ResolvedRequirements>(`/v1/requirements/resolve?${q}`, { revalidate: 300 });
}
