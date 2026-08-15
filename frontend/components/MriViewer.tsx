'use client';

import React, { useState } from 'react';
import { Layers, Eye, EyeOff, Sliders, Maximize2, Crosshair } from 'lucide-react';

interface MriViewerProps {
  sampleId: string;
  gradcam: {
    center_x: number;
    center_y: number;
    radius: number;
    intensity: number;
    primary_target: str;
  } | null;
  sliceCount?: number;
  keySliceIndex?: number;
}

export default function MriViewer({
  sampleId,
  gradcam,
  sliceCount = 24,
  keySliceIndex = 12
}: MriViewerProps) {
  const [currentSlice, setCurrentSlice] = useState<number>(keySliceIndex);
  const [showGradcam, setShowGradcam] = useState<boolean>(true);
  const [opacity, setOpacity] = useState<number>(0.75);
  const [plane, setPlane] = useState<'sagittal' | 'coronal' | 'axial'>('sagittal');

  // Determine heatmap coordinates relative to current slice distance
  const sliceDiff = Math.abs(currentSlice - keySliceIndex);
  const currentIntensity = gradcam ? Math.max(0.1, gradcam.intensity * (1 - sliceDiff * 0.12)) : 0;
  const isKeySlice = currentSlice === keySliceIndex;

  return (
    <div className="rounded-xl border border-medical-border bg-medical-card p-4 shadow-xl flex flex-col h-full">
      {/* Viewer Header Controls */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <Layers className="h-5 w-5 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Multi-Planar MRI Viewer</h3>
          <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-300">
            Slice {currentSlice} / {sliceCount}
          </span>
          {isKeySlice && (
            <span className="rounded bg-rose-950 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-800 animate-pulse">
              Key Pathology Slice
            </span>
          )}
        </div>

        {/* Plane Selector Tabs */}
        <div className="flex items-center space-x-1 rounded-lg bg-medical-dark p-1 border border-slate-800">
          {(['sagittal', 'coronal', 'axial'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPlane(p)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-all ${
                plane === p
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Main MRI DICOM Viewport Canvas */}
      <div className="relative flex-1 min-h-[360px] w-full rounded-lg bg-black overflow-hidden border border-slate-800 dicom-grid-overlay flex items-center justify-center">
        {/* Synthetic Volumetric Knee MRI Image Representation */}
        <div className="relative w-72 h-72 rounded-full border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-4 flex items-center justify-center shadow-2xl">
          {/* Femoral Condyle & Tibial Plateau Bone Structure Graphic */}
          <div className="absolute inset-4 rounded-full border border-slate-700/30 flex items-center justify-center">
            {/* Femur Contour */}
            <div className="absolute top-4 w-40 h-28 rounded-t-full border-t-2 border-x-2 border-slate-500/80 bg-slate-800/40"></div>
            {/* Tibia Contour */}
            <div className="absolute bottom-4 w-44 h-24 rounded-b-2xl border-b-2 border-x-2 border-slate-500/80 bg-slate-800/40"></div>
            {/* Joint Space */}
            <div className="absolute top-[48%] w-48 h-4 bg-slate-900/90 border-y border-cyan-900/30"></div>
          </div>

          {/* Grad-CAM Heatmap Activation Overlay Layer */}
          {gradcam && showGradcam && (
            <div
              className="absolute rounded-full transition-all duration-300 pointer-events-none"
              style={{
                left: `${gradcam.center_x * 100}%`,
                top: `${gradcam.center_y * 100}%`,
                transform: 'translate(-50%, -50%)',
                width: `${gradcam.radius * 260}px`,
                height: `${gradcam.radius * 260}px`,
                opacity: opacity * currentIntensity,
                background: sampleId.includes('normal')
                  ? 'radial-gradient(circle, rgba(16,185,129,0.5) 0%, rgba(16,185,129,0.1) 70%, transparent 100%)'
                  : 'radial-gradient(circle, rgba(244,63,94,0.85) 0%, rgba(245,158,11,0.6) 50%, rgba(244,63,94,0.1) 80%, transparent 100%)',
                filter: 'blur(8px)',
                boxShadow: sampleId.includes('normal')
                  ? '0 0 20px rgba(16,185,129,0.4)'
                  : '0 0 35px rgba(244,63,94,0.7)'
              }}
            ></div>
          )}

          {/* Target ROI Crosshair Indicator */}
          {gradcam && (
            <div
              className="absolute pointer-events-none flex flex-col items-center justify-center transition-all duration-300"
              style={{
                left: `${gradcam.center_x * 100}%`,
                top: `${gradcam.center_y * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <Crosshair className={`h-8 w-8 ${sampleId.includes('normal') ? 'text-emerald-400' : 'text-rose-400 animate-spin-slow'}`} />
              <div className="mt-1 rounded bg-black/90 px-1.5 py-0.5 text-[9px] font-mono text-cyan-300 border border-cyan-800 whitespace-nowrap shadow-md">
                ROI: {gradcam.primary_target}
              </div>
            </div>
          )}
        </div>

        {/* DICOM Overlay Metrics Header */}
        <div className="absolute top-3 left-3 text-[11px] font-mono text-slate-400 space-y-0.5 pointer-events-none bg-black/60 p-2 rounded border border-slate-800/80">
          <div>PATIENT: RADSCAN-9842</div>
          <div>MODE: {plane.toUpperCase()} T2 FS</div>
          <div>SLICE: {currentSlice} / {sliceCount}</div>
          <div>WINDOW: 350 / 80</div>
        </div>

        {/* Grad-CAM Heatmap Toggle Status */}
        <div className="absolute bottom-3 right-3 text-[10px] font-mono pointer-events-none bg-black/80 px-2 py-1 rounded border border-slate-800 text-slate-300">
          Grad-CAM: <span className={showGradcam ? 'text-rose-400 font-bold' : 'text-slate-500'}>{showGradcam ? 'ACTIVE' : 'OFF'}</span>
        </div>
      </div>

      {/* Slice Navigation Slider & Heatmap Controls */}
      <div className="mt-4 space-y-3 bg-medical-dark/80 p-3 rounded-lg border border-slate-800">
        {/* Slice Navigation Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-300">
            <span className="flex items-center space-x-1">
              <Sliders className="h-3.5 w-3.5 text-cyan-400" />
              <span>Volumetric Slice Slider</span>
            </span>
            <span className="font-mono text-cyan-400 font-medium">Slice {currentSlice} of {sliceCount}</span>
          </div>
          <input
            type="range"
            min={1}
            max={sliceCount}
            value={currentSlice}
            onChange={(e) => setCurrentSlice(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Grad-CAM Opacity Slider & Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-800/60">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowGradcam(!showGradcam)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border transition-all ${
                showGradcam
                  ? 'bg-rose-950/80 text-rose-300 border-rose-800 hover:bg-rose-900'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {showGradcam ? <Eye className="h-3.5 w-3.5 text-rose-400" /> : <EyeOff className="h-3.5 w-3.5" />}
              <span>{showGradcam ? 'Grad-CAM Overlay ON' : 'Show Heatmap'}</span>
            </button>
          </div>

          {/* Opacity slider */}
          {showGradcam && (
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span>Heatmap Opacity:</span>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.05}
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-24 h-1 bg-slate-800 rounded appearance-none cursor-pointer"
              />
              <span className="font-mono text-cyan-400 text-[11px] w-8">{Math.round(opacity * 100)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
