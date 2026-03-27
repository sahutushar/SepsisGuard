"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import VitalsForm from "@/components/VitalsForm";
import VitalTrendChart from "@/components/VitalTrendChart";
import RiskGauge from "@/components/RiskGauge";
import ContributorsPanel from "@/components/ContributorsPanel";
import { SAMPLE_PATIENTS, predictSepsis, generateTrendData } from "@/lib/api";
import { VitalsInput, PredictionResult, VitalTrendPoint } from "@/types";
import { AlertTriangle, Activity, User, ChevronDown } from "lucide-react";

export default function VitalsPage() {
  const [result,  setResult]  = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [trend,   setTrend]   = useState<VitalTrendPoint[]>(generateTrendData({ HR:80, O2Sat:97, Temp:37, SBP:120, MAP:85, Resp:16 }));
  const [selectedPatient, setSelectedPatient] = useState<string>("");

  const handlePredict = async (vitals: VitalsInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await predictSepsis(vitals);
      setResult(res);
      setTrend(generateTrendData(vitals));
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Failed to connect to API. Is the backend running?");
    }
    setLoading(false);
  };

  const handlePatientLoad = (id: string) => {
    setSelectedPatient(id);
    const p = SAMPLE_PATIENTS.find(x => x.id === id);
    if (p?.result) setResult(p.result);
    if (p?.history) setTrend(p.history);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vitals Assessment</h1>
              <p className="text-gray-500 text-sm mt-1">Enter or load patient vitals for real-time sepsis risk prediction</p>
            </div>

            {/* Patient loader */}
            <div className="relative">
              <select
                value={selectedPatient}
                onChange={e => handlePatientLoad(e.target.value)}
                className="appearance-none bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg px-4 py-2 pr-8 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="">Load Patient…</option>
                {SAMPLE_PATIENTS.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.ward})</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <VitalsForm onSubmit={handlePredict} loading={loading} />
              <VitalTrendChart data={trend} />
            </div>

            <div className="space-y-6">
              {result ? (
                <>
                  <RiskGauge result={result} />
                  <ContributorsPanel contributors={result.contributors} />
                </>
              ) : (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3 min-h-[280px]">
                  <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">
                    <Activity className="w-7 h-7 text-gray-600" />
                  </div>
                  <p className="text-gray-400 text-sm">Enter patient vitals and click<br /><span className="text-blue-400">Predict Sepsis Risk</span> to see results</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
