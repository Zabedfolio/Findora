import { useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "../utils/cn";

export function Card({ children, className, delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative rounded-3xl bg-white ring-card shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.12)]",
        "dark:bg-ink-900 dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_16px_40px_-24px_rgba(0,0,0,0.6)]",
        className
      )}
    >
      {children}
    </motion.section>
  );
}

export function CardHeader({ title, subtitle, right }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6">
      <div>
        <h3 className="font-display text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-[12.5px] text-slate-500 dark:text-slate-400">{subtitle}</p>
        )}
      </div>
      {right}
    </div>
  );
}

export function SegmentedControl({ options, value, onChange, size = "md" }) {
  const groupId = useId();
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full p-1",
        "bg-slate-100 ring-1 ring-slate-900/5 dark:bg-white/[0.06] dark:ring-white/[0.06]"
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative rounded-full font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
              size === "md" ? "px-3.5 py-1.5 text-[12.5px]" : "px-2.5 py-1 text-[11.5px]",
              active
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${groupId}`}
                className="absolute inset-0 rounded-full bg-white shadow-[0_1px_3px_rgba(16,24,40,0.12)] ring-1 ring-slate-900/5 dark:bg-white/[0.14] dark:shadow-none dark:ring-white/10"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Select({ value, onChange, options, icon, label }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 rounded-full py-2 pl-3.5 pr-3 text-[12.5px] font-medium",
          "bg-white text-slate-700 ring-1 ring-slate-900/10 transition-all hover:ring-slate-900/20",
          "dark:bg-white/[0.06] dark:text-slate-200 dark:ring-white/10 dark:hover:ring-white/20",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        )}
      >
        {icon && <span className="text-slate-400 dark:text-slate-500">{icon}</span>}
        {label && <span className="hidden text-slate-400 dark:text-slate-500 sm:inline">{label}</span>}
        <span className="max-w-[140px] truncate">{current?.label}</span>
        <ChevronDown size={14} className={cn("transition-transform duration-300", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl p-1.5",
              "bg-white shadow-xl ring-1 ring-slate-900/10",
              "dark:bg-ink-800 dark:ring-white/10 dark:shadow-black/50"
            )}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[12.5px] transition-colors",
                  opt.value === value
                    ? "bg-slate-100 font-semibold text-slate-900 dark:bg-white/10 dark:text-white"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5"
                )}
              >
                {opt.label}
                {opt.value === value && <Check size={14} className="text-indigo-500" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ChartTip({ visible, x, y, children }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.15 }}
          className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-[calc(100%+14px)]"
          style={{ left: x, top: y }}
        >
          <div className="whitespace-nowrap rounded-xl border border-slate-200/80 bg-white/95 px-3.5 py-2.5 shadow-[0_8px_30px_-6px_rgba(16,24,40,0.25)] backdrop-blur-md dark:border-white/10 dark:bg-ink-800/95 dark:shadow-black/60">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function TipRow({ color, label, value }) {
  return (
    <div className="flex items-center justify-between gap-6 text-[12px]">
      <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        {label}
      </span>
      <span className="tnum font-semibold text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

export function LiveDot({ className }) {
  return (
    <span className={cn("relative flex h-2 w-2", className)}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
    </span>
  );
}
