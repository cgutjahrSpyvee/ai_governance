// ============================================================
// HR AI Governance Dashboard — Mock Data
// ============================================================

// --- HR AI Models ---
export interface HRModel {
  id: string;
  name: string;
  function: "Hiring" | "Performance" | "Compensation" | "Retention" | "Workforce Planning";
  riskTier: "High" | "Medium" | "Low";
  vendor: string;
  owner: string;
  status: "Production" | "Staging" | "Under Review" | "Retired";
  lastAudit: string;
  fairnessScore: number;
  candidatesProcessed?: number;
  description: string;
}

export const hrModels: HRModel[] = [
  { id: "M-001", name: "ResumeScreen AI", function: "Hiring", riskTier: "High", vendor: "HireVue", owner: "Sarah Chen", status: "Production", lastAudit: "2026-02-15", fairnessScore: 0.82, candidatesProcessed: 45200, description: "Automated resume screening and ranking" },
  { id: "M-002", name: "InterviewBot Pro", function: "Hiring", riskTier: "High", vendor: "Paradox AI", owner: "Sarah Chen", status: "Production", lastAudit: "2026-01-20", fairnessScore: 0.78, candidatesProcessed: 12800, description: "AI-assisted video interview scoring" },
  { id: "M-003", name: "PerfScore 360", function: "Performance", riskTier: "Medium", vendor: "Lattice AI", owner: "James Park", status: "Production", lastAudit: "2026-03-01", fairnessScore: 0.91, description: "AI-assisted performance review scoring" },
  { id: "M-004", name: "CompBench Analyzer", function: "Compensation", riskTier: "High", vendor: "Payscale AI", owner: "Maria Torres", status: "Production", lastAudit: "2026-02-28", fairnessScore: 0.87, description: "Compensation benchmarking and recommendations" },
  { id: "M-005", name: "AttritionPredict", function: "Retention", riskTier: "Medium", vendor: "Internal", owner: "David Kim", status: "Production", lastAudit: "2026-01-10", fairnessScore: 0.89, description: "Employee attrition risk prediction" },
  { id: "M-006", name: "SkillMatch Engine", function: "Hiring", riskTier: "Medium", vendor: "Eightfold AI", owner: "Sarah Chen", status: "Production", lastAudit: "2026-03-10", fairnessScore: 0.93, candidatesProcessed: 28500, description: "Skills-based candidate matching" },
  { id: "M-007", name: "Sentiment Pulse", function: "Performance", riskTier: "Low", vendor: "Qualtrics AI", owner: "James Park", status: "Production", lastAudit: "2026-02-20", fairnessScore: 0.95, description: "Employee sentiment analysis from surveys" },
  { id: "M-008", name: "PayEquity Scanner", function: "Compensation", riskTier: "High", vendor: "Syndio", owner: "Maria Torres", status: "Under Review", lastAudit: "2026-03-15", fairnessScore: 0.84, description: "Pay equity analysis across demographics" },
  { id: "M-009", name: "WorkforcePlanner AI", function: "Workforce Planning", riskTier: "Medium", vendor: "Visier", owner: "Lisa Wang", status: "Production", lastAudit: "2026-01-25", fairnessScore: 0.90, description: "Workforce demand forecasting" },
  { id: "M-010", name: "ChatRecruiter", function: "Hiring", riskTier: "Low", vendor: "Internal", owner: "Sarah Chen", status: "Staging", lastAudit: "2026-03-20", fairnessScore: 0.96, candidatesProcessed: 3200, description: "Conversational AI for candidate Q&A" },
  { id: "M-011", name: "PromotionPredict", function: "Performance", riskTier: "High", vendor: "Internal", owner: "James Park", status: "Under Review", lastAudit: "2026-03-05", fairnessScore: 0.76, description: "AI-driven promotion readiness scoring" },
  { id: "M-012", name: "BenefitsOptimizer", function: "Compensation", riskTier: "Low", vendor: "Benefitfocus AI", owner: "Maria Torres", status: "Production", lastAudit: "2026-02-10", fairnessScore: 0.94, description: "Benefits package recommendation engine" },
];

// --- Compliance Regulations ---
export interface Regulation {
  name: string;
  shortName: string;
  compliance: number;
  status: "Compliant" | "Partial" | "Non-Compliant";
  deadline: string;
  requirements: number;
  completed: number;
  category: string;
}

