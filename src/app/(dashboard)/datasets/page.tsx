'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Upload,
  TrendingUp,
  CheckCircle2,
  Share2,
  Users,
  Brain,
  AlertCircle,
  Table as TableIcon,
  Sparkles,
} from 'lucide-react';
import { ParticipationChart } from '@/components/charts/ParticipationChart';
import { GeographicDistributionChart } from '@/components/charts/GeographicDistributionChart';

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDs, setSelectedDs] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fetchDatasets = () => {
    fetch('/api/datasets')
      .then((res) => res.json())
      .then((data) => {
        setDatasets(data.datasets || []);
        if (data.datasets && data.datasets.length > 0) {
          setSelectedDs(data.datasets[0]);
        }
      })
      .catch((err) => console.warn('Fetch datasets error:', err));
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleCsvUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/datasets/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'CSV upload failed');

      alert(`Dataset "${file.name}" uploaded & analyzed with deterministic TS metrics!`);
      fetchDatasets();
    } catch (err: any) {
      alert(err.message || 'Dataset processing failed');
    } finally {
      setUploading(false);
    }
  };

  const stats = selectedDs?.calculatedStats || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Structured Programme Dataset Analytics</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic TypeScript statistical calculations paired with AI qualitative interpretation. Zero LLM math.
          </p>
        </div>
      </div>

      {/* Upload CSV Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleCsvUpload(e.dataTransfer.files[0]);
          }
        }}
        className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer ${
          dragActive
            ? 'border-cyan-400 bg-cyan-500/10'
            : 'border-slate-800 bg-[#0f172a]/90 hover:border-slate-700'
        }`}
      >
        <input
          type="file"
          id="csvInput"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleCsvUpload(e.target.files[0]);
            }
          }}
        />
        <label htmlFor="csvInput" className="cursor-pointer flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3 shadow-lg shadow-cyan-500/10">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">
            {uploading ? 'Parsing CSV & Calculating Deterministic Metrics...' : 'Click to Upload CSV Dataset or Drag & Drop'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Expected columns: location, participants, completed, referred, outcome_rate, date</p>
        </label>
      </div>

      {/* Dataset Selector Tabs */}
      {datasets.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {datasets.map((ds) => {
            const isSelected = selectedDs?.id === ds.id;
            return (
              <button
                key={ds.id}
                onClick={() => setSelectedDs(ds)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/40 shadow-sm'
                    : 'bg-[#0f172a] text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {ds.name} ({ds.rowCount} rows)
              </button>
            );
          })}
        </div>
      )}

      {selectedDs ? (
        <>
          {/* Deterministic Stats Summary Banner */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl bg-[#0f172a]/90 border border-slate-800">
              <div className="text-[11px] text-slate-400">Total Enrolled</div>
              <div className="text-lg font-black text-white mt-1">{(stats.totalParticipants || 0).toLocaleString()}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0f172a]/90 border border-slate-800">
              <div className="text-[11px] text-slate-400">Average / Site</div>
              <div className="text-lg font-black text-slate-200 mt-1">{stats.averageParticipants || 0}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0f172a]/90 border border-slate-800">
              <div className="text-[11px] text-slate-400">Completion Rate</div>
              <div className="text-lg font-black text-teal-400 mt-1">{stats.completionRate || 0}%</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0f172a]/90 border border-slate-800">
              <div className="text-[11px] text-slate-400">Referral Rate</div>
              <div className="text-lg font-black text-cyan-400 mt-1">{stats.referralRate || 0}%</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0f172a]/90 border border-slate-800">
              <div className="text-[11px] text-slate-400">Missing Data %</div>
              <div className="text-lg font-black text-emerald-400 mt-1">{stats.missingDataPercentage || 0}%</div>
            </div>
          </div>

          {/* Charts & AI Interpretation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-5 rounded-2xl bg-[#0f172a]/90 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  Participation Trend Line
                </h3>
                <ParticipationChart data={stats.timeSeriesData} />
              </div>

              <div className="p-5 rounded-2xl bg-[#0f172a]/90 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-teal-400" />
                  Geographic District Breakdown
                </h3>
                <GeographicDistributionChart data={stats.geographicBreakdown} />
              </div>
            </div>

            {/* AI Qualitative Interpretation Card */}
            <div className="p-5 rounded-2xl bg-[#0f172a]/90 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Brain className="w-5 h-5 text-teal-400" />
                <div>
                  <h3 className="text-sm font-extrabold text-white">AI Non-Causal Interpretation</h3>
                  <div className="text-[10px] text-slate-400">Grounded in code-verified statistics</div>
                </div>
              </div>

              {/* Key Findings */}
              <div>
                <div className="text-xs font-semibold text-teal-300 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Key Findings
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {(selectedDs.aiSummary?.keyFindings || []).map((kf: string, idx: number) => (
                    <li key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                      {kf}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Observed Trends */}
              <div>
                <div className="text-xs font-semibold text-cyan-300 mb-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Observed Trends
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {(selectedDs.aiSummary?.trends || []).map((t: string, idx: number) => (
                    <li key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Non-Causality Safety Warning */}
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-[11px] text-amber-200/90">
                <strong>Safety Disclaimer:</strong> Low completion rates were observed in locations where transportation challenges were reported. The available dataset establishes correlation, not direct causation.
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="p-12 text-center text-xs text-slate-500 bg-[#0f172a]/90 rounded-2xl border border-slate-800">
          No structured dataset loaded yet. Upload a CSV to view deterministic statistical metrics.
        </div>
      )}
    </div>
  );
}
