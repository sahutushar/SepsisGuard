"use client";
import { Contributor } from "@/types";

interface Props { contributors: Contributor[] }

const STATUS_STYLE = {
  high:   "bg-red-500/15 text-red-500 dark:text-red-400 border-red-500/30",
  low:    "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  normal: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
};

const FEATURE_LABELS: Record<string, string> = {
  HR: "Heart Rate", O2Sat: "O₂ Saturation", Temp: "Temperature",
  SBP: "Systolic BP", MAP: "Mean Art. Press.", Resp: "Respiration",
};

export default function ContributorsPanel({ contributors }: Props) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 transition-colors duration-200">
      <h3 className="text-gray-900 dark:text-white font-semibold mb-4">Vital Contributions to Risk</h3>
      <div className="space-y-3">
        {contributors.map(c => (
          <div key={c.feature} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 dark:text-gray-300 font-medium w-36">
                  {FEATURE_LABELS[c.feature] ?? c.feature}
                </span>
                <span className={`px-1.5 py-0.5 rounded border text-xs ${STATUS_STYLE[c.status]}`}>
                  {c.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                <span className="font-mono">{c.value}</span>
                <span className="text-gray-400 dark:text-gray-600">({c.normal_range})</span>
                <span className="text-gray-700 dark:text-gray-300 font-semibold w-10 text-right">
                  {(c.contribution * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${c.contribution * 100}%`,
                  background:
                    c.status === "normal" ? "#10b981"
                    : c.contribution > 0.6 ? "#ef4444"
                    : "#f59e0b",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
