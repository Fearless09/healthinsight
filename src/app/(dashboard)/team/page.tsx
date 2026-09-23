'use client';

import React, { useState, useEffect } from 'react';
import { Users, Shield, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeam = () => {
    fetch('/api/team')
      .then((res) => res.json())
      .then((data) => setMembers(data.members || []))
      .catch((err) => console.warn('Fetch team error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId, newRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Role change failed');

      alert(`Role updated to ${newRole}`);
      fetchTeam();
    } catch (err: any) {
      alert(err.message || 'Updating role failed');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'PROGRAMME_MANAGER':
        return 'bg-teal-500/10 text-teal-300 border-teal-500/30';
      case 'RESEARCHER':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Team Management & Role-Based Access Control (RBAC)</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage workspace members, assign RBAC roles (ADMIN, PROGRAMME_MANAGER, RESEARCHER, VIEWER), and enforce data access isolation.
        </p>
      </div>

      {/* Permissions Matrix Reference */}
      <div className="p-4 rounded-2xl bg-[#0f172a]/90 border border-slate-800 space-y-3">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-400" />
          Workspace Role Permissions Matrix
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase">
              <tr>
                <th className="p-2.5 rounded-l-lg">Role</th>
                <th className="p-2.5">Upload Docs / Datasets</th>
                <th className="p-2.5">Query AI RAG Assistant</th>
                <th className="p-2.5">Generate Reports</th>
                <th className="p-2.5">Delete Docs</th>
                <th className="p-2.5 rounded-r-lg">Manage Team & Logs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              <tr>
                <td className="p-2.5 font-bold text-purple-400">ADMIN</td>
                <td className="p-2.5 text-teal-400">✓ Allowed</td>
                <td className="p-2.5 text-teal-400">✓ Allowed</td>
                <td className="p-2.5 text-teal-400">✓ Allowed</td>
                <td className="p-2.5 text-teal-400">✓ Allowed</td>
                <td className="p-2.5 text-teal-400">✓ Allowed</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-teal-300">PROGRAMME_MANAGER</td>
                <td className="p-2.5 text-teal-400">✓ Allowed</td>
                <td className="p-2.5 text-teal-400">✓ Allowed</td>
                <td className="p-2.5 text-teal-400">✓ Allowed</td>
                <td className="p-2.5 text-teal-400">✓ Allowed</td>
                <td className="p-2.5 text-slate-500">✕ Restricted</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-cyan-300">RESEARCHER</td>
                <td className="p-2.5 text-teal-400">✓ Allowed</td>
                <td className="p-2.5 text-teal-400">✓ Allowed</td>
                <td className="p-2.5 text-teal-400">✓ Allowed</td>
                <td className="p-2.5 text-slate-500">✕ Restricted</td>
                <td className="p-2.5 text-slate-500">✕ Restricted</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-300">VIEWER</td>
                <td className="p-2.5 text-slate-500">✕ Read Only</td>
                <td className="p-2.5 text-teal-400">✓ Allowed</td>
                <td className="p-2.5 text-slate-500">✕ Restricted</td>
                <td className="p-2.5 text-slate-500">✕ Restricted</td>
                <td className="p-2.5 text-slate-500">✕ Restricted</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Member List */}
      <div className="p-5 rounded-2xl bg-[#0f172a]/90 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-teal-400" />
          Active Workspace Members ({members.length})
        </h2>

        <div className="space-y-3">
          {members.map((m) => (
            <div key={m.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-teal-300 text-sm">
                  {m.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-100">{m.name}</div>
                  <div className="text-xs text-slate-400">{m.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-md border text-xs font-semibold ${getRoleBadge(m.role)}`}>
                  {m.role}
                </span>

                {/* Role Switcher */}
                <select
                  value={m.role}
                  onChange={(e) => handleRoleChange(m.userId, e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="PROGRAMME_MANAGER">PROGRAMME_MANAGER</option>
                  <option value="RESEARCHER">RESEARCHER</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
