import { cn } from "@/lib/utils";

/** Circle mark — "Ai" with red heart */
export function HumaniCoreMark({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/humanicore-mark.png"
      alt="HumaniCore AI mark"
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}

/** Sidebar wordmark: mark + text stack */
export function HumaniCoreWordmark({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <HumaniCoreMark size={34} />
      <div className="overflow-hidden">
        <p
          className="text-sm font-semibold text-[#1b4a8a] whitespace-nowrap leading-tight"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif", letterSpacing: "0.01em" }}
        >
          HumaniCore <span className="font-normal italic">AI</span>
        </p>
        {subtitle !== undefined && (
          <p className="text-[10px] text-slate-400 whitespace-nowrap leading-tight mt-0.5 truncate max-w-[140px]">
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
      <HumaniCoreMark size={56} />
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/humanicore-wordmark.png"
          alt="HumaniCore"
          height={36}
          style={{ height: 36, width: "auto" }}
          className="object-contain object-left"
        />
        <p className="text-xs text-slate-500 mt-1">
          Human Centered Governance for AI
        </p>
      </div>
    </div>
  );
}
