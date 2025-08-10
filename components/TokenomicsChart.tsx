'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

type Datum = { name: string; value: number };

/** Tooltip props (ভার্সন ডিফারেন্স হ্যান্ডেল করতে লাইটওয়েট টাইপ) */
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

/** Pie label props (সবগুলো optional, যাতে টাইপ মিসম্যাচ না হয়) */
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

  /** স্লাইসের ভিতরে পারসেন্টেজ লেবেল */
  const renderLabel = ({
    cx = 0,
    cy = 0,
    midAngle = 0,
    innerRadius = 0,
    outerRadius = 0,
    percent = 0,
  }: LabelRenderProps) => {
    const RAD = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + r * Math.cos(-midAngle * RAD);
    const y = cy + r * Math.sin(-midAngle * RAD);

    return (
      <text
        x={x}
        y={y}
        fill="#e5e7eb"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={700}
        style={{
          paintOrder: 'stroke',
          stroke: 'rgba(2,6,23,0.8)',
          strokeWidth: 3,
        }}
      >
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  /** কাস্টম টুলটিপ (টাইপ-সেফ, any ব্যবহার করা হয়নি) */
  const CustomTooltip: React.FC<TooltipPropsLite> = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;

    const p = payload[0];
    const name = p.name ?? p.payload?.name ?? '';
    const valueNum =
      typeof p.value === 'number'
        ? p.value
        : Number(p.value ?? p.payload?.value ?? 0);
    const pct = total > 0 ? ((valueNum / total) * 100).toFixed(2) : '0.00';

    return (
      <div
        style={{
          background: 'rgba(15,23,42,0.96)',
          color: '#e2e8f0',
          border: '1px solid #1f2937',
          borderRadius: 10,
          padding: '8px 10px',
          fontSize: 12,
        }}
      >
        <div style={{ fontWeight: 800, marginBottom: 2 }}>{name}</div>
        <div>
          Share: <strong>{pct}%</strong>
        </div>
        <div>
          Units: <strong>{valueNum}</strong>
        </div>
      </div>
    );
  };

  /** কাস্টম লেজেন্ড (Legend.content টাইপ ঝামেলা পুরোপুরি এড়াতে) */
  const CustomLegend: React.FC = () => {
    return (
      <ul
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          marginTop: 12,
          listStyle: 'none',
          padding: 0,
          justifyContent: 'center',
        }}
      >
        {data.map((d, i) => (
          <li
            key={`legend-${i}`}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: colors[i % colors.length] || '#64748b',
              }}
            />
            <span style={{ color: '#cbd5e1', fontSize: 12 }}>{d.name}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={62}
            outerRadius={96}
            startAngle={90}
            endAngle={-270}
            minAngle={8}
            stroke="rgba(2,6,23,0.6)"
            strokeWidth={2}
            labelLine={false}
            label={renderLabel}
            isAnimationActive={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length] || '#64748b'} />
            ))}
          </Pie>

          {/* Center total (পারফেক্ট সেন্টার) */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={22}
            fontWeight={800}
            fill="#f1f5f9"
            style={{
              paintOrder: 'stroke',
              stroke: 'rgba(2,6,23,0.85)',
              strokeWidth: 4,
            }}
          >
            {total}
          </text>
          <text
            x="50%"
            y="50%"
            dy={-20}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fontWeight={600}
            fill="#94a3b8"
          >
            Total
          </text>

          <Tooltip content={<CustomTooltip />} />
          {/* Recharts Legend বাদ; আমরা নিজেই লেজেন্ড রেন্ডার করবো */}
        </PieChart>
      </ResponsiveContainer>

      {/* কাস্টম লেজেন্ড */}
      <CustomLegend />
    </div>
  );
}
