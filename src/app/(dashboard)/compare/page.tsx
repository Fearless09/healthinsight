'use client';

import React, { useState, useEffect } from 'react';
import { GitCompare, FileText, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ComparePage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [doc1, setDoc1] = useState('');
  const [doc2, setDoc2] = useState('');
  const [comparison, setComparison] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/documents')
      .then((res) => res.json())
      .then((data) => {
        const list = data.documents || [];
        setDocuments(list);
        if (list.length >= 2) {
          setDoc1(list[0].name);
          setDoc2(list[1].name);
        } else if (list.length === 1) {
          setDoc1(list[0].name);
        }
      });
  }, []);

  const handleCompare = async () => {
    if (!doc1 || !doc2) {
      alert('Please select two documents to compare.');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/ai/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doc1Name: doc1, doc2Name: doc2 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Comparison failed');

      setComparison(data.comparison);
    } catch (err: any) {
      alert(err.message || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Structured Document Comparison</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Select two health programme evaluation documents to compare common findings, metric differences, and distinct outcomes.
        </p>
      </div>

      {/* Document Selection Panel */}
      <div className="p-5 rounded-2xl bg-[#0f172a]/90 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Document 1 (Baseline)</label>
            <select
              value={doc1}
              onChange={(e) => setDoc1(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Document 2 (Comparison target)</label>
            <select
              value={doc2}
              onChange={(e) => setDoc2(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleCompare}
          disabled={loading || !doc1 || !doc2}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-teal-600/20 transition-all"
        >
          <GitCompare className="w-4 h-4" />
          <span>{loading ? 'Analyzing & Comparing Documents...' : 'Generate Structured Comparison'}</span>
        </button>
      </div>

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Common Findings */}
            <div className="p-5 rounded-2xl bg-[#0f172a]/90 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                Common Findings Across Reports
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {comparison.commonFindings?.map((cf: string, idx: number) => (
                  <li key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2">
                    <span className="text-teal-400 font-bold">•</span>
                    <span>{cf}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Different Findings */}
            <div className="p-5 rounded-2xl bg-[#0f172a]/90 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-cyan-400" />
                Implementation Differences
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {comparison.differentFindings?.map((df: string, idx: number) => (
                  <li key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{df}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Metric Comparison Table */}
          <div className="p-5 rounded-2xl bg-[#0f172a]/90 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Metric Comparison Table</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3 rounded-l-lg">Indicator Metric</th>
                    <th className="p-3">{comparison.doc1Name}</th>
                    <th className="p-3 rounded-r-lg">{comparison.doc2Name}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {comparison.metricComparison?.map((mc: any, idx: number) => (
                    <tr key={idx}>
                      <td className="p-3 font-semibold text-slate-200">{mc.metric}</td>
                      <td className="p-3 text-teal-400 font-bold">{mc.doc1}</td>
                      <td className="p-3 text-cyan-400 font-bold">{mc.doc2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Disclaimer Note */}
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-200/90 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{comparison.disclaimer}</span>
          </div>
        </div>
      )}
    </div>
  );
}
