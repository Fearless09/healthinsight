import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TanstackProvider } from "@/tanstack";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "HealthInsight | Clinical & Population Health Intelligence",
    template: "%s | HealthInsight",
  },
  description:
    "Secure AI-powered health data analytics platform for clinical document RAG, PII detection, structured dataset insights, and cohort reporting.",
  keywords: [
    "HealthInsight",
    "Clinical Intelligence",
    "Healthcare AI",
    "Medical Document RAG",
    "PII Redaction",
    "Population Health Analytics",
  ],
  authors: [{ name: "HealthInsight Team" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <TanstackProvider>{children}</TanstackProvider>
      </body>
    </html>
  );
}
