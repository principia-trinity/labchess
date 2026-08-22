'use client';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function HistoryChart({ entries }: { entries: [string, number, number][] }) {
  const data = entries.map(([date, rank, lp]) => ({ date, rank, lp }));
  const maxRank = Math.max(...data.map((d) => d.rank), 10);
  const chart = (title: string, key: 'lp' | 'rank', color: string, reversed: boolean) => (
    <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-3">
      <h3 className="mb-2 text-xs font-bold text-[var(--text-dim)]">{title}</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid stroke="#232b38" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fill: '#8b93a3', fontSize: 10 }} />
          <YAxis
            tick={{ fill: '#8b93a3', fontSize: 10 }}
            reversed={reversed}
            domain={reversed ? [1, maxRank] : ['auto', 'auto']}
            allowDecimals={false}
          />
          <Tooltip contentStyle={{ background: '#11161f', border: '1px solid #232b38' }} labelStyle={{ color: '#e6e9ef' }} />
          <Line type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {chart('LP over time', 'lp', '#f4c874', false)}
      {chart('Rank over time', 'rank', '#3b82f6', true)}
    </div>
  );
}
