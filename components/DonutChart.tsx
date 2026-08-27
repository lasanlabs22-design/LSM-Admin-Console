'use client';

import { useState } from 'react';

type Slice = {
  label: string;
  value: number;
  color: string;
};

type ComputedSlice = Slice & {
  length: number;
  offset: number;
  fraction: number;
};

export default function DonutChart({
  data,
  size = 190,
  thickness = 22,
}: {
  data: Slice[];
  size?: number;
  thickness?: number;
}) {
  const [active, setActive] = useState<number | null>(null);

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  // Walk round the circle, tracking where each slice starts
  const slices: ComputedSlice[] = [];
  let offset = 0;

  for (const d of data) {
    const fraction = total ? d.value / total : 0;
    const length = fraction * circumference;
    slices.push({ ...d, length, offset, fraction });
    offset += length;
  }

  const shown = active !== null ? data[active] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-7">
      {/* The ring */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--line)"
            strokeWidth={thickness}
          />

          {slices.map((s, i) => (
            <circle
              key={s.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={active === i ? thickness + 4 : thickness}
              strokeDasharray={`${s.length} ${circumference - s.length}`}
              strokeDashoffset={-s.offset}
              strokeLinecap="butt"
              className="arc cursor-pointer transition-all duration-200"
              style={
                {
                  '--circ': circumference,
                  animationDelay: `${i * 0.09}s`,
                  opacity: active === null || active === i ? 1 : 0.28,
                } as React.CSSProperties
              }
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            />
          ))}
        </svg>

        {/* Centre readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div
            className="t-num font-semibold transition-all duration-200"
            style={{
              fontSize: shown ? 30 : 34,
              color: shown ? shown.color : 'var(--text)',
            }}
          >
            {shown ? shown.value : total}
          </div>
          <div
            className="t-label mt-1 transition-colors"
            style={{ fontSize: 9.5 }}
          >
            {shown ? shown.label : 'Total'}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 w-full space-y-1">
        {slices.map((s, i) => (
          <button
            key={s.label}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition text-left"
            style={{
              background: active === i ? 'var(--surface-hover)' : 'transparent',
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: s.color }}
            />
            <span className="text-[13px] font-medium flex-1">{s.label}</span>
            <span className="t-num text-[13px] font-semibold">{s.value}</span>
            <span
              className="t-num text-[11px] w-11 text-right"
              style={{ color: 'var(--text-faint)' }}
            >
              {total ? Math.round(s.fraction * 100) : 0}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
