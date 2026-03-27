"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, X, Mail, CheckCircle } from "lucide-react";
import { sendSepsisAlert } from "@/lib/emailService";

interface Props {
  show: boolean;
  riskPercent: number;
  patientName?: string;
  patientId?: string;
  ward?: string;
  patientEmail?: string;
  onClose: () => void;
}

export default function AlertModal({
  show, riskPercent, patientName = "Unknown", patientId = "—",
  ward = "—", patientEmail, onClose,
}: Props) {
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const actions = [
    "Notify attending physician immediately",
    "Initiate sepsis protocol (blood cultures × 2)",
    "Administer broad-spectrum antibiotics within 1 hour",
    "Increase monitoring frequency to every 15 min",
  ];

  useEffect(() => {
    if (!show) { setEmailStatus("idle"); return; }

    // auto-close after 10s
    const t = setTimeout(onClose, 10000);

    // auto-send email if we have a recipient
    if (patientEmail) {
      setEmailStatus("sending");
      sendSepsisAlert({
        patientName, patientId, ward, riskPercent,
        riskLevel: "High",
        toEmail: patientEmail,
        actions,
        timestamp: new Date().toLocaleString(),
      })
        .then(() => setEmailStatus("sent"))
        .catch(() => setEmailStatus("error"));
    }

    return () => clearTimeout(t);
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 border-2 border-red-500/60 rounded-2xl p-6 shadow-2xl shadow-red-500/20">
        <div className="absolute inset-0 rounded-2xl bg-red-500/5 pointer-events-none" />

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          {/* Pulsing icon */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
            <div className="relative w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-red-400 mb-1">HIGH SEPSIS RISK</h2>
            <p className="text-gray-400 text-sm">
              <span className="text-white font-semibold">{patientName}</span> · {ward} ·{" "}
              <span className="text-red-300 font-semibold">{riskPercent.toFixed(1)}%</span> probability
            </p>
          </div>

          {/* Email status badge */}
          {patientEmail && (
            <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border w-full justify-center ${
              emailStatus === "sending" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
              emailStatus === "sent"    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
              emailStatus === "error"   ? "bg-red-500/10 border-red-500/30 text-red-400" :
              "bg-gray-800 border-gray-700 text-gray-500"
            }`}>
              {emailStatus === "sent" ? <CheckCircle className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
              {emailStatus === "sending" && "Sending alert email…"}
              {emailStatus === "sent"    && `Email sent to ${patientEmail}`}
              {emailStatus === "error"   && "Email failed — check EmailJS config"}
              {emailStatus === "idle"    && `Will notify ${patientEmail}`}
            </div>
          )}

          {/* Actions */}
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-left space-y-1.5">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Recommended Actions</p>
            {actions.map((action, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                <span className="text-red-400 font-bold mt-0.5">{i + 1}.</span>
                {action}
              </div>
            ))}
          </div>

          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-semibold text-sm transition-all">
            Acknowledge Alert
          </button>
        </div>
      </div>
    </div>
  );
}
