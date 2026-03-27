"use client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { VitalTrendPoint } from "@/types";
import { useTheme } from "@/lib/ThemeContext";

interface Props { data: VitalTrendPoint[] }

const LINES = [
  { key: "HR",    color: "#f87171", label: "HR (bpm)"    },
  { key: "O2Sat", color: "#34d399", label: "O₂Sat (%)"   },
  { key: "Resp",  color: "#60a5fa", label: "Resp (b/min)" },
  { key: "SBP",   color: "#a78bfa", label: "SBP (mmHg)"  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-gray-500 dark:text-gray-400 mb-2 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}</span>
          <span className="font-mono font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function VitalTrendChart({ data }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const gridColor  = isDark ? "#1f2937" : "#e5e7eb";
  const tickColor  = isDark ? "#6b7280" : "#9ca3af";
  const legendColor = isDark ? "#9ca3af" : "#6b7280";

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 transition-colors duration-200">
      <h3 className="text-gray-900 dark:text-white font-semibold mb-4">Vital Signs Trend (Last 60 min)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="time" tick={{ fill: tickColor, fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: tickColor, fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            formatter={(v) => <span style={{ color: legendColor }}>{v}</span>}
          />
          {LINES.map(({ key, color, label }) => (
            <Line key={key} type="monotone" dataKey={key} name={label}
              stroke={color} strokeWidth={2} dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
