"use client";

import { usePerformance } from "@/lib/api-client";
import { PageLoading, PageError } from "@/components/ui/loading";
import { formatNumber } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { BarChart3, Users, RefreshCw, CheckCircle2 } from "lucide-react";

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
            <CheckCircle2 className="w-4 h-4 text-green-600" />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">AI vs Manager Scores by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performance}>
              <XAxis dataKey="department" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
              <YAxis domain={[3, 4.5]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="avgAIScore" name="AI Score" fill="#2563eb" radius={[2, 2, 0, 0]} />
              <Bar dataKey="avgManagerScore" name="Manager Score" fill="#10b981" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Gender Score Gap by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performance}>
              <XAxis dataKey="department" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
              <YAxis domain={[3, 4.5]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="maleAvg" name="Male Avg" fill="#2563eb" radius={[2, 2, 0, 0]} />
              <Bar dataKey="femaleAvg" name="Female Avg" fill="#ec4899" radius={[2, 2, 0, 0]} />
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
                      ? <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">Yes</span>
                      : <span className="text-xs px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">No</span>}
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
