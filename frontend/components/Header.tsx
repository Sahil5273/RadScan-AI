'use client';

import React from 'react';
import {
  Activity,
  ClipboardList,
  FileText,
  HelpCircle,
  LayoutGrid,
  Lock,
  Monitor,
  Settings,
} from 'lucide-react';

interface HeaderProps {
  onOpenTour?: () => void;
}

const MODULES = [
  { label: 'Worklist', icon: ClipboardList, active: false },
  { label: 'Image Review', icon: Monitor, active: true },
  { label: 'Reporting', icon: FileText, active: false },
  { label: 'Quality & Audit', icon: LayoutGrid, active: false },
];

export default function Header({ onOpenTour }: HeaderProps) {
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
                  MSK MRI
                </span>
              </div>
              <div className="hidden text-[11px] text-clinical-200 sm:block">
                Department of Radiology · Clinical Decision Support
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-1.5 rounded border border-white/15 bg-white/5 px-2 py-1 text-[11px] font-medium text-clinical-100 lg:flex">
              <Lock className="h-3.5 w-3.5" />
              De-identified session
            </div>

            <div className="hidden items-center gap-1.5 rounded border border-white/15 bg-white/5 px-2 py-1 text-[11px] font-medium text-clinical-100 xl:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Inference service online
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

            <button className="hidden rounded border border-white/20 p-1.5 text-white transition-colors hover:bg-white/10 sm:inline-flex">
              <Settings className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 border-l border-white/15 pl-2 sm:pl-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-clinical-400 text-xs font-bold text-clinical-900">
                AS
              </div>
              <div className="hidden leading-tight md:block">
                <div className="text-xs font-semibold">Dr. A. Sharma, MD</div>
                <div className="text-[11px] text-clinical-200">Musculoskeletal Radiology</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Module navigation */}
      <nav className="border-b border-surface-border bg-white px-4 sm:px-6">
        <div className="mx-auto flex max-w-[1680px] items-center gap-1 overflow-x-auto">
          {MODULES.map(({ label, icon: Icon, active }) => (
            <button
              key={label}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors ${
                active
                  ? 'border-clinical-600 text-clinical-700'
                  : 'border-transparent text-slate-500 hover:border-surface-strong hover:text-slate-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
