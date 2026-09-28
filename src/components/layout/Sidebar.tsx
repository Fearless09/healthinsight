"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Database,
  Bot,
  GitCompare,
  FileSpreadsheet,
  Users,
  ShieldAlert,
  Settings,
  Activity,
  HeartPulse,
  LogOut,
} from "lucide-react";
import { cn } from "@/utils/utils";
import { useLogout } from "@/tanstack/(hooks)/auth";

export function Sidebar() {
  const pathname = usePathname();
  const { mutateAsync: mutateLogoutAsync } = useLogout();

  return (
    <aside
      role="menubar"
      className="flex h-dvh w-64 shrink-0 flex-col justify-between gap-y-20 overflow-y-auto border-r border-slate-800/80 bg-[#090d16]"
    >
      <main role="group">
        {/* Brand Header */}
        <div className="flex items-center gap-3 border-b border-slate-800/80 px-5 py-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-linear-to-tr from-teal-500 to-cyan-400 font-bold text-slate-950 shadow-lg shadow-teal-500/20">
            <HeartPulse className="size-5 text-slate-950" />
          </span>
          <div>
            <h1 className="bg-linear-to-r from-white via-slate-200 to-teal-400 bg-clip-text text-base font-extrabold tracking-wide text-transparent">
              HEALTHINSIGHT
            </h1>
            <p className="text-[11px] font-medium tracking-tight text-teal-400/90">
              Programme Intelligence
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav role="menu" className="space-y-1 p-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (pathname?.startsWith(item.href) && item.href !== "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-300 flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium ${
                  isActive
                    ? "border-teal-500/30 bg-teal-500/10 text-teal-300 shadow-sm shadow-teal-500/10"
                    : "border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <Icon
                  className={cn(`size-4 shrink-0 text-slate-400`, {
                    "text-teal-400": isActive,
                  })}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </main>

      {/* Footer Tagline */}
      <footer className="space-y-3 p-3">
        <button
          onClick={() => mutateLogoutAsync()}
          className="transition-300 flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-slate-800/80 bg-slate-900/60 px-3 py-2 text-sm font-medium text-slate-500 hover:border-red-400 hover:bg-red-900/15 hover:text-red-400/80"
        >
          <LogOut className="size-4 shrink-0" />
          <span>Sign out</span>
        </button>

        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 text-xs text-slate-400">
          <div className="mb-1 flex items-center gap-2 font-semibold text-teal-400">
            <Activity className="size-3.5 shrink-0" />
            <span>HealthInsight</span>
          </div>
          <p className="text-[11px] text-slate-400 italic">
            "Turn health programme data into actionable insight."
          </p>
        </div>
      </footer>
    </aside>
  );
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Structured Datasets", href: "/datasets", icon: Database },
  { label: "AI Assistant (RAG)", href: "/assistant", icon: Bot },
  { label: "Document Compare", href: "/compare", icon: GitCompare },
  { label: "Report Generator", href: "/reports", icon: FileSpreadsheet },
  { label: "Team & RBAC", href: "/team", icon: Users },
  { label: "Audit Trail", href: "/audit-logs", icon: ShieldAlert },
  { label: "Workspace Settings", href: "/settings", icon: Settings },
];
