"use client";
import { Activity, Wifi, WifiOff, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { checkHealth } from "@/lib/api";

export default function TopBar() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [time, setTime]     = useState("");

  useEffect(() => {
    checkHealth().then(() => setOnline(true)).catch(() => setOnline(false));
    const tick = () => setTime(new Date().toLocaleTimeString());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-14 bg-gray-900/80 backdrop-blur border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <Activity className="w-4 h-4 text-red-400" />
        <span className="text-white font-semibold text-sm">Early Sepsis Risk Monitor</span>
        <span className="text-gray-600 text-xs hidden sm:block">· ICU Dashboard</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-gray-500 text-xs font-mono hidden sm:block">{time}</span>

        <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
          online === null ? "border-gray-700 text-gray-500"
          : online ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
          : "border-red-500/30 text-red-400 bg-red-500/10"
        }`}>
          {online === null ? <Wifi className="w-3 h-3" />
          : online ? <Wifi className="w-3 h-3" />
          : <WifiOff className="w-3 h-3" />}
          {online === null ? "Connecting…" : online ? "API Online" : "API Offline"}
        </div>

        <button className="relative p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
