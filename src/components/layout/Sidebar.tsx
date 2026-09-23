'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Documents', href: '/documents', icon: FileText },
  { label: 'Structured Datasets', href: '/datasets', icon: Database },
  { label: 'AI Assistant (RAG)', href: '/assistant', icon: Bot },
  { label: 'Document Compare', href: '/compare', icon: GitCompare },
  { label: 'Report Generator', href: '/reports', icon: FileSpreadsheet },
  { label: 'Team & RBAC', href: '/team', icon: Users },
  { label: 'Audit Trail', href: '/audit-logs', icon: ShieldAlert },
  { label: 'Workspace Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#090d16] border-r border-slate-800/80 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20 text-slate-950 font-bold">
            <HeartPulse className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-wide bg-gradient-to-r from-white via-slate-200 to-teal-400 bg-clip-text text-transparent">
              HEALTHINSIGHT
            </h1>
            <p className="text-[10px] text-teal-400/90 font-medium tracking-tight">Programme Intelligence</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30 shadow-sm shadow-teal-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Tagline */}
      <div className="p-4 m-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-2 text-teal-400 font-semibold mb-1">
          <Activity className="w-3.5 h-3.5" />
          <span>HealthInsight</span>
        </div>
        <p className="text-[11px] text-slate-400 italic">
          "Turn health programme data into actionable insight."
        </p>
      </div>
    </aside>
  );
}
