'use client';

import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const DONUT_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  entered: '#337dff',
  reviewed: '#8b5cf6',
  approved: '#10b981',
  rejected: '#ef4444',
};

export function OrdersTrendChart({ data }: { data: { date: string; count: number }[] }) {
  const pretty = data.map((d) => ({ ...d, label: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }) }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={pretty} margin={{ left: -20, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#337dff" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#337dff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#8892a0' }} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#8892a0' }} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
        />
        <Area
          type="monotone"
          dataKey="count"
          name="Orders"
          stroke="#337dff"
          strokeWidth={2.5}
          fill="url(#ordersGrad)"
          animationDuration={900}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ResultsDonut({ data }: { data: { status: string; count: number }[] }) {
  if (data.length === 0) {
    return <div className="grid h-[240px] place-items-center text-sm text-ink-800/40">No results yet</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          innerRadius={58}
          outerRadius={90}
          paddingAngle={3}
          animationDuration={900}
        >
          {data.map((entry) => (
            <Cell key={entry.status} fill={DONUT_COLORS[entry.status] ?? '#94a3b8'} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
