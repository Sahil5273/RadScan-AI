'use client';

import React from 'react';
import { BarChart3, AlertCircle, CheckCircle } from 'lucide-react';

interface PathologyBreakdownProps {
  pathologies: Record<string, number>;
  primaryDiagnosis: string;
}

export default function PathologyBreakdown({
  pathologies,
  primaryDiagnosis
}: PathologyBreakdownProps) {
  // Sort pathologies by probability descending
  const sortedPathologies = Object.entries(pathologies).sort((a, b) => b[1] - a[1]);

  return (
    <div className="rounded-xl border border-medical-border bg-medical-card p-4 shadow-xl flex flex-col h-full">
      {/* Header & Primary Diagnosis */}
      <div className="border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">2.5D CNN-BiGRU 12-Target Risk Breakdown</h3>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time probability distribution across 12 knee pathology targets.
        </p>

        {/* Primary Diagnosis Callout */}
        <div className="mt-3 rounded-lg border border-cyan-800/80 bg-cyan-950/40 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">Primary AI Triage Conclusion</div>
          <div className="text-sm font-bold text-white mt-0.5 flex items-center space-x-2">
            {primaryDiagnosis.includes('Normal') ? (
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            )}
            <span>{primaryDiagnosis}</span>
          </div>
        </div>
      </div>

      {/* Pathology Target Probability Bars */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[380px]">
        {sortedPathologies.map(([target, prob]) => {
          const percent = Math.round(prob * 100);
          
          let barColor = 'bg-emerald-500';
          let textColor = 'text-emerald-400';
          let badgeText = 'Low Risk';

          if (percent >= 70) {
            barColor = 'bg-rose-500';
            textColor = 'text-rose-400';
            badgeText = 'High Risk';
          } else if (percent >= 35) {
            barColor = 'bg-amber-500';
            textColor = 'text-amber-400';
            badgeText = 'Moderate';
          }

          return (
            <div key={target} className="rounded-lg bg-medical-dark/60 p-2.5 border border-slate-800/80">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-200">{target}</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                    percent >= 70 ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                    percent >= 35 ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {badgeText}
                  </span>
                  <span className={`font-mono font-bold ${textColor}`}>{percent}%</span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor} transition-all duration-500 rounded-full`}
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
