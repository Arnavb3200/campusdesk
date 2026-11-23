import { useId } from 'react';
import { cn } from '@/lib/utils';

/** Donut chart showing a percentage with an optional target tick. */
export function Donut({
  value,
  size = 120,
  stroke = 12,
  color = '#14b8a6',
  track = '#e9eef5',
  targetPct,
  label,
  sublabel,
}: {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  targetPct?: number;
  label?: string;
  sublabel?: string;
}) {
  const id = useId();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(Math.max(value, 0), 100);
  const dash = (clamped / 100) * c;
  const tickAngle = targetPct != null ? (targetPct / 100) * 2 * Math.PI : null;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          className="transition-[stroke-dasharray] duration-700 ease-out"
        />
        {tickAngle != null && (
          <line
            x1={size / 2 + r * Math.cos(tickAngle)}
            y1={size / 2 + r * Math.sin(tickAngle)}
            x2={size / 2 + (r + stroke * 0.9) * Math.cos(tickAngle)}
            y2={size / 2 + (r + stroke * 0.9) * Math.sin(tickAngle)}
            stroke="#1c2533"
            strokeWidth={2}
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold tracking-tight text-ink-900" id={`donut-${id}`}>
          {label ?? `${Math.round(value)}%`}
        </span>
        {sublabel && <span className="text-[10px] font-medium text-ink-400">{sublabel}</span>}
      </div>
    </div>
  );
}

/** Vertical bar chart with hover tooltips. */
export function BarChart({
  data,
  height = 160,
}: {
  data: { label: string; value: number; color?: string }[];
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="w-full">
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d, i) => (
          <div key={d.label + i} className="group relative flex h-full flex-1 flex-col justify-end">
            <div
              className={cn(
                'w-full rounded-t-md transition-all duration-500 ease-out group-hover:opacity-80',
                d.color ?? 'bg-teal-500',
              )}
              style={{ height: `${(d.value / max) * 100}%` }}
            />
            <div className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink-950 px-2 py-0.5 text-[10px] font-semibold text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              {d.value}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        {data.map((d, i) => (
          <span key={d.label + i} className="flex-1 truncate text-center text-[10px] font-medium text-ink-400">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Smooth area line chart with gradient fill and hover dots. */
export function AreaChart({
  series,
  labels,
  height = 180,
  color = '#0f766e',
}: {
  series: number[];
  labels: string[];
  height?: number;
  color?: string;
}) {
  const id = useId();
  const w = 560;
  const h = height;
  const pad = { top: 12, right: 8, bottom: 24, left: 8 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;
  const max = Math.max(...series, 100);
  const min = Math.min(...series, 0);

  const pts = series.map((v, i) => {
    const x = pad.left + (i / (series.length - 1)) * innerW;
    const y = pad.top + innerH - ((v - min) / (max - min || 1)) * innerH;
    return { x, y, v };
  });

  // Catmull-Rom -> bezier for smooth curve
  let path = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  const areaPath = `${path} L ${pts[pts.length - 1].x} ${pad.top + innerH} L ${pts[0].x} ${pad.top + innerH} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Attendance trend">
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={pad.left}
          x2={w - pad.right}
          y1={pad.top + innerH * f}
          y2={pad.top + innerH * f}
          stroke="#e9eef5"
          strokeDasharray="3 4"
        />
      ))}
      <line
        x1={pad.left}
        x2={w - pad.right}
        y1={pad.top + innerH * 0.25}
        y2={pad.top + innerH * 0.25}
        stroke="transparent"
      />
      <path d={areaPath} fill={`url(#grad-${id})`} />
      <path d={path} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={8} fill="transparent" className="cursor-pointer">
            <title>{`${labels[i]}: ${series[i]}%`}</title>
          </circle>
          <circle cx={p.x} cy={p.y} r={3} fill="white" stroke={color} strokeWidth={2} />
        </g>
      ))}
      {labels.map((l, i) => (
        <text
          key={l + i}
          x={pts[i].x}
          y={h - 6}
          textAnchor="middle"
          className="fill-ink-400"
          fontSize={10}
          fontWeight={500}
        >
          {l}
        </text>
      ))}
    </svg>
  );
}
