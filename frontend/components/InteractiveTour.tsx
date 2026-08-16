'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Columns2,
  Contrast,
  FileText,
  ListChecks,
  MapPin,
  X,
} from 'lucide-react';

interface TourStep {
  title: string;
  summary: string;
  detail: string;
  icon: React.ElementType;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Study worklist',
    summary: 'Select a study to load into the viewer',
    detail:
      'The worklist lists unread studies with priority, accession number, protocol and the AI triage flag. Selecting a row loads the series and runs analysis. External studies can be brought in with Import DICOM study.',
    icon: ClipboardList,
  },
  {
    title: 'Window level and width',
    summary: 'Adjust greyscale rendering',
    detail:
      'Window level sets the midpoint of the displayed intensity range and window width sets its span. Narrow the width to increase tissue contrast. Presets are provided for soft tissue, bone and fluid-sensitive review, and Reset restores the study default.',
    icon: Contrast,
  },
  {
    title: 'Annotations',
    summary: 'Mark and describe a location',
    detail:
      'Enable Annotate, then click anywhere on the image to drop a marker. Enter the finding description and save. Annotations are bound to the specific image number and are listed in the annotation register beneath the viewport.',
    icon: MapPin,
  },
  {
    title: 'Comparison view',
    summary: 'Review against a normal reference',
    detail:
      'Compare opens a second synchronised viewport showing a normal reference knee. Series navigation and windowing apply to both viewports simultaneously so anatomy can be assessed side by side.',
    icon: Columns2,
  },
  {
    title: 'AI analysis panel',
    summary: 'Probabilities across 12 targets',
    detail:
      'Targets are grouped as positive, indeterminate or negative against a 70% operating threshold, shown as a vertical marker on each bar. These probabilities are decision support only and do not constitute a diagnosis.',
    icon: ListChecks,
  },
  {
    title: 'Structured reporting',
    summary: 'Draft, review and export',
    detail:
      'The draft compiles examination, technique, findings, impression and recommendations, with a plain-language patient summary on a separate tab. Reports export to PDF with an attestation block and remain preliminary until signed by a radiologist.',
    icon: FileText,
  },
];

interface InteractiveTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InteractiveTour({ isOpen, onClose }: InteractiveTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const StepIcon = step.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) onClose();
    else setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (!isFirst) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-md border border-surface-border bg-white shadow-overlay">
        <div className="flex items-center justify-between border-b border-surface-border bg-clinical-900 px-4 py-3 text-white">
          <div>
            <h2 className="text-sm font-semibold">Using the RadScan AI workspace</h2>
            <p className="text-[11px] text-clinical-200">
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 transition-colors hover:bg-white/10"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-4 px-5 py-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-clinical-50 text-clinical-700 ring-1 ring-inset ring-clinical-200">
            <StepIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
            <p className="text-xs font-medium text-clinical-700">{step.summary}</p>
            <p className="mt-2.5 text-[13px] leading-relaxed text-slate-700">{step.detail}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-surface-border bg-surface-muted px-4 py-3">
          <button onClick={handlePrevious} disabled={isFirst} className="btn">
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </button>

          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((tourStep, index) => (
              <button
                key={tourStep.title}
                onClick={() => setCurrentStep(index)}
                aria-label={`Go to step ${index + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentStep ? 'w-5 bg-clinical-600' : 'w-1.5 bg-surface-strong'
                }`}
              />
            ))}
          </div>

          <button onClick={handleNext} className="btn btn-primary">
            {isLast ? 'Close' : 'Next'}
            {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
