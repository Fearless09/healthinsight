import type { Metadata } from "next";
import { PropsWithChildren } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { HealthDisclaimerBanner } from "@/components/layout/HealthDisclaimerBanner";

export const metadata: Metadata = {
  title: "Dashboard Portal",
  description:
    "HealthInsight Workspace Dashboard — Manage clinical documents, datasets, AI assistant queries, reports, and team collaboration.",
};

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <section
      role="main"
      className="flex h-dvh overflow-hidden bg-[#0b0f19] text-slate-100"
    >
      <Sidebar />
      <main role="main" className="flex min-w-0 flex-1 flex-col overflow-auto">
        <HealthDisclaimerBanner />
        <Header />
        <main className="mx-auto w-full max-w-7xl flex-1 p-6">{children}</main>
      </main>
    </section>
  );
}
