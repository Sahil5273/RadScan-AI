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
      <div className="border-b border-[var(--line)] px-3 py-2.5 sm:px-6">
        <div className="mx-auto flex max-w-[1680px] flex-wrap items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-white shadow-sm shrink-0">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.25} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-[var(--ink)] font-display">
                  RadScan AI
                </span>
                <span className="rounded-md bg-[var(--highlight)] px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[var(--accent-deep)]">
                  MSK MRI Triage
                </span>
              </div>
              <div className="hidden text-xs text-[var(--muted)] sm:block">
                Department of Radiology · Explainable Triage
              </div>
            </div>
          </div>

          {/* Right Controls: Engine Selector & Mode Toggle (Fully Responsive on Mobile) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Model Selector Dropdown (Visible on Mobile & Desktop) */}
            <div id="tour-model-selector" className="flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-white/80 px-2.5 py-1.5 text-xs font-semibold text-[var(--ink)] shadow-sm max-w-full">
              <Cpu className="h-3.5 w-3.5 text-[var(--accent)] shrink-0" />
              <span className="text-[11px] text-[var(--muted)] hidden sm:inline">Engine:</span>
              <select
                value={selectedModel}
                onChange={(e) => onSelectModel(e.target.value)}
                className="bg-transparent text-xs font-bold text-[var(--accent-deep)] outline-none cursor-pointer max-w-[200px] sm:max-w-none truncate"
              >
                <option value="phase1-sagittal-resnet18">
                  Phase 16.0: ACD-Net Seed 123 SOTA (0.860 LB)
                </option>
                <option value="phase4-3plane-resnet18">
                  Phase 16.2: ACD-Net FiLM Multi-Sequence (0.814 AUC)
                </option>
              </select>
            </div>

            {/* UI Mode Toggle (Simple vs Advanced) */}
            <div className="flex items-center rounded-xl border border-[var(--line)] bg-white/70 p-1 text-xs font-semibold">
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
                <span className="hidden sm:inline">Advanced PACS</span>
                <span className="sm:hidden">PACS</span>
              </button>
            </div>

            {onOpenTour && (
              <button
                onClick={onOpenTour}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--accent)] bg-[var(--highlight)] px-2.5 py-1.5 text-xs font-bold text-[var(--accent-deep)] transition hover:bg-[var(--accent)] hover:text-white"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Help</span>
              </button>
            )}

            <div className="hidden items-center gap-1.5 border-l border-[var(--line)] pl-3 text-[11px] font-semibold text-[var(--muted)] xl:flex">
              <Lock className="h-3.5 w-3.5" />
              Demo · no patient data
            </div>
          </div>
        </div>
      </div>

      {/* Module Navigation Bar */}
      <nav className="px-3 sm:px-6">
        <div className="mx-auto flex max-w-[1680px] items-center justify-between overflow-x-auto py-1">
          <div className="flex items-center gap-2 py-1">
            <button
              onClick={() => onChangeView('workspace')}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold transition ${
                currentView === 'workspace'
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--muted)] hover:bg-white/60 hover:text-[var(--ink)]'
              }`}
            >
              <Monitor className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Diagnostic Workstation
              <span className="chip chip-neutral text-[9px] uppercase ml-1 opacity-90 hidden sm:inline">
                {uiMode} Mode
              </span>
            </button>

            <button
              onClick={() => onChangeView('models')}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold transition ${
                currentView === 'models'
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--muted)] hover:bg-white/60 hover:text-[var(--ink)]'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Benchmarks & Specs
            </button>
          </div>

          <div className="hidden items-center gap-2 text-xs text-[var(--muted)] lg:flex">
            <span>Selected Engine: <strong className="text-[var(--accent-deep)] font-bold">{selectedModel === 'phase1-sagittal-resnet18' ? 'Phase 16.0 Seed 123 (0.860 LB SOTA)' : 'Phase 16.2 FiLM (0.814 AUC)'}</strong></span>
          </div>
        </div>
      </nav>
    </header>
  );
}
