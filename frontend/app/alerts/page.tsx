"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { SAMPLE_ALERTS } from "@/lib/api";
import { Alert } from "@/types";
import { sendSepsisAlert } from "@/lib/emailService";
import { AlertTriangle, AlertCircle, CheckCircle, Bell, BellOff, Clock, User, MapPin, ChevronDown, ChevronUp, Check, Mail } from "lucide-react";

const LEVEL_STYLE = {
  High:   { card: "border-red-500/40 bg-red-500/5",     badge: "bg-red-500/15 text-red-400 border-red-500/30",     icon: AlertTriangle, iconColor: "text-red-400",    ring: "bg-red-500/20" },
  Medium: { card: "border-yellow-500/40 bg-yellow-500/5", badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", icon: AlertCircle,   iconColor: "text-yellow-400", ring: "bg-yellow-500/20" },
  Low:    { card: "border-emerald-500/40 bg-emerald-500/5", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: CheckCircle, iconColor: "text-emerald-400", ring: "bg-emerald-500/20" },
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(SAMPLE_ALERTS);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"All" | "Unread" | "High" | "Medium" | "Low">("All");
  const [emailStatus, setEmailStatus] = useState<Record<string, "idle" | "sending" | "sent" | "error">>({});

  const acknowledge = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const acknowledgeAll = () => {
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
  };

  const sendEmail = async (alert: Alert) => {
    setEmailStatus(prev => ({ ...prev, [alert.id]: "sending" }));
    try {
      await sendSepsisAlert({
        patientName:  alert.patientName,
        patientId:    alert.patientId,
        ward:         alert.ward,
        riskPercent:  alert.riskPercent,
        riskLevel:    alert.riskLevel,
        toEmail:      alert.patientEmail,
        actions:      alert.actions,
        timestamp:    alert.timestamp,
      });
      setEmailStatus(prev => ({ ...prev, [alert.id]: "sent" }));
    } catch {
      setEmailStatus(prev => ({ ...prev, [alert.id]: "error" }));
    }
  };

  const filtered = alerts.filter(a => {
    if (filter === "Unread") return !a.acknowledged;
    if (filter === "All") return true;
    return a.riskLevel === filter;
  });

  const unread = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Bell className="w-6 h-6 text-red-400" />
                Alerts Center
                {unread > 0 && (
                  <span className="text-sm bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">{unread} new</span>
                )}
              </h1>
              <p className="text-gray-500 text-sm mt-1">{alerts.length} total alerts · {unread} unacknowledged</p>
            </div>
            {unread > 0 && (
              <button onClick={acknowledgeAll}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-600 text-sm transition-all">
                <Check className="w-4 h-4" /> Acknowledge All
              </button>
            )}
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Alerts",  value: alerts.length,                                  color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20"    },
              { label: "High Risk",     value: alerts.filter(a => a.riskLevel === "High").length,   color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20"     },
              { label: "Medium Risk",   value: alerts.filter(a => a.riskLevel === "Medium").length, color: "text-yellow-400",  bg: "bg-yellow-500/10",  border: "border-yellow-500/20"  },
              { label: "Acknowledged",  value: alerts.filter(a => a.acknowledged).length,          color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
            ].map(({ label, value, color, bg, border }) => (
              <div key={label} className={`rounded-xl p-4 border ${bg} ${border}`}>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-gray-500 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-4">
            {(["All", "Unread", "High", "Medium", "Low"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  filter === f
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                    : "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600"
                }`}>{f}</button>
            ))}
          </div>

          {/* Alert list */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center">
                <BellOff className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">No alerts match this filter</p>
              </div>
            )}

            {filtered.map(alert => {
              const style = LEVEL_STYLE[alert.riskLevel];
              const Icon  = style.icon;
              const isExp = expanded === alert.id;

              return (
                <div key={alert.id} className={`border rounded-2xl overflow-hidden transition-all ${
                  alert.acknowledged ? "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 opacity-70" : style.card
                }`}>
                  <div className="flex items-center gap-4 p-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full ${style.ring} flex items-center justify-center flex-shrink-0 ${!alert.acknowledged ? "animate-pulse" : ""}`}>
                      <Icon className={`w-5 h-5 ${style.iconColor}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-semibold">{alert.patientName}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${style.badge}`}>
                          {alert.riskLevel} Risk
                        </span>
                        {!alert.acknowledged && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">New</span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mt-0.5">{alert.message}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{alert.ward}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{alert.timestamp}</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{alert.patientId}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-white font-mono">{alert.riskPercent.toFixed(1)}%</span>
                      {alert.riskLevel === "High" && (
                        <button
                          onClick={() => sendEmail(alert)}
                          disabled={emailStatus[alert.id] === "sending" || emailStatus[alert.id] === "sent"}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            emailStatus[alert.id] === "sent"    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 opacity-60" :
                            emailStatus[alert.id] === "error"   ? "bg-red-500/15 text-red-400 border-red-500/30" :
                            emailStatus[alert.id] === "sending" ? "bg-blue-500/15 text-blue-400 border-blue-500/30 opacity-60" :
                            "bg-orange-500/15 text-orange-400 border-orange-500/30 hover:bg-orange-500/25"
                          }`}>
                          <Mail className="w-3.5 h-3.5" />
                          {emailStatus[alert.id] === "sending" ? "Sending…" :
                           emailStatus[alert.id] === "sent"    ? "Sent" :
                           emailStatus[alert.id] === "error"   ? "Retry" :
                           "Send Email"}
                        </button>
                      )}
                      {!alert.acknowledged && (
                        <button onClick={() => acknowledge(alert.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 text-xs font-medium transition-all">
                          <Check className="w-3.5 h-3.5" /> Acknowledge
                        </button>
                      )}
                      <button onClick={() => setExpanded(isExp ? null : alert.id)}
                        className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-all">
                        {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded actions */}
                  {isExp && (
                    <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-950/50">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">Recommended Actions</p>
                      <div className="space-y-2">
                        {alert.actions.map((action, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-800/50 border border-gray-700/50">
                            <span className={`text-xs font-bold mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${style.ring} ${style.iconColor}`}>{i + 1}</span>
                            <p className="text-gray-300 text-sm">{action}</p>
                          </div>
                        ))}
                      </div>
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
