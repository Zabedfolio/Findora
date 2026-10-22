import { useMemo, useState } from "react";
import { C } from "../lib/data";
import { clamp, fmtInt } from "../lib/format";
import { useMeasure } from "../hooks/useMeasure";
import { useTweenedSeries } from "../hooks/useTween";
import { Card, CardHeader, ChartTip, TipRow } from "./ui";
import { cn } from "../utils/cn";

const PAD = { t: 18, r: 14, b: 28, l: 40 };

function smoothPath(xs, ys) {
  if (xs.length < 2) return "";
  let d = `M${xs[0].toFixed(2)},${ys[0].toFixed(2)}`;
  for (let i = 0; i < xs.length - 1; i++) {
    const y0 = i === 0 ? ys[0] : ys[i - 1];
    const x0 = i === 0 ? xs[0] : xs[i - 1];
    const y3 = i + 2 < xs.length ? ys[i + 2] : ys[xs.length - 1];
    const x3 = i + 2 < xs.length ? xs[i + 2] : xs[xs.length - 1];
    const c1x = xs[i] + (xs[i + 1] - x0) / 6;
    const c1y = ys[i] + (ys[i + 1] - y0) / 6;
    const c2x = xs[i + 1] - (x3 - xs[i]) / 6;
    const c2y = ys[i + 1] - (y3 - ys[i]) / 6;
    d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${xs[i + 1].toFixed(2)},${ys[i + 1].toFixed(2)}`;
  }
  return d;
}

function niceMax(v) {
  if (v <= 5) return 5;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return nice * p;
}

export default function AreaChart({ labels, lost, found, segment, delay = 0 }) {
  const [ref, { width }] = useMeasure();
  const [hover, setHover] = useState(null);

  const lostT = useTweenedSeries(lost);
  const foundT = useTweenedSeries(found);

  const h = 288;
  const w = Math.max(width, 1);
  const innerW = w - PAD.l - PAD.r;
  const innerH = h - PAD.t - PAD.b;
  const n = Math.max(lostT.length, 1);

  const maxRaw = Math.max(...lostT, ...foundT, 4);
  const maxY = niceMax(maxRaw * 1.12);

  const xs = useMemo(
    () => Array.from({ length: n }, (_, i) => PAD.l + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW)),
    [n, innerW]
  );
  const toY = (v) => PAD.t + innerH - (v / maxY) * innerH;

  const ysLost = lostT.map(toY);
  const ysFound = foundT.map(toY);

  const lostLine = smoothPath(xs, ysLost);
  const foundLine = smoothPath(xs, ysFound);
  const base = PAD.t + innerH;
  const lostArea = `${lostLine} L${xs[n - 1].toFixed(2)},${base} L${xs[0].toFixed(2)},${base} Z`;
  const foundArea = `${foundLine} L${xs[n - 1].toFixed(2)},${base} L${xs[0].toFixed(2)},${base} Z`;

  const ticks = [0.25, 0.5, 0.75, 1].map((f) => ({ y: toY(maxY * f), v: maxY * f }));
  const labelEvery = Math.ceil(n / 6);

  const onMove = (e) => {
    const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const i = n === 1 ? 0 : Math.round(((x - PAD.l) / innerW) * (n - 1));
    setHover(clamp(i, 0, n - 1));
  };

  const totalLost = lost.reduce((a, b) => a + b, 0);
  const totalFound = found.reduce((a, b) => a + b, 0);

  const dimLost = segment === "found";
  const dimFound = segment === "lost";

  return (
    <Card delay={delay} className="overflow-hidden">
      <CardHeader
        title="Report activity"
        subtitle="Lost vs found reports over time"
        right={
          <div className="flex items-center gap-2">
            <LegendChip color={C.rose} label="Lost" value={fmtInt(totalLost)} dim={dimLost} />
            <LegendChip color={C.emerald} label="Found" value={fmtInt(totalFound)} dim={dimFound} />
          </div>
        }
      />

      <div className="mt-2 px-2 pb-2">
        <div ref={ref} className="relative" style={{ height: h }}>
          {width > 0 && (
            <svg width={w} height={h} className="block">
              <defs>
                <linearGradient id="g-lost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.rose} stopOpacity="0.26" />
                  <stop offset="100%" stopColor={C.rose} stopOpacity="0.01" />
                </linearGradient>
                <linearGradient id="g-found" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.emerald} stopOpacity="0.26" />
                  <stop offset="100%" stopColor={C.emerald} stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {ticks.map((t, i) => (
                <g key={i}>
                  <line x1={PAD.l} x2={w - PAD.r} y1={t.y} y2={t.y} strokeDasharray="3 6" className="stroke-slate-200 dark:stroke-white/[0.07]" strokeWidth="1" />
                  <text x={PAD.l - 10} y={t.y + 3.5} textAnchor="end" className="fill-slate-400 text-[10.5px] font-medium dark:fill-slate-500 tnum">
                    {fmtInt(t.v)}
                  </text>
                </g>
              ))}
              <line x1={PAD.l} x2={w - PAD.r} y1={base} y2={base} className="stroke-slate-300/70 dark:stroke-white/10" />

              {labels.map((lb, i) =>
                i % labelEvery === 0 ? (
                  <text key={i} x={xs[i]} y={h - 8} textAnchor="middle" className="fill-slate-400 text-[10.5px] font-medium dark:fill-slate-500">
                    {lb}
                  </text>
                ) : null
              )}

              <path d={foundArea} fill="url(#g-found)" opacity={dimFound ? 0.15 : 1} />
              <path d={lostArea} fill="url(#g-lost)" opacity={dimLost ? 0.15 : 1} />
              <path d={foundLine} fill="none" stroke={C.emerald} strokeWidth="2.4" strokeLinecap="round" opacity={dimFound ? 0.2 : 1} />
              <path d={lostLine} fill="none" stroke={C.rose} strokeWidth="2.4" strokeLinecap="round" opacity={dimLost ? 0.2 : 1} />

              {hover !== null && (
                <g>
                  <line x1={xs[hover]} x2={xs[hover]} y1={PAD.t} y2={base} className="stroke-slate-300 dark:stroke-white/20" strokeWidth="1" />
                  {!dimLost && (
                    <>
                      <circle cx={xs[hover]} cy={ysLost[hover]} r="8" fill={C.rose} opacity="0.18" />
                      <circle cx={xs[hover]} cy={ysLost[hover]} r="4" fill={C.rose} stroke="white" strokeWidth="2" className="dark:stroke-ink-900" />
                    </>
                  )}
                  {!dimFound && (
                    <>
                      <circle cx={xs[hover]} cy={ysFound[hover]} r="8" fill={C.emerald} opacity="0.18" />
                      <circle cx={xs[hover]} cy={ysFound[hover]} r="4" fill={C.emerald} stroke="white" strokeWidth="2" className="dark:stroke-ink-900" />
                    </>
                  )}
                </g>
              )}

              <rect x={PAD.l} y={PAD.t} width={innerW} height={innerH} fill="transparent" onMouseMove={onMove} onMouseLeave={() => setHover(null)} />
            </svg>
          )}

          <ChartTip
            visible={hover !== null}
            x={clamp(hover !== null ? xs[hover] : 0, 110, Math.max(w - 110, 110))}
            y={hover !== null ? clamp(dimLost ? ysFound[hover] : dimFound ? ysLost[hover] : Math.min(ysFound[hover], ysLost[hover]), 96, h) : 0}
          >
            {hover !== null && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {labels[hover]}
                </p>
                {!dimLost && <TipRow color={C.rose} label="Lost reports" value={fmtInt(lost[hover] ?? 0)} />}
                {!dimFound && <TipRow color={C.emerald} label="Found items" value={fmtInt(found[hover] ?? 0)} />}
                <div className="flex items-center justify-between gap-6 border-t border-slate-100 pt-1.5 text-[12px] dark:border-white/10">
                  <span className="text-slate-400">Total</span>
                  <span className="tnum font-bold text-slate-900 dark:text-white">
                    {fmtInt((lost[hover] ?? 0) + (found[hover] ?? 0))}
                  </span>
                </div>
              </div>
            )}
          </ChartTip>
        </div>
      </div>
    </Card>
  );
}

function LegendChip({ color, label, value, dim }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-1.5 ring-1 transition-opacity",
        "bg-slate-50 ring-slate-900/5 dark:bg-white/[0.05] dark:ring-white/10",
        dim && "opacity-40"
      )}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      <span className="text-[11.5px] font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <span className="tnum text-[11.5px] font-bold text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}
