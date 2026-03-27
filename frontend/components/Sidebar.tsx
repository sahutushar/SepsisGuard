"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Heart, BarChart2, Thermometer, Bell, FileText } from "lucide-react";

const NAV_ITEMS = [
  { icon: Activity,    label: "Dashboard",  href: "/"          },
  { icon: Heart,       label: "Patients",   href: "/patients"  },
  { icon: BarChart2,   label: "Analytics",  href: "/analytics" },
  { icon: Thermometer, label: "Vitals",     href: "/vitals"    },
  { icon: Bell,        label: "Alerts",     href: "/alerts"    },
  { icon: FileText,    label: "Reports",    href: "/reports"   },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-colors duration-200">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center">
            <Activity className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-gray-900 dark:text-white font-bold text-sm leading-tight">SepsisGuard</p>
            <p className="text-gray-500 text-xs">AI Monitoring System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all border ${
                active
                  ? "bg-red-500/15 text-red-500 dark:text-red-400 border-red-500/20"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 border-transparent"
              }`}>
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            DR
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-300 text-xs font-medium">Dr. Reynolds</p>
            <p className="text-gray-400 dark:text-gray-600 text-xs">ICU Attending</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
