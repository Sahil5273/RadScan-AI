'use client';

import React from 'react';
import { Activity, Cpu, Cloud, DollarSign, Award, Zap } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-medical-border bg-medical-dark/95 backdrop-blur-md px-6 py-3.5">
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

        {/* Cloud Architecture & Credit Status */}
        <div className="hidden md:flex items-center space-x-4 text-xs font-medium">
          {/* GCP Status */}
          <div className="flex items-center space-x-2 rounded-lg border border-slate-800 bg-medical-card px-3 py-1.5 text-slate-300">
            <Cloud className="h-4 w-4 text-blue-400" />
            <span>GCP Cloud Run</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-emerald-400 font-semibold">L4 GPU Ready</span>
          </div>

          {/* Vertex AI Gemini */}
          <div className="flex items-center space-x-2 rounded-lg border border-slate-800 bg-medical-card px-3 py-1.5 text-slate-300">
            <Cpu className="h-4 w-4 text-purple-400" />
            <span>Vertex AI Gemini 1.5 Pro</span>
          </div>

          {/* GCP Credit Ticker */}
          <div className="flex items-center space-x-1.5 rounded-lg border border-amber-900/50 bg-amber-950/30 px-3 py-1.5 text-amber-300">
            <DollarSign className="h-4 w-4 text-amber-400" />
            <span>Credits: <strong className="text-amber-200">$218.50</strong> / $250</span>
          </div>

          {/* Hackathon Entry Badge */}
          <div className="flex items-center space-x-1.5 rounded-lg border border-cyan-800/60 bg-cyan-950/40 px-3 py-1.5 text-cyan-300">
            <Award className="h-4 w-4 text-cyan-400" />
            <span>XPRIZE & Agentic Hackathon</span>
          </div>
        </div>
      </div>
    </header>
  );
}
