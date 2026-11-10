import React, { useState } from 'react';

// ---------------- 1. Bar Chart ----------------
interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 220,
  valuePrefix = '',
  valueSuffix = '',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-xs text-slate-400">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const chartHeight = height - 40;

  return (
    <div className="w-full flex flex-col justify-end" style={{ height }}>
      <div className="relative flex items-end justify-between gap-2 px-2" style={{ height: chartHeight }}>
        {data.map((item, idx) => {
          const barHeightPct = Math.max(6, (item.value / maxValue) * 100);
          const isHovered = hoveredIdx === idx;
          const barColor = item.color || '#2563EB';

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-10 px-2 py-1 bg-slate-900 text-white text-[11px] font-bold rounded shadow-lg whitespace-nowrap z-20 pointer-events-none">
                  {item.label}: {valuePrefix}{item.value.toLocaleString()}{valueSuffix}
                </div>
              )}

              {/* Bar */}
              <div
                className="w-full max-w-[42px] rounded-t-lg transition-all duration-300"
                style={{
                  height: `${barHeightPct}%`,
                  backgroundColor: barColor,
                  opacity: hoveredIdx !== null && !isHovered ? 0.6 : 1,
                  transform: isHovered ? 'scaleY(1.03)' : 'scaleY(1)',
                  transformOrigin: 'bottom',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between gap-2 mt-2 pt-2 border-t border-slate-100 px-2">
        {data.map((item, idx) => (
          <span
            key={idx}
            className="flex-1 text-center text-[10px] font-semibold text-slate-500 truncate"
            title={item.label}
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
};

// ---------------- 2. Area Line Chart ----------------
interface AreaLineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  valuePrefix?: string;
}

export const AreaLineChart: React.FC<AreaLineChartProps> = ({
  data,
  height = 200,
  color = '#2563EB',
  valuePrefix = '₹',
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: number; label: string } | null>(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-xs text-slate-400">
        No data available
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const minVal = 0;
  const maxVal = Math.max(...values, 100);

  const paddingX = 20;
  const paddingY = 25;
  const svgWidth = 500;
  const svgHeight = height;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - ((d.value - minVal) / (maxVal - minVal)) * (svgHeight - paddingY * 2);
    return { x, y, val: d.value, label: d.label };
  });

  const pathD = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#F1F5F9" strokeDasharray="4 4" />
        <line x1={paddingX} y1={svgHeight / 2} x2={svgWidth - paddingX} y2={svgHeight / 2} stroke="#F1F5F9" strokeDasharray="4 4" />
        <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#E2E8F0" />

        {/* Area fill */}
        <path d={areaD} fill={`url(#gradient-${color})`} />

        {/* Line stroke */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hoveredPoint?.label === p.label ? 6 : 4}
            fill="#FFFFFF"
            stroke={color}
            strokeWidth="2.5"
            className="cursor-pointer transition-all"
            onMouseEnter={() => setHoveredPoint(p)}
            onMouseLeave={() => setHoveredPoint(null)}
          />
        ))}
      </svg>

      {/* Floating Tooltip */}
      {hoveredPoint && (
        <div
          className="absolute pointer-events-none bg-slate-900 text-white text-[11px] px-2.5 py-1 rounded-md shadow-lg font-bold -translate-x-1/2 -translate-y-full mb-2 z-10"
          style={{
            left: `${(hoveredPoint.x / svgWidth) * 100}%`,
            top: `${(hoveredPoint.y / svgHeight) * 100}%`,
          }}
        >
          {hoveredPoint.label}: {valuePrefix}{hoveredPoint.val.toLocaleString()}
        </div>
      )}

      {/* Labels */}
      <div className="flex justify-between px-4 mt-1 text-[10px] font-semibold text-slate-400">
        <span>{data[0]?.label}</span>
        {data.length > 2 && <span>{data[Math.floor(data.length / 2)]?.label}</span>}
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
};

// ---------------- 3. Donut Chart ----------------
interface DonutChartProps {
  data: { label: string; count: number; color: string }[];
  size?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, size = 160 }) => {
  const total = data.reduce((acc, d) => acc + d.count, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-xs text-slate-400">
        No stock records found
      </div>
    );
  }

  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedAngle = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
          {data.map((item, idx) => {
            const strokeDasharray = `${(item.count / total) * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedAngle;
            accumulatedAngle += (item.count / total) * circumference;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 hover:opacity-80"
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">{total}</span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Units</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {data.map((item, idx) => {
          const pct = Math.round((item.count / total) * 100) || 0;
          return (
            <div key={idx} className="flex items-center gap-2.5 text-xs">
              <span className="w-3 h-3 rounded-md shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-600 font-medium">{item.label}</span>
              <span className="font-bold text-slate-900 ml-auto pl-4">{item.count} ({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

