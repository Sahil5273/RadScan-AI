'use client';

import React, { useState } from 'react';
import { FileText, Cpu, Copy, Check, Sparkles, User, Stethoscope, Download } from 'lucide-react';

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

export default function ReportGenerator({
  report,
  onGenerateReport,
  isGenerating
}: ReportGeneratorProps) {
  const [activeTab, setActiveTab] = useState<'clinical' | 'patient'>('clinical');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!report) return;
    const text = activeTab === 'clinical'
      ? `RADSCAN AI CLINICAL RADIOLOGY REPORT\n\nIMPRESSION:\n${report.impression}\n\nRECOMMENDATIONS:\n${report.recommendations}`
      : `PATIENT SUMMARY:\n${report.patient_summary}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-medical-border bg-medical-card p-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <Cpu className="h-5 w-5 text-purple-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">Vertex AI Gemini 1.5 Pro Report Generator</h3>
            <p className="text-xs text-slate-400">Automated DICOM clinical impression & patient summary generation</p>
          </div>
        </div>

        {/* Generate / Copy Buttons */}
        <div className="flex items-center space-x-2">
          {report && (
            <button
              onClick={handleCopy}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-medical-dark px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-600 transition-all"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}

          <button
            onClick={onGenerateReport}
            disabled={isGenerating}
            className="inline-flex items-center space-x-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50"
          >
            <Sparkles className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Drafting Report...' : 'Draft Gemini Report'}</span>
          </button>
        </div>
      </div>

      {/* Report Content Body */}
      {report ? (
        <div>
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-800 mb-3 space-x-4">
            <button
              onClick={() => setActiveTab('clinical')}
              className={`flex items-center space-x-1.5 pb-2 text-xs font-medium border-b-2 transition-all ${
                activeTab === 'clinical'
                  ? 'border-purple-400 text-purple-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Stethoscope className="h-3.5 w-3.5" />
              <span>Radiologist Clinical View</span>
            </button>

            <button
              onClick={() => setActiveTab('patient')}
              className={`flex items-center space-x-1.5 pb-2 text-xs font-medium border-b-2 transition-all ${
                activeTab === 'patient'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Patient Portal View</span>
            </button>
          </div>

          {/* Clinical View */}
          {activeTab === 'clinical' && (
            <div className="space-y-3 text-xs">
              {/* Study Info Banner */}
              <div className="rounded-lg bg-medical-dark p-3 border border-slate-800 font-mono grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
                <div><span className="text-slate-500">AGE:</span> {report.study_info.patient_age}</div>
                <div><span className="text-slate-500">GENDER:</span> {report.study_info.patient_gender}</div>
                <div><span className="text-slate-500">MODALITY:</span> MRI</div>
                <div><span className="text-slate-500">PRIMARY:</span> {report.study_info.primary_diagnosis}</div>
              </div>

              {/* Impression Section */}
              <div className="rounded-lg bg-purple-950/20 border border-purple-800/40 p-3">
                <div className="font-bold text-purple-300 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                  <FileText className="h-4 w-4" />
                  <span>Clinical Impression</span>
                </div>
                <div className="text-slate-200 whitespace-pre-line leading-relaxed font-sans font-normal">
                  {report.impression}
                </div>
              </div>

              {/* Recommendations Section */}
              <div className="rounded-lg bg-medical-dark p-3 border border-slate-800">
                <div className="font-bold text-slate-300 uppercase tracking-wider mb-1">Targeted Recommendations</div>
                <div className="text-slate-400 leading-relaxed font-sans">
                  {report.recommendations}
                </div>
              </div>
            </div>
          )}

          {/* Patient View */}
          {activeTab === 'patient' && (
            <div className="rounded-lg bg-cyan-950/20 border border-cyan-800/40 p-4 text-xs leading-relaxed text-slate-200 space-y-2">
              <div className="font-bold text-cyan-300 text-sm flex items-center space-x-2">
                <User className="h-4 w-4 text-cyan-400" />
                <span>Simplified Patient Summary</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                {report.patient_summary}
              </p>
              <div className="pt-2 border-t border-cyan-900/40 text-[11px] text-cyan-400 italic">
                Note: This explanation is generated by RadScan AI for patient understanding and should be reviewed with your treating doctor.
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-lg border border-dashed border-slate-800 p-8 text-center bg-medical-dark/40">
          <Cpu className="mx-auto h-8 w-8 text-slate-600 mb-2" />
          <div className="text-xs font-medium text-slate-400">No report generated yet</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Click &quot;Draft Gemini Report&quot; to synthesize clinical findings with Vertex AI Gemini 1.5 Pro.
          </p>
        </div>
      )}
    </div>
  );
}
