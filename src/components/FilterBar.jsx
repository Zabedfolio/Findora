import { motion, AnimatePresence } from "framer-motion";
import { MapPin, RotateCcw, CalendarRange } from "lucide-react";
import { LOCATIONS } from "../lib/data";
import { SegmentedControl, Select } from "./ui";
import { fmtDateShort } from "../lib/format";

export default function FilterBar({ range, onRange, segment, onSegment, location, onLocation, windowStart, onReset, isDefault }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-3"
    >
      <div className="no-scrollbar overflow-x-auto">
        <SegmentedControl
          value={range}
          onChange={onRange}
          options={[
            { value: "7d", label: "7D" },
            { value: "30d", label: "30D" },
            { value: "90d", label: "90D" },
            { value: "12m", label: "12M" },
          ]}
        />
      </div>

      <div className="no-scrollbar overflow-x-auto">
        <SegmentedControl
          value={segment}
          onChange={onSegment}
          options={[
            { value: "all", label: "All activity" },
            { value: "lost", label: "Lost" },
            { value: "found", label: "Found" },
          ]}
        />
      </div>

      <Select
        icon={<MapPin size={14} />}
        value={location}
        onChange={onLocation}
        options={[{ value: "all", label: "All locations" }, ...LOCATIONS.map((l) => ({ value: l, label: l }))]}
      />

      <AnimatePresence>
        {!isDefault && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, width: 0 }}
            animate={{ opacity: 1, scale: 1, width: "auto" }}
            exit={{ opacity: 0, scale: 0.8, width: 0 }}
            onClick={onReset}
            className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full px-3 py-2 text-[12px] font-semibold text-slate-500 transition-colors hover:bg-slate-900/5 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <RotateCcw size={13} strokeWidth={2.4} />
            Reset
          </motion.button>
        )}
      </AnimatePresence>

      <span className="ml-auto hidden items-center gap-2 text-[12px] font-medium text-slate-400 md:flex dark:text-slate-500">
        <CalendarRange size={14} />
        <span className="tnum">{fmtDateShort(windowStart)} — {fmtDateShort(Date.now())}</span>
      </span>
    </motion.div>
  );
}
