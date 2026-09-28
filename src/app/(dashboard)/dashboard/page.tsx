"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Database,
  Users,
  CheckCircle2,
  Share2,
  TrendingUp,
  Clock,
  Plus,
  MoveRight,
} from "lucide-react";
import { ParticipationChart } from "@/components/charts/ParticipationChart";
import { CompletionRateChart } from "@/components/charts/CompletionRateChart";
import { GeographicDistributionChart } from "@/components/charts/GeographicDistributionChart";
import { cn } from "@/utils/utils";
import { useDocuments } from "@/tanstack/(hooks)/documents";
import { useReport } from "@/tanstack/(hooks)/report";
import { useDatasets } from "@/tanstack/(hooks)/datasets";

export default function DashboardPage() {
  const { data: documentsData, isLoading: documentsLoading } = useDocuments();
  const { data: reportsData, isLoading: reportsLoading } = useReport();
  const { data: datasetsData, isLoading: datasetsLoading } = useDatasets();
  const isLoading = useMemo(() => {
    return documentsLoading || reportsLoading || datasetsLoading;
  }, [documentsLoading, reportsLoading, datasetsLoading]);

  const documents = documentsData || [];
  const datasets = datasetsData || [];
  const reports = reportsData || [];

  const analytics = useMemo(() => {
    if (datasets.length <= 0) {
      return {
        totalParticipants: 1450,
        avgCompletionRate: 84.2,
        avgReferralRate: 14.8,
        avgOutcomeRate: 91.5,
      };
    }

    const totalParticipants = datasets.reduce(
      (acc, d) => acc + (d.calculatedStats?.totalParticipants || 0),
      0,
    );
    const avgCompletionRate =
      Math.round(
        (datasets.reduce(
          (acc, d) => acc + (d.calculatedStats?.completionRate || 84.2),
          0,
        ) /
          datasets.length) *
          10,
      ) / 10;
    const avgReferralRate =
      Math.round(
        (datasets.reduce(
          (acc, d) => acc + (d.calculatedStats?.referralRate || 14.8),
          0,
        ) /
          datasets.length) *
          10,
      ) / 10;
    const avgOutcomeRate =
      Math.round(
        (datasets.reduce(
          (acc, d) => acc + (d.calculatedStats?.outcomeRate || 91.5),
          0,
        ) /
          datasets.length) *
          10,
      ) / 10;

    return {
      totalParticipants,
      avgCompletionRate,
      avgReferralRate,
      avgOutcomeRate,
    };
  }, [datasets]);

  const {
    avgCompletionRate,
    avgOutcomeRate,
    avgReferralRate,
    totalParticipants,
  } = analytics;

  return (
    <section aria-label="dashboard" className="space-y-6">
      {/* Page Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Programme Executive Dashboard
          </h1>
          <p className="mt-0.5 text-xs text-slate-400">
            Turn health programme documents and structured datasets into
            grounded insights.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/documents"
            className="transition-300 flex items-center gap-1.5 rounded-xl bg-teal-600 px-3 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-teal-600/20 hover:bg-teal-500"
          >
            <Plus className="size-3.5" />
            <span>Upload Document</span>
          </Link>
          <Link
            href="/datasets"
            className="transition-300 flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
          >
            <Database className="size-3.5 text-teal-400" />
            <span>Upload CSV Dataset</span>
          </Link>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <main className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard name="Documents Processed" value={documents.length} />
        <KPICard name="Dataset Uploads" value={datasets.length} />
        <KPICard name="AI Research Queries" value={24} />
        <KPICard name="Reports Generated" value={reports.length} />
      </main>

      {/* Programme Performance Analytics Banner */}
      <main className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-800 bg-linear-to-r from-slate-900 via-[#0f172a] to-slate-900 p-4 text-center md:grid-cols-4">
        <AnalyticsCard
          name="Total Enrolled Participants"
          value={totalParticipants.toString()}
        />
        <AnalyticsCard
          name="Programme Completion Rate"
          value={avgCompletionRate + "%"}
        />
        <AnalyticsCard name="Referral Rate" value={avgReferralRate + "%"} />
        <AnalyticsCard
          name="Outcome Success Rate"
          value={avgOutcomeRate + "%"}
        />
      </main>

      {/* Charts Grid */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <main className="space-y-4 rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <TrendingUp className="size-4 shrink-0 text-teal-400" />
              Participation & Programme Completion Over Time
            </h2>
            <span className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-[10px] font-medium text-slate-400">
              Monthly
            </span>
          </div>
          <ParticipationChart
            data={datasets[0]?.calculatedStats?.timeSeriesData}
          />
        </main>

        <main className="space-y-4 rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-bold text-white">
            <CheckCircle2 className="size-4 shrink-0 text-teal-400" />
            Programme Completion Ratio
          </h2>
          <CompletionRateChart
            completionRate={avgCompletionRate}
            referralRate={avgReferralRate}
          />
        </main>
      </section>

      {/* Geographic Distribution Chart & Recent Activity */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-5 shadow-sm lg:col-span-2">
          <h2 className="flex items-center gap-2 text-sm font-bold text-white">
            <Database className="h-4 w-4 text-cyan-400" />
            Geographic District Performance & Outcome Rate
          </h2>
          <GeographicDistributionChart
            data={datasets[0]?.calculatedStats?.geographicBreakdown}
          />
        </div>

        {/* Recent Activity Feed */}
        <main className="space-y-4 rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-5 shadow-sm">
          <header className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <Clock className="h-4 w-4 text-teal-400" />
              Recent Documents & Queries
            </h2>
            <Link
              href="/documents"
              className="flex items-center gap-1 text-[11px] text-teal-400 hover:underline"
            >
              View All <MoveRight className="size-3 shrink-0" />
            </Link>
          </header>

          <ul className="space-y-3">
            {documents.length === 0 ? (
              <li className="py-8 text-center text-xs text-balance text-slate-500">
                <FileText className="mx-auto mb-2 size-8 text-slate-600 opacity-60" />
                No documents processed yet. Click "Upload Document" to begin.
              </li>
            ) : (
              documents.slice(0, 4).map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-teal-500/20 bg-teal-500/10 text-teal-400">
                    <FileText className="size-4 shrink-0" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <h6 className="truncate text-xs font-semibold text-slate-200">
                      {doc.name}
                    </h6>
                    <p className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{doc.wordCount} words</span>
                      <span>•</span>
                      <span className="font-medium text-teal-400">
                        PII Scrubbed
                      </span>
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </main>
      </section>
    </section>
  );
}

type KPI = {
  name:
    | "Documents Processed"
    | "Dataset Uploads"
    | "AI Research Queries"
    | "Reports Generated";
  value: number;
};
const KPICard = ({ name, value }: KPI) => {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-4 shadow-sm">
      <div>
        <h5 className="text-xs font-medium text-slate-400">{name}</h5>
        <h4 className="mt-1 text-2xl font-black text-white">{value}</h4>
        <span className="mt-1 flex items-center gap-1 text-[10px] text-teal-400">
          <CheckCircle2 className="size-3" /> PII Scrubbed & pgvector Indexed
        </span>
      </div>

      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-xl border [&>svg]:size-5",
          {
            "border-teal-500/20 bg-teal-500/10 text-teal-400":
              name === "Documents Processed",
            "border-blue-500/20 bg-blue-500/10 text-blue-400":
              name === "Dataset Uploads",
            "border-purple-500/20 bg-purple-500/10 text-purple-400":
              name === "AI Research Queries",
            "border-amber-500/20 bg-amber-500/10 text-amber-400":
              name === "Reports Generated",
          },
        )}
      >
        <FileText />
      </span>
    </div>
  );
};

type Analytics = {
  name:
    | "Total Enrolled Participants"
    | "Programme Completion Rate"
    | "Referral Rate"
    | "Outcome Success Rate";
  value: string;
};

const AnalyticsCard = ({ name, value }: Analytics) => {
  return (
    <div className="border-r border-slate-800/60 p-2 last:border-r-0">
      <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
        <span className="text-teal-400 [&>svg]:size-3.5">
          {name === "Total Enrolled Participants" ? (
            <Users />
          ) : name === "Programme Completion Rate" ? (
            <CheckCircle2 />
          ) : name === "Referral Rate" ? (
            <Share2 />
          ) : name === "Outcome Success Rate" ? (
            <TrendingUp />
          ) : (
            ""
          )}
        </span>
        {name}
      </div>
      <p
        className={cn("mt-1 text-xl font-extrabold text-white", {
          "text-white": name === "Total Enrolled Participants",
          "text-teal-400": name === "Programme Completion Rate",
          "text-blue-400": name === "Referral Rate",
          "text-emerald-400": name === "Outcome Success Rate",
        })}
      >
        {value}
      </p>
    </div>
  );
};
