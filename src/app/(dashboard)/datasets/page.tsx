"use client";

import { useEffect, useState } from "react";
import { Database, TrendingUp, Brain, Sparkles } from "lucide-react";
import { ParticipationChart } from "@/components/charts/ParticipationChart";
import { GeographicDistributionChart } from "@/components/charts/GeographicDistributionChart";
import { useDatasets, useUploadDatasets } from "@/tanstack/(hooks)/datasets";
import { Dataset } from "@/db/schema";
import { cn } from "@/utils/utils";

export default function DatasetsPage() {
  const { data: datasetsData } = useDatasets();
  const datasets = datasetsData || [];
  const [selectedDs, setSelectedDs] = useState<Dataset | null>(null);
  const { mutateAsync: uploadDataset, isPending: uploading } =
    useUploadDatasets();

  const [dragActive, setDragActive] = useState(false);

  const handleCsvUpload = async (file: File) => {
    if (!file) return;
    uploadDataset(file);
  };

  const stats = selectedDs?.calculatedStats || {};

  useEffect(() => {
    if (datasets.length > 0) {
      setSelectedDs(datasets[0]);
    }
  }, [datasets]);

  return (
    <section aria-label="datasets" className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Structured Programme Dataset Analytics
        </h1>
        <p className="mt-0.5 text-xs text-slate-400">
          Deterministic TypeScript statistical calculations paired with AI
          qualitative interpretation. Zero LLM math.
        </p>
      </header>

      {/* Upload CSV Dropzone */}
      <main
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          const files = e.dataTransfer.files;
          if (files && files[0]) {
            handleCsvUpload(files[0]);
          }
        }}
        className={`transition-300 cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center ${
          dragActive
            ? "border-cyan-400 bg-cyan-500/10"
            : "border-slate-800 bg-[#0f172a]/90 hover:border-slate-700"
        }`}
      >
        <input
          type="file"
          id="csvInput"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files[0]) {
              handleCsvUpload(files[0]);
            }
          }}
        />
        <label
          htmlFor="csvInput"
          className="flex cursor-pointer flex-col items-center"
        >
          <span className="mb-3 flex size-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 shadow-lg shadow-cyan-500/10">
            <Database className="size-6" />
          </span>

          <h3 className="text-sm font-bold text-slate-200">
            {uploading
              ? "Parsing CSV & Calculating Deterministic Metrics..."
              : "Click to Upload CSV Dataset or Drag & Drop"}
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Expected columns: location, participants, completed, referred,
            outcome_rate, date
          </p>
        </label>
      </main>

      {/* Dataset Selector Tabs */}
      {datasets.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {datasets.map((ds) => {
            const isSelected = selectedDs?.id === ds.id;
            return (
              <button
                key={ds.id}
                onClick={() => setSelectedDs(ds)}
                className={`transition-300 cursor-pointer rounded-xl border px-4 py-2 text-xs font-semibold whitespace-nowrap ${
                  isSelected
                    ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300 shadow-sm"
                    : "border-slate-800 bg-[#0f172a] text-slate-400 hover:text-slate-200"
                }`}
              >
                {ds.name.replaceAll("_", " ")} ({ds.rowCount} rows)
              </button>
            );
          })}
        </div>
      )}

      {selectedDs ? (
        <>
          {/* Deterministic Stats Summary Banner */}
          <main className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <StatsCard
              name="Total Enrolled"
              value={(stats.totalParticipants || 0).toLocaleString()}
            />
            <StatsCard
              name="Average / Site"
              value={(stats.averageParticipants || 0).toLocaleString()}
            />
            <StatsCard
              name="Completion Rate"
              value={(stats.completionRate || 0) + "%"}
            />
            <StatsCard
              name="Referral Rate"
              value={(stats.referralRate || 0) + "%"}
            />
            <StatsCard
              name="Missing Data %"
              value={(stats.missingDataPercentage || 0) + "%"}
            />
          </main>

          {/* Charts & AI Interpretation */}
          <section className="relative grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
            <main className="space-y-6 lg:col-span-2">
              <div className="space-y-3 rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                  <TrendingUp className="size-4 shrink-0 text-cyan-400" />
                  Participation Trend Line
                </h3>
                <ParticipationChart data={stats.timeSeriesData} />
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                  <Database className="size-4 shrink-0 text-teal-400" />
                  Geographic District Breakdown
                </h3>
                <GeographicDistributionChart data={stats.geographicBreakdown} />
              </div>
            </main>

            {/* AI Qualitative Interpretation Card */}
            <aside className="space-y-4 rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-5 lg:sticky lg:top-18">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Brain className="size-5 shrink-0 text-teal-400" />
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    AI Non-Causal Interpretation
                  </h3>
                  <div className="text-[10px] text-slate-400">
                    Grounded in code-verified statistics
                  </div>
                </div>
              </div>

              {/* Key Findings */}
              <div>
                <h6 className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-teal-300">
                  <Sparkles className="size-3.5 shrink-0" /> Key Findings
                </h6>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {(selectedDs.aiSummary?.keyFindings || []).map((kf, idx) => (
                    <li
                      key={idx}
                      className="rounded-lg border border-slate-800/80 bg-slate-900 p-2"
                    >
                      {kf}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Observed Trends */}
              <div>
                <h6 className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-cyan-300">
                  <TrendingUp className="size-3.5 shrink-0" /> Observed Trends
                </h6>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {(selectedDs.aiSummary?.trends || []).map((t, idx) => (
                    <li
                      key={idx}
                      className="rounded-lg border border-slate-800/80 bg-slate-900 p-2"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Non-Causality Safety Warning */}
              <article className="rounded-xl border border-amber-500/20 bg-amber-950/30 p-3 text-[11px] text-amber-200/90">
                <strong>Safety Disclaimer:</strong> Low completion rates were
                observed in locations where transportation challenges were
                reported. The available dataset establishes correlation, not
                direct causation.
              </article>
            </aside>
          </section>
        </>
      ) : (
        <p className="rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-12 text-center text-xs text-balance text-slate-500">
          No structured dataset loaded yet. Upload a CSV to view deterministic
          statistical metrics.
        </p>
      )}
    </section>
  );
}

type Stats = {
  name:
    | "Total Enrolled"
    | "Average / Site"
    | "Completion Rate"
    | "Referral Rate"
    | "Missing Data %";
  value: string;
};
const StatsCard = ({ name, value }: Stats) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#0f172a]/90 p-3.5">
      <p className="text-[11px] text-slate-400">{name}</p>
      <h6
        className={cn("mt-1 text-lg font-black text-white", {
          "text-white": name === "Total Enrolled",
          "text-blue-400": name === "Average / Site",
          "text-teal-400": name === "Completion Rate",
          "text-cyan-400": name === "Referral Rate",
          "text-emerald-400": name === "Missing Data %",
        })}
      >
        {value}
      </h6>
    </div>
  );
};
