"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/**
 * Cursor-following champagne spotlight (Aceternity pattern).
 * Renders its own absolute inset-0 layer — place inside a relative container.
 */
export default function Spotlight({ className = "" }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const x = useSpring(mx, { stiffness: 90, damping: 20, mass: 0.4 });
  const y = useSpring(my, { stiffness: 90, damping: 20, mass: 0.4 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      mx.set(e.clientX - r.left);
      my.set(e.clientY - r.top);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* Static ambient glow so the panel reads premium before any mouse move. */}
      <div
        className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full opacity-70"
        style={{
          background:
            "radial-gradient(circle, rgba(212,175,55,0.10) 0%, rgba(212,175,55,0.03) 45%, transparent 70%)",
        }}
      />
      <motion.div
        className="absolute h-[560px] w-[560px] rounded-full"
        style={{
          left: x,
          top: y,
          translateX: "-50%",
          translateY: "-50%",
          background:
            "radial-gradient(circle, rgba(212,175,55,0.16) 0%, rgba(212,175,55,0.05) 45%, transparent 70%)",
        }}
      />
    </div>
  );
}
