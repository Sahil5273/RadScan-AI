'use client';

import React from 'react';
import { AlertTriangle, CalendarDays, Stethoscope, UserCheck, UserRound } from 'lucide-react';

interface PatientInfo {
  age?: number;
  gender?: string;
  mri_type?: string;
  acquisition_date?: string;
  study_description?: string;
}

interface PatientBannerProps {
  sampleId: string;
  patientInfo: PatientInfo | null;
  primaryDiagnosis: string;
  isLoading: boolean;
}

// Accession and MRN are derived from the study identifier so the banner stays
// stable between renders instead of generating new values on each pass.
function studyIdentifiers(sampleId: string) {
  const seed = Array.from(sampleId).reduce((total, char) => total + char.charCodeAt(0), 0);
  return {
    mrn: `MRN-${(seed * 37).toString().padStart(7, '0').slice(-7)}`,
    accession: `ACC-2026-${(seed * 11).toString().padStart(5, '0').slice(-5)}`,
  };
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
  sampleId,
  patientInfo,
  primaryDiagnosis,
  isLoading,
}: PatientBannerProps) {
  const { mrn, accession } = studyIdentifiers(sampleId);
  const isNormal = primaryDiagnosis.toLowerCase().includes('normal');
  const age = patientInfo?.age ?? '—';
  const gender = patientInfo?.gender ?? 'Unknown';
  const genderCode = gender.charAt(0).toUpperCase() || 'U';

  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-clinical-50 text-clinical-700 ring-1 ring-inset ring-clinical-200">
            <UserRound className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-slate-900">
                ANONYMISED, PATIENT
              </h2>
              <span className="chip chip-neutral">De-identified</span>
              {!isNormal && !isLoading && (
                <span className="chip chip-critical">
                  <AlertTriangle className="h-3 w-3" />
                  Priority read
                </span>
              )}
            </div>
            <div className="data-mono mt-0.5 text-xs text-slate-600">
              {mrn} · {age}
              {genderCode} · {accession}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-surface-border pt-3 sm:grid-cols-3 lg:grid-cols-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0 xl:grid-cols-5">
          <Field
            icon={Stethoscope}
            label="Study"
            value={patientInfo?.study_description ?? 'Knee MRI'}
          />
          <Field label="Modality / Protocol" value={patientInfo?.mri_type ?? 'MRI — Knee'} />
          <Field
            icon={CalendarDays}
            label="Study date"
            value={patientInfo?.acquisition_date ?? '—'}
          />
          <Field icon={UserCheck} label="Referring" value="Dr. M. Iyer — Orthopaedics" />
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
