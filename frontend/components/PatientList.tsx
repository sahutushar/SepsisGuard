"use client";
import { Patient } from "@/types";
import { predictSepsis } from "@/lib/api";
import { useState } from "react";
import { User, ChevronRight, Loader2 } from "lucide-react";

interface Props {
  patients: Patient[];
  onSelect: (p: Patient) => void;
}

const RISK_STYLE = {
  High:   "bg-red-500/15 text-red-400 border-red-500/30",
  Medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Low:    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "—":    "bg-gray-700/50 text-gray-500 border-gray-700",
};

export default function PatientList({ patients, onSelect }: Props) {
  const [list, setList] = useState<Patient[]>(patients);
  const [loading, setLoading] = useState<string | null>(null);

  const scan = async (p: Patient) => {
    setLoading(p.id);
    try {
      const result = await predictSepsis(p.vitals);
      const updated = { ...p, result, timestamp: new Date().toLocaleTimeString() };
      setList(prev => prev.map(x => x.id === p.id ? updated : x));
    } catch { /* silent */ }
    setLoading(null);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Patient Monitor</h3>
        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
          {list.length} patients
        </span>
      </div>

      <div className="space-y-2">
        {list.map(p => {
          const level = p.result?.risk_level ?? "—";
          const style = RISK_STYLE[level as keyof typeof RISK_STYLE] ?? RISK_STYLE["—"];
          return (
            <div
              key={p.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-blue-400" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-gray-200 text-sm font-medium truncate">{p.name}</p>
                <p className="text-gray-500 text-xs">{p.ward} · Age {p.age}</p>
              </div>

              <div className="flex items-center gap-2">
                {p.result && (
                  <span className="text-xs font-mono text-gray-400">
                    {p.result.risk_percent.toFixed(1)}%
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${style}`}>
                  {level}
                </span>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => scan(p)}
                  disabled={loading === p.id}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all disabled:opacity-50"
                  title="Quick scan"
                >
                  {loading === p.id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => onSelect({ ...p, result: p.result })}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-700 transition-all"
                  title="Load into form"
                >
                  <User className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
