import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  variant?: "default" | "success" | "warning" | "danger";
}

// Muted earth-tone palette (reference mockup). "danger" → terracotta,
// "warning" → gold, "success" → sage; "default" → navy brand tint.
const variantStyles = {
  default: "bg-[#1e2761]/10 text-[#1e2761]",
  success: "bg-[#d7f2e4] text-[#0a7a49]",
  warning: "bg-[#fbeecd] text-[#8a620a]",
  danger: "bg-[#f9e4de] text-[#ae3c24]",
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                "text-xs font-medium mt-2",
                trend.value >= 0 ? "text-[#0a7a49]" : "text-[#ae3c24]"
              )}
            >
              {trend.value >= 0 ? "+" : ""}
              {trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg",
            variantStyles[variant]
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
