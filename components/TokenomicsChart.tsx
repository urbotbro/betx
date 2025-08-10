'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

type Datum = { name: string; value: number };

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

  // সব লেবেল ভিতরে রাখার জন্য
  const renderLabel = (props: any) => {
    const RADIAN = Math.PI / 180;
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      percent,
    } = props;

    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#f1f5f9"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={600}
        style={{ paintOrder: 'stroke', stroke: 'rgba(2,6,23,0.7)', strokeWidth: 3 }}
      >
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0];
    const name = p?.name ?? p?.payload?.name;
    const value = p?.value ?? p?.payload?.value;
    const pct = ((value / total) * 100).toFixed(2);
    return (
      <div
        style={{
          background: 'rgba(15,23,42,0.95)',
          color: '#e2e8f0',
          border: '1px solid #1f2937',
          borderRadius: 8,
          padding: '8px 10px',
          fontSize: 12,
        }}
      >
        <div style={{ fontWeight: 700 }}>{name}</div>
        <div>Share: {pct}%</div>
        <div>Units: {value}</div>
      </div>
    );
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          marginTop: 8,
          listStyle: 'none',
          padding: 0,
        }}
      >
        {payload.map((entry: any, i: number) => (
          <li key={`legend-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: entry.color,
              }}
            />
            <span style={{ color: '#cbd5e1', fontSize: 12 }}>{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            stroke="rgba(2,6,23,0.6)"
            strokeWidth={2}
            labelLine={false}
            label={renderLabel}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>

          {/* একদম সেন্টারে টোটাল */}
          <text
            x="50%"
            y="39%"
            textAnchor="middle"
            fontSize={12}
            fill="#94a3b8"
          >
            Total
          </text>
          <text
            x="50%"
            y="47%"
            textAnchor="middle"
            fontSize={20}
            fontWeight={700}
            fill="#f1f5f9"
            style={{ paintOrder: 'stroke', stroke: 'rgba(2,6,23,0.7)', strokeWidth: 3 }}
          >
            {total}
          </text>

          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" align="center" content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
