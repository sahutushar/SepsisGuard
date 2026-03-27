"use client";
import { Activity, Wifi, WifiOff, Bell, LogOut, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { checkHealth, SAMPLE_ALERTS } from "@/lib/api";
import { useTheme } from "@/lib/ThemeContext";

export default function TopBar() {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const [online, setOnline] = useState<boolean | null>(null);
  const [time, setTime]     = useState("");

  const unread = SAMPLE_ALERTS.filter(a => !a.acknowledged).length;

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

  useEffect(() => {
    checkHealth().then(() => setOnline(true)).catch(() => setOnline(false));
    const tick = () => setTime(new Date().toLocaleTimeString());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-14 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <Activity className="w-4 h-4 text-red-400" />
        <span className="font-semibold text-sm text-gray-900 dark:text-white">Early Sepsis Risk Monitor</span>
        <span className="text-gray-400 dark:text-gray-600 text-xs hidden sm:block">· ICU Dashboard</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-gray-400 dark:text-gray-500 text-xs font-mono hidden sm:block">{time}</span>

        {/* API status */}
        <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
          online === null ? "border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500"
          : online ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
          : "border-red-500/30 text-red-500 dark:text-red-400 bg-red-500/10"
        }`}>
          {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {online === null ? "Connecting…" : online ? "API Online" : "API Offline"}
        </div>

        {/* Theme toggle */}
        <button onClick={toggle}
          className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}>
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Alerts bell */}
        <Link href="/alerts" className="relative p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
              {unread}
            </span>
          )}
        </Link>

        {/* Logout */}
        <button onClick={handleLogout}
          className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          title="Logout">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
