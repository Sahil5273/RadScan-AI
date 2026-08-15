'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronRight, ChevronLeft, X, Sparkles, Activity, Layers, BarChart3, Cpu, CheckCircle } from 'lucide-react';

interface TourStep {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  highlightTag: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "1. GCP Cloud Infrastructure & Credits",
    subtitle: "Enterprise Scale-to-Zero Architecture",
    description: "The top navbar monitors GCP Cloud Run container status (NVIDIA L4 GPU acceleration), Vertex AI Gemini 1.5 Pro integration, and your remaining $250 GCP credits ($218.50 left).",
    icon: <Activity className="h-6 w-6 text-cyan-400" />,
    highlightTag: "GCP Status Bar"
  },
  {
    title: "2. 1-Click Judge Evaluation Suite",
    subtitle: "Sub-Second Test Cases for Competition Reviewers",
    description: "Hackathon judges can test 'Sample 1: ACL Tear', 'Sample 2: Meniscus Tear', or 'Sample 3: Normal Knee' in < 3 seconds, or drag & drop custom DICOM MRI files.",
    icon: <Sparkles className="h-6 w-6 text-emerald-400" />,
    highlightTag: "Sample Selector"
  },
  {
    title: "3. Multi-Planar Volumetric Slice Viewer",
    subtitle: "2.5D Sagittal, Coronal & Axial Planes",
    description: "Navigate through 24 MRI volumetric slices using the interactive slider. Key pathology slices are automatically flagged by the 2.5D CNN-BiGRU model.",
    icon: <Layers className="h-6 w-6 text-blue-400" />,
    highlightTag: "MRI Slice View"
  },
  {
    title: "4. Grad-CAM Visual Heatmap Layer",
    subtitle: "Visual Explainability for Radiologists",
    description: "Toggle the Grad-CAM explainability heatmap ON/OFF and adjust opacity from 0% to 100%. Red/yellow target crosshairs pinpoint exact lesion coordinates.",
    icon: <Sparkles className="h-6 w-6 text-rose-400" />,
    highlightTag: "Grad-CAM Heatmap"
  },
  {
    title: "5. 12-Target Pathology Risk Breakdown",
    subtitle: "Multi-Class Probability Distribution",
    description: "Evaluates 12 knee pathology targets (ACL, PCL, Meniscus, Effusion, Edema, Cartilage, etc.) simultaneously with color-coded risk indicators.",
    icon: <BarChart3 className="h-6 w-6 text-amber-400" />,
    highlightTag: "Risk Breakdown"
  },
  {
    title: "6. Vertex AI Gemini 1.5 Pro Report Generator",
    subtitle: "Multimodal Clinical Impression & Patient Portal Summary",
    description: "Synthesizes structured DICOM findings, clinical impressions, recommendations, and patient-friendly non-technical summaries in real time.",
    icon: <Cpu className="h-6 w-6 text-purple-400" />,
    highlightTag: "Gemini 1.5 Pro Report"
  }
];

interface InteractiveTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InteractiveTour({ isOpen, onClose }: InteractiveTourProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (!isLast) setCurrentStep(currentStep + 1);
    else onClose();
  };

  const handlePrev = () => {
    if (!isFirst) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-cyan-800/80 bg-medical-card p-6 shadow-2xl shadow-cyan-950/80">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Step Badge */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="rounded-full bg-cyan-950 px-3 py-1 text-xs font-semibold text-cyan-400 border border-cyan-800">
            Step {currentStep + 1} of {TOUR_STEPS.length}
          </span>
          <span className="text-xs text-slate-400 font-mono">• {step.highlightTag}</span>
        </div>

        {/* Content Header */}
        <div className="flex items-start space-x-3 mb-4">
          <div className="rounded-xl bg-medical-dark p-3 border border-slate-800 shadow-inner">
            {step.icon}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{step.title}</h3>
            <p className="text-xs text-cyan-300 font-medium">{step.subtitle}</p>
          </div>
        </div>

        {/* Step Description */}
        <div className="rounded-xl bg-medical-dark/90 p-4 border border-slate-800 text-xs leading-relaxed text-slate-300 mb-6">
          {step.description}
        </div>

        {/* Tour Navigation Controls */}
        <div className="flex items-center justify-between border-t border-slate-800/80 pt-4">
          <button
            onClick={handlePrev}
            disabled={isFirst}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-medical-dark px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-all disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center space-x-1.5">
            {TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full cursor-pointer transition-all ${
                  idx === currentStep ? 'w-6 bg-cyan-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="inline-flex items-center space-x-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-cyan-950 transition-all"
          >
            <span>{isLast ? 'Finish Tour' : 'Next'}</span>
            {!isLast ? <ChevronRight className="h-4 w-4" /> : <CheckCircle className="h-4 w-4 text-emerald-300" />}
          </button>
        </div>
      </div>
    </div>
  );
}