export const regulations: Regulation[] = [
  { name: "NYC Local Law 144", shortName: "LL144", compliance: 92, status: "Compliant", deadline: "2026-07-01", requirements: 24, completed: 22, category: "Employment" },
  { name: "EU AI Act — High-Risk HR", shortName: "EU AI Act", compliance: 78, status: "Partial", deadline: "2026-08-01", requirements: 38, completed: 30, category: "AI Safety" },
  { name: "EEOC AI Guidance", shortName: "EEOC", compliance: 88, status: "Compliant", deadline: "2026-06-15", requirements: 18, completed: 16, category: "Employment" },
  { name: "GDPR Article 22", shortName: "GDPR", compliance: 95, status: "Compliant", deadline: "2026-05-25", requirements: 12, completed: 11, category: "Privacy" },
  { name: "Illinois AI Video Interview Act", shortName: "IL AIVI", compliance: 100, status: "Compliant", deadline: "2026-12-31", requirements: 8, completed: 8, category: "Employment" },
  { name: "ISO 42001 AI Management", shortName: "ISO 42001", compliance: 65, status: "Partial", deadline: "2026-09-30", requirements: 42, completed: 27, category: "AI Safety" },
  { name: "NIST AI RMF", shortName: "NIST RMF", compliance: 72, status: "Partial", deadline: "2026-10-01", requirements: 30, completed: 22, category: "AI Safety" },
  { name: "SOC 2 Type II", shortName: "SOC 2", compliance: 90, status: "Compliant", deadline: "2026-04-30", requirements: 20, completed: 18, category: "Security" },
];

// --- Bias Metrics ---
export interface BiasMetric {
  model: string;
  metric: string;
  group: string;
  value: number;
  threshold: number;
  status: "Pass" | "Warning" | "Fail";
}

export const biasMetrics: BiasMetric[] = [
  { model: "ResumeScreen AI", metric: "Demographic Parity", group: "Gender", value: 0.92, threshold: 0.80, status: "Pass" },
  { model: "ResumeScreen AI", metric: "Demographic Parity", group: "Ethnicity", value: 0.81, threshold: 0.80, status: "Pass" },
  { model: "ResumeScreen AI", metric: "Disparate Impact", group: "Age (40+)", value: 0.74, threshold: 0.80, status: "Fail" },
  { model: "ResumeScreen AI", metric: "Equal Opportunity", group: "Gender", value: 0.88, threshold: 0.80, status: "Pass" },
  { model: "InterviewBot Pro", metric: "Demographic Parity", group: "Gender", value: 0.85, threshold: 0.80, status: "Pass" },
  { model: "InterviewBot Pro", metric: "Demographic Parity", group: "Ethnicity", value: 0.77, threshold: 0.80, status: "Fail" },
  { model: "InterviewBot Pro", metric: "Disparate Impact", group: "Disability", value: 0.83, threshold: 0.80, status: "Pass" },
  { model: "PerfScore 360", metric: "Demographic Parity", group: "Gender", value: 0.94, threshold: 0.80, status: "Pass" },
  { model: "PerfScore 360", metric: "Equal Opportunity", group: "Ethnicity", value: 0.91, threshold: 0.80, status: "Pass" },
  { model: "CompBench Analyzer", metric: "Disparate Impact", group: "Gender", value: 0.86, threshold: 0.80, status: "Pass" },
  { model: "CompBench Analyzer", metric: "Disparate Impact", group: "Ethnicity", value: 0.79, threshold: 0.80, status: "Warning" },
  { model: "PromotionPredict", metric: "Demographic Parity", group: "Gender", value: 0.71, threshold: 0.80, status: "Fail" },
  { model: "PromotionPredict", metric: "Demographic Parity", group: "Ethnicity", value: 0.68, threshold: 0.80, status: "Fail" },
  { model: "PromotionPredict", metric: "Equal Opportunity", group: "Age (40+)", value: 0.73, threshold: 0.80, status: "Fail" },
  { model: "PayEquity Scanner", metric: "Disparate Impact", group: "Gender", value: 0.88, threshold: 0.80, status: "Pass" },
  { model: "PayEquity Scanner", metric: "Disparate Impact", group: "Ethnicity", value: 0.82, threshold: 0.80, status: "Pass" },
];

// --- Hiring Funnel Data ---
export interface HiringFunnelStage {
  stage: string;
  male: number;
  female: number;
  nonBinary: number;
  white: number;
  black: number;
  hispanic: number;
  asian: number;
  other: number;
}

