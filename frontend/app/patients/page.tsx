"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { SAMPLE_PATIENTS, predictSepsis, generateTrendData } from "@/lib/api";
import { Patient, PredictionResult } from "@/types";
import { User, Activity, Loader2, ChevronDown, ChevronUp, Heart, Wind, Thermometer, Droplets, TrendingUp, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import VitalTrendChart from "@/components/VitalTrendChart";
import RiskGauge from "@/components/RiskGauge";
import ContributorsPanel from "@/components/ContributorsPanel";

const RISK_STYLE = {
  High:   { badge: "bg-red-500/15 text-red-400 border-red-500/30",     icon: AlertTriangle, dot: "bg-red-400" },
  Medium: { badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", icon: AlertCircle,   dot: "bg-yellow-400" },
  Low:    { badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: CheckCircle, dot: "bg-emerald-400" },
};

const VITAL_ICONS = [
  { key: "HR",    label: "Heart Rate",   unit: "bpm",   icon: Heart,       normal: [60, 100]  },
  { key: "O2Sat", label: "O₂ Sat",       unit: "%",     icon: Droplets,    normal: [95, 100]  },
  { key: "Temp",  label: "Temp",         unit: "°C",    icon: Thermometer, normal: [36.1, 37.2] },
  { key: "SBP",   label: "Systolic BP",  unit: "mmHg",  icon: TrendingUp,  normal: [90, 140]  },
  { key: "MAP",   label: "MAP",          unit: "mmHg",  icon: Activity,    normal: [70, 100]  },
  { key: "Resp",  label: "Resp Rate",    unit: "b/min", icon: Wind,        normal: [12, 20]   },
];

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>(SAMPLE_PATIENTS);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading]   = useState<string | null>(null);
  const [filter, setFilter]     = useState<"All" | "High" | "Medium" | "Low">("All");

  const scan = async (p: Patient) => {
    setLoading(p.id);
    try {
      const result = await predictSepsis(p.vitals);
      setPatients(prev => prev.map(x => x.id === p.id
        ? { ...x, result, timestamp: new Date().toLocaleTimeString(), history: generateTrendData(p.vitals) }
        : x
      ));
    } catch { /* silent */ }
    setLoading(null);
  };

  const filtered = patients.filter(p =>
    filter === "All" ? true : p.result?.risk_level === filter
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Monitor</h1>
              <p className="text-gray-500 text-sm mt-1">{patients.length} patients under observation</p>
            </div>
            <div className="flex gap-2">
              {(["All", "High", "Medium", "Low"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    filter === f
                      ? f === "High" ? "bg-red-500/20 text-red-400 border-red-500/40"
                        : f === "Medium" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
                        : f === "Low" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                        : "bg-blue-500/20 text-blue-400 border-blue-500/40"
                      : "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600"
                  }`}
                >{f}</button>
              ))}
            </div>
          </div>

          {/* Patient Cards */}
          <div className="space-y-3">
            {filtered.map(p => {
              const level = p.result?.risk_level;
              const style = level ? RISK_STYLE[level] : null;
              const isExpanded = expanded === p.id;

              return (
                <div key={p.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
                  {/* Card Header */}
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-blue-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold">{p.name}</p>
                        <span className="text-gray-600 text-xs">#{p.id}</span>
                        {style && (
                          <span className={`w-2 h-2 rounded-full ${style.dot} animate-pulse`} />
                        )}
                      </div>
                      <p className="text-gray-500 text-xs">{p.ward} · Age {p.age} · {p.diagnosis}</p>
                      <p className="text-gray-600 text-xs">Admitted: {p.admittedAt}</p>
                    </div>

                    {/* Vitals mini row */}
                    <div className="hidden lg:flex items-center gap-4">
                      {VITAL_ICONS.slice(0, 4).map(({ key, label, unit, normal }) => {
                        const val = p.vitals[key as keyof typeof p.vitals] as number;
                        const bad = val < normal[0] || val > normal[1];
                        return (
                          <div key={key} className="text-center">
                            <p className={`text-sm font-bold font-mono ${bad ? "text-red-400" : "text-white"}`}>{val}</p>
                            <p className="text-gray-600 text-xs">{label}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-3">
                      {p.result && (
                        <div className="text-right">
                          <p className="text-white font-bold text-lg">{p.result.risk_percent.toFixed(1)}%</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${style?.badge}`}>
                            {p.result.risk_level} Risk
                          </span>
                        </div>
                      )}

                      <button onClick={() => scan(p)} disabled={loading === p.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 text-xs font-medium transition-all disabled:opacity-50">
                        {loading === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                        {loading === p.id ? "Scanning…" : "Scan"}
                      </button>

                      <button onClick={() => setExpanded(isExpanded ? null : p.id)}
                        className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-all">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-gray-950/50">
                      {/* All vitals */}
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
                        {VITAL_ICONS.map(({ key, label, unit, icon: Icon, normal }) => {
                          const val = p.vitals[key as keyof typeof p.vitals] as number;
                          const bad = val < normal[0] || val > normal[1];
                          return (
                            <div key={key} className={`rounded-xl p-3 border text-center ${bad ? "bg-red-500/10 border-red-500/30" : "bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/50"}`}>
                              <Icon className={`w-4 h-4 mx-auto mb-1 ${bad ? "text-red-400" : "text-gray-400"}`} />
                              <p className={`text-lg font-bold font-mono ${bad ? "text-red-400" : "text-gray-900 dark:text-white"}`}>{val}</p>
                              <p className="text-gray-500 text-xs">{label}</p>
                              <p className="text-gray-600 text-xs">{unit}</p>
                            </div>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                        <div className="xl:col-span-2">
                          {p.history && <VitalTrendChart data={p.history} />}
                        </div>
                        <div className="space-y-4">
                          {p.result ? (
                            <>
                              <RiskGauge result={p.result} />
                              <ContributorsPanel contributors={p.result.contributors} />
                            </>
                          ) : (
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 text-center text-gray-500 text-sm">
                              Click <span className="text-blue-400">Scan</span> to assess risk
                            </div>
                          )}
                        </div>
                      </div>

                      {p.timestamp && (
                        <p className="text-gray-600 text-xs mt-3">Last assessed: {p.timestamp}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
