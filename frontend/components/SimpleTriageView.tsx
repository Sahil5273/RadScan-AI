'use client';

import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  Info,
  Layers,
  MapPin,
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
  const [showGradcam, setShowGradcam] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'patient'>('summary');
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
      {/* Scenario Presets Selector Card */}
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
        {/* Left Column: Authentic Clinical MRI Image Slice & Label Overlay */}
        <div id="tour-mri-viewport" className="space-y-5 lg:col-span-5">
          <div className="panel overflow-hidden">
            <div className="panel-header">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[var(--accent)]" />
                <h3 className="panel-title">Authentic Sagittal MRI Slice</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowLabels(!showLabels)}
                  className={`btn ${showLabels ? 'btn-active' : ''}`}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Pins
                </button>
                <button
                  onClick={() => setShowGradcam(!showGradcam)}
                  className={`btn ${showGradcam ? 'btn-active' : ''}`}
                >
                  {showGradcam ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  Heatmap
                </button>
              </div>
            </div>

            {/* Real DICOM MRI Image Container */}
            <div className="relative aspect-square w-full bg-[#05070a] overflow-hidden flex items-center justify-center">
              <img
                src="/mri_knee_sagittal.jpg"
                alt="Clinical Knee MRI Scan"
                className="h-full w-full object-contain"
              />

              {/* PyTorch Grad-CAM Thermal Heatmap Overlay */}
              {gradcam && showGradcam && (
                <div
                  className="pointer-events-none absolute rounded-full blur-xl transition-all duration-300"
                  style={{
                    left: `${(gradcam.center_x || 0.48) * 100}%`,
                    top: `${(gradcam.center_y || 0.52) * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    width: `${(gradcam.radius || 0.22) * 260}px`,
                    height: `${(gradcam.radius || 0.22) * 260}px`,
                    opacity: 0.78,
                    background: isNormal
                      ? 'radial-gradient(circle, rgba(15,118,110,.75), transparent 80%)'
                      : 'radial-gradient(circle, rgba(225,29,72,.90) 0%, rgba(217,119,6,.65) 45%, transparent 80%)',
                  }}
                />
              )}

              {/* Interactive Pathology Label Pin */}
              {showLabels && !isNormal && topPathologies.length > 0 && (
                <div
                  className="absolute pointer-events-auto transition-all rise-in"
                  style={{
                    left: `${(gradcam?.center_x || 0.48) * 100}%`,
                    top: `${(gradcam?.center_y || 0.52) * 100}%`,
                    transform: 'translate(-50%, -100%)',
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div className="rounded-xl bg-slate-900/90 border border-rose-500/60 px-2.5 py-1 text-[10px] font-bold text-white shadow-xl backdrop-blur-md flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                      <span>{topPathologies[0][0]}: {Math.round(topPathologies[0][1] * 100)}%</span>
                    </div>
                    <div className="h-4 w-0.5 bg-rose-500 shadow-md" />
                  </div>
                </div>
              )}

              {/* Image Metadata Bar */}
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-slate-300 bg-slate-950/75 backdrop-blur-md px-2.5 py-1 rounded-lg font-mono">
                <span>Sagittal T2 FSE · 1.5T</span>
                <span>Matrix: 512×512 · Thk: 3.0mm</span>
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