export const hiringFunnel: HiringFunnelStage[] = [
  { stage: "Applications", male: 12400, female: 10800, nonBinary: 800, white: 8500, black: 4200, hispanic: 3800, asian: 5200, other: 2300 },
  { stage: "AI Screening", male: 7200, female: 6100, nonBinary: 420, white: 5100, black: 2200, hispanic: 2100, asian: 3200, other: 1120 },
  { stage: "Phone Screen", male: 3600, female: 3100, nonBinary: 200, white: 2600, black: 1100, hispanic: 1050, asian: 1600, other: 550 },
  { stage: "Interview", male: 1800, female: 1600, nonBinary: 100, white: 1350, black: 550, hispanic: 520, asian: 800, other: 280 },
  { stage: "Offer", male: 620, female: 560, nonBinary: 35, white: 480, black: 190, hispanic: 175, asian: 280, other: 90 },
  { stage: "Hired", male: 520, female: 480, nonBinary: 30, white: 410, black: 160, hispanic: 150, asian: 235, other: 75 },
];

// --- Audit Logs ---
export interface AuditLog {
  id: string;
  timestamp: string;
  event: string;
  category: "Model Deployment" | "Config Change" | "Access Review" | "Policy Update" | "Screening Decision" | "Score Override" | "Model Retrain";
  user: string;
  severity: "Info" | "Warning" | "Critical";
  affectedCount: number;
  details: string;
}

export const auditLogs: AuditLog[] = [
  { id: "AL-001", timestamp: "2026-03-30T14:22:00Z", event: "ResumeScreen AI model retrained", category: "Model Retrain", user: "Sarah Chen", severity: "Warning", affectedCount: 0, details: "Bias correction applied to age demographic" },
  { id: "AL-002", timestamp: "2026-03-30T11:05:00Z", event: "PromotionPredict flagged for bias", category: "Screening Decision", user: "System", severity: "Critical", affectedCount: 342, details: "Gender parity below threshold for Q1 promotion cycle" },
  { id: "AL-003", timestamp: "2026-03-29T16:45:00Z", event: "CompBench model config updated", category: "Config Change", user: "Maria Torres", severity: "Info", affectedCount: 0, details: "Updated salary band references for 2026" },
  { id: "AL-004", timestamp: "2026-03-29T09:30:00Z", event: "Quarterly access review completed", category: "Access Review", user: "David Kim", severity: "Info", affectedCount: 15, details: "15 user permissions reviewed, 3 revoked" },
  { id: "AL-005", timestamp: "2026-03-28T15:12:00Z", event: "AI Ethics Policy v3.2 published", category: "Policy Update", user: "Lisa Wang", severity: "Info", affectedCount: 0, details: "Updated guidelines for AI use in performance reviews" },
  { id: "AL-006", timestamp: "2026-03-28T10:00:00Z", event: "InterviewBot Pro scoring override", category: "Score Override", user: "James Park", severity: "Warning", affectedCount: 23, details: "Manual override on 23 candidate scores after review" },
  { id: "AL-007", timestamp: "2026-03-27T13:40:00Z", event: "PayEquity Scanner deployed to staging", category: "Model Deployment", user: "Maria Torres", severity: "Info", affectedCount: 0, details: "New version with updated equity calculations" },
  { id: "AL-008", timestamp: "2026-03-27T08:15:00Z", event: "ChatRecruiter moved to staging", category: "Model Deployment", user: "Sarah Chen", severity: "Info", affectedCount: 0, details: "Internal chatbot for candidate FAQ" },
  { id: "AL-009", timestamp: "2026-03-26T17:00:00Z", event: "Bulk screening decision audit", category: "Screening Decision", user: "System", severity: "Warning", affectedCount: 1250, details: "Monthly audit of automated screening decisions" },
  { id: "AL-010", timestamp: "2026-03-26T11:30:00Z", event: "AttritionPredict accuracy review", category: "Access Review", user: "David Kim", severity: "Info", affectedCount: 0, details: "Model accuracy at 87.3%, above 85% threshold" },
  { id: "AL-011", timestamp: "2026-03-25T14:50:00Z", event: "SkillMatch Engine retrained", category: "Model Retrain", user: "Sarah Chen", severity: "Info", affectedCount: 0, details: "Added 150 new skill taxonomies" },
  { id: "AL-012", timestamp: "2026-03-25T09:00:00Z", event: "NYC LL144 audit report filed", category: "Policy Update", user: "Lisa Wang", severity: "Info", affectedCount: 0, details: "Annual bias audit submitted to NYC DCWP" },
];

