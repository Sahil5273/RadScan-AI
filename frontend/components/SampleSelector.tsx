'use client';

import React, { useRef } from 'react';
import { ChevronRight, ListFilter, Loader2, Upload } from 'lucide-react';

interface SampleSelectorProps {
  activeSampleId: string;
  onSelectSample: (sampleId: string) => void;
  onUploadCustom: (file: File) => void;
  isLoading: boolean;
}

interface WorklistRow {
  id: string;
  patient: string;
  demographics: string;
  accession: string;
  study: string;
  protocol: string;
  date: string;
  priority: 'STAT' | 'Routine';
  finding: string;
  severity: 'critical' | 'moderate' | 'normal';
}

const WORKLIST: WorklistRow[] = [
  {
    id: 'sample-acl-tear',
    patient: 'ANONYMISED, PATIENT A',
    demographics: '28M',
    accession: 'ACC-2026-04128',
    study: 'Right Knee MRI — Acute Pivot Shift Injury',
    protocol: 'Sagittal T2 FS',
    date: '2026-08-10',
    priority: 'STAT',
    finding: 'ACL tear 94%',
    severity: 'critical',
  },
  {
    id: 'sample-meniscus-tear',
    patient: 'ANONYMISED, PATIENT B',
    demographics: '42F',
    accession: 'ACC-2026-04131',
    study: 'Left Knee MRI — Medial Joint Line Pain',
    protocol: 'Coronal / Sagittal PD',
    date: '2026-08-12',
    priority: 'Routine',
    finding: 'Medial meniscus tear 91%',
    severity: 'moderate',
  },
  {
    id: 'sample-normal-knee',
    patient: 'ANONYMISED, PATIENT C',
    demographics: '31F',
    accession: 'ACC-2026-04140',
    study: 'Right Knee MRI — Routine Screening',
    protocol: 'Multi-planar T1 / T2',
    date: '2026-08-14',
    priority: 'Routine',
    finding: 'No acute abnormality',
    severity: 'normal',
  },
];

const SEVERITY_CHIP: Record<WorklistRow['severity'], string> = {
  critical: 'chip chip-critical',
  moderate: 'chip chip-moderate',
  normal: 'chip chip-normal',
};

export default function SampleSelector({
  activeSampleId,
  onSelectSample,
  onUploadCustom,
  isLoading,
}: SampleSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onUploadCustom(event.target.files[0]);
    }
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <ListFilter className="h-4 w-4 text-clinical-600" />
          <h2 className="panel-title">Study Worklist</h2>
          <span className="chip chip-neutral">{WORKLIST.length} unread</span>
          {isLoading && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-clinical-700">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading study
            </span>
          )}
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".dcm,.dicom,.png,.jpg,.jpeg"
            className="hidden"
          />
          <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="btn">
            <Upload className="h-3.5 w-3.5" />
            Import DICOM study
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse text-left">
          <thead>
            <tr className="border-b border-surface-border bg-white">
              {['Priority', 'Patient', 'Accession', 'Study description', 'Protocol', 'Study date', 'AI triage', ''].map(
                (heading) => (
                  <th
                    key={heading}
                    className="field-label whitespace-nowrap px-3 py-2 font-semibold"
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {WORKLIST.map((row) => {
              const isActive = activeSampleId === row.id;
              return (
                <tr
                  key={row.id}
                  onClick={() => !isLoading && onSelectSample(row.id)}
                  className={`cursor-pointer border-b border-surface-border text-xs transition-colors last:border-b-0 ${
                    isActive ? 'bg-clinical-50' : 'bg-white hover:bg-surface-muted'
                  } ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
                >
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <span
                      className={
                        row.priority === 'STAT' ? 'chip chip-critical' : 'chip chip-neutral'
                      }
                    >
                      {row.priority}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <div className="font-semibold text-slate-800">{row.patient}</div>
                    <div className="data-mono text-[11px] text-slate-500">{row.demographics}</div>
                  </td>
                  <td className="data-mono whitespace-nowrap px-3 py-2.5 text-slate-600">
                    {row.accession}
                  </td>
                  <td className="px-3 py-2.5 text-slate-700">{row.study}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">{row.protocol}</td>
                  <td className="data-mono whitespace-nowrap px-3 py-2.5 text-slate-600">
                    {row.date}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <span className={SEVERITY_CHIP[row.severity]}>{row.finding}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        isActive ? 'text-clinical-700' : 'text-slate-400'
                      }`}
                    >
                      {isActive ? 'Open' : 'Review'}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
