import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

export function useTweenedSeries(target, duration = 0.8) {
  const safeTarget = Array.isArray(target) ? target : [];
  const targetKey = safeTarget.join(",");
  const [display, setDisplay] = useState(safeTarget);
  const displayRef = useRef(safeTarget);
  const prevKeyRef = useRef(targetKey);

  useEffect(() => {
    if (!Array.isArray(target) || target.length === 0) {
      setDisplay([]);
      return;
    }

    if (prevKeyRef.current === targetKey && displayRef.current.length === target.length) {
      return;
    }
    prevKeyRef.current = targetKey;

    const from = displayRef.current && displayRef.current.length === target.length
      ? displayRef.current
      : target;

    const a = from;
    const b = target;

    const controls = animate(0, 1, {
      duration,
      ease: [0.22, 0.9, 0.28, 1],
      onUpdate: (t) => {
        const next = a.map((v, i) => v + ((b[i] ?? v) - v) * t);
        displayRef.current = next;
        setDisplay(next);
      },
    });

    return () => controls.stop();
  }, [targetKey, duration]);

  return Array.isArray(display) && display.length ? display : safeTarget;
}

export function useCountUp(target = 0, duration = 0.9) {
  const safeTarget = typeof target === "number" && !isNaN(target) ? target : 0;
  const [display, setDisplay] = useState(safeTarget);
  const ref = useRef(safeTarget);
  const prevTargetRef = useRef(safeTarget);

  useEffect(() => {
    const val = typeof target === "number" && !isNaN(target) ? target : 0;
    if (prevTargetRef.current === val && ref.current === val) return;
    prevTargetRef.current = val;

    const current = typeof ref.current === "number" && !isNaN(ref.current) ? ref.current : 0;
    const controls = animate(current, val, {
      duration,
      ease: [0.25, 0.8, 0.3, 1],
      onUpdate: (v) => {
        const safeV = typeof v === "number" && !isNaN(v) ? v : 0;
        ref.current = safeV;
        setDisplay(safeV);
      },
    });
    return () => controls.stop();
  }, [target, duration]);

  return typeof display === "number" && !isNaN(display) ? display : 0;
}
