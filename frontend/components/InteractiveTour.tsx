'use client';

import React, { useState, useEffect } from 'react';

export interface TourStep {
  targetId: string;
  title: string;
  description: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-portal-header',
    title: 'Welcome to RadScan AI!',
    description:
      'RadScan AI is an explainable decision support copilot for knee MRI triage. It combines multi-planar computer vision with Vertex AI Gemini report generation.',
  },
  {
    targetId: 'tour-case-selector',
    title: 'Clinical Scenario Presets & Study Selection',
    description:
      'Select 1-click test cases (ACL Tear, Meniscus Tear, Normal Knee) or upload custom DICOM files for instant evaluation.',
  },
  {
    targetId: 'tour-mri-viewport',
    title: 'Interactive MRI Slice Viewer & Grad-CAM',
    description:
      'Inspect MRI slice sequences. Toggle the Grad-CAM visual explainability heatmap to overlay red/yellow lesion coordinates directly onto anatomy.',
  },
  {
    targetId: 'tour-triage-summary',
    title: 'Primary Diagnosis & Key Risk Indicators',
    description:
      'Review primary AI conclusions and pathology probabilities across target attributes evaluated against validated clinical operating thresholds.',
  },
  {
    targetId: 'tour-clinical-report',
    title: 'Vertex AI Gemini Clinical Report & Patient Portal',
    description:
      'Generate structured radiology reports (Examination, Findings, Impression, Recommendations) and plain-language patient portal summaries exportable to PDF.',
  },
  {
    targetId: 'tour-model-selector',
    title: 'Dual Engine Selection & RSNA Benchmarks',
    description:
      'Switch between Phase 1 Sagittal Triage (0.784 LB) and Phase 4 3-Plane Fusion (0.7699 Gold Val) or inspect the 12-target benchmark comparison matrix.',
  },
];

interface InteractiveTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InteractiveTour({ isOpen, onClose }: InteractiveTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  // Reset step index when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  // Dynamically calculate target element coordinates & smooth scroll into view
  useEffect(() => {
    if (!isOpen || TOUR_STEPS.length === 0) return;

    const updateCoords = () => {
      const step = TOUR_STEPS[currentStepIndex];
      const target = document.getElementById(step.targetId);
      if (target) {
        const rect = target.getBoundingClientRect();
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setCoords(null);
      }
    };

    updateCoords();
    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords);

    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords);
    };
  }, [isOpen, currentStepIndex]);

  if (!isOpen || TOUR_STEPS.length === 0) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];

  // Viewport-fixed bottom-center floating popup position
  const popupStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '40px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 32px)',
    maxWidth: '420px',
  };

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-[9999]">
      {/* Dynamic spotlight cutout with smooth pulse glow ring & dimming backdrop */}
      {coords ? (
        <div
          className="absolute z-[10000] rounded-2xl border border-[var(--accent)] pointer-events-none transition-all duration-300 shadow-[0_0_0_9999px_rgba(15,23,42,0.65),0_0_20px_rgba(20,184,166,0.45)]"
          style={{
            top: coords.top - 6,
            left: coords.left - 6,
            width: coords.width + 12,
            height: coords.height + 12,
          }}
        />
      ) : (
        <div className="fixed inset-0 z-[10000] bg-slate-900/65 pointer-events-auto" />
      )}

      {/* Popover content card */}
      <div
        style={popupStyle}
        className="z-[10001] pointer-events-auto rounded-2xl border border-[var(--line)] bg-white/95 p-5 shadow-2xl backdrop-blur-md transition-all duration-300 ease-out rise-in"
      >
        <header className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-deep)]">
            Step {currentStepIndex + 1} of {TOUR_STEPS.length}
          </span>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--ink)] text-xs font-semibold"
          >
            Skip
          </button>
        </header>

        <h4 className="text-base font-bold text-[var(--ink)] mb-1 font-display">
          {currentStep.title}
        </h4>
        <p className="text-xs leading-relaxed text-[var(--muted)] mb-4">
          {currentStep.description}
        </p>

        <footer className="flex items-center justify-between border-t border-[var(--line)] pt-3">
          <button
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className="rounded-xl px-3 py-1.5 text-xs font-semibold text-[var(--muted)] hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            &larr; Back
          </button>
          <button
            onClick={handleNext}
            className="rounded-xl bg-[var(--accent)] px-4 py-1.5 text-xs font-bold text-white transition hover:bg-[var(--accent-deep)]"
          >
            {currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish ✨' : 'Next \u2192'}
          </button>
        </footer>
      </div>
    </div>
  );
}
