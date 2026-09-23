'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, User, RefreshCw, LogOut, Shield } from 'lucide-react';

interface HeaderProps {
  userSession?: {
    name: string;
    email: string;
    role: string;
    workspaceName: string;
  } | null;
}

export function Header({ userSession }: HeaderProps) {
  const router = useRouter();
  const [loadingSeed, setLoadingSeed] = useState(false);
  const [currentSession, setCurrentSession] = useState(userSession);

  useEffect(() => {
    if (!userSession) {
      fetch('/api/auth/session')
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated && data.user) {
            setCurrentSession(data.user);
          } else {
            // Default demo session fallback for immediate rich preview
            setCurrentSession({
              name: 'Alex Rivera',
              email: 'pm@healthinsight.org',
              role: 'PROGRAMME_MANAGER',
              workspaceName: 'Global Health Outreach Workspace',
            });
          }
        });
    }
  }, [userSession]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleSeedData = async () => {
    setLoadingSeed(true);
    try {
      await fetch('/api/seed', { method: 'POST' });
      alert('Synthetic health programme reports and datasets have been re-seeded!');
      window.location.reload();
    } catch (err) {
      alert('Seeding failed.');
    } finally {
      setLoadingSeed(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'PROGRAMME_MANAGER':
        return 'bg-teal-500/10 text-teal-300 border-teal-500/30';
      case 'RESEARCHER':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <header className="h-16 bg-[#0c101c]/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Workspace Switcher */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-200 shadow-inner">
          <Building2 className="w-3.5 h-3.5 text-teal-400" />
          <span>{currentSession?.workspaceName || 'Global Health Outreach Workspace'}</span>
        </div>
      </div>

      {/* User Actions & Role Indicator */}
      <div className="flex items-center gap-3">
        {/* Seed Data Action Button */}
        <button
          onClick={handleSeedData}
          disabled={loadingSeed}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 transition-colors"
          title="Reset demo synthetic health reports and datasets"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${loadingSeed ? 'animate-spin' : ''}`} />
          <span>{loadingSeed ? 'Seeding...' : 'Seed Demo Data'}</span>
        </button>

        {/* User Info Card */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-200">{currentSession?.name || 'Programme Manager'}</div>
            <div className="text-[10px] text-slate-400">{currentSession?.email || 'pm@healthinsight.org'}</div>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getRoleBadgeColor(currentSession?.role || 'PROGRAMME_MANAGER')}`}>
            {currentSession?.role || 'PROGRAMME_MANAGER'}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800/50 transition-colors ml-1"
          title="Log out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
