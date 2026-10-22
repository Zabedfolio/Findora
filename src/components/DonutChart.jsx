import { useMemo, useState } from "react";
import { fmtInt, fmtPct } from "../lib/format";
import { useCountUp, useTweenedSeries } from "../hooks/useTween";
import { Card, CardHeader } from "./ui";
import { cn } from "../utils/cn";

const R = 82;
const CIRC = 2 * Math.PI * R;
const GAP = 5;

export default function DonutChart({ data, delay = 0 }) {
  const [hover, setHover] = useState(null);
  const total = data.reduce((a, b) => a + b.value, 0);
  const fracs = useMemo(() => data.map((d) => (total ? d.value / total : 0)), [data, total]);
  const fracsT = useTweenedSeries(fracs, 0.9);
  const totalT = Math.round(useCountUp(total));

  const starts = [];
  fracsT.reduce((acc, f, i) => (starts[i] = acc, acc + f), 0);

  const active = hover ?? "returned";
  const activeRow = data.find((d) => d.status === active);
  const activeIdx = data.findIndex((d) => d.status === active);

  return (
    <Card delay={delay} className="flex h-full flex-col">
      <CardHeader title="Resolution funnel" subtitle="Where reports currently stand" />
      <div className="flex flex-1 flex-col items-center justify-center px-5 pb-2 pt-1">
        <div className="relative">
          <svg width="212" height="212" viewBox="0 0 212 212">
            <circle cx="106" cy="106" r={R} fill="none" strokeWidth="18" className="stroke-slate-100 dark:stroke-white/[0.05]" />
            {data.map((d, i) => {
              const frac = fracsT[i] ?? 0;
              const len = Math.max(frac * CIRC - GAP, 0);
              const isHover = hover === d.status;
              const dimmed = hover !== null && !isHover;
              return (
                <circle
                  key={d.status}
                  cx="106"
                  cy="106"
                  r={R}
                  fill="none"
                  stroke={d.color}
                  strokeWidth={isHover ? 26 : 18}
                  strokeDasharray={`${len} ${CIRC - len}`}
                  strokeDashoffset={-(starts[i] ?? 0) * CIRC + GAP / 2}
                  transform="rotate(-90 106 106)"
                  strokeLinecap="butt"
                  className="cursor-pointer transition-all duration-300"
                  style={{ opacity: dimmed ? 0.25 : 1 }}
                  onMouseEnter={() => setHover(d.status)}
                  onMouseLeave={() => setHover(null)}
                />
              );
            })}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <p key={active} className="tnum font-display text-[30px] font-bold leading-none tracking-tight text-slate-900 dark:text-white">
              {fmtInt(hover ? data[activeIdx]?.value ?? 0 : totalT)}
            </p>
            <p className="mt-1.5 max-w-[110px] text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
              {hover ? activeRow?.label : "Total reports"}
            </p>
            {hover && (
              <p className="tnum mt-1 text-[12px] font-bold" style={{ color: activeRow?.color }}>
                {fmtPct(total ? ((activeRow?.value ?? 0) / total) * 100 : 0)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1 px-5 pb-5">
        {data.map((d) => {
          const pct = total ? (d.value / total) * 100 : 0;
          const isHover = hover === d.status;
          const dimmed = hover !== null && !isHover;
          return (
            <button
              key={d.status}
              onMouseEnter={() => setHover(d.status)}
              onMouseLeave={() => setHover(null)}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all duration-200",
                isHover && "bg-slate-50 dark:bg-white/[0.05]",
                dimmed && "opacity-45"
              )}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-[4px]" style={{ background: d.color }} />
              <span className="flex-1 truncate text-[12.5px] font-medium text-slate-600 dark:text-slate-300">
                {d.label}
              </span>
              <span className="tnum text-[12.5px] font-bold text-slate-900 dark:text-white">{fmtInt(d.value)}</span>
              <span className="tnum w-11 text-right text-[11px] font-medium text-slate-400 dark:text-slate-500">
                {fmtPct(pct, 0)}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
