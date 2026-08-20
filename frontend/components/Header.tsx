'use client';

import React from 'react';
import {
  Activity,
  BarChart3,
  Cpu,
  Lock,
  Monitor,
  SlidersHorizontal,
  Sparkles,
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
    <header id="tour-portal-header" className="sticky top-0 z-40 backdrop-blur-md border-b border-[var(--line)] bg-[var(--panel)]">
      {/* Editorial Identity Bar */}
      <div className="border-b border-[var(--line)] px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-[1680px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-white shadow-sm">
              <Activity className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-[var(--ink)] font-display">
                  RadScan AI
                </span>
                <span className="rounded-md bg-[var(--highlight)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--accent-deep)]">
                  MSK MRI Decision Support
                </span>
              </div>
              <div className="hidden text-xs text-[var(--muted)] sm:block">
                Department of Radiology · Explainable Triage
              </div>
            </div>
          </div>

          {/* Right Controls: Engine Selector & Mode Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Model Selector Dropdown */}
            <div id="tour-model-selector" className="hidden items-center gap-1.5 rounded-xl border border-[var(--line)] bg-white/70 px-3 py-1.5 text-xs font-semibold text-[var(--ink)] md:flex shadow-sm">
              <Cpu className="h-3.5 w-3.5 text-[var(--accent)] shrink-0" />
              <span className="text-[11px] text-[var(--muted)] hidden lg:inline">Engine:</span>
              <select
                value={selectedModel}
                onChange={(e) => onSelectModel(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[var(--accent-deep)] outline-none cursor-pointer"
              >
                <option value="phase1-sagittal-resnet18">
                  Phase 4: 3-Plane Fusion (0.802 LB)
                </option>
                <option value="phase4-3plane-resnet18">
                  Phase 5: 3D SwinUNETR Ensemble (0.809 LB Champion)
                </option>
                <option value="phase3-multimodal-oracle">
                  Phase 3: Multimodal Oracle (0.852 AUC)
                </option>
              </select>
            </div>

            {/* UI Mode Toggle (Simple vs Advanced) */}
            <div className="flex items-center rounded-xl border border-[var(--line)] bg-white/60 p-1 text-xs font-semibold">
              <button
                onClick={() => onToggleUiMode('simple')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs transition ${
                  uiMode === 'simple'
                    ? 'bg-[var(--accent)] text-white font-bold shadow-sm'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                <Zap className="h-3 w-3" />
                Simple
              </button>
              <button
                onClick={() => onToggleUiMode('advanced')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs transition ${
                  uiMode === 'advanced'
                    ? 'bg-[var(--accent)] text-white font-bold shadow-sm'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                <SlidersHorizontal className="h-3 w-3" />
                Advanced PACS
              </button>
            </div>

            {onOpenTour && (
              <button
                onClick={onOpenTour}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--accent)] bg-[var(--highlight)] px-3 py-1.5 text-xs font-bold text-[var(--accent-deep)] transition hover:bg-[var(--accent)] hover:text-white"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Help</span>
              </button>
            )}

            <div className="hidden items-center gap-1.5 border-l border-[var(--line)] pl-3 text-[11px] font-semibold text-[var(--muted)] md:flex">
              <Lock className="h-3.5 w-3.5" />
              Demo · no patient data
            </div>
          </div>
        </div>
      </div>

      {/* Module Navigation Bar */}
      <nav className="px-4 sm:px-6">
        <div className="mx-auto flex max-w-[1680px] items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-2 py-2">
            <button
              onClick={() => onChangeView('workspace')}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                currentView === 'workspace'
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--muted)] hover:bg-white/60 hover:text-[var(--ink)]'
              }`}
            >
              <Monitor className="h-4 w-4" />
              Diagnostic Workstation
              <span className="chip chip-neutral text-[9px] uppercase ml-1 opacity-90">
                {uiMode} Mode
              </span>
            </button>

            <button
              onClick={() => onChangeView('models')}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                currentView === 'models'
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--muted)] hover:bg-white/60 hover:text-[var(--ink)]'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Model Comparison & Benchmarks
              <span className="chip chip-info text-[9px] uppercase ml-1">
                RSNA Benchmark
              </span>
            </button>
          </div>

          <div className="hidden items-center gap-2 text-xs text-[var(--muted)] sm:flex">
            <span>Selected Engine: <strong className="text-[var(--accent-deep)] font-bold">{selectedModel === 'phase1-sagittal-resnet18' ? 'Phase 4 Multi-Planar (0.802 LB)' : selectedModel === 'phase4-3plane-resnet18' ? 'Phase 5 3D SwinUNETR (0.809 LB)' : 'Phase 3 Multimodal (0.852 AUC)'}</strong></span>
          </div>
        </div>
      </nav>
    </header>
  );
}
