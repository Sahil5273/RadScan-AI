'use client';

import React, { useRef } from 'react';
import { Upload, Zap, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface SampleSelectorProps {
  activeSampleId: string;
  onSelectSample: (sampleId: string) => void;
  onUploadCustom: (file: File) => void;
  isLoading: boolean;
}

export default function SampleSelector({
  activeSampleId,
  onSelectSample,
  onUploadCustom,
  isLoading
}: SampleSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadCustom(e.target.files[0]);
    }
  };

  return (
    <div className="rounded-xl border border-medical-border bg-medical-card p-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-semibold text-white">1-Click Judge Evaluation Suite</h2>
            <span className="rounded-md bg-emerald-950 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-800">
              ⚡ Instant Test (&lt; 3s)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any pre-loaded 2.5D MRI sample dataset or drop a custom .dcm file to trigger live volumetric inference & Grad-CAM visual heatmaps.
          </p>
        </div>

        {/* Custom Upload Button */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".dcm,.dicom,.png,.jpg,.jpeg"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="inline-flex items-center space-x-2 rounded-lg bg-medical-border hover:bg-slate-700 px-3.5 py-2 text-xs font-medium text-slate-200 transition-all border border-slate-700 hover:border-cyan-500 disabled:opacity-50"
          >
            <Upload className="h-4 w-4 text-cyan-400" />
            <span>Upload Custom DICOM</span>
          </button>
        </div>
      </div>

      {/* 3-Sample Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Sample 1: ACL Tear */}
        <button
          onClick={() => onSelectSample('sample-acl-tear')}
          disabled={isLoading}
          className={`flex items-start space-x-3 rounded-lg p-3 text-left transition-all border ${
            activeSampleId === 'sample-acl-tear'
              ? 'bg-rose-950/40 border-rose-500/80 shadow-md shadow-rose-950/50'
              : 'bg-medical-dark/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="rounded-md bg-rose-500/20 p-2 text-rose-400 mt-0.5">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-white">Sample 1: ACL Tear</span>
              <span className="rounded bg-rose-900/60 text-[10px] text-rose-300 font-semibold px-1.5 py-0.2">High Risk</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">Acute knee pivot-shift trauma (28M)</p>
            <div className="text-[10px] text-rose-400 font-medium mt-1">
              • ACL Disruption (94%) • Effusion (88%)
            </div>
          </div>
        </button>

        {/* Sample 2: Meniscus Tear */}
        <button
          onClick={() => onSelectSample('sample-meniscus-tear')}
          disabled={isLoading}
          className={`flex items-start space-x-3 rounded-lg p-3 text-left transition-all border ${
            activeSampleId === 'sample-meniscus-tear'
              ? 'bg-amber-950/40 border-amber-500/80 shadow-md shadow-amber-950/50'
              : 'bg-medical-dark/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="rounded-md bg-amber-500/20 p-2 text-amber-400 mt-0.5">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-white">Sample 2: Meniscus Tear</span>
              <span className="rounded bg-amber-900/60 text-[10px] text-amber-300 font-semibold px-1.5 py-0.2">Moderate</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">Medial joint line pain & locking (42F)</p>
            <div className="text-[10px] text-amber-400 font-medium mt-1">
              • Medial Meniscus Tear (91%)
            </div>
          </div>
        </button>

        {/* Sample 3: Normal Knee */}
        <button
          onClick={() => onSelectSample('sample-normal-knee')}
          disabled={isLoading}
          className={`flex items-start space-x-3 rounded-lg p-3 text-left transition-all border ${
            activeSampleId === 'sample-normal-knee'
              ? 'bg-emerald-950/40 border-emerald-500/80 shadow-md shadow-emerald-950/50'
              : 'bg-medical-dark/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="rounded-md bg-emerald-500/20 p-2 text-emerald-400 mt-0.5">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-white">Sample 3: Normal Knee</span>
              <span className="rounded bg-emerald-900/60 text-[10px] text-emerald-300 font-semibold px-1.5 py-0.2">Normal</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">Unremarkable screening MRI (31F)</p>
            <div className="text-[10px] text-emerald-400 font-medium mt-1">
              • Normal Joint Architecture (96%)
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
