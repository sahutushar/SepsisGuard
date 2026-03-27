"use client";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { SAMPLE_PATIENTS, SAMPLE_ALERTS, SAMPLE_REPORTS } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from "recharts";
import { TrendingUp, Users, AlertTriangle, Activity, BarChart2, Clock } from "lucide-react";

const COLORS = { High: "#ef4444", Medium: "#f59e0b", Low: "#10b981" };

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

export default function AnalyticsPage() {
  // Risk distribution pie
  const riskDist = [
    { name: "High Risk",   value: SAMPLE_REPORTS.filter(r => r.riskLevel === "High").length,   color: COLORS.High   },
    { name: "Medium Risk", value: SAMPLE_REPORTS.filter(r => r.riskLevel === "Medium").length, color: COLORS.Medium },
    { name: "Low Risk",    value: SAMPLE_REPORTS.filter(r => r.riskLevel === "Low").length,    color: COLORS.Low    },
  ];

  // Ward risk bar chart
  const wards = [...new Set(SAMPLE_PATIENTS.map(p => p.ward))];
  const wardData = wards.map(ward => {
    const pts = SAMPLE_PATIENTS.filter(p => p.ward === ward);
    return { ward, patients: pts.length };
  });

  // Hourly alert trend (simulated)
  const hourlyAlerts = Array.from({ length: 12 }, (_, i) => ({
    hour: `${(8 + i).toString().padStart(2, "0")}:00`,
    High:   Math.floor(Math.random() * 3),
    Medium: Math.floor(Math.random() * 4),
    Low:    Math.floor(Math.random() * 2),
  }));

  // Vital averages across patients
  const vitalAvgs = [
    { vital: "HR",     avg: Math.round(SAMPLE_PATIENTS.reduce((s, p) => s + p.vitals.HR, 0)    / SAMPLE_PATIENTS.length), normal: 80  },
    { vital: "O₂Sat",  avg: Math.round(SAMPLE_PATIENTS.reduce((s, p) => s + p.vitals.O2Sat, 0) / SAMPLE_PATIENTS.length), normal: 97  },
    { vital: "Temp",   avg: parseFloat((SAMPLE_PATIENTS.reduce((s, p) => s + p.vitals.Temp, 0) / SAMPLE_PATIENTS.length).toFixed(1)), normal: 37  },
    { vital: "SBP",    avg: Math.round(SAMPLE_PATIENTS.reduce((s, p) => s + p.vitals.SBP, 0)   / SAMPLE_PATIENTS.length), normal: 115 },
    { vital: "MAP",    avg: Math.round(SAMPLE_PATIENTS.reduce((s, p) => s + p.vitals.MAP, 0)   / SAMPLE_PATIENTS.length), normal: 85  },
    { vital: "Resp",   avg: Math.round(SAMPLE_PATIENTS.reduce((s, p) => s + p.vitals.Resp, 0)  / SAMPLE_PATIENTS.length), normal: 16  },
  ];

  // Risk score trend (simulated over 7 days)
  const riskTrend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return {
      day: d.toLocaleDateString([], { weekday: "short" }),
      avgRisk: Math.round(30 + Math.random() * 40),
      highCount: Math.floor(Math.random() * 4),
    };
  });

  const stats = [
    { label: "Total Patients",    value: SAMPLE_PATIENTS.length,                                  icon: Users,         color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20"    },
    { label: "Active Alerts",     value: SAMPLE_ALERTS.filter(a => !a.acknowledged).length,       icon: AlertTriangle, color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20"     },
    { label: "Reports Generated", value: SAMPLE_REPORTS.length,                                   icon: BarChart2,     color: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/20"  },
    { label: "Avg Risk Score",    value: `${Math.round(SAMPLE_REPORTS.reduce((s, r) => s + r.riskPercent, 0) / SAMPLE_REPORTS.length)}%`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <BarChart2 className="w-6 h-6 text-purple-400" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-1">Population-level sepsis risk insights</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map(({ label, value, icon: Icon, color, bg, border }) => (
              <div key={label} className={`rounded-xl p-4 border ${bg} ${border}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-gray-500 text-xs">{label}</span>
                </div>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Charts row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Risk Distribution Pie */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <h3 className="text-gray-900 dark:text-white font-semibold mb-4">Risk Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={riskDist} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {riskDist.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, fontSize: 12 }} />
                  <Legend formatter={(v) => <span style={{ color: "#9ca3af", fontSize: 11 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Patients per Ward */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <h3 className="text-gray-900 dark:text-white font-semibold mb-4">Patients by Ward</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={wardData} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="ward" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="patients" name="Patients" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Vital Averages */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <h3 className="text-gray-900 dark:text-white font-semibold mb-4">Avg Vitals vs Normal</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={vitalAvgs} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="vital" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="avg"    name="Patient Avg" fill="#f87171" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="normal" name="Normal"      fill="#374151" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hourly alert volume */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <h3 className="text-gray-900 dark:text-white font-semibold mb-1">Alert Volume (Today)</h3>
              <p className="text-gray-500 text-xs mb-4 flex items-center gap-1"><Clock className="w-3 h-3" />Hourly breakdown by severity</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={hourlyAlerts} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="hour" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(v) => <span style={{ color: "#9ca3af", fontSize: 11 }}>{v}</span>} />
                  <Bar dataKey="High"   name="High"   fill={COLORS.High}   stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Medium" name="Medium" fill={COLORS.Medium} stackId="a" />
                  <Bar dataKey="Low"    name="Low"    fill={COLORS.Low}    stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 7-day risk trend */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <h3 className="text-gray-900 dark:text-white font-semibold mb-1">7-Day Risk Trend</h3>
              <p className="text-gray-500 text-xs mb-4 flex items-center gap-1"><Activity className="w-3 h-3" />Average risk score across all patients</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={riskTrend} margin={{ left: -20 }}>
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="avgRisk" name="Avg Risk %" stroke="#3b82f6" strokeWidth={2} fill="url(#riskGrad)" dot={{ fill: "#3b82f6", r: 4 }} />
                  <Line type="monotone" dataKey="highCount" name="High Risk Patients" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