// --- Incidents ---
export interface Incident {
  id: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "Investigating" | "Resolved" | "Closed";
  category: "Bias Detected" | "Compliance Violation" | "Data Breach" | "Model Failure" | "Employee Grievance";
  reportedDate: string;
  resolvedDate?: string;
  assignedTo: string;
  affectedModel: string;
  description: string;
}

export const incidents: Incident[] = [
  { id: "INC-001", title: "Age bias detected in resume screening", severity: "Critical", status: "Investigating", category: "Bias Detected", reportedDate: "2026-03-28", assignedTo: "Sarah Chen", affectedModel: "ResumeScreen AI", description: "Four-fifths rule violation for candidates over 40" },
  { id: "INC-002", title: "Gender disparity in promotion predictions", severity: "Critical", status: "Open", category: "Bias Detected", reportedDate: "2026-03-30", assignedTo: "James Park", affectedModel: "PromotionPredict", description: "Female employees scored 18% lower on average" },
  { id: "INC-003", title: "Employee grievance — unfair AI review score", severity: "High", status: "Investigating", category: "Employee Grievance", reportedDate: "2026-03-25", assignedTo: "James Park", affectedModel: "PerfScore 360", description: "Employee claims AI score didn't reflect actual work" },
  { id: "INC-004", title: "Ethnicity bias in interview scoring", severity: "High", status: "Resolved", category: "Bias Detected", reportedDate: "2026-03-10", resolvedDate: "2026-03-22", assignedTo: "Sarah Chen", affectedModel: "InterviewBot Pro", description: "Disparate impact ratio below 0.80 for Hispanic candidates" },
  { id: "INC-005", title: "EU AI Act documentation gap", severity: "Medium", status: "Open", category: "Compliance Violation", reportedDate: "2026-03-20", assignedTo: "Lisa Wang", affectedModel: "ResumeScreen AI", description: "Missing transparency documentation for high-risk system" },
  { id: "INC-006", title: "CompBench data pipeline failure", severity: "Medium", status: "Resolved", category: "Model Failure", reportedDate: "2026-03-15", resolvedDate: "2026-03-16", assignedTo: "Maria Torres", affectedModel: "CompBench Analyzer", description: "Stale salary data used for 2 days due to ETL failure" },
  { id: "INC-007", title: "Unauthorized model access attempt", severity: "High", status: "Closed", category: "Data Breach", reportedDate: "2026-03-05", resolvedDate: "2026-03-06", assignedTo: "David Kim", affectedModel: "PayEquity Scanner", description: "Non-HR employee attempted to access pay equity data" },
  { id: "INC-008", title: "NYC LL144 audit delay risk", severity: "Medium", status: "Resolved", category: "Compliance Violation", reportedDate: "2026-02-28", resolvedDate: "2026-03-25", assignedTo: "Lisa Wang", affectedModel: "ResumeScreen AI", description: "Annual bias audit filing nearly missed deadline" },
];

// --- Performance Review Data ---
export interface PerformanceData {
  department: string;
  avgAIScore: number;
  avgManagerScore: number;
  overrideRate: number;
  employeeCount: number;
  maleAvg: number;
  femaleAvg: number;
  calibrated: boolean;
}

export const performanceData: PerformanceData[] = [
  { department: "Engineering", avgAIScore: 3.8, avgManagerScore: 3.9, overrideRate: 12, employeeCount: 2400, maleAvg: 3.85, femaleAvg: 3.72, calibrated: true },
  { department: "Sales", avgAIScore: 3.6, avgManagerScore: 3.7, overrideRate: 18, employeeCount: 1800, maleAvg: 3.65, femaleAvg: 3.58, calibrated: true },
  { department: "Marketing", avgAIScore: 3.9, avgManagerScore: 3.8, overrideRate: 8, employeeCount: 950, maleAvg: 3.88, femaleAvg: 3.91, calibrated: true },
  { department: "Operations", avgAIScore: 3.5, avgManagerScore: 3.6, overrideRate: 22, employeeCount: 3200, maleAvg: 3.52, femaleAvg: 3.48, calibrated: false },
  { department: "Finance", avgAIScore: 3.7, avgManagerScore: 3.8, overrideRate: 10, employeeCount: 800, maleAvg: 3.74, femaleAvg: 3.68, calibrated: true },
  { department: "HR", avgAIScore: 4.0, avgManagerScore: 3.9, overrideRate: 5, employeeCount: 350, maleAvg: 3.95, femaleAvg: 4.02, calibrated: true },
  { department: "Legal", avgAIScore: 3.8, avgManagerScore: 3.9, overrideRate: 15, employeeCount: 280, maleAvg: 3.82, femaleAvg: 3.79, calibrated: true },
  { department: "R&D", avgAIScore: 3.9, avgManagerScore: 4.0, overrideRate: 7, employeeCount: 1600, maleAvg: 3.92, femaleAvg: 3.86, calibrated: true },
];

