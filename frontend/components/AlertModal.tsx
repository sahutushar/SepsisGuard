"use client";
import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface Props {
  show: boolean;
  riskPercent: number;
  onClose: () => void;
}

export default function AlertModal({ show, riskPercent, onClose }: Props) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(onClose, 8000);
      return () => clearTimeout(t);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-gray-900 border-2 border-red-500/60 rounded-2xl p-6 shadow-2xl shadow-red-500/20 animate-pulse-once">
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-2xl bg-red-500/5 pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
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
              Patient vitals indicate a <span className="text-red-300 font-semibold">{riskPercent.toFixed(1)}%</span> probability of sepsis onset.
            </p>
          </div>

          <div className="w-full bg-gray-800 rounded-xl p-4 text-left space-y-1.5">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Recommended Actions</p>
            {[
              "Notify attending physician immediately",
              "Initiate sepsis protocol (blood cultures × 2)",
              "Administer broad-spectrum antibiotics within 1 hour",
              "Increase monitoring frequency to every 15 min",
            ].map((action, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                <span className="text-red-400 font-bold mt-0.5">{i + 1}.</span>
                {action}
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-semibold text-sm transition-all"
          >
            Acknowledge Alert
          </button>
        </div>
      </div>
    </div>
  );
}
