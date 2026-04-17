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

export function getRiskColor(level: string): string {
  switch (level.toLowerCase()) {
    case "high":
    case "critical":
      return "text-red-600 bg-red-50 border-red-200";
    case "medium":
      return "text-amber-600 bg-amber-50 border-amber-200";
    case "low":
      return "text-green-600 bg-green-50 border-green-200";
    default:
      return "text-slate-600 bg-slate-50 border-slate-200";
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
    case "production":
    case "resolved":
    case "compliant":
      return "text-green-700 bg-green-50 border-green-200";
    case "under review":
    case "investigating":
    case "in progress":
    case "partial":
      return "text-amber-700 bg-amber-50 border-amber-200";
    case "retired":
    case "closed":
      return "text-slate-500 bg-slate-50 border-slate-200";
    case "non-compliant":
    case "open":
    case "critical":
      return "text-red-700 bg-red-50 border-red-200";
    default:
      return "text-blue-700 bg-blue-50 border-blue-200";
  }
}
