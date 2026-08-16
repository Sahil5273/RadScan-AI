'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface PathologyBreakdownProps {
  pathologies: Record<string, number>;
  primaryDiagnosis: string;
  findingsSummary?: string;
  modelVersion?: string;
}

type Classification = 'positive' | 'indeterminate' | 'negative';

const POSITIVE_THRESHOLD = 0.7;
const INDETERMINATE_THRESHOLD = 0.35;

function classify(probability: number): Classification {
  if (probability >= POSITIVE_THRESHOLD) return 'positive';
  if (probability >= INDETERMINATE_THRESHOLD) return 'indeterminate';
  return 'negative';
}

const GROUPS: { key: Classification; title: string; chip: string; bar: string }[] = [
  { key: 'positive', title: 'Positive', chip: 'chip chip-critical', bar: 'bg-severity-critical' },
  {
    key: 'indeterminate',
    title: 'Indeterminate',
    chip: 'chip chip-moderate',
    bar: 'bg-severity-moderate',
  },
  { key: 'negative', title: 'Negative', chip: 'chip chip-normal', bar: 'bg-slate-300' },
];

export default function PathologyBreakdown({
  pathologies,
  primaryDiagnosis,
  findingsSummary,
  modelVersion,
}: PathologyBreakdownProps) {
  const entries = Object.entries(pathologies).sort((a, b) => b[1] - a[1]);
  const isNormal = primaryDiagnosis.toLowerCase().includes('normal');
  const positiveCount = entries.filter(([, value]) => classify(value) === 'positive').length;

  return (
    <section className="panel flex h-full flex-col">
      <div className="panel-header">
        <h2 className="panel-title">AI Analysis</h2>
        <span className="text-[11px] text-slate-500">{entries.length} targets evaluated</span>
      </div>

      {/* Primary conclusion */}
      <div
        className={`border-b px-3 py-3 ${
          isNormal ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
        }`}
      >
        <div className="field-label">Primary AI conclusion</div>
        <div className="mt-1 flex items-start gap-2">
          {isNormal ? (
            <CheckCircle2 className="mt-px h-4 w-4 shrink-0 text-severity-normal" />
          ) : (
            <AlertTriangle className="mt-px h-4 w-4 shrink-0 text-severity-critical" />
          )}
          <div className="min-w-0">
            <div
              className={`text-sm font-semibold leading-snug ${
                isNormal ? 'text-emerald-900' : 'text-red-900'
              }`}
            >
              {primaryDiagnosis}
            </div>
            <div className="mt-0.5 text-[11px] text-slate-600">
              {positiveCount > 0
                ? `${positiveCount} target${positiveCount > 1 ? 's' : ''} above the ${Math.round(
                    POSITIVE_THRESHOLD * 100,
                  )}% operating threshold`
                : 'No target exceeded the positive operating threshold'}
            </div>
          </div>
        </div>
      </div>

      {findingsSummary && (
        <div className="border-b border-surface-border bg-white px-3 py-2.5">
          <div className="field-label mb-1">Narrative summary</div>
          <p className="text-xs leading-relaxed text-slate-700">{findingsSummary}</p>
        </div>
      )}

      {/* Grouped probability table */}
      <div className="flex-1 overflow-y-auto">
        {entries.length === 0 && (
          <div className="px-3 py-8 text-center text-xs text-slate-500">
            Select a study from the worklist to run analysis.
          </div>
        )}

        {GROUPS.map((group) => {
          const rows = entries.filter(([, value]) => classify(value) === group.key);
          if (rows.length === 0) return null;

          return (
            <div key={group.key}>
              <div className="sticky top-0 z-10 flex items-center justify-between border-y border-surface-border bg-surface-muted px-3 py-1.5">
                <span className="field-label">{group.title}</span>
                <span className="data-mono text-[11px] text-slate-500">{rows.length}</span>
              </div>

              <ul>
                {rows.map(([target, probability]) => {
                  const percent = Math.round(probability * 100);
                  return (
                    <li
                      key={target}
                      className="border-b border-surface-border px-3 py-2 last:border-b-0"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-xs font-medium text-slate-800" title={target}>
                          {target}
                        </span>
                        <span className="data-mono shrink-0 text-xs font-bold text-slate-900">
                          {percent}%
                        </span>
                      </div>
                      <div className="relative mt-1.5 h-1.5 w-full overflow-hidden rounded-sm bg-slate-100">
                        <div
                          className={`h-full rounded-sm ${group.bar} transition-[width] duration-500`}
                          style={{ width: `${percent}%` }}
                        />
                        {/* Operating threshold marker */}
                        <span
                          className="absolute top-0 h-full w-px bg-slate-400/70"
                          style={{ left: `${POSITIVE_THRESHOLD * 100}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-1.5 border-t border-surface-border bg-surface-muted px-3 py-2 text-[11px] leading-snug text-slate-500">
        <Info className="mt-px h-3.5 w-3.5 shrink-0" />
        <span>
          Probabilities are decision support output{modelVersion ? ` from model ${modelVersion}` : ''} and
          do not constitute a diagnosis. Vertical marker denotes the {Math.round(POSITIVE_THRESHOLD * 100)}%
          operating threshold.
        </span>
      </div>
    </section>
  );
}
