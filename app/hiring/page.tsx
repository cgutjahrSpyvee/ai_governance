"use client";

import { useHiringFunnel, useModels, useBiasMetrics } from "@/lib/api-client";
import { PageLoading, PageError } from "@/components/ui/loading";
import { formatNumber } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { UserSearch, AlertCircle, CheckCircle2, TrendingDown } from "lucide-react";

const GENDER_COLORS = ["#2563eb", "#ec4899", "#8b5cf6"];
const ETHNICITY_COLORS = ["#64748b", "#0ea5e9", "#f59e0b", "#ef4444", "#10b981"];

export default function HiringPage() {
  const { data: funnel, isLoading: l1, error: e1 } = useHiringFunnel();
  const { data: models, isLoading: l2, error: e2 } = useModels();
  const { data: biasMetrics, isLoading: l3, error: e3 } = useBiasMetrics();

  if (l1 || l2 || l3) return <PageLoading />;
  if (e1 || e2 || e3) return <PageError />;
  if (!funnel || !models || !biasMetrics) return <PageError />;

  const firstStage = funnel[0];
  const totalCandidates = firstStage ? firstStage.male + firstStage.female + firstStage.nonBinary : 0;
  const screeningStage = funnel.find((f) => f.stage === "AI Screening");
  const passRate = firstStage && screeningStage
    ? +(
        ((screeningStage.male + screeningStage.female + screeningStage.nonBinary) /
          (firstStage.male + firstStage.female + firstStage.nonBinary)) *
        100
      ).toFixed(1)
    : 0;

  const hiringModelNames = new Set(models.filter((m) => m.function === "Hiring").map((m) => m.name));
  const hiringBias = biasMetrics.filter((b) => hiringModelNames.has(b.model));
  const biasFails = hiringBias.filter((b) => b.status === "Fail").length;

  const genderFunnelData = funnel.map((s) => ({
    stage: s.stage,
    Male: s.male,
    Female: s.female,
    "Non-Binary": s.nonBinary,
  }));

  const ethnicityFunnelData = funnel.map((s) => ({
    stage: s.stage,
    White: s.white,
    Black: s.black,
    Hispanic: s.hispanic,
    Asian: s.asian,
    Other: s.other,
  }));

  // Four-fifths rule per stage
  const fourFifthsRows = funnel.map((stage) => {
    const total = stage.male + stage.female + stage.nonBinary;
    const rates = {
      male: stage.male / total,
      female: stage.female / total,
      nb: stage.nonBinary / total,
    };
    const max = Math.max(rates.male, rates.female, rates.nb);
    return {
      stage: stage.stage,
      maleRatio: +(rates.male / max).toFixed(3),
      femaleRatio: +(rates.female / max).toFixed(3),
      nbRatio: +(rates.nb / max).toFixed(3),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hiring & Recruitment AI Governance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fairness monitoring across AI-assisted hiring pipeline
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <UserSearch className="w-4 h-4" />
            <span className="text-xs">Total Candidates</span>
          </div>
          <p className="text-xl font-bold">{formatNumber(totalCandidates)}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingDown className="w-4 h-4" />
            <span className="text-xs">AI Screening Pass Rate</span>
          </div>
          <p className="text-xl font-bold">{passRate}%</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-xs">Bias Checks Passing</span>
          </div>
          <p className="text-xl font-bold text-green-600">
            {hiringBias.filter((b) => b.status === "Pass").length}/{hiringBias.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-xs">Bias Alerts</span>
          </div>
          <p className="text-xl font-bold text-red-600">{biasFails}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Candidate Funnel by Gender</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={genderFunnelData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="stage" type="category" width={90} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Male" fill={GENDER_COLORS[0]} radius={[0, 2, 2, 0]} />
              <Bar dataKey="Female" fill={GENDER_COLORS[1]} radius={[0, 2, 2, 0]} />
              <Bar dataKey="Non-Binary" fill={GENDER_COLORS[2]} radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Candidate Funnel by Ethnicity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ethnicityFunnelData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="stage" type="category" width={90} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="White" fill={ETHNICITY_COLORS[0]} radius={[0, 2, 2, 0]} />
              <Bar dataKey="Black" fill={ETHNICITY_COLORS[1]} radius={[0, 2, 2, 0]} />
              <Bar dataKey="Hispanic" fill={ETHNICITY_COLORS[2]} radius={[0, 2, 2, 0]} />
              <Bar dataKey="Asian" fill={ETHNICITY_COLORS[3]} radius={[0, 2, 2, 0]} />
              <Bar dataKey="Other" fill={ETHNICITY_COLORS[4]} radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Four-Fifths Rule Compliance (Gender)</h3>
        <p className="text-xs text-muted-foreground mb-4">Values below 0.80 indicate potential adverse impact.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 font-medium">Stage</th>
                <th className="pb-2 font-medium">Male Ratio</th>
                <th className="pb-2 font-medium">Female Ratio</th>
                <th className="pb-2 font-medium">Non-Binary Ratio</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {fourFifthsRows.map((row) => {
                const minRatio = Math.min(row.maleRatio, row.femaleRatio, row.nbRatio);
                const pass = minRatio >= 0.8;
                return (
                  <tr key={row.stage} className="border-b border-border/50">
                    <td className="py-2.5 font-medium">{row.stage}</td>
                    <td className={`py-2.5 ${row.maleRatio < 0.8 ? "text-red-600 font-semibold" : ""}`}>{row.maleRatio}</td>
                    <td className={`py-2.5 ${row.femaleRatio < 0.8 ? "text-red-600 font-semibold" : ""}`}>{row.femaleRatio}</td>
                    <td className={`py-2.5 ${row.nbRatio < 0.8 ? "text-red-600 font-semibold" : ""}`}>{row.nbRatio}</td>
                    <td className="py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded border ${pass ? "text-green-700 bg-green-50 border-green-200" : "text-red-700 bg-red-50 border-red-200"}`}>
                        {pass ? "Pass" : "Fail"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
