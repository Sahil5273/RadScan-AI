'use client';

import React, { useRef } from 'react';
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
  Upload,
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

const CLINICAL_PRESETS = [
  {
    id: 'sample-acl-tear',
    title: 'Sample 1: Acute ACL Tear',
    subtitle: '28M · Right Knee T2 FS · Acute Pivot Shift',
    chip: 'chip-critical',
    label: 'ACL Tear 94%',
  },
  {
    id: 'sample-meniscus-tear',
    title: 'Sample 2: Meniscus Tear',
    subtitle: '42F · Left Knee PD FS · Medial Pain',
    chip: 'chip-moderate',
    label: 'Medial Meniscus 91%',
  },
  {
    id: 'sample-normal-knee',
    title: 'Sample 3: Normal Knee',
    subtitle: '31F · Right Knee T1/T2 · Routine Screening',
    chip: 'chip-normal',
    label: 'Unremarkable 96%',
  },
];

interface SimpleTriageViewProps {
  sampleId: string;
  patientInfo: PatientInfo | null;
  primaryDiagnosis: string;
  pathologies: Record<string, number>;
  gradcam: GradcamData | null;
  findingsSummary?: string;
  report: any | null;
  onSelectSample: (sampleId: string) => void;
  onUploadCustom: (file: File) => void;
  isLoadingPredict: boolean;
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
  onSelectSample,
  onUploadCustom,
  isLoadingPredict,
  onGenerateReport,
  isGeneratingReport,
  modelName = 'Phase 1: 1-Plane Sagittal',
  onSwitchToAdvanced,
}: SimpleTriageViewProps) {
  const [showGradcam, setShowGradcam] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'summary' | 'patient'>('summary');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isNormal = primaryDiagnosis.toLowerCase().includes('unremarkable') || primaryDiagnosis.toLowerCase().includes('normal');
  const entries = Object.entries(pathologies).sort((a, b) => b[1] - a[1]);
  const topPathologies = entries.slice(0, 3);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onUploadCustom(event.target.files[0]);
    }
  };

  return (
    <div className="space-y-6 rise-in">
      {/* Scenario Presets Selector Card (X-CDS Query Form Style) */}
      <div id="tour-case-selector" className="panel p-5 bg-[var(--panel)]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <span className="field-label text-[var(--accent-deep)]">Clinical Presets & Scenario Entry</span>
            <h3 className="text-lg font-bold text-[var(--ink)] font-display">
              Select Patient Scan Scenario
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".dcm,.dicom,.png,.jpg,.jpeg"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoadingPredict}
              className="btn btn-primary"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload Custom DICOM
            </button>

            <button
              onClick={onSwitchToAdvanced}
              className="btn"
            >
              Advanced Workstation &rarr;
            </button>
          </div>
        </div>

        {/* Preset Pill Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CLINICAL_PRESETS.map((preset) => {
            const isActive = sampleId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => !isLoadingPredict && onSelectSample(preset.id)}
                disabled={isLoadingPredict}
                className={`rounded-2xl border p-3.5 text-left transition-all ${
                  isActive
                    ? 'border-[var(--accent)] bg-[var(--highlight)] shadow-sm ring-1 ring-[var(--accent)]'
                    : 'border-[var(--line)] bg-white/70 hover:bg-white hover:border-[var(--accent)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[var(--ink)] font-display truncate">
                    {preset.title}
                  </span>
                  <span className={`chip ${preset.chip} text-[9px]`}>{preset.label}</span>
                </div>
                <p className="text-[11px] text-[var(--muted)] mt-1 truncate">
                  {preset.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Key MRI Preview */}
        <div id="tour-mri-viewport" className="space-y-5 lg:col-span-5">
          <div className="panel overflow-hidden">
            <div className="panel-header">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[var(--accent)]" />
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

            <div className="relative aspect-square w-full bg-[#091318] flex items-center justify-center p-4">
              <svg viewBox="0 0 200 200" className="h-full w-full max-h-[360px]">
                <defs>
                  <radialGradient id="sim-marrow-x" cx="45%" cy="38%" r="68%">
                    <stop offset="0%" stopColor="#9ba3ae" />
                    <stop offset="55%" stopColor="#767e8a" />
                    <stop offset="100%" stopColor="#4d545e" />
                  </radialGradient>
                  <radialGradient id="sim-soft-x" cx="50%" cy="48%" r="62%">
                    <stop offset="0%" stopColor="#3b424d" />
                    <stop offset="62%" stopColor="#272d36" />
                    <stop offset="100%" stopColor="#0b0e13" />
                  </radialGradient>
                </defs>

                <rect width="200" height="200" fill="#04060a" />
                <path d="M58 0 C42 40 36 74 44 100 C36 130 42 170 56 200 L150 200 C162 170 166 130 156 100 C164 74 158 40 144 0 Z" fill="url(#sim-soft-x)" />
                <path d="M80 0 L80 66 C64 72 57 86 58 98 C59 112 76 122 98 121 C120 120 139 112 141 97 C143 84 136 71 120 66 L120 0 Z" fill="url(#sim-marrow-x)" stroke="#05070b" strokeWidth="2" />
                <path d="M60 140 C60 132 68 130 82 129 L120 129 C134 130 142 133 142 141 C142 160 134 180 132 200 L74 200 C72 180 60 160 60 140 Z" fill="url(#sim-marrow-x)" stroke="#05070b" strokeWidth="2" />

                {!isNormal ? (
                  <ellipse cx="101" cy="114" rx="10" ry="8" fill="#9f1239" opacity="0.45" />
                ) : null}
              </svg>

              {gradcam && showGradcam && (
                <div
                  className="pointer-events-none absolute rounded-full blur-md"
                  style={{
                    left: `${gradcam.center_x * 100}%`,
                    top: `${gradcam.center_y * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    width: `${gradcam.radius * 230}px`,
                    height: `${gradcam.radius * 230}px`,
                    opacity: 0.75,
                    background: isNormal
                      ? 'radial-gradient(circle, rgba(15,118,110,.75), transparent 80%)'
                      : 'radial-gradient(circle, rgba(159,18,57,.85), rgba(217,119,6,.5) 55%, transparent 80%)',
                  }}
                />
              )}

              <div className="absolute bottom-3 left-3 data-mono text-[10px] text-slate-400">
                Key Sagittal T2 Slice · 1.5T MRI
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Triage Conclusion & Report Drawer */}
        <div className="space-y-5 lg:col-span-7">
          {/* Primary AI Conclusion Card */}
          <div id="tour-triage-summary" className="panel p-6">
            <div className="field-label mb-1">Primary Triage Finding</div>
            <div className="flex items-start gap-3">
              {isNormal ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-[var(--danger)] shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className={`text-xl font-display leading-snug ${isNormal ? 'text-emerald-900' : 'text-rose-900'}`}>
                  {primaryDiagnosis}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                  {findingsSummary || 'Processed across volumetric multi-slice series. Pathology indicators derived from validated RSNA benchmark checkpoints.'}
                </p>
              </div>
            </div>

            {/* Key Pathology Indicators */}
            <div className="mt-5 border-t border-[var(--line)] pt-4">
              <div className="field-label mb-3">Key Risk Indicators</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {topPathologies.map(([name, probability]) => {
                  const percent = Math.round(probability * 100);
                  const isHigh = percent >= 70;
                  const isMod = percent >= 35 && percent < 70;

                  return (
                    <div
                      key={name}
                      className={`rounded-xl border p-3 ${
                        isHigh
                          ? 'border-rose-200 bg-rose-50/50'
                          : isMod
                          ? 'border-amber-200 bg-amber-50/50'
                          : 'border-[var(--line)] bg-white/60'
                      }`}
                    >
                      <div className="text-xs font-semibold text-[var(--ink)] truncate" title={name}>
                        {name}
                      </div>
                      <div className={`data-mono text-lg font-bold mt-1 ${
                        isHigh ? 'text-rose-800' : isMod ? 'text-amber-800' : 'text-[var(--muted)]'
                      }`}>
                        {percent}%
                      </div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200/80 overflow-hidden">
                        <div
                          className={`h-full ${isHigh ? 'bg-[var(--danger)]' : isMod ? 'bg-amber-600' : 'bg-[var(--accent)]'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Calming Clinical Report Card */}
          <div id="tour-clinical-report" className="panel">
            <div className="panel-header">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[var(--accent)]" />
                <h3 className="panel-title">Clinical Impression & Patient Summary</h3>
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
                      Patient Portal
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onGenerateReport}
                    disabled={isGeneratingReport}
                    className="btn btn-primary"
                  >
                    <Sparkles className={`h-3.5 w-3.5 ${isGeneratingReport ? 'animate-spin' : ''}`} />
                    {isGeneratingReport ? 'Synthesizing…' : 'Generate Summary'}
                  </button>
                )}
              </div>
            </div>

            <div className="p-5">
              {report ? (
                activeTab === 'summary' ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border-l-4 border-[var(--accent)] bg-[var(--highlight)] p-4 text-xs leading-relaxed text-[var(--ink)]">
                      <div className="field-label mb-1 text-[var(--accent-deep)]">Impression</div>
                      <div className="whitespace-pre-line font-medium text-[var(--ink)]">{report.impression}</div>
                    </div>

                    <div className="text-xs text-[var(--muted)] leading-relaxed">
                      <strong className="font-semibold text-[var(--ink)]">Recommendations: </strong>
                      {report.recommendations}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-[var(--line)] bg-white/70 p-4 text-xs leading-relaxed text-[var(--muted)]">
                    <div className="field-label mb-1.5 text-[var(--accent-deep)]">Plain-Language Patient Breakdown</div>
                    <p className="text-[var(--ink)]">{report.patient_summary}</p>
                  </div>
                )
              ) : (
                <div className="text-center py-8 text-xs text-[var(--muted)]">
                  Click <strong className="text-[var(--accent-deep)]">Generate Summary</strong> to synthesize clinical findings with Vertex AI Gemini 1.5 Pro.
                </div>
              )}
            </div>

            <div className="border-t border-[var(--line)] bg-[var(--panel-strong)] px-5 py-3 flex items-center justify-between text-xs text-[var(--muted)]">
              <span className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-[var(--accent)]" />
                Investigational decision support only.
              </span>
              <button
                onClick={onSwitchToAdvanced}
                className="font-semibold text-[var(--accent-deep)] hover:underline"
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
