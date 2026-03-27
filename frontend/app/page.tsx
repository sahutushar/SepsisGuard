"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import Sidebar          from "@/components/Sidebar";
import TopBar           from "@/components/TopBar";
import VitalsForm       from "@/components/VitalsForm";
import RiskGauge        from "@/components/RiskGauge";
import ContributorsPanel from "@/components/ContributorsPanel";
import VitalTrendChart  from "@/components/VitalTrendChart";
import AlertModal       from "@/components/AlertModal";
import PatientList      from "@/components/PatientList";
import { predictSepsis, generateTrendData, SAMPLE_PATIENTS, SAMPLE_ALERTS } from "@/lib/api";
import { VitalsInput, PredictionResult, Patient } from "@/types";
import { Activity, Users, AlertTriangle, TrendingUp, FileText, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const [result,  setResult]  = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [alert,   setAlert]   = useState(false);
  const [alertPatient, setAlertPatient] = useState<{ name: string; id: string; ward: string; email: string } | null>(null);
  const [trend,   setTrend]   = useState(generateTrendData({ HR:80, O2Sat:97, Temp:37, SBP:120, MAP:85, Resp:16 }));

  const handlePredict = useCallback(async (vitals: VitalsInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await predictSepsis(vitals);
      setResult(res);
      setTrend(generateTrendData(vitals));
      if (res.risk_level === "High") {
        setAlertPatient(null); // manual prediction — no specific patient
        setAlert(true);
      }
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Failed to connect to API. Is the backend running?");
    }
    setLoading(false);
  }, []);

  const handlePatientSelect = (p: Patient) => {
    if (p.result) setResult(p.result);
    if (p.history) setTrend(p.history);
    if (p.result?.risk_level === "High") {
      setAlertPatient({ name: p.name, id: p.id, ward: p.ward, email: p.email });
      setAlert(true);
    }
  };

  const unreadAlerts = SAMPLE_ALERTS.filter(a => !a.acknowledged).length;
  const avgRisk = Math.round(
    SAMPLE_PATIENTS.filter(p => p.result).reduce((s, p) => s + (p.result?.risk_percent ?? 0), 0) /
    Math.max(1, SAMPLE_PATIENTS.filter(p => p.result).length)
  );

  const stats = [
    { label: "Patients Monitored", value: SAMPLE_PATIENTS.length, icon: Users,         color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20",    href: "/patients"  },
    { label: "Active Alerts",      value: unreadAlerts,           icon: AlertTriangle, color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20",     href: "/alerts"    },
    { label: "Reports Generated",  value: 6,                      icon: FileText,      color: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/20",  href: "/reports"   },
    { label: "Avg Risk Score",     value: `${avgRisk || 34}%`,    icon: TrendingUp,    color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", href: "/analytics" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-200">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <main className="flex-1 p-6 overflow-auto">
          {/* Welcome */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ICU Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Real-time sepsis risk monitoring powered by AI</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map(({ label, value, icon: Icon, color, bg, border, href }) => (
              <Link key={label} href={href}
                className={`rounded-xl p-4 border ${bg} ${border} flex items-center gap-3 hover:scale-[1.02] transition-transform cursor-pointer group`}>
                <div className={`w-10 h-10 rounded-lg ${bg} border ${border} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-gray-500 text-xs">{label}</p>
                </div>
                <ArrowRight className={`w-4 h-4 ${color} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </Link>
            ))}
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Main grid */}
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

              <PatientList patients={SAMPLE_PATIENTS} onSelect={handlePatientSelect} />
            </div>
          </div>
        </main>
      </div>

      <AlertModal
        show={alert}
        riskPercent={result?.risk_percent ?? 0}
        patientName={alertPatient?.name}
        patientId={alertPatient?.id}
        ward={alertPatient?.ward}
        patientEmail={alertPatient?.email}
        onClose={() => setAlert(false)}
      />
    </div>
  );
}
