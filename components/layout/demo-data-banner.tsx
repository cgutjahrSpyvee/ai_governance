import { FlaskConical } from "lucide-react";

/**
 * Marks a screen whose figures are seeded demonstration data rather than a
 * live governance-engine result.
 *
 * The dashboard must never present seeded numbers as if they were audit
 * findings — a viewer cannot otherwise tell a demo value from a real impact
 * ratio. Screens backed by the engine must NOT render this banner; screens
 * with no live source must.
 */
export default function DemoDataBanner({ detail }: { detail?: string }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-100 border border-slate-300">
      <FlaskConical className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
      <p className="text-xs text-slate-700 leading-relaxed">
        <span className="font-semibold">Demo data — not a live audit result.</span>{" "}
        {detail ??
          "This screen is not connected to the governance engine. Figures shown are seeded for demonstration and must not be relied on as findings."}
      </p>
    </div>
  );
}
