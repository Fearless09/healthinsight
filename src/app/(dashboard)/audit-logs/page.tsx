"use client";

import { useMemo, useState } from "react";
import { Filter, Loader, User } from "lucide-react";
import { useAudit } from "@/tanstack/(hooks)/audit";
import { SelectGroup } from "@/components/ui/Select";

export default function AuditLogsPage() {
  const { data: auditData, isPending: loading } = useAudit();
  const logs = auditData || [];

  const [filterAction, setFilterAction] = useState("ALL");

  const filteredLogs = useMemo(() => {
    if (filterAction === "ALL") return logs;
    return logs.filter((log) => log.action === filterAction);
  }, [logs, filterAction]);

  const getActionBadgeColor = (action: string) => {
    if (action.includes("LOGIN"))
      return "bg-purple-500/10 text-purple-300 border-purple-500/30";
    if (action.includes("DOCUMENT"))
      return "bg-teal-500/10 text-teal-300 border-teal-500/30";
    if (action.includes("DATASET"))
      return "bg-cyan-500/10 text-cyan-300 border-cyan-500/30";
    if (action.includes("AI"))
      return "bg-indigo-500/10 text-indigo-300 border-indigo-500/30";
    if (action.includes("REPORT"))
      return "bg-amber-500/10 text-amber-300 border-amber-500/30";
    return "bg-slate-800 text-slate-300 border-slate-700";
  };

  return (
    <section aria-label="audit-logs" className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Security Audit Trail
          </h1>
          <p className="mt-0.5 text-xs text-slate-400">
            Immutable system audit logs tracking authentication, document
            indexing, AI assistant queries, dataset uploads, and RBAC changes.
          </p>
        </div>

        {/* Action Filter */}
        <div className="flex items-center gap-2">
          <Filter className="size-3.5 shrink-0 text-slate-500" />
          <SelectGroup
            id="filter-logs"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            options={events}
            size="sm"
          />
        </div>
      </header>

      {/* Audit Log Table */}
      <section className="space-y-4 rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-5 shadow-sm">
        {loading && filteredLogs.length === 0 ? (
          <div className="flex items-center gap-1 text-xs text-teal-400">
            <Loader className="size-4 shrink-0 animate-spin" />
            <span>Loading audit logs...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <p className="py-12 text-center text-xs text-slate-500">
            No audit log records match the selected action filter.
          </p>
        ) : (
          <main className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-[10px] tracking-wider text-slate-400 uppercase">
                <tr>
                  <th className="rounded-l-lg p-3">Timestamp</th>
                  <th className="p-3 text-center">User Email</th>
                  <th className="p-3 text-center">Action Event</th>
                  <th className="p-3 text-center">Resource Type</th>
                  <th className="rounded-r-lg p-3 text-right">
                    Metadata Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 border-t border-slate-800">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="transition-300 hover:bg-slate-900/40"
                  >
                    <td className="p-3 font-mono text-[11px] whitespace-nowrap text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="flex items-center justify-center gap-1.5 p-3 text-center font-semibold text-slate-200">
                      <User className="size-3.5 shrink-0 text-teal-400" />
                      {log.userEmail}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`rounded border px-2 py-0.5 text-[10px] font-bold ${getActionBadgeColor(log.action)}`}
                      >
                        {log.action.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono text-slate-400">
                      {log.resourceType.replaceAll("_", " ")}
                    </td>
                    <td className="max-w-xs truncate p-3 text-right font-mono text-[11px] text-slate-300">
                      {JSON.stringify(log.metadata || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </main>
        )}
      </section>
    </section>
  );
}

const events = [
  { name: "All Event Types", value: "ALL" },
  { name: "USER_LOGIN", value: "USER_LOGIN" },
  { name: "DOCUMENT_UPLOADED", value: "DOCUMENT_UPLOADED" },
  { name: "DATASET_UPLOADED", value: "DATASET_UPLOADED" },
  { name: "AI_QUESTION_ASKED", value: "AI_QUESTION_ASKED" },
  { name: "REPORT_GENERATED", value: "REPORT_GENERATED" },
  { name: "TEAM_ROLE_CHANGED", value: "TEAM_ROLE_CHANGED" },
];
