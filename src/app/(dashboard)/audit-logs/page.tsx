'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Filter, Clock, User, CheckCircle2 } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('ALL');

  useEffect(() => {
    fetch('/api/audit-logs')
      .then((res) => res.json())
      .then((data) => setLogs(data.auditLogs || []))
      .catch((err) => console.warn('Fetch audit logs error:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter((log) =>
    filterAction === 'ALL' ? true : log.action === filterAction
  );

  const getActionBadgeColor = (action: string) => {
    if (action.includes('LOGIN')) return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
    if (action.includes('DOCUMENT')) return 'bg-teal-500/10 text-teal-300 border-teal-500/30';
    if (action.includes('DATASET')) return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
    if (action.includes('AI')) return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
    if (action.includes('REPORT')) return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Security Audit Trail</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable system audit logs tracking authentication, document indexing, AI assistant queries, dataset uploads, and RBAC changes.
          </p>
        </div>

        {/* Action Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">All Event Types</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
            <option value="DOCUMENT_UPLOADED">DOCUMENT_UPLOADED</option>
            <option value="DATASET_UPLOADED">DATASET_UPLOADED</option>
            <option value="AI_QUESTION_ASKED">AI_QUESTION_ASKED</option>
            <option value="REPORT_GENERATED">REPORT_GENERATED</option>
            <option value="TEAM_ROLE_CHANGED">TEAM_ROLE_CHANGED</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="p-5 rounded-2xl bg-[#0f172a]/90 border border-slate-800 space-y-4 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="p-3 rounded-l-lg">Timestamp</th>
                <th className="p-3">User Email</th>
                <th className="p-3">Action Event</th>
                <th className="p-3">Resource Type</th>
                <th className="p-3 rounded-r-lg">Metadata Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3 font-semibold text-slate-200 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-teal-400" />
                    {log.userEmail}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getActionBadgeColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-400">{log.resourceType}</td>
                  <td className="p-3 text-slate-300 max-w-xs truncate font-mono text-[11px]">
                    {JSON.stringify(log.metadata || {})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-500">
            No audit log records match the selected action filter.
          </div>
        )}
      </div>
    </div>
  );
}
