'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Printer,
  Download,
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck,
  FileText,
} from 'lucide-react';

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [title, setTitle] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchReports = () => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((data) => {
        setReports(data.reports || []);
        if (data.reports && data.reports.length > 0) {
          setSelectedReport(data.reports[0]);
        }
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setGenerating(true);

    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: 'Custom Programme Evaluation Report' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      alert('Programme Report generated successfully!');
      setShowModal(false);
      setTitle('');
      fetchReports();
    } catch (err: any) {
      alert(err.message || 'Report generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Programme Report Generator</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Synthesize document RAG findings, dataset analytics, and research insights into structured exportable reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-teal-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Report</span>
          </button>
          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-teal-400" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports Navigation Sidebar */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-teal-400" />
            Generated Reports ({reports.length})
          </h2>

          <div className="space-y-2">
            {reports.map((rep) => {
              const isSelected = selectedReport?.id === rep.id;
              return (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReport(rep)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-950/20 border-teal-500/40 shadow-sm'
                      : 'bg-[#0f172a]/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-100">{rep.title}</div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(rep.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-teal-400 font-medium">Ready</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Report Interactive Preview Document */}
        <div className="lg:col-span-2 p-8 rounded-2xl bg-[#0f172a]/90 border border-slate-800 space-y-6 shadow-xl print:p-0 print:bg-white print:text-black">
          {selectedReport ? (
            <>
              {/* Document Header */}
              <div className="border-b border-slate-800 pb-4 space-y-2">
                <div className="inline-block px-2.5 py-0.5 rounded bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[10px] font-extrabold uppercase">
                  HEALTHINSIGHT PROGRAMME INTELLIGENCE REPORT
                </div>
                <h2 className="text-xl font-black text-white">{selectedReport.title}</h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-teal-400" /> Date: {new Date(selectedReport.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-teal-400" /> Author: Alex Rivera (Programme Manager)
                  </span>
                  <span>Sources: 3 Documents, 1 CSV Dataset</span>
                </div>
              </div>

              {/* Mandatory AI Disclosure & Disclaimer */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <div>
                  <strong>AI Assistance Disclosure:</strong> Report content was assembled with Hugging Face LLM assistance grounded in verified workspace data.
                </div>
                <div className="text-teal-400/90">
                  <strong>Mandatory Disclaimer:</strong> HealthInsight is a research and programme analysis tool. It does not provide medical diagnosis, treatment recommendations, or clinical advice.
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-6">
                {(selectedReport.sections || []).map((sec: any, idx: number) => (
                  <div key={idx} className="space-y-2">
                    <h3 className="text-sm font-bold text-teal-300 border-b border-slate-800/60 pb-1">
                      {sec.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
                      {sec.content}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-xs text-slate-500">
              Select or generate a report to view preview.
            </div>
          )}
        </div>
      </div>

      {/* Generate Report Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Generate Programme Intelligence Report</h3>
            <form onSubmit={handleGenerateReport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Report Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q3 Maternal & Child Health Evaluation Report"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs shadow-lg"
                >
                  {generating ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
