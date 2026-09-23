'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartPulse, Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('DemoPass123!');
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 shadow-xl shadow-teal-500/20 text-slate-950 font-bold mb-4">
            <HeartPulse className="w-8 h-8 text-slate-950" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">HEALTHINSIGHT</h1>
          <p className="text-xs text-teal-400 font-medium mt-1">
            "Turn health programme data into actionable insight."
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-lg font-bold text-slate-100 mb-1">Welcome Back</h2>
          <p className="text-xs text-slate-400 mb-6">Access your workspace documents, RAG assistant, and dataset analytics.</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@healthinsight.org"
                  required
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 transition-all"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* One-Click Demo Role Accounts */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="text-[11px] text-slate-400 font-semibold mb-2 text-center uppercase tracking-wider">
              Instant Demo Accounts (Click to Select)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => loginAsDemo('admin@healthinsight.org')}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-left text-xs transition-colors"
              >
                <div className="font-semibold text-purple-400">Admin</div>
                <div className="text-[10px] text-slate-500">Full control & audit logs</div>
              </button>
              <button
                type="button"
                onClick={() => loginAsDemo('pm@healthinsight.org')}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-teal-500/50 text-left text-xs transition-colors"
              >
                <div className="font-semibold text-teal-300">Programme Mgr</div>
                <div className="text-[10px] text-slate-500">Upload & analyze</div>
              </button>
              <button
                type="button"
                onClick={() => loginAsDemo('researcher@healthinsight.org')}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-left text-xs transition-colors"
              >
                <div className="font-semibold text-cyan-300">Researcher</div>
                <div className="text-[10px] text-slate-500">Semantic RAG & compare</div>
              </button>
              <button
                type="button"
                onClick={() => loginAsDemo('viewer@healthinsight.org')}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-600 text-left text-xs transition-colors"
              >
                <div className="font-semibold text-slate-300">Viewer</div>
                <div className="text-[10px] text-slate-500">Read-only AI queries</div>
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="text-center mt-6 text-[11px] text-slate-500 max-w-sm mx-auto flex items-center gap-1.5 justify-center">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>HealthInsight is a research tool. It does not provide medical advice.</span>
        </div>
      </div>
    </div>
  );
}