// --- Pay Equity Data ---
export interface PayEquityData {
  role: string;
  level: string;
  maleMedian: number;
  femaleMedian: number;
  gapPercent: number;
  whiteMedian: number;
  bipocMedian: number;
  ethnicGapPercent: number;
  aiRecommended: number;
  actual: number;
}

export const payEquityData: PayEquityData[] = [
  { role: "Software Engineer", level: "L3", maleMedian: 145000, femaleMedian: 140000, gapPercent: 3.4, whiteMedian: 144000, bipocMedian: 141000, ethnicGapPercent: 2.1, aiRecommended: 143500, actual: 142500 },
  { role: "Software Engineer", level: "L5", maleMedian: 210000, femaleMedian: 198000, gapPercent: 5.7, whiteMedian: 208000, bipocMedian: 200000, ethnicGapPercent: 3.8, aiRecommended: 205000, actual: 204000 },
  { role: "Product Manager", level: "L4", maleMedian: 175000, femaleMedian: 168000, gapPercent: 4.0, whiteMedian: 173000, bipocMedian: 170000, ethnicGapPercent: 1.7, aiRecommended: 172000, actual: 171500 },
  { role: "Sales Director", level: "L6", maleMedian: 245000, femaleMedian: 228000, gapPercent: 6.9, whiteMedian: 242000, bipocMedian: 231000, ethnicGapPercent: 4.5, aiRecommended: 238000, actual: 236500 },
  { role: "Data Scientist", level: "L4", maleMedian: 165000, femaleMedian: 160000, gapPercent: 3.0, whiteMedian: 164000, bipocMedian: 161000, ethnicGapPercent: 1.8, aiRecommended: 163000, actual: 162500 },
  { role: "Marketing Manager", level: "L4", maleMedian: 138000, femaleMedian: 135000, gapPercent: 2.2, whiteMedian: 137000, bipocMedian: 136000, ethnicGapPercent: 0.7, aiRecommended: 137000, actual: 136500 },
  { role: "Operations Lead", level: "L5", maleMedian: 155000, femaleMedian: 148000, gapPercent: 4.5, whiteMedian: 153000, bipocMedian: 150000, ethnicGapPercent: 2.0, aiRecommended: 152000, actual: 151500 },
  { role: "VP Engineering", level: "L8", maleMedian: 380000, femaleMedian: 352000, gapPercent: 7.4, whiteMedian: 375000, bipocMedian: 357000, ethnicGapPercent: 4.8, aiRecommended: 370000, actual: 366000 },
];

// --- Policies ---
export interface Policy {
  id: string;
  name: string;
  category: "Ethics" | "Privacy" | "Security" | "Transparency" | "Compliance";
  version: string;
  status: "Active" | "Draft" | "Under Review" | "Archived";
  lastReviewed: string;
  nextReview: string;
  owner: string;
  approver: string;
}

