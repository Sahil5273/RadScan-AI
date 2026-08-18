'use client';

import React, { useState } from 'react';
import { Check, Copy, Download, FileText, RefreshCw, ShieldAlert, User } from 'lucide-react';

interface ReportData {
  study_info: {
    patient_age: number;
    patient_gender: string;
    modality: string;
    study_description: string;
    primary_diagnosis: string;
  };
  clinical_findings: Record<string, string>;
  impression: string;
  recommendations: string;
  patient_summary: string;
}

interface ReportGeneratorProps {
  report: ReportData | null;
  onGenerateReport: () => void;
  isGenerating: boolean;
}

function titleCase(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-surface-border px-4 py-3 first:border-t-0">
      <h4 className="field-label mb-1.5 text-clinical-700">{title}</h4>
      <div className="text-[13px] leading-relaxed text-slate-800">{children}</div>
    </section>
  );
}

export default function ReportGenerator({
  report,
  onGenerateReport,
  isGenerating,
}: ReportGeneratorProps) {
  const [activeTab, setActiveTab] = useState<'clinical' | 'patient'>('clinical');
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleCopy = () => {
    if (!report) return;
    const text =
      activeTab === 'clinical'
        ? [
            'RADSCAN AI — STRUCTURED RADIOLOGY REPORT',
            `EXAM: ${report.study_info.study_description}`,
            '',
            'FINDINGS:',
            ...Object.entries(report.clinical_findings || {}).map(
              ([key, value]) => `- ${titleCase(key)}: ${value}`,
            ),
            '',
            `IMPRESSION:\n${report.impression}`,
            '',
            `RECOMMENDATIONS:\n${report.recommendations}`,
            '',
            'Preliminary AI-assisted draft. Requires attestation by a qualified radiologist.',
          ].join('\n')
        : `PATIENT SUMMARY:\n${report.patient_summary}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (!report) return;

    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    const ensureSpace = (needed: number) => {
      if (y + needed > 268) {
        pdf.addPage();
        y = 20;
      }
    };

    const addBody = (text: string) => {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(32, 41, 57);
      const lines = pdf.splitTextToSize(text || 'Not provided.', contentWidth);
      ensureSpace(lines.length * 4.8);
      pdf.text(lines, margin, y);
      y += lines.length * 4.8 + 5;
    };

    const addSection = (title: string, body: string) => {
      ensureSpace(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(35, 74, 128);
      pdf.text(title.toUpperCase(), margin, y);
      y += 2;
      pdf.setDrawColor(221, 227, 236);
      pdf.setLineWidth(0.3);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 5;
      addBody(body);
    };

    // Letterhead
    pdf.setFillColor(19, 42, 73);
    pdf.rect(0, 0, pageWidth, 26, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(15);
    pdf.setTextColor(255, 255, 255);
    pdf.text('RadScan AI', margin, 12);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(192, 214, 240);
    pdf.text('Department of Radiology — Structured MRI Report', margin, 18);
    pdf.text(`Generated ${new Date().toLocaleString()}`, pageWidth - margin, 18, { align: 'right' });

    // Demographics block
    y = 34;
    pdf.setDrawColor(221, 227, 236);
    pdf.setFillColor(247, 249, 252);
    pdf.rect(margin, y, contentWidth, 20, 'FD');
    pdf.setFontSize(8);
    pdf.setTextColor(102, 112, 133);
    pdf.text('PATIENT', margin + 4, y + 6);
    pdf.text('AGE / SEX', margin + 60, y + 6);
    pdf.text('MODALITY', margin + 100, y + 6);
    pdf.setFontSize(9.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(16, 24, 40);
    pdf.text('ANONYMISED, PATIENT', margin + 4, y + 13);
    pdf.text(
      `${report.study_info.patient_age} / ${report.study_info.patient_gender}`,
      margin + 60,
      y + 13,
    );
    pdf.text('MRI', margin + 100, y + 13);
    y += 28;

    addSection('Examination', report.study_info.study_description);
    addSection('Technique', report.study_info.modality);
    addSection('Comparison', 'No prior comparable study available.');

    ensureSpace(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(35, 74, 128);
    pdf.text('FINDINGS', margin, y);
    y += 2;
    pdf.line(margin, y, pageWidth - margin, y);
    y += 5;
    Object.entries(report.clinical_findings || {}).forEach(([key, value]) => {
      addBody(`${titleCase(key)}: ${value}`);
      y -= 2;
    });
    y += 3;

    addSection('Impression', report.impression);
    addSection('Recommendations', report.recommendations);

    // Attestation block
    ensureSpace(30);
    pdf.setDrawColor(221, 227, 236);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 7;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(180, 35, 24);
    pdf.text('PRELIMINARY — NOT YET ATTESTED', margin, y);
    y += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(71, 84, 103);
    pdf.text(
      'Draft produced with AI decision support. Requires review, correction and electronic signature',
      margin,
      y,
    );
    y += 4.5;
    pdf.text('by a qualified radiologist before release to the medical record.', margin, y);
    y += 12;
    pdf.setDrawColor(150, 160, 175);
    pdf.line(margin, y, margin + 70, y);
    pdf.line(pageWidth - margin - 50, y, pageWidth - margin, y);
    y += 4;
    pdf.setFontSize(7.5);
    pdf.text('Reporting radiologist', margin, y);
    pdf.text('Date / time', pageWidth - margin - 50, y);

    const pages = pdf.getNumberOfPages();
    for (let page = 1; page <= pages; page += 1) {
      pdf.setPage(page);
      pdf.setDrawColor(221, 227, 236);
      pdf.line(margin, 284, pageWidth - margin, 284);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(133, 143, 160);
      pdf.text('RadScan AI · Investigational decision support · Not for primary diagnosis', margin, 289);
      pdf.text(`Page ${page} of ${pages}`, pageWidth - margin, 289, { align: 'right' });
    }

    pdf.save(
      `RadScan-Report-${report.study_info.primary_diagnosis
        .replace(/[^a-z0-9]+/gi, '-')
        .toLowerCase()}.pdf`,
    );
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  return (
    <section className="panel">
      <div className="panel-header flex-wrap">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-clinical-600" />
          <h2 className="panel-title">Structured Report</h2>
          <span className="chip chip-moderate">Preliminary draft</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {report && (
            <>
              <button onClick={handleCopy} className="btn">
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-severity-normal" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? 'Copied' : 'Copy text'}
              </button>
              <button onClick={handleDownloadPdf} className="btn">
                {downloaded ? (
                  <Check className="h-3.5 w-3.5 text-severity-normal" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                {downloaded ? 'Downloaded' : 'Download PDF'}
              </button>
            </>
          )}
          <button onClick={onGenerateReport} disabled={isGenerating} className="btn btn-primary">
            <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating…' : report ? 'Regenerate draft' : 'Generate draft'}
          </button>
        </div>
      </div>

      {report ? (
        <>
          <div className="flex items-center gap-1 border-b border-surface-border bg-white px-3 pt-2">
            {(
              [
                { key: 'clinical', label: 'Clinical report', icon: FileText },
                { key: 'patient', label: 'Patient summary', icon: User },
              ] as const
            ).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-semibold transition-colors ${
                  activeTab === key
                    ? 'border-clinical-600 text-clinical-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'clinical' ? (
            <div className="bg-surface-muted p-3 sm:p-4">
              {/* Report rendered as a document sheet */}
              <article className="mx-auto max-w-4xl border border-surface-border bg-white shadow-panel">
                <header className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-clinical-800 px-4 py-3">
                  <div>
                    <div className="text-sm font-bold uppercase tracking-wide text-clinical-900">
                      Structured Radiology Report
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Department of Radiology · Musculoskeletal MRI
                    </div>
                  </div>
                  <dl className="data-mono grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-slate-600">
                    <dt className="text-slate-400">Age / Sex</dt>
                    <dd className="text-right text-slate-800">
                      {report.study_info.patient_age} / {report.study_info.patient_gender}
                    </dd>
                    <dt className="text-slate-400">Modality</dt>
                    <dd className="text-right text-slate-800">MRI</dd>
                  </dl>
                </header>

                <ReportSection title="Examination">
                  {report.study_info.study_description}
                </ReportSection>

                <ReportSection title="Technique">{report.study_info.modality}</ReportSection>

                <ReportSection title="Comparison">
                  No prior comparable study available.
                </ReportSection>

                <ReportSection title="Findings">
                  <dl className="space-y-1.5">
                    {Object.entries(report.clinical_findings || {}).map(([key, value]) => (
                      <div key={key} className="sm:flex sm:gap-3">
                        <dt className="shrink-0 font-semibold text-slate-900 sm:w-56">
                          {titleCase(key)}
                        </dt>
                        <dd className="text-slate-700">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </ReportSection>

                <ReportSection title="Impression">
                  <div className="whitespace-pre-line border-l-2 border-clinical-600 bg-clinical-50 px-3 py-2 font-medium text-slate-900">
                    {report.impression}
                  </div>
                </ReportSection>

                <ReportSection title="Recommendations">{report.recommendations}</ReportSection>

                <footer className="border-t border-surface-border bg-surface-muted px-4 py-3">
                  <div className="flex items-start gap-2 text-[11px] leading-snug text-slate-600">
                    <ShieldAlert className="mt-px h-4 w-4 shrink-0 text-severity-moderate" />
                    <p>
                      <strong className="text-slate-800">Preliminary — not yet attested.</strong>{' '}
                      Draft produced with AI decision support and requires review, correction and
                      electronic signature by a qualified radiologist before release to the medical
                      record.
                    </p>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="border-t border-slate-400 pt-1 text-[11px] text-slate-500">
                      Reporting radiologist
                    </div>
                    <div className="border-t border-slate-400 pt-1 text-[11px] text-slate-500">
                      Date / time of attestation
                    </div>
                  </div>
                </footer>
              </article>
            </div>
          ) : (
            <div className="bg-surface-muted p-3 sm:p-4">
              <article className="mx-auto max-w-3xl border border-surface-border bg-white p-4 shadow-panel">
                <h3 className="mb-2 text-sm font-bold text-slate-900">
                  What your scan results mean
                </h3>
                <p className="text-[13px] leading-relaxed text-slate-700">
                  {report.patient_summary}
                </p>
                <p className="mt-3 border-t border-surface-border pt-3 text-[11px] leading-snug text-slate-500">
                  This plain-language summary is provided to help you understand your imaging. It is
                  not a diagnosis. Please discuss these results with your treating clinician.
                </p>
              </article>
            </div>
          )}
        </>
      ) : (
        <div className="px-4 py-10 text-center">
          <FileText className="mx-auto mb-2 h-7 w-7 text-slate-300" />
          <div className="text-xs font-semibold text-slate-600">No report drafted</div>
          <p className="mx-auto mt-1 max-w-md text-[11px] leading-relaxed text-slate-500">
            Generate a structured draft to compile the AI findings into examination, technique,
            findings, impression and recommendation sections.
          </p>
        </div>
      )}
    </section>
  );
}
