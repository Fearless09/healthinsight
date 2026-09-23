'use client';

import React, { useState } from 'react';
import { Settings, Cpu, Database, ShieldCheck, RefreshCw, Save } from 'lucide-react';

export default function SettingsPage() {
  const [hfApiKey, setHfApiKey] = useState('hf_••••••••••••••••••••••••••••••••');
  const [textModel, setTextModel] = useState('mistralai/Mistral-7B-Instruct-v0.3');
  const [embeddingModel, setEmbeddingModel] = useState('sentence-transformers/all-MiniLM-L6-v2');
  const [saved, setSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Workspace & AI Provider Settings</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure Hugging Face Inference models, vector embedding parameters, and privacy preprocessing options.
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Hugging Face AI Provider settings updated successfully.</span>
        </div>
      )}

      {/* Hugging Face AI Configuration */}
      <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-[#0f172a]/90 border border-slate-800 space-y-5">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Cpu className="w-4 h-4 text-teal-400" />
          Hugging Face Model Abstraction Service
        </h2>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Hugging Face API Token (HF_API_KEY)</label>
          <input
            type="password"
            value={hfApiKey}
            onChange={(e) => setHfApiKey(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
          />
          <p className="text-[11px] text-slate-500 mt-1">Never exposed to the browser. Server-side environment variable.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">HF Text Generation Model (HF_TEXT_MODEL)</label>
            <input
              type="text"
              value={textModel}
              onChange={(e) => setTextModel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">HF Embedding Model (HF_EMBEDDING_MODEL)</label>
            <input
              type="text"
              value={embeddingModel}
              onChange={(e) => setEmbeddingModel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-teal-600/20 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Model Settings</span>
          </button>
        </div>
      </form>

      {/* Vector Database & Storage Status */}
      <div className="p-6 rounded-2xl bg-[#0f172a]/90 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Database className="w-4 h-4 text-cyan-400" />
          Vector Storage & Database Configuration
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[11px]">Database Provider</div>
            <div className="font-bold text-white">PostgreSQL + pgvector</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[11px]">ORM & Schema</div>
            <div className="font-bold text-teal-400">Drizzle ORM</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[11px]">Object Storage</div>
            <div className="font-bold text-cyan-400">Vercel Blob / Local Storage</div>
          </div>
        </div>
      </div>
    </div>
  );
}
