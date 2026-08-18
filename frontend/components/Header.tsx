'use client';

import React from 'react';
import {
  Activity,
  BarChart3,
  Cpu,
  HelpCircle,
  Lock,
  Monitor,
  Settings,
  SlidersHorizontal,
  Zap,
} from 'lucide-react';

interface HeaderProps {
  onOpenTour?: () => void;
  uiMode: 'simple' | 'advanced';
  onToggleUiMode: (mode: 'simple' | 'advanced') => void;
  currentView: 'workspace' | 'models';
  onChangeView: (view: 'workspace' | 'models') => void;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

export default function Header({
  onOpenTour,
  uiMode,
  onToggleUiMode,
  currentView,
  onChangeView,
  selectedModel,
  onSelectModel,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40">
      {/* Institutional identity bar */}
      <div className="bg-clinical-900 px-4 text-white sm:px-6">
        <div className="mx-auto flex h-14 max-w-[1680px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-white/10 ring-1 ring-inset ring-white/20">
              <Activity className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold tracking-tight">RadScan AI</span>
                <span className="hidden rounded-sm bg-white/10 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wider text-clinical-100 sm:inline">
                  MSK MRI Copilot
                </span>
              </div>
              <div className="hidden text-[11px] text-clinical-200 sm:block">
                Department of Radiology · Clinical Decision Support
              </div>
            </div>
          </div>

          {/* Center & Right Controls: Model Selector & View Mode */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Model Selector Dropdown */}
            <div className="hidden items-center gap-1.5 rounded border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white md:flex">
              <Cpu className="h-3.5 w-3.5 text-clinical-200 shrink-0" />
              <span className="text-[11px] text-clinical-200 hidden lg:inline">Engine:</span>
              <select
                value={selectedModel}
                onChange={(e) => onSelectModel(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white outline-none cursor-pointer"
              >
                <option value="model-2.5d-bigru" className="text-slate-900">
                  2.5D Volumetric CNN-BiGRU (18ms)
                </option>
                <option value="model-3d-swin" className="text-slate-900">
                  3D SwinUNETR Transformer (62ms)
                </option>
              </select>
            </div>

            {/* UI Mode Toggle (Simple vs Advanced) */}
            <div className="flex items-center rounded border border-white/20 bg-white/10 p-0.5 text-xs font-semibold">
              <button
                onClick={() => onToggleUiMode('simple')}
                className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] transition-colors ${
                  uiMode === 'simple'
                    ? 'bg-white text-clinical-900 font-bold'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Zap className="h-3 w-3" />
                Simple
              </button>
              <button
                onClick={() => onToggleUiMode('advanced')}
                className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] transition-colors ${
                  uiMode === 'advanced'
                    ? 'bg-white text-clinical-900 font-bold'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <SlidersHorizontal className="h-3 w-3" />
                Advanced PACS
              </button>
            </div>

            <div className="hidden items-center gap-1.5 rounded border border-white/15 bg-white/5 px-2 py-1 text-[11px] font-medium text-clinical-100 lg:flex">
              <Lock className="h-3.5 w-3.5" />
              De-identified
            </div>

            {onOpenTour && (
              <button
                onClick={onOpenTour}
                className="inline-flex items-center gap-1.5 rounded border border-white/20 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/10"
              >
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Help</span>
              </button>
            )}

            <div className="flex items-center gap-2 border-l border-white/15 pl-2 sm:pl-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-clinical-400 text-xs font-bold text-clinical-900">
                AS
              </div>
              <div className="hidden leading-tight md:block">
                <div className="text-xs font-semibold">Dr. A. Sharma, MD</div>
                <div className="text-[11px] text-clinical-200">MSK Radiology</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Module navigation bar */}
      <nav className="border-b border-surface-border bg-white px-4 sm:px-6">
        <div className="mx-auto flex max-w-[1680px] items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onChangeView('workspace')}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors ${
                currentView === 'workspace'
                  ? 'border-clinical-600 text-clinical-700'
                  : 'border-transparent text-slate-500 hover:border-surface-strong hover:text-slate-700'
              }`}
            >
              <Monitor className="h-4 w-4" />
              Diagnostic Workstation
              <span className="chip chip-neutral text-[9px] uppercase ml-1">
                {uiMode} Mode
              </span>
            </button>

            <button
              onClick={() => onChangeView('models')}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors ${
                currentView === 'models'
                  ? 'border-clinical-600 text-clinical-700'
                  : 'border-transparent text-slate-500 hover:border-surface-strong hover:text-slate-700'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Model Comparison & Benchmarks
              <span className="chip chip-info text-[9px] uppercase ml-1">
                Dual Models
              </span>
            </button>
          </div>

          <div className="hidden items-center gap-2 py-2 text-xs text-slate-500 sm:flex">
            <span>Model: <strong className="text-slate-800 font-semibold">{selectedModel === 'model-2.5d-bigru' ? '2.5D CNN-BiGRU' : '3D Swin-Transformer'}</strong></span>
          </div>
        </div>
      </nav>
    </header>
  );
}
