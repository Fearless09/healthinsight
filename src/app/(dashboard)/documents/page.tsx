"use client";

import { useState } from "react";
import {
  FileText,
  Upload,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";
import { useDocuments, useUploadDocuments } from "@/tanstack/(hooks)/documents";
import { Document } from "@/db/schema";
import { InputGroup } from "@/components/ui/Input";

export default function DocumentsPage() {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { mutateAsync, isPending: uploading } = useUploadDocuments();
  const { data } = useDocuments();
  const documents = data || [];

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    mutateAsync(file);
  };

  const filteredDocs = documents.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <section aria-label="documents" className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Document Repository & PII Pipeline
        </h1>
        <p className="mt-0.5 text-xs text-slate-400">
          Upload PDF, DOCX, or TXT health programme reports. Text is
          automatically scrubbed for PII and indexed with pgvector.
        </p>
      </header>

      {/* PII Disclaimer Banner */}
      <code className="flex items-center gap-2 rounded-xl border border-teal-500/20 bg-teal-950/40 p-3 text-xs text-teal-200/90">
        <ShieldCheck className="size-4 shrink-0 text-teal-400" />
        <span>
          <strong>Automated Privacy Preprocessing:</strong> Names, phone
          numbers, emails, addresses, and ID numbers are detected and redacted
          ([PERSON], [PHONE], [EMAIL]) prior to vector embedding.
          <em className="mt-0.5 block text-[11px] text-teal-300/70">
            Automated PII detection may not identify all sensitive information.
            Review data before processing.
          </em>
        </span>
      </code>

      {/* File Upload Dropzone */}
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
            handleFileUpload(files[0]);
          }
        }}
        className={`transition-300 cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center ${
          dragActive
            ? "border-teal-400 bg-teal-500/10"
            : "border-slate-800 bg-[#0f172a]/90 hover:border-slate-700"
        }`}
      >
        <input
          type="file"
          id="fileInput"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files[0]) {
              handleFileUpload(files[0]);
            }
          }}
        />
        <label
          htmlFor="fileInput"
          className="flex cursor-pointer flex-col items-center"
        >
          <span className="mb-3 flex size-12 shrink-0 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10 text-teal-400 shadow-lg shadow-teal-500/10">
            <Upload className="size-6" />
          </span>
          <h3 className="flex items-center justify-center gap-2 text-sm font-bold text-slate-200">
            {uploading ? (
              <>
                <LoaderCircle className="size-4 shrink-0 animate-spin" />
                Processing & Indexing Vector Chunks...
              </>
            ) : (
              "Click to Upload or Drag & Drop Health Report"
            )}
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Supports PDF, DOCX, TXT (Up to 25MB)
          </p>
        </label>
      </main>

      {/* Main Content Layout */}
      <section className="relative grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        {/* Document List */}
        <main className="space-y-4 lg:sticky lg:top-18 lg:col-span-2">
          <header className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <FileText className="size-4 shrink-0 text-teal-400" />
              Processed Workspace Documents ({filteredDocs.length})
            </h2>

            {/* Search Input */}
            <div className="relative w-full max-w-48">
              <InputGroup
                id="docs_search"
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search docs..."
                size="sm"
                icon
              />
            </div>
          </header>

          <ul className="space-y-3">
            {filteredDocs.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <li
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`transition-300 group flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 ${
                    isSelected
                      ? "border-teal-500/40 bg-teal-950/20 shadow-sm shadow-teal-500/10"
                      : "border-slate-800 bg-[#0f172a]/90 hover:border-slate-700"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10 text-teal-400">
                      <FileText className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <h6 className="truncate text-sm font-bold text-slate-100">
                        {doc.name}
                      </h6>
                      <p className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">
                          {doc.fileType}
                        </span>
                        <span>•</span>
                        <span>{doc.pageCount} Pages</span>
                        <span>•</span>
                        <span>{doc.wordCount} Words</span>
                      </p>
                    </div>
                  </div>

                  <span className="flex shrink-0 items-center gap-3">
                    <span className="inline-flex items-center gap-1 rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-[10px] font-semibold text-teal-300">
                      <CheckCircle2 className="size-3 shrink-0 text-teal-400" />
                      {doc.status}
                    </span>
                    <ChevronRight className="transition-300 size-4 shrink-0 text-slate-500 group-hover:translate-x-1" />
                  </span>
                </li>
              );
            })}

            {filteredDocs.length === 0 && (
              <li className="rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-8 text-center text-xs text-slate-500">
                No matching documents found.
              </li>
            )}
          </ul>
        </main>

        {/* Selected Document Details Drawer */}
        <main className="space-y-4 rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-5">
          {selectedDoc ? (
            <>
              <header className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    {selectedDoc.name}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Processed:{" "}
                    {new Date(selectedDoc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="rounded border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-[10px] font-semibold text-teal-300 uppercase">
                  {selectedDoc.fileType}
                </span>
              </header>

              {/* PII Summary Badge */}
              <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-900/90 p-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <ShieldCheck className="size-4 shrink-0 text-teal-400" />
                  PII Protection Status
                </span>
                <p className="text-[11px] text-slate-400">
                  {selectedDoc.hasPiiDetected ? (
                    <span className="font-medium text-amber-300">
                      PII Detected & Scrubbed (
                      {selectedDoc.piiSummary?.count || 3} instances:{" "}
                      {selectedDoc.piiSummary?.types?.join(", ") ||
                        "PERSON, PHONE"}
                      )
                    </span>
                  ) : (
                    <span className="font-medium text-teal-400">
                      Clean — No direct PII detected
                    </span>
                  )}
                </p>
              </div>

              {/* Executive Summary */}
              <div>
                <h6 className="mb-1 text-xs font-semibold text-slate-300">
                  Executive Summary
                </h6>
                <p className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 text-xs leading-relaxed text-slate-400">
                  {selectedDoc.summary ||
                    "Summary generated via Hugging Face model abstraction."}
                </p>
              </div>

              {/* Extracted Findings */}
              <div>
                <h6 className="mb-1 text-xs font-semibold text-slate-300">
                  Extracted Key Findings
                </h6>
                <ul className="space-y-1.5">
                  {(selectedDoc.extractedFindings || []).map(
                    (finding: string, idx: number) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 rounded-lg border border-slate-800/50 bg-slate-900/40 p-2 text-xs text-slate-300"
                      >
                        <span className="font-bold text-teal-400">•</span>
                        <span>{finding}</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </>
          ) : (
            <p className="py-12 text-center text-xs text-balance text-slate-500">
              Select a document from the left list to view PII status, page
              count, and summary.
            </p>
          )}
        </main>
      </section>
    </section>
  );
}
