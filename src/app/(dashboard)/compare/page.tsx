"use client";

import { useState, useEffect, useCallback } from "react";
import {
  GitCompare,
  CheckCircle2,
  ShieldCheck,
  LoaderCircle,
} from "lucide-react";
import {
  useCompareDocuments,
  useDocuments,
} from "@/tanstack/(hooks)/documents";
import { cn } from "@/utils/utils";
import { SelectGroup } from "@/components/ui/Select";

export default function ComparePage() {
  const { data: documentsData } = useDocuments();
  const documents = documentsData || [];

  const {
    mutateAsync: compareAsync,
    isPending: loading,
    data: comparison,
  } = useCompareDocuments();

  const [doc1, setDoc1] = useState("");
  const [doc2, setDoc2] = useState("");

  useEffect(() => {
    if (documents.length === 0) return;

    if (documents.length == 1) {
      setDoc1(documents[0].name);
    } else {
      setDoc1(documents[0].name);
      setDoc2(documents[1].name);
      handleCompare(documents[0].name, documents[1].name);
    }
  }, [documents]);

  const handleCompare = useCallback(
    async (doc1: string, doc2: string) => {
      if (!doc1 || !doc2) {
        alert("Please select two documents to compare.");
        return;
      }
      compareAsync({ doc1Name: doc1, doc2Name: doc2 });
    },
    [compareAsync],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Structured Document Comparison
        </h1>
        <p className="mt-0.5 text-xs text-slate-400">
          Select two health programme evaluation documents to compare common
          findings, metric differences, and distinct outcomes.
        </p>
      </header>

      {/* Document Selection Panel */}
      <section className="space-y-4 rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-5">
        <main className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectGroup
            id="select-doc1"
            label="Document 1 (Baseline)"
            value={doc1}
            onChange={(e) => setDoc1(e.target.value)}
            options={documents.map(({ name }) => ({ name, value: name }))}
          />
          <SelectGroup
            id="select-doc2"
            label="Document 2 (Comparison target)"
            value={doc2}
            onChange={(e) => setDoc2(e.target.value)}
            options={documents.map(({ name }) => ({ name, value: name }))}
          />
        </main>

        <button
          onClick={() => handleCompare(doc1, doc2)}
          disabled={loading || !doc1 || !doc2}
          className={cn(
            "transition-300 flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-teal-600/20 hover:bg-teal-500 disabled:opacity-75",
            "[&>svg]:size-4 [&>svg]:shrink-0",
          )}
        >
          {loading ? (
            <>
              <LoaderCircle className="animate-spin stroke-3" />
              Analyzing & Comparing Documents...
            </>
          ) : (
            <>
              <GitCompare />
              Generate Structured Comparison
            </>
          )}
        </button>
      </section>

      {/* Comparison Results */}
      {comparison && (
        <section className="space-y-6">
          <main className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Common Findings */}
            <div className="space-y-3 rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-5">
              <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-teal-300 uppercase">
                <CheckCircle2 className="size-4 shrink-0 text-teal-400" />
                Common Findings Across Reports
              </h3>

              <ul className="space-y-2 text-xs text-slate-300">
                {comparison.commonFindings?.map((cf, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-900 p-3"
                  >
                    <span className="font-bold text-teal-400">•</span>
                    <span>{cf}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Different Findings */}
            <div className="space-y-3 rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-5">
              <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-cyan-300 uppercase">
                <GitCompare className="size-4 shrink-0 text-cyan-400" />
                Implementation Differences
              </h3>

              <ul className="space-y-2 text-xs text-slate-300">
                {comparison.differentFindings?.map((df, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-900 p-3"
                  >
                    <span className="font-bold text-cyan-400">•</span>
                    <span>{df}</span>
                  </li>
                ))}
              </ul>
            </div>
          </main>

          {/* Metric Comparison Table */}
          <main className="space-y-3 rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-5">
            <h3 className="text-xs font-bold tracking-wider text-white uppercase">
              Metric Comparison Table
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-[10px] text-slate-400 uppercase">
                  <tr>
                    <th className="rounded-l-lg p-3">Indicator Metric</th>
                    <th className="p-3 text-center">{comparison.doc1Name}</th>
                    <th className="rounded-r-lg p-3 text-center">
                      {comparison.doc2Name}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 border-t border-slate-800">
                  {comparison.metricComparison?.map((mc: any, idx: number) => (
                    <tr key={idx}>
                      <td className="p-3 font-semibold text-slate-200">
                        {mc.metric}
                      </td>
                      <td className="p-3 text-center font-bold text-teal-400">
                        {mc.doc1}
                      </td>
                      <td className="p-3 text-center font-bold text-cyan-400">
                        {mc.doc2}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>

          {/* Disclaimer Note */}
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-950/30 p-3 text-xs text-amber-200/90">
            <ShieldCheck className="size-4 shrink-0 text-amber-400" />
            <span>{comparison.disclaimer}</span>
          </div>
        </section>
      )}
    </div>
  );
}
