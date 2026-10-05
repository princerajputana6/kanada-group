"use client";

import { motion } from "framer-motion";

/**
 * Decorative animated IC die — gradient traces with pulsing signal dots that
 * travel along the wires. Pure SVG + framer; infinite/loop animations only, so
 * a paused frame is harmless (never gates content visibility).
 */
export function ChipIllustration({ className }: { className?: string }) {
  const traces = [
    "M20 60 H80 V40 H140",
    "M20 100 H60 V140 H140",
    "M280 60 H220 V40 H160",
    "M280 100 H240 V140 H160",
    "M20 140 H90 V100 H140",
    "M280 140 H210 V60 H160",
  ];

  return (
    <div className={className}>
      <svg viewBox="0 0 300 200" className="h-full w-full" fill="none">
        <defs>
          <linearGradient id="chipIllGrad" x1="0" y1="0" x2="300" y2="200" gradientUnits="userSpaceOnUse">
            <stop stopColor="#67c9d6" />
            <stop offset="0.5" stopColor="#2ba3b4" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
          <filter id="chipGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* traces */}
        <g stroke="url(#chipIllGrad)" strokeWidth="1.5" strokeOpacity="0.4">
          {traces.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {/* travelling signal dots */}
        {traces.map((d, i) => (
          <motion.circle
            key={`dot-${i}`}
            r="2.5"
            fill="#22d3ee"
            filter="url(#chipGlow)"
            initial={{ offsetDistance: "0%" }}
            animate={{ offsetDistance: "100%" }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "linear", delay: i * 0.4 }}
            style={{ offsetPath: `path("${d}")` } as React.CSSProperties}
          />
        ))}

        {/* pin pads */}
        <g fill="url(#chipIllGrad)" fillOpacity="0.6">
          {[60, 100, 140].map((y) => (
            <rect key={`l${y}`} x="14" y={y - 3} width="6" height="6" rx="1" />
          ))}
          {[60, 100, 140].map((y) => (
            <rect key={`r${y}`} x="280" y={y - 3} width="6" height="6" rx="1" />
          ))}
        </g>

        {/* die */}
        <rect
          x="120"
          y="60"
          width="60"
          height="80"
          rx="10"
          fill="url(#chipIllGrad)"
          fillOpacity="0.12"
          stroke="url(#chipIllGrad)"
          strokeWidth="2"
        />
        {/* die inner grid */}
        <g stroke="url(#chipIllGrad)" strokeWidth="1" strokeOpacity="0.35">
          <line x1="135" y1="60" x2="135" y2="140" />
          <line x1="150" y1="60" x2="150" y2="140" />
          <line x1="165" y1="60" x2="165" y2="140" />
          <line x1="120" y1="80" x2="180" y2="80" />
          <line x1="120" y1="100" x2="180" y2="100" />
          <line x1="120" y1="120" x2="180" y2="120" />
        </g>
        <motion.rect
          x="142"
          y="92"
          width="16"
          height="16"
          rx="3"
          fill="url(#chipIllGrad)"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}
