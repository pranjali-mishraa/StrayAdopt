import { useEffect, useState } from "react";
import { useInView } from "./useInView";

export default function AnimatedCounter({ target, suffix = "", duration = 1500 }) {
  const [ref, inView] = useInView();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let start = null;
    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return (
    <span ref={ref} className="font-display text-4xl font-bold text-bark-dark">
      {value}
      {suffix}
    </span>
  );
}