export const policies: Policy[] = [
  { id: "POL-001", name: "AI Ethics in HR Decision-Making", category: "Ethics", version: "3.2", status: "Active", lastReviewed: "2026-03-15", nextReview: "2026-09-15", owner: "Lisa Wang", approver: "CHRO" },
  { id: "POL-002", name: "Candidate Data Privacy Policy", category: "Privacy", version: "2.1", status: "Active", lastReviewed: "2026-02-01", nextReview: "2026-08-01", owner: "David Kim", approver: "DPO" },
  { id: "POL-003", name: "AI Model Audit & Testing Framework", category: "Compliance", version: "1.4", status: "Active", lastReviewed: "2026-01-20", nextReview: "2026-07-20", owner: "Sarah Chen", approver: "CTO" },
  { id: "POL-004", name: "Automated Decision Transparency", category: "Transparency", version: "2.0", status: "Active", lastReviewed: "2026-03-01", nextReview: "2026-09-01", owner: "Lisa Wang", approver: "CLO" },
  { id: "POL-005", name: "Employee AI Grievance Procedure", category: "Ethics", version: "1.2", status: "Active", lastReviewed: "2026-02-15", nextReview: "2026-08-15", owner: "James Park", approver: "CHRO" },
  { id: "POL-006", name: "AI System Security Standards", category: "Security", version: "3.0", status: "Active", lastReviewed: "2026-03-10", nextReview: "2026-06-10", owner: "David Kim", approver: "CISO" },
  { id: "POL-007", name: "Pay Equity AI Guidelines", category: "Compliance", version: "1.1", status: "Under Review", lastReviewed: "2026-01-05", nextReview: "2026-04-05", owner: "Maria Torres", approver: "CFO" },
  { id: "POL-008", name: "Third-Party AI Vendor Assessment", category: "Security", version: "2.3", status: "Active", lastReviewed: "2026-02-20", nextReview: "2026-08-20", owner: "David Kim", approver: "CPO" },
  { id: "POL-009", name: "AI in Performance Reviews — Best Practices", category: "Transparency", version: "1.0", status: "Draft", lastReviewed: "2026-03-20", nextReview: "2026-06-20", owner: "James Park", approver: "CHRO" },
];

// --- Chart trend data ---
export const fairnessScoreTrend = [
  { month: "Oct", resumeScreen: 0.79, interviewBot: 0.75, perfScore: 0.88, compBench: 0.83 },
  { month: "Nov", resumeScreen: 0.80, interviewBot: 0.76, perfScore: 0.89, compBench: 0.84 },
  { month: "Dec", resumeScreen: 0.81, interviewBot: 0.77, perfScore: 0.90, compBench: 0.85 },
  { month: "Jan", resumeScreen: 0.80, interviewBot: 0.78, perfScore: 0.90, compBench: 0.86 },
  { month: "Feb", resumeScreen: 0.81, interviewBot: 0.78, perfScore: 0.91, compBench: 0.86 },
  { month: "Mar", resumeScreen: 0.82, interviewBot: 0.78, perfScore: 0.91, compBench: 0.87 },
];

export const riskDistribution = [
  { domain: "Hiring", high: 2, medium: 1, low: 1 },
  { domain: "Performance", high: 1, medium: 1, low: 1 },
  { domain: "Compensation", high: 2, medium: 0, low: 1 },
  { domain: "Retention", high: 0, medium: 1, low: 0 },
  { domain: "Workforce", high: 0, medium: 1, low: 0 },
];

export const incidentTrend = [
  { month: "Oct", critical: 1, high: 2, medium: 3, low: 1 },
  { month: "Nov", critical: 0, high: 3, medium: 2, low: 2 },
  { month: "Dec", critical: 1, high: 1, medium: 4, low: 1 },
  { month: "Jan", critical: 2, high: 2, medium: 2, low: 3 },
  { month: "Feb", critical: 0, high: 1, medium: 3, low: 2 },
  { month: "Mar", critical: 2, high: 1, medium: 2, low: 0 },
];

export const payGapTrend = [
  { quarter: "Q1 2025", gender: 5.8, ethnicity: 4.2 },
  { quarter: "Q2 2025", gender: 5.5, ethnicity: 4.0 },
  { quarter: "Q3 2025", gender: 5.1, ethnicity: 3.7 },
  { quarter: "Q4 2025", gender: 4.8, ethnicity: 3.5 },
  { quarter: "Q1 2026", gender: 4.5, ethnicity: 3.2 },
];

// --- KPI Summary ---
export const kpiSummary = {
  totalModels: hrModels.length,
  activeModels: hrModels.filter(m => m.status === "Production").length,
  avgFairnessScore: Math.round(hrModels.reduce((sum, m) => sum + m.fairnessScore, 0) / hrModels.length * 100) / 100,
  overallCompliance: Math.round(regulations.reduce((sum, r) => sum + r.compliance, 0) / regulations.length),
  openIncidents: incidents.filter(i => i.status !== "Closed" && i.status !== "Resolved").length,
  criticalIncidents: incidents.filter(i => i.severity === "Critical" && i.status !== "Closed" && i.status !== "Resolved").length,
  candidatesProcessed: hrModels.reduce((sum, m) => sum + (m.candidatesProcessed || 0), 0),
  totalEmployeesMonitored: performanceData.reduce((sum, d) => sum + d.employeeCount, 0),
};
