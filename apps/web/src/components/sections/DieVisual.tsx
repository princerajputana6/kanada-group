/**
 * Stylised silicon die: a packaged chip with functional blocks and routing
 * traces that carry slow pulses of light. Pure SVG + CSS — crisp at any
 * size, no WebGL, and the pulses stop under reduced motion.
 */

const PADS_PER_SIDE = 12;
const pads = Array.from({ length: PADS_PER_SIDE }, (_, i) => 78 + i * 29);

// Traces from blocks out to the pad ring: [path, colour, delay seconds]
const TRACES: [string, string, number][] = [
  ["M175 150 V60 H165", "#67c9d6", 0],
  ["M205 150 V92 H310 V60", "#22D3EE", 1.2],
  ["M330 140 H420", "#67c9d6", 2.1],
  ["M330 200 H370 V250 H420", "#22D3EE", 0.6],
  ["M135 330 V420", "#67c9d6", 1.6],
  ["M240 360 V395 H278 V420", "#FDBA3B", 2.8],
  ["M340 330 V420", "#67c9d6", 3.4],
  ["M110 215 H60", "#22D3EE", 2.4],
  ["M110 180 H88 V120 H60", "#67c9d6", 0.9],
  ["M250 230 V270", "#2ba3b4", 1.9],
  ["M190 230 V250 H150 V270", "#2ba3b4", 3.0],
];

function Block({
  x,
  y,
  w,
  h,
  label,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="6" fill="url(#block)" stroke="rgba(103, 201, 214,0.35)" />
      {children}
      <text
        x={x + 10}
        y={y + 18}
        fill="rgba(255,255,255,0.72)"
        fontSize="10"
        fontFamily="ui-monospace, SFMono-Regular, monospace"
        letterSpacing="0.12em"
      >
        {label}
      </text>
    </g>
  );
}

export function DieVisual({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 480"
      className={className}
      role="img"
      aria-label="Illustration of a silicon chip die with logic, memory and analog blocks"
    >
      <defs>
        <linearGradient id="die" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#16121f" />
          <stop offset="1" stopColor="#0a0a0d" />
        </linearGradient>
        <linearGradient id="block" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgba(43, 163, 180,0.18)" />
          <stop offset="1" stopColor="rgba(43, 163, 180,0.03)" />
        </linearGradient>
        <radialGradient id="core-glow">
          <stop offset="0" stopColor="rgba(43, 163, 180,0.55)" />
          <stop offset="1" stopColor="rgba(43, 163, 180,0)" />
        </radialGradient>
        <pattern id="sram" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="5" height="5" x="1.5" y="1.5" rx="1" fill="rgba(34,211,238,0.22)" />
        </pattern>
        <pattern id="stdcell" width="12" height="6" patternUnits="userSpaceOnUse">
          <rect width="10" height="3" x="1" y="1.5" fill="rgba(103, 201, 214,0.14)" />
        </pattern>
      </defs>

      {/* Package + pad ring */}
      <rect x="20" y="20" width="440" height="440" rx="28" fill="#0a0a0d" stroke="rgba(255,255,255,0.1)" />
      {pads.map((p) => (
        <g key={p} fill="rgba(255,255,255,0.14)">
          <rect x={p - 5} y="34" width="10" height="18" rx="2" />
          <rect x={p - 5} y="428" width="10" height="18" rx="2" />
          <rect x="34" y={p - 5} width="18" height="10" rx="2" />
          <rect x="428" y={p - 5} width="18" height="10" rx="2" />
        </g>
      ))}

      {/* Die */}
      <rect x="60" y="60" width="360" height="360" rx="14" fill="url(#die)" stroke="rgba(43, 163, 180,0.45)" />
      <circle cx="220" cy="190" r="150" fill="url(#core-glow)" />

      {/* Static routing underlay */}
      <g fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1.5">
        {TRACES.map(([d], i) => (
          <path key={i} d={d} />
        ))}
      </g>

      {/* Functional blocks */}
      <Block x={110} y={150} w={220} h={80} label="CPU CORE">
        <rect x={120} y={172} width={200} height={50} fill="url(#stdcell)" />
      </Block>
      <Block x={110} y={270} w={80} h={60} label="PLL">
        <circle cx={150} cy={308} r={12} fill="none" stroke="rgba(253,186,59,0.55)" />
      </Block>
      <Block x={205} y={270} w={70} h={90} label="SRAM">
        <rect x={213} y={286} width={54} height={66} fill="url(#sram)" />
      </Block>
      <Block x={290} y={270} w={80} h={60} label="ADC">
        <path d="M300 318 l8 -10 l8 6 l8 -12 l8 8 l8 -4 l10 -6" fill="none" stroke="rgba(34,211,238,0.6)" strokeWidth="1.5" />
      </Block>

      {/* Light pulses */}
      <g fill="none" strokeWidth="2" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 4px rgba(103, 201, 214,0.9))" }}>
        {TRACES.map(([d, color, delay], i) => (
          <path
            key={i}
            d={d}
            stroke={color}
            className="animate-trace"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </g>

      {/* Die marking */}
      <text
        x="400"
        y="405"
        textAnchor="end"
        fill="rgba(255,255,255,0.32)"
        fontSize="9"
        fontFamily="ui-monospace, SFMono-Regular, monospace"
        letterSpacing="0.2em"
      >
        KG·VLSI·01
      </text>
    </svg>
  );
}
