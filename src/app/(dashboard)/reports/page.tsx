"use client";

import React, { useEffect, useState } from "react";
import {
  FileSpreadsheet,
  Plus,
  Printer,
  Calendar,
  User,
  Trash,
  LoaderCircle,
} from "lucide-react";
import {
  useDeleteReport,
  useGenerateReport,
  useReport,
} from "@/tanstack/(hooks)/report";
import { Report } from "@/db/schema";
import { cn } from "@/utils/utils";
import { InputGroup } from "@/components/ui/Input";

export default function ReportsPage() {
  const { data: reportsData } = useReport();
  const reports = reportsData || [];

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handlePrintPdf = () => {
    window.print();
  };

  useEffect(() => {
    if (reports.length === 0) return;
    setSelectedReport(reports[0]);
  }, [reports]);

  return (
    <section aria-label="reports" className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Programme Report Generator
          </h1>
          <p className="mt-0.5 text-xs text-slate-400">
            Synthesize document RAG findings, dataset analytics, and research
            insights into structured exportable reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="transition-300 flex cursor-pointer items-center gap-1.5 rounded-xl bg-teal-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-teal-600/20 hover:bg-teal-500"
          >
            <Plus className="size-4 shrink-0" />
            <span>Generate New Report</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="transition-300 flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
          >
            <Printer className="size-3.5 shrink-0 text-teal-400" />
            <span>Export PDF</span>
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <section className="relative grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        {/* Reports Navigation Sidebar */}
        <main className="space-y-3 lg:sticky lg:top-18">
          <h2 className="flex items-center gap-2 text-sm font-bold text-white">
            <FileSpreadsheet className="size-4 shrink-0 text-teal-400" />
            Generated Reports ({reports.length})
          </h2>

          <div className="space-y-2">
            {reports.map((rep) => (
              <ReportBar
                key={rep.id}
                rep={rep}
                isSelected={selectedReport?.id === rep.id}
                onSelect={() => setSelectedReport(rep)}
              />
            ))}
          </div>
        </main>

        {/* Selected Report Interactive Preview Document */}
        <main className="space-y-6 rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-8 shadow-xl lg:col-span-2 print:bg-white print:p-0 print:text-black">
          {selectedReport ? (
            <>
              {/* Document Header */}
              <div className="space-y-2 border-b border-slate-800 pb-4">
                <span className="inline-block rounded border border-teal-500/30 bg-teal-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-teal-300 uppercase">
                  HEALTHINSIGHT PROGRAMME INTELLIGENCE REPORT
                </span>
                <h2 className="text-xl font-black text-white">
                  {selectedReport.title}
                </h2>
                <div
                  className={cn(
                    "flex flex-wrap items-center gap-4 text-xs text-slate-400",
                    "[&_svg]:size-3.5 [&_svg]:text-teal-400",
                  )}
                >
                  <span className="flex items-center gap-1">
                    <Calendar /> Date:{" "}
                    {new Date(selectedReport.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <User /> Author: Alex Rivera (Programme Manager)
                  </span>
                  <span>Sources: 3 Documents, 1 CSV Dataset</span>
                </div>
              </div>

              {/* Mandatory AI Disclosure & Disclaimer */}
              <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/90 p-3 text-[11px] text-slate-400">
                <p>
                  <strong>AI Assistance Disclosure:</strong> Report content was
                  assembled with Hugging Face LLM assistance grounded in
                  verified workspace data.
                </p>
                <p className="text-teal-400/90">
                  <strong>Mandatory Disclaimer:</strong> HealthInsight is a
                  research and programme analysis tool. It does not provide
                  medical diagnosis, treatment recommendations, or clinical
                  advice.
                </p>
              </div>

              {/* Sections */}
              <ul className="space-y-6">
                {(selectedReport.sections || []).map((sec, idx) => (
                  <li key={idx} className="space-y-2">
                    <h3 className="border-b border-slate-800/60 pb-1 text-sm font-bold text-teal-300">
                      {sec.title}
                    </h3>
                    <p className="rounded-xl border border-slate-800/50 bg-slate-950/40 p-3 text-xs leading-relaxed text-slate-300">
                      {sec.content}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="py-20 text-center text-xs text-slate-500">
              Select or generate a report to view preview.
            </p>
          )}
        </main>
      </section>

      {/* Generate Report Modal */}
      {showModal && <Modal onClose={() => setShowModal(false)} />}
    </section>
  );
}

type ReportBarProps = {
  rep: Report;
  isSelected: boolean;
  onSelect: () => void;
};
const ReportBar = ({ isSelected, onSelect, rep }: ReportBarProps) => {
  const { mutateAsync: deleteReportAsync, isPending: deleting } =
    useDeleteReport();

  return (
    <div
      onClick={() => onSelect()}
      className={`transition-300 cursor-pointer rounded-xl border p-3.5 ${
        isSelected
          ? "border-teal-500/40 bg-teal-950/20 shadow-sm"
          : "border-slate-800 bg-[#0f172a]/90 hover:border-slate-700"
      }`}
    >
      <h6 className="truncate text-xs font-bold text-slate-100">{rep.title}</h6>
      <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <Calendar className="size-3 shrink-0 text-slate-500" />
          {new Date(rep.createdAt).toLocaleDateString()}
        </span>
        <span className="font-medium text-teal-400">Ready</span>
        <button
          type="button"
          className={cn(
            "ms-auto cursor-pointer disabled:pointer-events-none disabled:opacity-75",
            "[&>svg]:size-3.5 [&>svg]:shrink-0",
          )}
          onClick={(e) => {
            e.stopPropagation();
            deleteReportAsync(rep.id);
          }}
          disabled={deleting}
        >
          {deleting ? (
            <LoaderCircle className="animate-spin stroke-3 text-red-400" />
          ) : (
            <Trash className="text-red-400" />
          )}
        </button>
      </div>
    </div>
  );
};

const Modal = ({ onClose }: { onClose: () => void }) => {
  const { mutateAsync: generateReportAsync, isPending: generating } =
    useGenerateReport();

  const [title, setTitle] = useState("");

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    await generateReportAsync(title);
    onClose();
  };

  return (
    <section
      aria-label="modal backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
    >
      <section
        aria-label="modal"
        className="w-full max-w-md space-y-4 rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-2xl"
      >
        <h3 className="text-sm font-bold text-white">
          Generate Programme Intelligence Report
        </h3>
        <form onSubmit={handleGenerateReport} className="space-y-4">
          <InputGroup
          id="report_title"
            label="Report Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q3 Maternal & Child Health Evaluation Report"
            required
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onClose()}
              className="rounded-xl bg-slate-800 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 disabled:pointer-events-none disabled:opacity-50"
              disabled={generating}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={generating}
              className="flex items-center gap-1 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg hover:bg-teal-500 disabled:pointer-events-none disabled:opacity-75"
            >
              {generating ? (
                <>
                  <LoaderCircle className="size-3.5 shrink-0 animate-spin stroke-3" />
                  Generating...
                </>
              ) : (
                "Generate Report"
              )}
            </button>
          </div>
        </form>
      </section>
    </section>
  );
};
