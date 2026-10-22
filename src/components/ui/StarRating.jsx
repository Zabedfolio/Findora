"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Star } from "lucide-react";

const FILLED = "fill-amber-400 text-amber-400";
const EMPTY = "fill-transparent text-zinc-300";

export default function StarRating({
    value = 0,
    onChange,
    max = 5,
    size = 24,
    readOnly = false,
    showValue = false,
    count,
    className = "",
}) {
    const reduce = useReducedMotion();
    const [hover, setHover] = useState(0);

    const interactive = !readOnly && typeof onChange === "function";
    const active = interactive && hover ? hover : value;

    const stars = Array.from({ length: max }, (_, i) => i + 1);

    function handleKeyDown(e) {
        if (!interactive) return;
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            onChange(Math.min(max, (value || 0) + 1));
        } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            onChange(Math.max(1, (value || 1) - 1));
        }
    }

    return (
        <div className={`inline-flex items-center gap-2 ${className}`}>
            {interactive ? (
                // Interactive picker: whole stars only
                <div
                    role="radiogroup"
                    aria-label="Rating"
                    className="flex items-center gap-1"
                    onMouseLeave={() => setHover(0)}
                    onKeyDown={handleKeyDown}
                >
                    {stars.map((n) => {
                        const isFilled = n <= active;
                        return (
                            <motion.button
                                key={n}
                                type="button"
                                role="radio"
                                aria-checked={value === n}
                                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                                onMouseEnter={() => setHover(n)}
                                onClick={() => onChange(n)}
                                whileHover={reduce ? undefined : { scale: 1.2 }}
                                whileTap={reduce ? undefined : { scale: 0.85 }}
                                className="rounded-md p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
                            >
                                <motion.span
                                    className="block"
                                    animate={
                                        reduce
                                            ? undefined
                                            : { scale: isFilled ? [1, 1.3, 1] : 1 }
                                    }
                                    transition={{ duration: 0.3 }}
                                >
                                    <Star
                                        size={size}
                                        className={`transition-colors duration-150 ${isFilled ? FILLED : EMPTY
                                            }`}
                                    />
                                </motion.span>
                            </motion.button>
                        );
                    })}
                </div>
            ) : (
                // Display mode: supports decimals like 3.5 or 4.2
                <div
                    className="flex items-center gap-0.5"
                    role="img"
                    aria-label={`Rated ${value} out of ${max}`}
                >
                    {stars.map((n, i) => {
                        const pct = Math.max(0, Math.min(1, value - i)) * 100;
                        return (
                            <span
                                key={n}
                                className="relative inline-block"
                                style={{ width: size, height: size }}
                            >
                                <Star size={size} className={`absolute inset-0 ${EMPTY}`} />
                                <motion.span
                                    className="absolute inset-0 overflow-hidden"
                                    initial={reduce ? false : { width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
                                >
                                    <Star size={size} className={`max-w-none shrink-0 ${FILLED}`} />
                                </motion.span>
                            </span>
                        );
                    })}
                </div>
            )}

            {showValue && (
                <span className="text-sm font-semibold text-zinc-800">
                    {Number(value).toFixed(1)}
                    {typeof count === "number" && (
                        <span className="ml-1 font-normal text-zinc-500">({count})</span>
                    )}
                </span>
            )}
        </div>
    );
}