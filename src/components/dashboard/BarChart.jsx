import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { C } from "@/lib/data";
import { clamp, fmtInt } from "@/lib/format";
import { useMeasure } from "@/hooks/useMeasure";
import { ChartTip, TipRow } from "./ui";
import { cn } from "@/utils/cn";

export default function CategoryBars({ data, segment }) {
  const max = Math.max(...data.map((d) => d.total), 1);
  const rootRef = useRef(null);
  const [, { width: rootW }] = useMeasure();
  const [hover, setHover] = useState(null);

  return (
    <div ref={rootRef} className="relative px-5 pb-1 pt-3 sm:px-6">
      <div className="space-y-[13px]">
        {data.map((d, i) => {
          const lostW = (d.lost / max) * 100;
          const foundW = (d.found / max) * 100;
          const isHover = hover?.i === i;
          return (
            <div
              key={d.key}
              className="group flex items-center gap-3"
              onMouseMove={(e) => {
                if (!rootRef.current) return;
                const rect = rootRef.current.getBoundingClientRect();
                setHover({ i, x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
              onMouseLeave={() => setHover(null)}
            >
              <span className={cn(
                "w-[104px] shrink-0 truncate text-right text-[11.5px] font-medium transition-colors sm:w-[118px]",
                isHover ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
              )}>
                {d.label}
              </span>
              <div className="relative h-[22px] flex-1">
                <div className="absolute inset-y-[5px] flex w-full overflow-hidden rounded-full bg-slate-100/80 dark:bg-white/[0.05]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${segment === "found" ? 0 : lostW}%` }}
                    transition={{ duration: 0.9, delay: 0.05 + i * 0.045, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-l-full"
                    style={{ background: `linear-gradient(90deg, ${C.roseDeep}, ${C.rose})`, opacity: segment === "found" ? 0 : 1 }}
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${segment === "lost" ? 0 : foundW}%` }}
                    transition={{ duration: 0.9, delay: 0.08 + i * 0.045, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full flex-1 rounded-r-full"
                    style={{ background: `linear-gradient(90deg, ${C.emeraldDeep}, ${C.emerald})`, opacity: segment === "lost" ? 0 : 1 }}
                  />
                </div>
              </div>
              <span className={cn(
                "tnum w-9 shrink-0 text-[11.5px] font-bold transition-colors",
                isHover ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"
              )}>
                {fmtInt(d.total)}
              </span>
            </div>
          );
        })}
      </div>

      <ChartTip
        visible={hover !== null}
        x={hover ? clamp(hover.x, 96, Math.max(rootW - 96, 96)) : 0}
        y={hover ? clamp(hover.y, 92, 9999) : 0}
      >
        {hover !== null && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {data[hover.i].label}
            </p>
            <TipRow color={C.rose} label="Lost" value={fmtInt(data[hover.i].lost)} />
            <TipRow color={C.emerald} label="Found" value={fmtInt(data[hover.i].found)} />
          </div>
        )}
      </ChartTip>
    </div>
  );
}
