"use client";

import { usePerformance } from "@/lib/api-client";
import { PageLoading, PageError } from "@/components/ui/loading";
import { formatNumber } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { BarChart3, Users, RefreshCw, CheckCircle2, Info } from "lucide-react";

export default function PerformancePage() {
  const { data: performance, isLoading, error } = usePerformance();

  if (isLoading) return <PageLoading />;
  if (error) return <PageError message={error.message} />;
  if (!performance) return <PageError />;

  const totalEmployees = performance.reduce((s, d) => s + d.employeeCount, 0);
  const avgOverride = +(performance.reduce((s, d) => s + d.overrideRate, 0) / performance.length).toFixed(1);
  const calibratedCount = performance.filter((d) => d.calibrated).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Performance Review AI Oversight</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitoring AI-assisted performance scoring, manager overrides, and demographic equity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs">Employees Reviewed</span>
          </div>
          <p className="text-xl font-bold">{formatNumber(totalEmployees)}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <RefreshCw className="w-4 h-4" />
            <span className="text-xs">Avg Override Rate</span>
          </div>
          <p className="text-xl font-bold">{avgOverride}%</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CheckCircle2 className="w-4 h-4 text-[#0a7a49]" />
            <span className="text-xs">Calibrated Depts</span>
          </div>
          <p className="text-xl font-bold">{calibratedCount}/{performance.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs">Departments</span>
          </div>
          <p className="text-xl font-bold">{performance.length}</p>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 leading-relaxed">
          The {avgOverride}% average override rate reflects <span className="font-semibold text-slate-700">manager judgment applied on top of model output</span> — a governance signal that human review is active, not a defect.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">AI vs Manager Scores by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performance}>
              <XAxis dataKey="department" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
              <YAxis domain={[3, 4.5]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="avgAIScore" name="AI Score" fill="#1e2761" radius={[2, 2, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="avgManagerScore" name="Manager Score" fill="#028090" radius={[2, 2, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Score by Gender by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performance}>
              <XAxis dataKey="department" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
              <YAxis domain={[3, 4.5]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="maleAvg" name="Male Avg" fill="#1e2761" radius={[2, 2, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="femaleAvg" name="Female Avg" fill="#02c39a" radius={[2, 2, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Department Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 font-medium">Department</th>
                <th className="pb-2 font-medium">Employees</th>
                <th className="pb-2 font-medium">AI Avg</th>
                <th className="pb-2 font-medium">Manager Avg</th>
                <th className="pb-2 font-medium">Override Rate</th>
                <th className="pb-2 font-medium">Male Avg</th>
                <th className="pb-2 font-medium">Female Avg</th>
                <th className="pb-2 font-medium">Calibrated</th>
              </tr>
            </thead>
            <tbody>
              {performance.map((d) => (
                <tr key={d.department} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="py-2.5 font-medium">{d.department}</td>
                  <td className="py-2.5 text-muted-foreground">{formatNumber(d.employeeCount)}</td>
                  <td className="py-2.5">{d.avgAIScore}</td>
                  <td className="py-2.5">{d.avgManagerScore}</td>
                  <td className="py-2.5">{d.overrideRate}%</td>
                  <td className="py-2.5">{d.maleAvg}</td>
                  <td className="py-2.5">{d.femaleAvg}</td>
                  <td className="py-2.5">
                    {d.calibrated
                      ? <span className="text-xs px-2 py-0.5 rounded border text-[#0a7a49] bg-[#d7f2e4] border-[#a9e1c6]">Calibrated</span>
                      : <span className="text-xs px-2 py-0.5 rounded border text-[#8a620a] bg-[#fbeecd] border-[#eed18a]">Calibration Pending</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
