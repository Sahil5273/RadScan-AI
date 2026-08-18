'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  Info,
  Layers,
  Sparkles,
  User,
  Zap,
} from 'lucide-react';

interface PatientInfo {
  age?: number;
  gender?: string;
  mri_type?: string;
  acquisition_date?: string;
  study_description?: string;
}

interface GradcamData {
  center_x: number;
  center_y: number;
  radius: number;
  intensity: number;
  primary_target: string;
}

interface SimpleTriageViewProps {
  sampleId: string;
  patientInfo: PatientInfo | null;
  primaryDiagnosis: string;
  pathologies: Record<string, number>;
  gradcam: GradcamData | null;
  findingsSummary?: string;
  report: any | null;
  onGenerateReport: () => void;
  isGeneratingReport: boolean;
  modelName?: string;
  onSwitchToAdvanced: () => void;
}

export default function SimpleTriageView({
  sampleId,
  patientInfo,
  primaryDiagnosis,
  pathologies,
  gradcam,
  findingsSummary,
  report,
  onGenerateReport,
  isGeneratingReport,
  modelName = '2.5D Volumetric CNN-BiGRU',
  onSwitchToAdvanced,
}: SimpleTriageViewProps) {
  const [showGradcam, setShowGradcam] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'patient'>('summary');

  const isNormal = primaryDiagnosis.toLowerCase().includes('normal');
  const entries = Object.entries(pathologies).sort((a, b) => b[1] - a[1]);
  const topPathologies = entries.filter(([name]) => name !== 'Normal Joint').slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Top Banner Notice */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-clinical-200 bg-clinical-50/70 p-3 text-xs text-clinical-900">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-clinical-600 shrink-0" />
          <span>
            <strong className="font-semibold">Simple Triage Mode:</strong> Streamlined clinical view showing high-level findings and report summary.
          </span>
        </div>
        <button
          onClick={onSwitchToAdvanced}
          className="inline-flex items-center gap-1 font-semibold text-clinical-700 hover:text-clinical-900 hover:underline"
        >
          Switch to Advanced PACS Workstation
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Column: Key Image Preview & Case Info */}
        <div className="space-y-4 lg:col-span-6 xl:col-span-5">
          {/* Patient Overview */}
          <div className="panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="field-label">Patient Case</div>
                <h2 className="text-base font-bold text-slate-900">ANONYMISED, PATIENT</h2>
                <p className="data-mono text-xs text-slate-500 mt-0.5">
                  {patientInfo?.age || 30}Y {patientInfo?.gender || 'Unknown'} · {patientInfo?.study_description || 'Knee MRI'}
                </p>
              </div>
              <span className={`chip ${isNormal ? 'chip-normal' : 'chip-critical'}`}>
                {isNormal ? 'Unremarkable' : 'Priority Case'}
              </span>
            </div>

            <div className="mt-3 border-t border-surface-border pt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="field-label block">Study Date</span>
                <span className="font-semibold text-slate-800">{patientInfo?.acquisition_date || '—'}</span>
              </div>
              <div>
                <span className="field-label block">Active AI Model</span>
                <span className="font-semibold text-clinical-700 truncate block">{modelName}</span>
              </div>
            </div>
          </div>

          {/* Key Image Preview */}
          <div className="panel overflow-hidden">
            <div className="panel-header">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-clinical-600" />
                <h3 className="panel-title">Key MRI Slice</h3>
              </div>
              <button
                onClick={() => setShowGradcam(!showGradcam)}
                className={`btn ${showGradcam ? 'btn-active' : ''}`}
              >
                {showGradcam ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                Lesion Heatmap
              </button>
            </div>

            <div className="relative aspect-square w-full bg-slate-950 flex items-center justify-center p-4">
              <svg viewBox="0 0 200 200" className="h-full w-full max-h-[380px]">
                <defs>
                  <radialGradient id="sim-marrow" cx="45%" cy="38%" r="68%">
                    <stop offset="0%" stopColor="#9ba3ae" />
                    <stop offset="55%" stopColor="#767e8a" />
                    <stop offset="100%" stopColor="#4d545e" />
                  </radialGradient>
                  <radialGradient id="sim-soft" cx="50%" cy="48%" r="62%">
                    <stop offset="0%" stopColor="#3b424d" />
                    <stop offset="62%" stopColor="#272d36" />
                    <stop offset="100%" stopColor="#0b0e13" />
                  </radialGradient>
                </defs>

                <rect width="200" height="200" fill="#04060a" />
                <path d="M58 0 C42 40 36 74 44 100 C36 130 42 170 56 200 L150 200 C162 170 166 130 156 100 C164 74 158 40 144 0 Z" fill="url(#sim-soft)" />
                <path d="M80 0 L80 66 C64 72 57 86 58 98 C59 112 76 122 98 121 C120 120 139 112 141 97 C143 84 136 71 120 66 L120 0 Z" fill="url(#sim-marrow)" stroke="#05070b" strokeWidth="2" />
                <path d="M60 140 C60 132 68 130 82 129 L120 129 C134 130 142 133 142 141 C142 160 134 180 132 200 L74 200 C72 180 60 160 60 140 Z" fill="url(#sim-marrow)" stroke="#05070b" strokeWidth="2" />

                {!isNormal ? (
                  <ellipse cx="101" cy="114" rx="10" ry="8" fill="#d92d20" opacity="0.4" />
                ) : null}
              </svg>

              {gradcam && showGradcam && (
                <div
                  className="pointer-events-none absolute rounded-full blur-md"
                  style={{
                    left: `${gradcam.center_x * 100}%`,
                    top: `${gradcam.center_y * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    width: `${gradcam.radius * 240}px`,
                    height: `${gradcam.radius * 240}px`,
                    opacity: 0.75,
                    background: isNormal
                      ? 'radial-gradient(circle, rgba(6,118,71,.75), transparent 80%)'
                      : 'radial-gradient(circle, rgba(217,45,32,.85), rgba(247,144,9,.5) 55%, transparent 80%)',
                  }}
                />
              )}

              <div className="absolute bottom-2 left-2 data-mono text-[10px] text-slate-400">
                Key Sagittal T2 Slice · 1.5T MRI
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Triage Summary & Report Drawer */}
        <div className="space-y-4 lg:col-span-6 xl:col-span-7">
          {/* Primary AI Findings Card */}
          <div className="panel p-4">
            <div className="field-label">AI Triage Conclusion</div>
            <div className="mt-1.5 flex items-start gap-2.5">
              {isNormal ? (
                <CheckCircle2 className="h-5 w-5 text-severity-normal shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-severity-critical shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className={`text-base font-bold leading-snug ${isNormal ? 'text-emerald-900' : 'text-red-900'}`}>
                  {primaryDiagnosis}
                </h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  {findingsSummary || 'Multi-planar scan processed. Key pathological targets identified above clinical operating threshold.'}
                </p>
              </div>
            </div>

            {/* Top Pathology Cards */}
            <div className="mt-4 border-t border-surface-border pt-3">
              <div className="field-label mb-2">Key Risk Indicators</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {topPathologies.map(([name, probability]) => {
                  const percent = Math.round(probability * 100);
                  const isHigh = percent >= 70;
                  const isMod = percent >= 35 && percent < 70;

                  return (
                    <div
                      key={name}
                      className={`rounded border p-2.5 ${
                        isHigh
                          ? 'border-red-200 bg-red-50/60'
                          : isMod
                          ? 'border-amber-200 bg-amber-50/50'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="text-[11px] font-semibold text-slate-800 truncate" title={name}>
                        {name}
                      </div>
                      <div className={`data-mono text-base font-bold mt-1 ${
                        isHigh ? 'text-red-700' : isMod ? 'text-amber-800' : 'text-slate-600'
                      }`}>
                        {percent}%
                      </div>
                      <div className="mt-1 h-1 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full ${isHigh ? 'bg-severity-critical' : isMod ? 'bg-severity-moderate' : 'bg-slate-400'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Clinical Report Drawer */}
          <div className="panel">
            <div className="panel-header">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-clinical-600" />
                <h3 className="panel-title">Clinical Report Summary</h3>
              </div>

              <div className="flex items-center gap-2">
                {report ? (
                  <div className="segment">
                    <button
                      data-active={activeTab === 'summary'}
                      onClick={() => setActiveTab('summary')}
                    >
                      Clinical Impression
                    </button>
                    <button
                      data-active={activeTab === 'patient'}
                      onClick={() => setActiveTab('patient')}
                    >
                      Patient Summary
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onGenerateReport}
                    disabled={isGeneratingReport}
                    className="btn btn-primary"
                  >
                    <Sparkles className={`h-3.5 w-3.5 ${isGeneratingReport ? 'animate-spin' : ''}`} />
                    {isGeneratingReport ? 'Generating Report…' : 'Generate Summary'}
                  </button>
                )}
              </div>
            </div>

            <div className="p-4">
              {report ? (
                activeTab === 'summary' ? (
                  <div className="space-y-3">
                    <div className="rounded border-l-3 border-clinical-600 bg-clinical-50/70 p-3 text-xs leading-relaxed text-slate-800">
                      <div className="field-label mb-1 text-clinical-700">Impression</div>
                      <div className="whitespace-pre-line font-medium text-slate-900">{report.impression}</div>
                    </div>

                    <div className="text-xs text-slate-700">
                      <strong className="font-semibold text-slate-900">Recommendations: </strong>
                      {report.recommendations}
                    </div>
                  </div>
                ) : (
                  <div className="rounded border border-surface-border bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
                    <div className="field-label mb-1">Plain-Language Patient Breakdown</div>
                    <p>{report.patient_summary}</p>
                  </div>
                )
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">
                  Click <strong className="text-slate-700">Generate Summary</strong> to synthesize clinical findings with Vertex AI Gemini 1.5 Pro.
                </div>
              )}
            </div>

            <div className="border-t border-surface-border bg-surface-muted px-4 py-2 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Info className="h-3 w-3" />
                Investigational decision support only.
              </span>
              <button
                onClick={onSwitchToAdvanced}
                className="font-semibold text-clinical-700 hover:underline"
              >
                Open Full Workstation Suite &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
