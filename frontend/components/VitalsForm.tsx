"use client";
import { useState } from "react";
import { VitalsInput } from "@/types";
import { CRITICAL_VITALS, NORMAL_VITALS } from "@/lib/api";
import { Zap, RotateCcw, Send, Loader2 } from "lucide-react";

interface Props {
  onSubmit: (v: VitalsInput) => void;
  loading: boolean;
}

const FIELDS: { key: keyof VitalsInput; label: string; unit: string; min: number; max: number; step: number; normal: string }[] = [
  { key: "HR",    label: "Heart Rate",          unit: "bpm",        min: 20,  max: 250, step: 1,   normal: "60–100"  },
  { key: "O2Sat", label: "O₂ Saturation",       unit: "%",          min: 50,  max: 100, step: 0.1, normal: "95–100"  },
  { key: "Temp",  label: "Temperature",         unit: "°C",         min: 30,  max: 45,  step: 0.1, normal: "36.1–37.2" },
  { key: "SBP",   label: "Systolic BP",         unit: "mmHg",       min: 50,  max: 250, step: 1,   normal: "90–140"  },
  { key: "MAP",   label: "Mean Arterial Press.", unit: "mmHg",       min: 30,  max: 180, step: 1,   normal: "70–100"  },
  { key: "Resp",  label: "Respiration Rate",    unit: "breaths/min", min: 4,   max: 60,  step: 1,   normal: "12–20"   },
];

const DEFAULT: VitalsInput = { HR: 80, O2Sat: 97, Temp: 37.0, SBP: 120, MAP: 85, Resp: 16 };

export default function VitalsForm({ onSubmit, loading }: Props) {
  const [values, setValues] = useState<VitalsInput>(DEFAULT);

  const set = (key: keyof VitalsInput, val: string) =>
    setValues(prev => ({ ...prev, [key]: parseFloat(val) || 0 }));

  const isAbnormal = (key: keyof VitalsInput, val: number) => {
    const f = FIELDS.find(f => f.key === key)!;
    const [lo, hi] = f.normal.split("–").map(Number);
    return val < lo || val > hi;
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-semibold text-lg">Patient Vitals Input</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setValues(NORMAL_VITALS)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all border border-gray-700"
          >
            <RotateCcw className="w-3 h-3" /> Normal
          </button>
          <button
            onClick={() => setValues(CRITICAL_VITALS)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-all border border-red-500/30"
          >
            <Zap className="w-3 h-3" /> Simulate Critical
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {FIELDS.map(({ key, label, unit, min, max, step, normal }) => {
          const val = values[key];
          const bad = isAbnormal(key, val);
          return (
            <div key={key} className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-gray-400 text-xs font-medium">{label}</label>
                <span className={`text-xs px-1.5 py-0.5 rounded ${bad ? "bg-red-500/15 text-red-400" : "bg-gray-800 text-gray-500"}`}>
                  Normal: {normal} {unit}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={min} max={max} step={step}
                  value={val}
                  onChange={e => set(key, e.target.value)}
                  className={`w-full bg-gray-800 border rounded-lg px-3 py-2.5 text-white text-sm pr-14 focus:outline-none focus:ring-1 transition-all ${
                    bad
                      ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500"
                      : "border-gray-700 focus:ring-blue-500/50 focus:border-blue-500"
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none">
                  {unit}
                </span>
              </div>
              {/* Mini slider */}
              <input
                type="range" min={min} max={max} step={step}
                value={val}
                onChange={e => set(key, e.target.value)}
                className="w-full h-1 accent-blue-500 cursor-pointer"
              />
            </div>
          );
        })}
      </div>

      <button
        onClick={() => onSubmit(values)}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</>
        ) : (
          <><Send className="w-4 h-4" /> Predict Sepsis Risk</>
        )}
      </button>
    </div>
  );
}
