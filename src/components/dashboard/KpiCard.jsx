import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/utils/cn";
import { Card } from "./ui";
import { useCountUp, useTweenedSeries } from "@/hooks/useTween";

function Sparkline({ data = [], color }) {
  const pts = useTweenedSeries(data, 0.85);
  const w = 132;
  const h = 44;
  const validPts = pts.map((p) => (typeof p === "number" && !isNaN(p) ? p : 0));
  const max = Math.max(...validPts, 1);
  const stepX = w / Math.max(1, validPts.length - 1);
  const path = validPts
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i * stepX).toFixed(1)},${(h - 4 - (v / max) * (h - 10)).toFixed(1)}`)
    .join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;
  const id = `sp-${(color || "#9ae600").replace("#", "")}`;

  return (
    
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-[90px] sm:w-[105px] overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(validPts.length - 1) * stepX} cy={h - 4 - (validPts[validPts.length - 1] / max) * (h - 10)} r="3" fill={color} className="drop-shadow-sm" />
    </svg>
  );
}

export default function KpiCard({ label, value = 0, format, delta = 0, invert, icon: Icon, iconClass, spark = [], sparkColor, delay = 0 }) {
  const safeValue = typeof value === "number" && !isNaN(value) ? value : 0;
  const display = useCountUp(safeValue);
  const safeDelta = typeof delta === "number" && !isNaN(delta) ? delta : 0;
  const positive = invert ? safeDelta <= 0 : safeDelta >= 0;
  const abs = Math.abs(safeDelta);

  return (
    <Card
      delay={delay}
      className="group overflow-hidden p-5 transition-shadow duration-300 hover:shadow-[0_2px_4px_rgba(16,24,40,0.06),0_18px_40px_-14px_rgba(16,24,40,0.22)] hover:ring-slate-900/10 dark:hover:shadow-black/60 dark:hover:ring-white/[0.14]"
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110", iconClass)}>
              <Icon size={17} strokeWidth={2.2} />
            </span>
            <p className="truncate text-[11.5px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400" title={label}>
              {label}
            </p>
          </div>
          <p className="tnum font-display mt-3 text-[30px] font-bold leading-none tracking-tight text-slate-900 dark:text-white">
            {format(display)}
          </p>
        </div>
        <div className="shrink-0 opacity-90 pl-1">
          <Sparkline data={spark} color={sparkColor} />
        </div>
      </div>

      <div className="mt-3.5 flex items-center gap-2">
        <span
          className={cn(
            "tnum inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ring-1",
            positive ? "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 ring-rose-500/20 dark:text-rose-400"
          )}
        >
          {positive ? <TrendingUp size={12} strokeWidth={2.6} /> : <TrendingDown size={12} strokeWidth={2.6} />}
          {abs.toFixed(1)}%
        </span>
        <span className="text-[11.5px] text-slate-400 dark:text-slate-500">vs previous period</span>
      </div>
    </Card>
  );
}
