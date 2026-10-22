import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

export function useTweenedSeries(target, duration = 0.8) {
  const [display, setDisplay] = useState(target);
  const displayRef = useRef(target);
  const first = useRef(true);

  useEffect(() => {
    const from = displayRef.current;
    const sample = (arr, n) => {
      if (arr.length === n) return arr.slice();
      if (arr.length === 0) return new Array(n).fill(0);
      const out = [];
      for (let i = 0; i < n; i++) {
        const x = (i / Math.max(1, n - 1)) * (arr.length - 1);
        const lo = Math.floor(x);
        const hi = Math.min(arr.length - 1, lo + 1);
        out.push(arr[lo] + (arr[hi] - arr[lo]) * (x - lo));
      }
      return out;
    };
    const a = sample(from, target.length);
    const b = target;
    const controls = animate(0, 1, {
      duration: first.current ? duration * 1.15 : duration,
      ease: [0.22, 0.9, 0.28, 1],
      onUpdate: (t) => {
        const next = a.map((v, i) => v + (b[i] - v) * t);
        displayRef.current = next;
        setDisplay(next);
      },
    });
    first.current = false;
    return () => controls.stop();
  }, [target.join(","), duration]);

  return display;
}

export function useCountUp(target, duration = 0.9) {
  const [display, setDisplay] = useState(target);
  const ref = useRef(target);
  useEffect(() => {
    const controls = animate(ref.current, target, {
      duration,
      ease: [0.25, 0.8, 0.3, 1],
      onUpdate: (v) => {
        ref.current = v;
        setDisplay(v);
      },
    });
    return () => controls.stop();
  }, [target, duration]);
  return display;
}
