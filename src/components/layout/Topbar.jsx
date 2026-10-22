import { motion, AnimatePresence } from "framer-motion";
import { Menu, Bell, Sun, Moon } from "lucide-react";
import { cn } from "../../utils/cn";

function IconButton({ children, onClick, label, dot }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "relative grid h-10 w-10 place-items-center rounded-full transition-all duration-200",
        "bg-white text-slate-500 ring-1 ring-slate-900/10 hover:text-slate-900 hover:ring-slate-900/20",
        "dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/10 dark:hover:bg-white/10 dark:hover:text-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      )}
    >
      {children}
      {dot && (
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-ink-950" />
      )}
    </button>
  );
}

export default function Topbar({ light, onToggleTheme, onOpenMenu }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-20 -mx-4 px-4 pb-3 pt-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#f4f5f8] via-[#f4f5f8]/85 to-transparent dark:from-ink-950 dark:via-ink-950/85 dark:to-transparent" />
      <div className="relative flex items-center gap-3">
        <button
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="grid h-10 w-10 place-items-center rounded-full bg-white text-slate-600 ring-1 ring-slate-900/10 lg:hidden dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/10"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
            <span>Findora</span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-slate-600 dark:text-slate-300">Administration</span>
          </div>
          <div className="mt-0.5 flex items-center gap-2.5">
            <h1 className="font-display truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl dark:text-white">
              Platform overview
            </h1>
            <span className="hidden items-center rounded-full bg-amber-500/10 px-2.5 py-1 text-[10.5px] font-semibold text-amber-700 ring-1 ring-amber-500/20 sm:flex dark:text-amber-300">
              DEMO
            </span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          <span className="mr-1 hidden text-[12.5px] font-medium text-slate-400 md:block dark:text-slate-500">
            {today}
          </span>
          <IconButton label="Notifications" dot>
            <Bell size={17} strokeWidth={2.1} />
          </IconButton>
          <IconButton label="Toggle theme" onClick={onToggleTheme}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={light ? "moon" : "sun"}
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="grid place-items-center"
              >
                {light ? <Moon size={17} strokeWidth={2.1}  /> : <Sun size={17} strokeWidth={2.1} />}
              </motion.span>
            </AnimatePresence>
          </IconButton>
          <button className="relative ml-0.5 hidden h-10 w-10 overflow-hidden rounded-full ring-2 ring-white transition-transform hover:scale-105 sm:block dark:ring-ink-800">
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-amber-400 via-rose-400 to-violet-500 text-[12px] font-bold text-white">
              AR
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
