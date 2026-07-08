// ------------------------------------------------------------------
// Authoritative rule pack — UX Redesign Directive v1.0 §7.5.
//
// This file is the single source of truth for AI-related employment
// regulations. Regulation entries and effective dates come from here,
// not from hardcoded front-end data. The seed derives the DB rows from
// this pack, and the Compliance screen renders (and annotates) from it.
//
// Canon includes Colorado SB 26-189 (effective January 1, 2027) and the
// EU AI Act Annex III timing, where both the original August 2, 2026 date
// and the deferred December 2, 2027 date appear pending Official Journal
// publication.
// ------------------------------------------------------------------

export interface RulePackEntry {
  name: string;
  shortName: string;
  compliance: number;
  status: "Compliant" | "Partial" | "Non-Compliant";
  /** ISO date used for sorting / upcoming-deadline math. */
  deadline: string;
  requirements: number;
  completed: number;
  category: string;
  /** Human-readable effective-date string shown on the Compliance screen. */
  effectiveDate: string;
  /** Optional rule-pack annotation (e.g. deferred-date / pending publication). */
  note?: string;
}

export const RULE_PACK: RulePackEntry[] = [
  { name: "SOC 2 Type II", shortName: "SOC 2", compliance: 90, status: "Compliant", deadline: "2026-04-29", requirements: 20, completed: 18, category: "Security", effectiveDate: "Apr 29, 2026" },
  { name: "GDPR Article 22", shortName: "GDPR", compliance: 95, status: "Compliant", deadline: "2026-05-24", requirements: 12, completed: 11, category: "Privacy", effectiveDate: "May 24, 2026" },
  { name: "EEOC AI Guidance", shortName: "EEOC", compliance: 88, status: "Partial", deadline: "2026-06-14", requirements: 18, completed: 16, category: "Employment", effectiveDate: "Jun 14, 2026" },
  { name: "NYC Local Law 144", shortName: "LL144", compliance: 92, status: "Compliant", deadline: "2026-07-05", requirements: 13, completed: 12, category: "Employment", effectiveDate: "Jul 5, 2026" },
  {
    name: "Colorado SB 26-189", shortName: "CO SB26-189", compliance: 40, status: "Partial",
    deadline: "2027-01-01", requirements: 20, completed: 8, category: "Employment",
    effectiveDate: "Effective Jan 1, 2027",
    note: "Rule pack canon · effective date pending implementation window.",
  },
  {
    name: "EU AI Act (Annex III)", shortName: "EU AI Act", compliance: 55, status: "Partial",
    deadline: "2026-08-02", requirements: 20, completed: 11, category: "AI Safety",
    effectiveDate: "Effective Aug 2, 2026 — deferred Dec 2, 2027",
    note: "Both effective dates shown pending Official Journal publication.",
  },
  { name: "ISO 42001 AI Management", shortName: "ISO 42001", compliance: 90, status: "Compliant", deadline: "2026-09-30", requirements: 42, completed: 38, category: "AI Safety", effectiveDate: "Sep 30, 2026" },
  { name: "NIST AI RMF", shortName: "NIST RMF", compliance: 90, status: "Compliant", deadline: "2026-10-01", requirements: 30, completed: 27, category: "AI Safety", effectiveDate: "Oct 1, 2026" },
];

/** Lookup for presentation-layer enrichment (effective date + note) by shortName. */
export const rulePackByShortName: Record<string, RulePackEntry> = Object.fromEntries(
  RULE_PACK.map((r) => [r.shortName, r]),
);
