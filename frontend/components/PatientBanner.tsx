'use client';

import React from 'react';
import { AlertTriangle, CalendarDays, Layers, Stethoscope } from 'lucide-react';

interface PatientInfo {
  age?: number;
  gender?: string;
  mri_type?: string;
  acquisition_date?: string;
  study_description?: string;
}

interface PatientBannerProps {
  patientInfo: PatientInfo | null;
  primaryDiagnosis: string;
  isLoading: boolean;
}

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="field-label flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </div>
      <div className="field-value truncate" title={value}>
        {value}
      </div>
    </div>
  );
}

export default function PatientBanner({
  patientInfo,
  primaryDiagnosis,
  isLoading,
}: PatientBannerProps) {
  const isNormal = primaryDiagnosis.toLowerCase().includes('normal') ||
    primaryDiagnosis.toLowerCase().includes('unremarkable');

  const age = patientInfo?.age;
  const gender = patientInfo?.gender;
  const demographics = age && gender ? `${age} · ${gender}` : 'Not recorded';

  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-clinical-50 text-clinical-700 ring-1 ring-inset ring-clinical-200">
            <Layers className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-slate-900">
                {patientInfo?.study_description ?? 'Knee MRI'}
              </h2>
              <span className="chip chip-neutral">De-identified</span>
              {!isNormal && !isLoading && (
                <span className="chip chip-critical">
                  <AlertTriangle className="h-3 w-3" />
                  Priority read
                </span>
              )}
            </div>
            <div className="mt-0.5 text-xs text-slate-600">
              Demo study — no patient identifiers are stored or displayed
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-surface-border pt-3 sm:grid-cols-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <Field label="Age / Sex" value={demographics} />
          <Field
            icon={Stethoscope}
            label="Protocol"
            value={patientInfo?.mri_type ?? 'MRI — Knee'}
          />
          <Field
            icon={CalendarDays}
            label="Study date"
            value={patientInfo?.acquisition_date ?? '—'}
          />
          <div className="min-w-0">
            <div className="field-label">Read status</div>
            <div className="mt-0.5">
              {isLoading ? (
                <span className="chip chip-info">Analysis running</span>
              ) : (
                <span className="chip chip-moderate">Preliminary — unsigned</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
