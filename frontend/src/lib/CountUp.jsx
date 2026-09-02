import { useEffect, useRef, useState } from "react";

/**
 * Smoothly counts up to `value`. Preserves prefix/suffix and INR formatting.
 * Uses requestAnimationFrame; runs once per unique value.
 */
export default function CountUp({
  value = 0,
  duration = 1100,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
  format = "en-IN",
  testId,
}) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const fromRef = useRef(0);

  useEffect(() => {
    fromRef.current = display;
    startRef.current = null;
    const from = fromRef.current;
    const to = Number(value) || 0;

    const step = (ts) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const current = from + (to - from) * eased;
      setDisplay(current);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);
  const formatted = decimals > 0
    ? display.toLocaleString(format, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(display).toLocaleString(format);

  return (
    <span data-testid={testId} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
