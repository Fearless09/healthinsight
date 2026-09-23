'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Clock,
  ChevronRight,
  Eye,
  Search,
} from 'lucide-react';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDocs = () => {
    fetch('/api/documents')
      .then((res) => res.json())
      .then((data) => {
        setDocuments(data.documents || []);
        if (data.documents && data.documents.length > 0) {
          setSelectedDoc(data.documents[0]);
        }
      })
      .catch((err) => console.warn('Fetch docs error:', err));
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      alert(`Document "${file.name}" uploaded, PII scrubbed, and pgvector indexed successfully!`);
      fetchDocs();
    } catch (err: any) {
      alert(err.message || 'File processing failed');
    } finally {
      setUploading(false);
    }
  };

  const filteredDocs = documents.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Document Repository & PII Pipeline</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload PDF, DOCX, or TXT health programme reports. Text is automatically scrubbed for PII and indexed with pgvector.
          </p>
        </div>
      </div>

      {/* PII Disclaimer Banner */}
      <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/20 text-xs text-teal-200/90 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
        <span>
          <strong>Automated Privacy Preprocessing:</strong> Names, phone numbers, emails, addresses, and ID numbers are detected and redacted ([PERSON], [PHONE], [EMAIL]) prior to vector embedding.
          <em className="block text-[11px] text-teal-300/70 mt-0.5">Automated PII detection may not identify all sensitive information. Review data before processing.</em>
        </span>
      </div>

      {/* File Upload Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
          }
        }}
        className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer ${
          dragActive
            ? 'border-teal-400 bg-teal-500/10'
            : 'border-slate-800 bg-[#0f172a]/90 hover:border-slate-700'
        }`}
      >
        <input
          type="file"
          id="fileInput"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />
        <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-3 shadow-lg shadow-teal-500/10">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">
            {uploading ? 'Processing & Indexing Vector Chunks...' : 'Click to Upload or Drag & Drop Health Report'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, TXT (Up to 25MB)</p>
        </label>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-400" />
              Processed Workspace Documents ({filteredDocs.length})
            </h2>

            {/* Search Input */}
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search docs..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredDocs.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-teal-950/20 border-teal-500/40 shadow-sm shadow-teal-500/10'
                      : 'bg-[#0f172a]/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-100 truncate">{doc.name}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                        <span className="uppercase text-[10px] font-semibold text-slate-400">{doc.fileType}</span>
                        <span>•</span>
                        <span>{doc.pageCount} Pages</span>
                        <span>•</span>
                        <span>{doc.wordCount} Words</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[10px] font-semibold">
                      <CheckCircle2 className="w-3 h-3 text-teal-400" />
                      {doc.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              );
            })}

            {filteredDocs.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500 bg-[#0f172a]/90 rounded-2xl border border-slate-800">
                No matching documents found.
              </div>
            )}
          </div>
        </div>

        {/* Selected Document Details Drawer */}
        <div className="p-5 rounded-2xl bg-[#0f172a]/90 border border-slate-800 space-y-4">
          {selectedDoc ? (
            <>
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-white">{selectedDoc.name}</h3>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Processed: {new Date(selectedDoc.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[10px] font-semibold uppercase">
                  {selectedDoc.fileType}
                </span>
              </div>

              {/* PII Summary Badge */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  PII Protection Status
                </div>
                <div className="text-[11px] text-slate-400">
                  {selectedDoc.hasPiiDetected ? (
                    <span className="text-amber-300 font-medium">
                      PII Detected & Scrubbed ({selectedDoc.piiSummary?.count || 3} instances: {selectedDoc.piiSummary?.types?.join(', ') || 'PERSON, PHONE'})
                    </span>
                  ) : (
                    <span className="text-teal-400 font-medium">Clean — No direct PII detected</span>
                  )}
                </div>
              </div>

              {/* Executive Summary */}
              <div>
                <div className="text-xs font-semibold text-slate-300 mb-1">Executive Summary</div>
                <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  {selectedDoc.summary || 'Summary generated via Hugging Face model abstraction.'}
                </p>
              </div>

              {/* Extracted Findings */}
              <div>
                <div className="text-xs font-semibold text-slate-300 mb-1">Extracted Key Findings</div>
                <ul className="space-y-1.5">
                  {(selectedDoc.extractedFindings || []).map((finding: string, idx: number) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-900/40 p-2 rounded-lg border border-slate-800/50">
                      <span className="text-teal-400 font-bold">•</span>
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              Select a document from the left list to view PII status, page count, and summary.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
