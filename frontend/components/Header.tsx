'use client';

import React from 'react';
import { Activity, Cpu, Cloud, DollarSign, Award, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onOpenTour?: () => void;
}

export default function Header({ onOpenTour }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-medical-border bg-medical-dark/95 backdrop-blur-md px-6 py-3.5">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand & Tagline */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-lg shadow-cyan-500/20 glow-cyan">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white">RadScan<span className="text-medical-accent">.AI</span></h1>
              <span className="rounded-full bg-cyan-950 px-2 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-800/50">
                v2.5 Volumetric
              </span>
            </div>
            <p className="text-xs text-slate-400">AI Radiology Triage & Multimodal MRI Report Copilot</p>
          </div>
        </div>

        {/* Cloud Architecture, Credit Status & Help Tour */}
        <div className="flex items-center space-x-3 text-xs font-medium">
          {/* Guided Tour Button */}
          {onOpenTour && (
            <button
              onClick={onOpenTour}
              className="inline-flex items-center space-x-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-cyan-950 transition-all border border-cyan-400/30"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Take Guided Tour</span>
            </button>
          )}

          {/* GCP Status */}
          <div className="hidden lg:flex items-center space-x-2 rounded-lg border border-slate-800 bg-medical-card px-3 py-1.5 text-slate-300">
            <Cloud className="h-4 w-4 text-blue-400" />
            <span>GCP Cloud Run</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-emerald-400 font-semibold">L4 GPU Ready</span>
          </div>

          {/* Vertex AI Gemini */}
          <div className="hidden md:flex items-center space-x-2 rounded-lg border border-slate-800 bg-medical-card px-3 py-1.5 text-slate-300">
            <Cpu className="h-4 w-4 text-purple-400" />
            <span>Vertex AI Gemini 1.5 Pro</span>
          </div>

          {/* GCP Credit Ticker */}
          <div className="hidden sm:flex items-center space-x-1.5 rounded-lg border border-amber-900/50 bg-amber-950/30 px-3 py-1.5 text-amber-300">
            <DollarSign className="h-4 w-4 text-amber-400" />
            <span>Credits: <strong className="text-amber-200">$218.50</strong> / $250</span>
          </div>
        </div>
      </div>
    </header>
  );
}
