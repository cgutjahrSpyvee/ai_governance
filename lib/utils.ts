import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatPercent(num: number): string {
  return `${num.toFixed(1)}%`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ------------------------------------------------------------------ *
 * Brand palette — UX Redesign Directive v1.0 (2026-07-06), Section 5
 * Navy / teal / mint / slate on #F8FAFC. No red/amber/green verdict
 * colors anywhere in the interface.
 * ------------------------------------------------------------------ */
export const BRAND = {
  navy: "#1e2761",
  teal: "#028090",
  mint: "#02c39a",
  slate: "#64748b",
  slateLight: "#94a3b8",
  slateFaint: "#cbd5e1",
} as const;

/* Chart series colors for Review Priority Tiers — muted terracotta / gold /
 * sage (reference mockup). Activity density, not danger. */
export const PRIORITY_CHART = {
  p1: "#e29a83",
  p2: "#e6be63",
  standard: "#6fc79c",
} as const;

/* Demographic series keep distinct, legible colors per Section 5 —
 * the goal is removing verdict colors, not removing information. */
// Order: [Male, Female, Non-Binary] — navy / teal / mint per reference mockup.
export const GENDER_COLORS = ["#1e2761", "#028090", "#02c39a"];
// Order: [White, Black, Hispanic, Asian, Other] — navy / mint / steel-blue / teal / slate.
export const ETHNICITY_COLORS = ["#1e2761", "#02c39a", "#5b7db1", "#028090", "#94a3b8"];

/* Reusable chip class strings — muted earth-tone palette from the reference
 * mockup (kept as static literals so Tailwind's scanner can see them). */
const CHIP_TERRACOTTA = "text-[#ae3c24] bg-[#f9e4de] border-[#efc5b8]"; // Priority 1 / Review Required / Open
const CHIP_GOLD = "text-[#8a620a] bg-[#fbeecd] border-[#eed18a]";       // Priority 2 / in-progress
const CHIP_SAGE = "text-[#0a7a49] bg-[#d7f2e4] border-[#a9e1c6]";       // within target / compliant
const CHIP_SLATE = "text-slate-600 bg-slate-100 border-slate-200";     // standard / neutral
const CHIP_FAINT = "text-slate-500 bg-slate-50 border-slate-200";

/* ------------------------------------------------------------------ *
 * Section 4 — Global Vocabulary Standard.
 * The interface states facts and measurements; it never asserts a
 * legal conclusion. Apply everywhere a label appears.
 * ------------------------------------------------------------------ */
const VOCAB: Record<string, string> = {
  Fail: "Review Required",
  Failures: "Open Reviews",
  Warnings: "Pending Calibrations",
  Warning: "Pending Calibration",
  Pass: "Within Target",
  Passing: "Within Target",
  "Adverse Impact": "Impact Ratio Below Threshold",
  "Bias Detected": "Review for Bias Implications",
  "Non-Compliant": "Open Requirements",
  Partial: "Review in Progress",
  "Compliance Violation": "Requirement Gap Under Review",
  Critical: "Priority 1",
  High: "Priority 1",
  Medium: "Priority 2",
  Low: "Standard Review Queue",
};

/** Translate a raw label to its neutral, non-conclusory equivalent. */
export function vocab(label: string): string {
  return VOCAB[label] ?? label;
}

/** Map a risk tier / severity to its Priority label (Section 4). */
export function getPriorityLabel(level: string): string {
  switch (level.toLowerCase()) {
    case "critical":
    case "high":
      return "Priority 1";
    case "medium":
      return "Priority 2";
    case "low":
      return "Standard Review Queue";
    default:
      return level;
  }
}

/** Chip styling for a Priority tier — muted terracotta / gold / sage. */
export function getPriorityColor(level: string): string {
  switch (level.toLowerCase()) {
    case "critical":
    case "high":
    case "priority 1":
      return CHIP_TERRACOTTA;
    case "medium":
    case "priority 2":
      return CHIP_GOLD;
    case "low":
    case "standard review queue":
      return CHIP_SAGE;
    default:
      return CHIP_SLATE;
  }
}

/** Backward-compatible alias — risk framing is now priority framing. */
export const getRiskColor = getPriorityColor;

/** Chip styling for a workflow/operational status. */
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    // Completed / within target / operational-good — sage
    case "active":
    case "production":
    case "resolved":
    case "compliant":
    case "within target":
    case "within reference":
      return CHIP_SAGE;
    // Work-in-progress — gold
    case "under review":
    case "investigating":
    case "in progress":
    case "review in progress":
    case "partial":
    case "pending calibration":
    case "staging":
      return CHIP_GOLD;
    // Terminal / inactive
    case "retired":
    case "closed":
      return CHIP_FAINT;
    // Open items / requires attention — terracotta
    case "non-compliant":
    case "open requirements":
    case "open":
    case "review required":
      return CHIP_TERRACOTTA;
    default:
      return CHIP_SLATE;
  }
}

/* ------------------------------------------------------------------ *
 * Section 6 — Statistical Validity Guardrails.
 * Where a demographic slice falls below the reporting threshold the
 * front end suppresses the displayed rate. The underlying data
 * remains in the audit record.
 * ------------------------------------------------------------------ */
export const REPORTING_THRESHOLD = 30;

/** Focal-group share of the pool below which an impact ratio is not a
 * reliable estimate (reference-group sizing correction, Section 6).
 * Configurable per rule pack. */
export const REPRESENTATION_FLOOR = 0.05;

/** True when a slice count is too small to report a meaningful rate. */
export function belowThreshold(n: number, threshold = REPORTING_THRESHOLD): boolean {
  return n < threshold;
}

/** True when a focal group is below the reporting threshold — either in
 * absolute count (n < 30) or in share of the pool (reference-group sizing).
 * Either condition makes the displayed impact ratio statistically unreliable. */
export function sliceSuppressed(count: number, total: number): boolean {
  return belowThreshold(count) || (total > 0 && count / total < REPRESENTATION_FLOOR);
}

export const SUPPRESSED_LABEL = "n below reporting threshold";

/* ------------------------------------------------------------------ *
 * Section 3 — Audit Log Context column.
 * A plain-language explanation generated at the presentation layer.
 * It never replaces the verbatim source event string.
 * ------------------------------------------------------------------ */
export function auditContext(event: string, category: string): string {
  const e = event.toLowerCase();
  if (e.includes("threshold") || e.includes("impact ratio") || e.includes("four-fifths"))
    return "An impact ratio crossed its configured threshold and opened a review.";
  if (e.includes("override"))
    return "A manager applied judgment on top of the model output.";
  if (e.includes("bias"))
    return "A metric was flagged for review of possible bias implications.";
  if (e.includes("audit") || e.includes("certif"))
    return "A governance audit or certification step was recorded.";
  if (e.includes("model") && (e.includes("deploy") || e.includes("promot")))
    return "A model changed deployment state.";
  if (e.includes("access") || e.includes("login") || e.includes("permission"))
    return "An access or permission event was logged.";
  if (e.includes("calibrat"))
    return "A calibration step is pending or was completed.";
  if (e.includes("resolve") || e.includes("closed"))
    return "A case moved to a resolved state.";
  return `Operational event recorded under ${category}.`;
}
