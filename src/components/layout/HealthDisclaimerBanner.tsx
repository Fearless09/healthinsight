"use client";

import { AlertTriangle, ShieldCheck, XIcon } from "lucide-react";
import { useState } from "react";

export function HealthDisclaimerBanner() {
  const [show, setShow] = useState(true);

  if (!show) return;
  return (
    <main
      role="dialog"
      className="flex flex-wrap items-center gap-2 border-b border-amber-500/20 bg-amber-950/40 px-4 py-2 text-xs text-amber-200/90"
    >
      <div className="flex max-w-3xl flex-1 items-center gap-2 text-balance">
        <AlertTriangle className="size-4 shrink-0 text-amber-400" />
        <span>
          <strong>Mandatory Notice:</strong> HealthInsight is a research and
          programme analysis tool. It does not provide medical diagnosis,
          treatment recommendations, or clinical advice.
        </span>
      </div>

      <div className="ms-auto flex items-center gap-1.5 rounded border border-teal-500/20 bg-teal-950/60 px-2 py-0.5 font-medium text-teal-400">
        <ShieldCheck className="size-3.5" />
        <span>Synthetic Demo Data Enabled</span>
      </div>

      <button className="cursor-pointer" onClick={() => setShow(false)}>
        <XIcon className="size-4 text-cyan-400" />
      </button>
    </main>
  );
}
