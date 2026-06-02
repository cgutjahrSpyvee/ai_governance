/**
 * HumaniCore AI — Certification Engine (Phase 2)
 *
 * Computes fairness metrics across all screening results for a requisition
 * and produces a pass/fail certification report.
 */

export interface MetricResult {
  label: string;
  description: string;
  value: number;
  threshold: number;
  unit: string;
  passed: boolean;
  detail: string;
}

export interface CertificationMetrics {
  requisitionId: string;
  requisitionTitle: string;
  totalScreened: number;
  passed: boolean;
  score: number;          // 0–100 overall compliance score
  metrics: MetricResult[];
  recommendationDist: Record<string, number>;
  biasAlertRate: number;
  reviewRequiredRate: number;
  reviewCompletionRate: number;
  adverseImpactRatio: number;
  scoreVariance: number;
  generatedAt: string;
}

interface RawResult {
  overallScore: number;
  recommendation: string;
  biasFlags: string;       // JSON string
  reviewRequired: boolean;
  humanDecision?: string | null;
  status: string;
}

// ── Math helpers ──────────────────────────────────────────────────────────────

function mean(arr: number[]) {
  return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
}

function stddev(arr: number[]) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
}

// ── Four-fifths proxy ─────────────────────────────────────────────────────────
// Without demographic data we use the distribution of scores between the
// top half vs bottom half of applicants as an adverse-impact proxy.
// A ratio ≥ 0.80 is compliant with the four-fifths rule.

function adverseImpactProxy(scores: number[]): number {
  if (scores.length < 4) return 1.0; // not enough data
  const sorted = [...scores].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const lower = sorted.slice(0, mid);
  const upper = sorted.slice(mid);
  const lowerPass = lower.filter((s) => s >= 65).length / lower.length;
  const upperPass = upper.filter((s) => s >= 65).length / upper.length;
  if (upperPass === 0) return 0;
  return Math.min(1, lowerPass / upperPass);
}

// ── Main computation ──────────────────────────────────────────────────────────

export function computeCertification(
  results: RawResult[],
  requisitionId: string,
  requisitionTitle: string
): CertificationMetrics {
  const n = results.length;
  const generatedAt = new Date().toISOString();

  if (n === 0) {
    return {
      requisitionId,
      requisitionTitle,
      totalScreened: 0,
      passed: false,
      score: 0,
      metrics: [],
      recommendationDist: {},
      biasAlertRate: 0,
      reviewRequiredRate: 0,
      reviewCompletionRate: 0,
      adverseImpactRatio: 1,
      scoreVariance: 0,
      generatedAt,
    };
  }

  const scores = results.map((r) => r.overallScore);
  const biasAlertCount = results.filter((r) => {
    try { return (JSON.parse(r.biasFlags || "[]") as string[]).length > 0; } catch { return false; }
  }).length;
  const reviewRequired = results.filter((r) => r.reviewRequired);
  const reviewDecided = reviewRequired.filter((r) => r.humanDecision);

  const biasAlertRate = biasAlertCount / n;
  const reviewRequiredRate = reviewRequired.length / n;
  const reviewCompletionRate = reviewRequired.length > 0
    ? reviewDecided.length / reviewRequired.length
    : 1.0;
  const variance = stddev(scores);
  const airProxy = adverseImpactProxy(scores);

  const recommendationDist: Record<string, number> = {};
  for (const r of results) {
    recommendationDist[r.recommendation] = (recommendationDist[r.recommendation] ?? 0) + 1;
  }

  // ── Five fairness metrics ──────────────────────────────────────────────────

  const metrics: MetricResult[] = [
    {
      label: "Bias Alert Rate",
      description: "Share of resumes that triggered at least one bias flag",
      value: +(biasAlertRate * 100).toFixed(1),
      threshold: 15,
      unit: "%",
      passed: biasAlertRate <= 0.15,
      detail: `${biasAlertCount} of ${n} resumes flagged for potential demographic signals`,
    },
    {
      label: "Four-Fifths Rule (Proxy)",
      description: "Adverse impact ratio — lower-scoring group pass rate ÷ higher-scoring group pass rate. ≥ 0.80 is compliant.",
      value: +airProxy.toFixed(2),
      threshold: 0.80,
      unit: "",
      passed: airProxy >= 0.80,
      detail: n < 4
        ? "Not enough data (minimum 4 resumes required)"
        : `Score-based adverse impact ratio: ${(airProxy * 100).toFixed(0)}% (threshold: 80%)`,
    },
    {
      label: "Human Review Completion",
      description: "% of flagged candidates that received a human decision",
      value: +(reviewCompletionRate * 100).toFixed(1),
      threshold: 80,
      unit: "%",
      passed: reviewRequired.length === 0 || reviewCompletionRate >= 0.80,
      detail: reviewRequired.length === 0
        ? "No candidates required review"
        : `${reviewDecided.length} of ${reviewRequired.length} flagged candidates reviewed`,
    },
    {
      label: "Score Consistency",
      description: "Standard deviation of overall scores. Lower = more consistent evaluation.",
      value: +variance.toFixed(1),
      threshold: 28,
      unit: "pts",
      passed: variance <= 28,
      detail: `Score std dev: ${variance.toFixed(1)} pts across ${n} candidates (threshold: ≤ 28)`,
    },
    {
      label: "Recommendation Balance",
      description: "No single recommendation category should dominate (max 75% of outcomes)",
      value: +(Math.max(...Object.values(recommendationDist)) / n * 100).toFixed(1),
      threshold: 75,
      unit: "%",
      passed: Math.max(...Object.values(recommendationDist)) / n <= 0.75,
      detail: `Most frequent outcome: ${Object.entries(recommendationDist).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A"} at ${(Math.max(...Object.values(recommendationDist)) / n * 100).toFixed(0)}%`,
    },
  ];

  const passedCount = metrics.filter((m) => m.passed).length;
  const passed = passedCount === metrics.length;
  const score = Math.round((passedCount / metrics.length) * 100);

  return {
    requisitionId,
    requisitionTitle,
    totalScreened: n,
    passed,
    score,
    metrics,
    recommendationDist,
    biasAlertRate,
    reviewRequiredRate,
    reviewCompletionRate,
    adverseImpactRatio: airProxy,
    scoreVariance: variance,
    generatedAt,
  };
}
