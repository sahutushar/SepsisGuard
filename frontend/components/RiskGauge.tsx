"use client";
import { PredictionResult } from "@/types";
import { AlertTriangle, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";

interface Props {
  result: PredictionResult;
}

const CONFIG = {
  Low:    { color: "emerald", icon: CheckCircle,   bg: "from-emerald-500/10 to-emerald-500/5", border: "border-emerald-500/30", text: "text-emerald-400", ring: "stroke-emerald-400" },
  Medium: { color: "yellow",  icon: AlertCircle,   bg: "from-yellow-500/10 to-yellow-500/5",   border: "border-yellow-500/30",  text: "text-yellow-400",  ring: "stroke-yellow-400"  },
  High:   { color: "red",     icon: AlertTriangle, bg: "from-red-500/10 to-red-500/5",         border: "border-red-500/30",     text: "text-red-400",     ring: "stroke-red-400"     },
};

export default function RiskGauge({ result }: Props) {
  const cfg   = CONFIG[result.risk_level];
  const Icon  = cfg.icon;
  const pct   = result.risk_percent;

  // SVG arc gauge
  const R = 70;
  const cx = 90, cy = 90;
  const startAngle = -210;
  const sweepAngle = 240;
  const angle = startAngle + (pct / 100) * sweepAngle;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const arcX = (a: number) => cx + R * Math.cos(toRad(a));
  const arcY = (a: number) => cy + R * Math.sin(toRad(a));

  const describeArc = (start: number, end: number) => {
    const large = end - start > 180 ? 1 : 0;
    return `M ${arcX(start)} ${arcY(start)} A ${R} ${R} 0 ${large} 1 ${arcX(end)} ${arcY(end)}`;
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${cfg.bg} ${cfg.border} p-6 transition-colors duration-200`}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-5 h-5 ${cfg.text}`} />
        <h3 className="text-gray-900 dark:text-white font-semibold">Risk Assessment</h3>
      </div>

      {/* Gauge SVG */}
      <div className="flex justify-center mb-4">
        <svg width="180" height="130" viewBox="0 0 180 130">
          {/* Track */}
          <path d={describeArc(startAngle, startAngle + sweepAngle)}
            fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round"
            className="text-gray-200 dark:text-gray-700" />
          {/* Fill */}
          <path d={describeArc(startAngle, angle)}
            fill="none" strokeWidth="12" strokeLinecap="round"
            className={cfg.ring}
            style={{ transition: "all 0.8s ease" }} />
          {/* Needle dot */}
          <circle cx={arcX(angle)} cy={arcY(angle)} r="6"
            className={`fill-current ${cfg.text}`} />
          {/* Center text */}
          <text x={cx} y={cy + 8} textAnchor="middle"
            fill="currentColor" className="text-gray-900 dark:text-white" fontSize="22" fontWeight="bold">
            {pct.toFixed(1)}%
          </text>
          <text x={cx} y={cy + 24} textAnchor="middle"
            fill="#9ca3af" fontSize="10">
            Risk Score
          </text>
          {/* Labels */}
          <text x={arcX(startAngle) - 4} y={arcY(startAngle) + 4}
            fill="#9ca3af" fontSize="9" textAnchor="middle">0</text>
          <text x={arcX(startAngle + sweepAngle) + 4} y={arcY(startAngle + sweepAngle) + 4}
            fill="#9ca3af" fontSize="9" textAnchor="middle">100</text>
        </svg>
      </div>

      {/* Badge */}
      <div className="flex justify-center">
        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border ${cfg.border} ${cfg.text} bg-white/70 dark:bg-gray-900/50`}>
          <TrendingUp className="w-3.5 h-3.5" />
          {result.risk_level} Risk
        </span>
      </div>

      {/* Score bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Low</span><span>Medium</span><span>High</span>
        </div>
        <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: pct < 40
                ? "linear-gradient(90deg,#10b981,#34d399)"
                : pct < 70
                ? "linear-gradient(90deg,#f59e0b,#fbbf24)"
                : "linear-gradient(90deg,#ef4444,#f87171)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
