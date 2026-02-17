"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedNumber({
  value,
  duration = 500,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const fromValueRef = useRef(value);

  useEffect(() => {
    const startValue = fromValueRef.current;
    const delta = value - startValue;

    if (delta === 0) return;

    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(startValue + delta * eased);

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      } else {
        fromValueRef.current = value;
      }
    };

    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
