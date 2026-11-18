"use client";

// Lightweight, dependency-free SVG charts tuned to the brand palette.
const INK = "#F3E9D6";
const MUTE = "rgba(243,233,214,0.45)";
const GRID = "rgba(243,233,214,0.10)";

export function Stat({ label, value, delta, suffix }) {
  const up = delta >= 0;
  return (
    <div className="card p-5">
      <div className="text-xs font-semibold uppercase tracking-widest text-cream/50">{label}</div>
      <div className="display mt-1 text-3xl text-cream">
        {value}
        {suffix && <span className="ml-1 text-base text-cream/50">{suffix}</span>}
      </div>
      {delta !== undefined && (
        <div className={`mt-1 text-xs font-semibold ${up ? "text-green-400" : "text-chili"}`}>
          {up ? "▲" : "▼"} {Math.abs(delta)}% vs last period
        </div>
      )}
    </div>
  );
}

export function LineChart({ data, keys = ["visits"], colors = ["#F2792B", "#E23B2E"], height = 220 }) {
  const w = 640;
  const pad = { l: 36, r: 12, t: 12, b: 24 };
  const max = Math.max(...data.flatMap((d) => keys.map((k) => d[k]))) * 1.1;
  const ix = (i) => pad.l + (i * (w - pad.l - pad.r)) / (data.length - 1);
  const iy = (v) => pad.t + (1 - v / max) * (height - pad.t - pad.b);

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" role="img">
      {[0, 0.5, 1].map((g) => (
        <line key={g} x1={pad.l} x2={w - pad.r} y1={pad.t + g * (height - pad.t - pad.b)} y2={pad.t + g * (height - pad.t - pad.b)} stroke={GRID} />
      ))}
      {keys.map((k, ki) => {
        const d = data.map((pt, i) => `${i === 0 ? "M" : "L"} ${ix(i)} ${iy(pt[k])}`).join(" ");
        const area = `${d} L ${ix(data.length - 1)} ${height - pad.b} L ${ix(0)} ${height - pad.b} Z`;
        return (
          <g key={k}>
            <path d={area} fill={colors[ki]} opacity="0.12" />
            <path d={d} fill="none" stroke={colors[ki]} strokeWidth="2.5" strokeLinejoin="round" />
            {data.map((pt, i) => <circle key={i} cx={ix(i)} cy={iy(pt[k])} r="2.5" fill={colors[ki]} />)}
          </g>
        );
      })}
      {data.map((pt, i) => (
        i % 2 === 0 && <text key={i} x={ix(i)} y={height - 6} fill={MUTE} fontSize="10" textAnchor="middle">{pt.label}</text>
      ))}
    </svg>
  );
}

export function BarChart({ data, color = "#E23B2E", height = 200 }) {
  const w = 640;
  const pad = { l: 28, r: 12, t: 12, b: 24 };
  const max = Math.max(...data.map((d) => d.v)) * 1.1;
  const bw = (w - pad.l - pad.r) / data.length;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" role="img">
      {data.map((d, i) => {
        const h = (d.v / max) * (height - pad.t - pad.b);
        const x = pad.l + i * bw;
        const y = height - pad.b - h;
        return (
          <g key={i}>
            <rect x={x + bw * 0.18} y={y} width={bw * 0.64} height={h} rx="4" fill={color} opacity={0.5 + 0.5 * (d.v / max)} />
            <text x={x + bw / 2} y={height - 7} fill={MUTE} fontSize="9" textAnchor="middle">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function HBars({ data, color = "#F2792B" }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-cream/80">{d.label}</span>
            <span className="text-cream/50">{d.value}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full" style={{ width: `${(d.value / max) * 100}%`, background: color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Donut({ data, size = 170 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <g transform={`translate(${size / 2},${size / 2}) rotate(-90)`}>
          {data.map((d, i) => {
            const frac = d.value / total;
            const dash = `${frac * c} ${c}`;
            const el = (
              <circle key={i} r={r} fill="none" stroke={d.color} strokeWidth="16"
                strokeDasharray={dash} strokeDashoffset={-offset * c} />
            );
            offset += frac;
            return el;
          })}
        </g>
        <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fill={INK} fontSize="20" fontWeight="700">{total}</text>
      </svg>
      <div className="space-y-1.5">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
            <span className="text-cream/80">{d.label}</span>
            <span className="text-cream/45">{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
