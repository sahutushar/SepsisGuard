"use client";
import { Activity, Heart, Wind, Thermometer, Droplets, TrendingUp } from "lucide-react";

const NAV_ITEMS = [
  { icon: Activity,     label: "Dashboard",   active: true  },
  { icon: Heart,        label: "Patients",    active: false },
  { icon: TrendingUp,   label: "Analytics",   active: false },
  { icon: Wind,         label: "Vitals",      active: false },
  { icon: Thermometer,  label: "Alerts",      active: false },
  { icon: Droplets,     label: "Reports",     active: false },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center">
            <Activity className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">SepsisGuard</p>
            <p className="text-gray-500 text-xs">AI Monitoring System</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
              active
                ? "bg-red-500/15 text-red-400 border border-red-500/20"
                : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            DR
          </div>
          <div>
            <p className="text-gray-300 text-xs font-medium">Dr. Reynolds</p>
            <p className="text-gray-600 text-xs">ICU Attending</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
