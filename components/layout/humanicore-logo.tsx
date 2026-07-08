import { cn } from "@/lib/utils";
import { HUMANICORE_MARK, HUMANICORE_WORDMARK } from "@/lib/logo-assets";

/** Circle mark — "Ai" with red heart, embedded as data URI (light background) */
export function HumaniCoreMark({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={HUMANICORE_MARK}
      alt="HumaniCore AI"
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}

/** Brand mark rendered on a blue (navy) tile — for use on the dark sidebar. */
export function HumaniCoreBrandMark({ className, size = 34 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="HumaniCore AI"
    >
      <rect width="400" height="400" rx="92" fill="#1e2761" />
      <g transform="translate(200 200) scale(0.82) translate(-200 -200)">
        <circle cx="200" cy="205" r="150" fill="none" stroke="#02c39a" strokeWidth="30" />
        <text x="200" y="270" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="220" fill="#ffffff" textAnchor="middle">Ai</text>
        <path d="M300 120 l-40 40 -36-36a26 26 0 1 1 36-36 26 26 0 1 1 40 32z" fill="#ef3e4a" />
      </g>
    </svg>
  );
}

/** Sidebar wordmark: mark + text stack. `light` for dark/navy backgrounds. */
export function HumaniCoreWordmark({ subtitle, light = false }: { subtitle?: string; light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <HumaniCoreBrandMark size={34} />
      <div className="overflow-hidden">
        <p
          className={cn(
            "text-sm font-semibold whitespace-nowrap leading-tight",
            light ? "text-white" : "text-[#1e2761]",
          )}
          style={{ fontFamily: "Georgia, 'Times New Roman', serif", letterSpacing: "0.01em" }}
        >
          HumaniCore <span className="font-normal italic">AI</span>
        </p>
        {subtitle !== undefined && (
          <p className={cn(
            "text-[10px] whitespace-nowrap leading-tight mt-0.5 truncate max-w-[140px]",
            light ? "text-white/50" : "text-slate-400",
          )}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

/** Login-page header: mark + wordmark image + tagline */
export function HumaniCoreLoginMark() {
  return (
    <div className="flex items-center gap-3">
      <HumaniCoreMark size={52} />
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HUMANICORE_WORDMARK}
          alt="HumaniCore"
          height={34}
          style={{ height: 34, width: "auto" }}
          className="object-contain object-left"
        />
        <p className="text-xs text-slate-500 mt-1">
          Human Centered Governance for AI
        </p>
      </div>
    </div>
  );
}
