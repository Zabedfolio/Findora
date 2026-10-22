import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { fmtInt } from "../lib/format";

export default function LocationList({ data }) {
  const max = Math.max(...data.map((d) => d.total), 1);
  return (
    <div className="px-5 pb-5 pt-1 sm:px-6">
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={d.name} className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.04]">
            <span className="tnum w-4 text-[11px] font-bold text-slate-300 dark:text-slate-600">{i + 1}</span>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-indigo-500/10 text-indigo-500 dark:bg-indigo-400/10 dark:text-indigo-300">
              <MapPin size={13} strokeWidth={2.3} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="truncate text-[12.5px] font-medium text-slate-700 dark:text-slate-200">{d.name}</p>
                <p className="tnum shrink-0 text-[12px] font-bold text-slate-900 dark:text-white">{fmtInt(d.total)}</p>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(d.total / max) * 100}%` }}
                  transition={{ duration: 0.9, delay: 0.1 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
