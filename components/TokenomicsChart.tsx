'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Sector,
} from 'recharts';

type Datum = { name: string; value: number };

type TooltipPayloadItem = {
  name?: string;
  value?: number | string;
  payload?: Datum;
  color?: string;
};
type TooltipPropsLite = {
  active?: boolean;
  payload?: ReadonlyArray<TooltipPayloadItem>;
};

type LabelRenderProps = {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
};

export default function TokenomicsChart({
  data,
  colors = [],
}: {
  data: Datum[];
  colors?: string[];
}) {
  const total = React.useMemo(
    () => data.reduce((s, d) => s + d.value, 0),
    [data]
  );

  const withPct = React.useMemo(
    () => data.map(d => ({ ...d, pct: total ? (d.value / total) * 100 : 0 })),
    [data, total]
  );

  // container width ট্র্যাক
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const [wrapW, setWrapW] = React.useState(800);
  React.useEffect(() => {
    const read = () => wrapRef.current && setWrapW(wrapRef.current.clientWidth);
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, []);

  // চার্টের height: মোবাইলে বেশি, ডেক্সটপে সীমাবদ্ধ (ওভারল্যাপ এড়াতে)
  const chartH = React.useMemo(() => {
    const h = Math.round(wrapW * 0.6);          // বেস
    return Math.max(260, Math.min(360, h));     // 260–360px রেঞ্জ
  }, [wrapW]);

  // ডোনাট রেডিয়াস: height-ভিত্তিক, তাই কখনো কাটা যাবে না
  const outerR = Math.round(chartH * 0.38);     // ~ 99–136
  const innerR = Math.max(48, outerR - 34);

  // হোভার স্টেট
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const onEnter = (_: unknown, idx: number) => setActiveIndex(idx);
  const onLeave = () => setActiveIndex(null);

  const renderActiveShape = (props: any) => {
    const {
      cx, cy, innerRadius, outerRadius,
      startAngle, endAngle, fill, payload, percent, value,
    } = props;
    return (
      <g>
        <Sector
          cx={cx} cy={cy}
          innerRadius={innerRadius + 2}
          outerRadius={outerRadius + 8}
          startAngle={startAngle} endAngle={endAngle}
          fill={fill} opacity={0.18}
        />
        <Sector
          cx={cx} cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 4}
          startAngle={startAngle} endAngle={endAngle}
          fill={fill}
        />
        <text
          x={cx} y={cy} dy={-6} textAnchor="middle"
          fill="#e5e7eb" fontSize={12} fontWeight={800}
          style={{ paintOrder: 'stroke', stroke: 'rgba(2,6,23,0.85)', strokeWidth: 3 }}
        >
          {(percent * 100).toFixed(0)}%
        </text>
        <text x={cx} y={cy} dy={12} textAnchor="middle" fill="#cbd5e1" fontSize={11}>
          {payload?.name ?? ''} • {value}
        </text>
      </g>
    );
  };

  const renderLabel = ({
    cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0,
  }: LabelRenderProps) => {
    const RAD = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + r * Math.cos(-midAngle * RAD);
    const y = cy + r * Math.sin(-midAngle * RAD);
    return (
      <text
        x={x} y={y} fill="#e5e7eb" textAnchor="middle" dominantBaseline="central"
        fontSize={11} fontWeight={700}
        style={{ paintOrder: 'stroke', stroke: 'rgba(2,6,23,0.8)', strokeWidth: 3 }}
      >
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  const CustomTooltip: React.FC<TooltipPropsLite> = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;
    const p = payload[0];
    const name = p.name ?? p.payload?.name ?? '';
    const valueNum = typeof p.value === 'number' ? p.value : Number(p.value ?? p.payload?.value ?? 0);
    const pct = total ? ((valueNum / total) * 100).toFixed(2) : '0.00';
    return (
      <div
        style={{
          background: 'rgba(15,23,42,0.96)',
          color: '#e2e8f0',
          border: '1px solid #1f2937',
          borderRadius: 12,
          padding: '8px 10px',
          fontSize: 12,
          boxShadow: '0 8px 24px rgba(2,6,23,0.45)',
        }}
      >
        <div style={{ fontWeight: 800, marginBottom: 2 }}>{name}</div>
        <div>Share: <strong>{pct}%</strong></div>
        <div>Units: <strong>{valueNum}</strong></div>
      </div>
    );
  };

  // লেজেন্ড: রেস্পন্সিভ ১/২ কলাম
  const [twoCol, setTwoCol] = React.useState(false);
  React.useEffect(() => {
    const check = () => setTwoCol(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const CustomLegend: React.FC = () => (
    <ul
      style={{
        display: 'grid',
        gridTemplateColumns: twoCol ? 'repeat(2, minmax(0,1fr))' : '1fr',
        gap: 12,
        marginTop: 14,
        listStyle: 'none',
        padding: 0,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {withPct.map((d, i) => {
        const color = colors[i % colors.length] || '#64748b';
        return (
          <li key={`legend-${i}`} style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
              <span
                title={d.name}
                style={{
                  color: '#e2e8f0', fontSize: 12, fontWeight: 600,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
              >
                {d.name}
              </span>
              <span style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: 12 }}>
                {d.pct.toFixed(1)}%
              </span>
            </div>
            <div
              style={{
                height: 6, borderRadius: 999, background: 'rgba(148,163,184,0.18)',
                marginTop: 6, overflow: 'hidden',
              }}
            >
              <div style={{ height: '100%', width: `${d.pct}%`, background: color, opacity: 0.9 }} />
            </div>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div
      ref={wrapRef}
      style={{
        width: '100%',
        overflow: 'hidden',       // বাইরে কিছু যেন না যায়
        paddingTop: 6,            // শিরোনাম থেকে একটু গ্যাপ
      }}
    >
      <ResponsiveContainer width="100%" height={chartH}>
        <PieChart margin={{ top: 6, right: 4, bottom: 4, left: 4 }}>
          <defs>
            <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feOffset dx="0" dy="0" />
              <feGaussianBlur stdDeviation="3" result="offset-blur" />
              <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
              <feFlood floodColor="rgba(2,6,23,0.65)" floodOpacity="1" result="color" />
              <feComposite operator="in" in="color" in2="inverse" result="shadow" />
              <feComposite operator="over" in="shadow" in2="SourceGraphic" />
            </filter>
          </defs>

          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="58%"                 // একটু নিচে বসাই, যেন টপে কাটা না পড়ে
            innerRadius={innerR}
            outerRadius={outerR}
            startAngle={90}
            endAngle={-270}          // ফুল 360°
            minAngle={6}
            stroke="rgba(2,6,23,0.45)"
            strokeWidth={2}
            labelLine={false}
            label={activeIndex === null ? renderLabel : undefined}
            isAnimationActive={false}
            activeIndex={activeIndex ?? undefined}
            activeShape={renderActiveShape}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            filter="url(#innerShadow)"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length] || '#64748b'} />
            ))}
          </Pie>

          {/* Center text */}
          <text
            x="50%" y="50%" dy={-10} textAnchor="middle" dominantBaseline="central"
            fontSize={12} fontWeight={700} fill="#94a3b8"
          >
            Total
          </text>
          <text
            x="50%" y="50%" dy={14} textAnchor="middle" dominantBaseline="central"
            fontSize={24} fontWeight={900} fill="#f1f5f9"
            style={{ paintOrder: 'stroke', stroke: 'rgba(2,6,23,0.85)', strokeWidth: 4 }}
          >
            {total}
          </text>

          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* চার্টের নিচে লেজেন্ড */}
      <div style={{ padding: '0 2px 8px' }}>
        <CustomLegend />
      </div>
    </div>
  );
}
