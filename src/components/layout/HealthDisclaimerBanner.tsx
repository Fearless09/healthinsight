'use client';

import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export function HealthDisclaimerBanner() {
  return (
    <div className="bg-amber-950/40 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-200/90 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>Mandatory Notice:</strong> HealthInsight is a research and programme analysis tool. It does not provide medical diagnosis, treatment recommendations, or clinical advice.
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-500/20 font-medium">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Synthetic Demo Data Enabled</span>
      </div>
    </div>
  );
}
