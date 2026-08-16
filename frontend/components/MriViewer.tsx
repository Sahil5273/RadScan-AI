'use client';

import React, { useEffect, useState } from 'react';
import {
  Columns2,
  Contrast,
  Crosshair,
  Eye,
  EyeOff,
  Layers,
  MapPin,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';

interface GradcamData {
  center_x: number;
  center_y: number;
  radius: number;
  intensity: number;
  primary_target: string;
}

interface Annotation {
  id: number;
  x: number;
  y: number;
  slice: number;
  note: string;
  study: string;
}

interface PendingPin {
  x: number;
  y: number;
  study: string;
}

interface MriViewerProps {
  sampleId: string;
  gradcam: GradcamData | null;
  sliceCount?: number;
  keySliceIndex?: number;
  studyDescription?: string;
}

const DEFAULT_WINDOW = { level: 400, width: 800 };

const WINDOW_PRESETS = [
  { label: 'Default', level: 400, width: 800 },
  { label: 'Soft tissue', level: 450, width: 1100 },
  { label: 'Bone', level: 620, width: 1600 },
  { label: 'Fluid sensitive', level: 300, width: 520 },
];

const ORIENTATION: Record<string, { top: string; bottom: string; left: string; right: string }> = {
  sagittal: { top: 'S', bottom: 'I', left: 'A', right: 'P' },
  coronal: { top: 'S', bottom: 'I', left: 'R', right: 'L' },
  axial: { top: 'A', bottom: 'P', left: 'R', right: 'L' },
};

// Convert DICOM window level/width into equivalent CSS display filters so the
// on-screen rendering responds the way a PACS viewport would.
function windowToFilter(level: number, width: number) {
  const contrast = Math.min(320, Math.max(30, (DEFAULT_WINDOW.width / width) * 100));
  const brightness = Math.min(220, Math.max(30, 100 + (DEFAULT_WINDOW.level - level) * 0.12));
  return `brightness(${brightness.toFixed(0)}%) contrast(${contrast.toFixed(0)}%)`;
}

// Greyscale approximation of a sagittal knee MRI. Bone marrow renders bright
// with a dark cortical rim, fluid renders bright, and the ACL band is drawn
// intact or disrupted depending on the study.
function KneeAnatomy({ isNormal, idPrefix }: { isNormal: boolean; idPrefix: string }) {
  const marrow = `${idPrefix}-marrow`;
  const soft = `${idPrefix}-soft`;
  const grain = `${idPrefix}-grain`;
  const vignette = `${idPrefix}-vignette`;
  const blur = `${idPrefix}-blur`;

  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" role="presentation">
      <defs>
        <radialGradient id={marrow} cx="45%" cy="38%" r="68%">
          <stop offset="0%" stopColor="#9ba3ae" />
          <stop offset="55%" stopColor="#767e8a" />
          <stop offset="100%" stopColor="#4d545e" />
        </radialGradient>

        <radialGradient id={soft} cx="50%" cy="48%" r="62%">
          <stop offset="0%" stopColor="#3b424d" />
          <stop offset="62%" stopColor="#272d36" />
          <stop offset="100%" stopColor="#0b0e13" />
        </radialGradient>

        <radialGradient id={vignette} cx="50%" cy="50%" r="62%">
          <stop offset="55%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.9" />
        </radialGradient>

        {/* Acquisition noise gives the render an MRI texture */}
        <filter id={grain}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" />
          <feColorMatrix type="saturate" values="0" />
        </filter>

        <filter id={blur}>
          <feGaussianBlur stdDeviation="0.55" />
        </filter>
      </defs>

      <rect width="200" height="200" fill="#04060a" />

      <g filter={`url(#${blur})`}>
        {/* Soft tissue envelope */}
        <path
          d="M58 0 C42 40 36 74 44 100 C36 130 42 170 56 200 L150 200 C162 170 166 130 156 100 C164 74 158 40 144 0 Z"
          fill={`url(#${soft})`}
        />

        {/* Femur and distal condyle */}
        <path
          d="M80 0 L80 66 C64 72 57 86 58 98 C59 112 76 122 98 121 C120 120 139 112 141 97 C143 84 136 71 120 66 L120 0 Z"
          fill={`url(#${marrow})`}
          stroke="#05070b"
          strokeWidth="2.4"
        />

        {/* Tibia and plateau */}
        <path
          d="M60 140 C60 132 68 130 82 129 L120 129 C134 130 142 133 142 141 C142 160 134 180 132 200 L74 200 C72 180 60 160 60 140 Z"
          fill={`url(#${marrow})`}
          stroke="#05070b"
          strokeWidth="2.4"
        />

        {/* Fibular head, posterior */}
        <ellipse
          cx="150"
          cy="152"
          rx="9"
          ry="12"
          fill={`url(#${marrow})`}
          stroke="#05070b"
          strokeWidth="2"
        />

        {/* Patella, anterior to the trochlea */}
        <ellipse
          cx="46"
          cy="96"
          rx="11"
          ry="16"
          fill={`url(#${marrow})`}
          stroke="#05070b"
          strokeWidth="2.2"
        />

        {/* Menisci seated on the tibial plateau */}
        <path d="M64 136 L88 129 L88 136 Z" fill="#0a0d12" />
        <path d="M140 136 L116 129 L116 136 Z" fill="#0a0d12" />

        {/* Posterior cruciate ligament */}
        <path
          d="M128 94 C120 108 112 118 104 126"
          fill="none"
          stroke="#0b0e14"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Anterior cruciate ligament: intact, or disrupted with fluid signal */}
        {isNormal ? (
          <path
            d="M114 100 L90 128"
            stroke="#0b0e14"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          <>
            <path
              d="M114 100 L106 109"
              stroke="#0b0e14"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M97 120 L90 128"
              stroke="#0b0e14"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Fluid filling the ligament gap */}
            <ellipse cx="101" cy="114" rx="9" ry="7" fill="#c3cad4" opacity="0.55" />
          </>
        )}

        {/* Joint effusion and marrow oedema */}
        {!isNormal && (
          <>
            <ellipse cx="58" cy="112" rx="12" ry="19" fill="#cfd6df" opacity="0.28" />
            <ellipse cx="126" cy="104" rx="15" ry="12" fill="#e2e8ef" opacity="0.2" />
          </>
        )}
      </g>

      <rect width="200" height="200" filter={`url(#${grain})`} opacity="0.16" />
      <rect width="200" height="200" fill={`url(#${vignette})`} />
    </svg>
  );
}

interface ViewportProps {
  label: string;
  study: string;
  isNormal: boolean;
  gradcam: GradcamData | null;
  showGradcam: boolean;
  opacity: number;
  currentIntensity: number;
  level: number;
  width: number;
  plane: string;
  currentSlice: number;
  sliceCount: number;
  seriesLabel: string;
  annotations: Annotation[];
  pendingPin: PendingPin | null;
  pinMode: boolean;
  compact?: boolean;
  onPin: (event: React.MouseEvent<HTMLDivElement>, study: string) => void;
}

function DicomViewport({
  label,
  study,
  isNormal,
  gradcam,
  showGradcam,
  opacity,
  currentIntensity,
  level,
  width,
  plane,
  currentSlice,
  sliceCount,
  seriesLabel,
  annotations,
  pendingPin,
  pinMode,
  compact = false,
  onPin,
}: ViewportProps) {
  const orientation = ORIENTATION[plane] ?? ORIENTATION.sagittal;

  return (
    <div
      className={`viewport viewport-grid relative flex items-center justify-center overflow-hidden ${
        compact ? 'min-h-[330px]' : 'min-h-[420px]'
      } ${pinMode ? 'cursor-crosshair ring-1 ring-inset ring-clinical-400' : ''}`}
      onClick={(event) => onPin(event, study)}
    >
      {/* Top DICOM annotation row */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between px-3 py-2">
        <div className="data-mono text-[10px] leading-4 text-slate-300">
          <div className="font-semibold uppercase tracking-wide text-white">{label}</div>
          <div className="text-slate-400">ANONYMISED, PATIENT</div>
        </div>
        <div className="data-mono text-right text-[10px] leading-4 text-slate-400">
          <div>{seriesLabel}</div>
          <div>
            Im {currentSlice}/{sliceCount}
          </div>
        </div>
      </div>

      {/* Orientation markers */}
      <div className="pointer-events-none absolute inset-0 z-10 text-[10px] font-bold text-slate-500">
        <span className="absolute left-1/2 top-9 -translate-x-1/2">{orientation.top}</span>
        <span className="absolute bottom-9 left-1/2 -translate-x-1/2">{orientation.bottom}</span>
        <span className="absolute left-2 top-1/2 -translate-y-1/2">{orientation.left}</span>
        <span className="absolute right-2 top-1/2 -translate-y-1/2">{orientation.right}</span>
      </div>

      {/* Simulated knee MRI cross-section */}
      <div
        className={`relative aspect-square overflow-hidden transition-[filter] duration-150 ${
          compact ? 'h-[86%]' : 'h-[92%]'
        }`}
        style={{ filter: windowToFilter(level, width) }}
      >
        <KneeAnatomy isNormal={isNormal} idPrefix={`mri-${study}`} />

        {gradcam && showGradcam && (
          <div
            className="pointer-events-none absolute rounded-full blur-lg"
            style={{
              left: `${gradcam.center_x * 100}%`,
              top: `${gradcam.center_y * 100}%`,
              transform: 'translate(-50%, -50%)',
              width: `${gradcam.radius * (compact ? 190 : 260)}px`,
              height: `${gradcam.radius * (compact ? 190 : 260)}px`,
              opacity: opacity * currentIntensity,
              background: isNormal
                ? 'radial-gradient(circle, rgba(6,118,71,.75), rgba(6,118,71,.12) 70%, transparent)'
                : 'radial-gradient(circle, rgba(217,45,32,.92), rgba(247,144,9,.6) 52%, transparent 82%)',
            }}
          />
        )}

        {gradcam && showGradcam && (
          <div
            className="pointer-events-none absolute"
            style={{
              left: `${gradcam.center_x * 100}%`,
              top: `${gradcam.center_y * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Crosshair
              className={`h-7 w-7 ${isNormal ? 'text-emerald-300' : 'text-red-400'}`}
              strokeWidth={1.5}
            />
          </div>
        )}
      </div>

      {/* Bottom DICOM annotation row */}
      <div className="data-mono pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between px-3 py-2 text-[10px] leading-4 text-slate-400">
        <div>
          <div>
            W: {width} L: {level}
          </div>
          <div>Slice thickness 3.0 mm · Gap 0.3 mm</div>
        </div>
        <div className="text-right">
          <div>1.5T · TR 3800 / TE 96</div>
          <div className="uppercase">{plane}</div>
        </div>
      </div>

      {/* Radiologist annotations */}
      {annotations.map((annotation, index) => (
        <div
          key={annotation.id}
          className="group absolute z-30 -translate-x-1/2 -translate-y-full"
          style={{ left: `${annotation.x}%`, top: `${annotation.y}%` }}
        >
          <div className="relative">
            <MapPin className="h-6 w-6 fill-amber-400 text-slate-900" strokeWidth={1.5} />
            <span className="absolute left-1/2 top-0.5 -translate-x-1/2 text-[9px] font-bold text-slate-900">
              {index + 1}
            </span>
          </div>
          <div className="pointer-events-none absolute bottom-7 left-1/2 hidden w-48 -translate-x-1/2 rounded border border-surface-strong bg-white p-2 text-[11px] leading-snug text-slate-700 shadow-overlay group-hover:block">
            {annotation.note}
          </div>
        </div>
      ))}

      {/* Marker for a pin awaiting its note */}
      {pendingPin && pendingPin.study === study && (
        <div
          className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-full"
          style={{ left: `${pendingPin.x}%`, top: `${pendingPin.y}%` }}
        >
          <MapPin className="h-6 w-6 animate-pulse fill-clinical-300 text-slate-900" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}

export default function MriViewer({
  sampleId,
  gradcam,
  sliceCount = 24,
  keySliceIndex = 12,
  studyDescription = 'Knee MRI',
}: MriViewerProps) {
  const [currentSlice, setCurrentSlice] = useState(keySliceIndex);
  const [showGradcam, setShowGradcam] = useState(true);
  const [opacity, setOpacity] = useState(0.75);
  const [plane, setPlane] = useState<'sagittal' | 'coronal' | 'axial'>('sagittal');
  const [level, setLevel] = useState(DEFAULT_WINDOW.level);
  const [width, setWidth] = useState(DEFAULT_WINDOW.width);
  const [compareMode, setCompareMode] = useState(false);
  const [pinMode, setPinMode] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  useEffect(() => {
    setCurrentSlice(keySliceIndex);
    setPendingPin(null);
  }, [keySliceIndex, sampleId]);

  const sliceDiff = Math.abs(currentSlice - keySliceIndex);
  const currentIntensity = gradcam ? Math.max(0.1, gradcam.intensity * (1 - sliceDiff * 0.12)) : 0;
  const isKeySlice = currentSlice === keySliceIndex;
  const primaryStudy = compareMode ? 'acl' : sampleId;

  const visibleAnnotations = (study: string) =>
    annotations.filter(
      (annotation) => annotation.slice === currentSlice && annotation.study === study,
    );

  const handlePin = (event: React.MouseEvent<HTMLDivElement>, study: string) => {
    if (!pinMode) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setPendingPin({
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
      study,
    });
    setNoteDraft('');
  };

  const saveAnnotation = (text: string = noteDraft) => {
    if (!pendingPin || !text.trim()) return;
    setAnnotations((items) => [
      ...items,
      {
        id: Date.now(),
        x: pendingPin.x,
        y: pendingPin.y,
        slice: currentSlice,
        note: text.trim(),
        study: pendingPin.study,
      },
    ]);
    setPendingPin(null);
    setNoteDraft('');
  };

  const applyPreset = (presetLevel: number, presetWidth: number) => {
    setLevel(presetLevel);
    setWidth(presetWidth);
  };

  const seriesLabel = `SE 2 · ${plane === 'sagittal' ? 'T2 FS' : plane === 'coronal' ? 'PD FS' : 'T1'}`;

  return (
    <section className="panel flex h-full flex-col">
      <div className="panel-header flex-wrap">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-clinical-600" />
          <h2 className="panel-title">Image Review</h2>
          <span className="hidden text-[11px] text-slate-500 lg:inline">{studyDescription}</span>
          {isKeySlice && <span className="chip chip-info">Key image</span>}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <div className="segment">
            {(['sagittal', 'coronal', 'axial'] as const).map((item) => (
              <button
                key={item}
                data-active={plane === item}
                onClick={() => setPlane(item)}
                className="capitalize"
              >
                {item}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setPinMode(!pinMode);
              setPendingPin(null);
            }}
            className={`btn ${pinMode ? 'btn-active' : ''}`}
          >
            <MapPin className="h-3.5 w-3.5" />
            {pinMode ? 'Annotating' : 'Annotate'}
          </button>

          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`btn ${compareMode ? 'btn-active' : ''}`}
          >
            <Columns2 className="h-3.5 w-3.5" />
            {compareMode ? 'Exit compare' : 'Compare'}
          </button>

          <button
            onClick={() => setShowGradcam(!showGradcam)}
            className={`btn ${showGradcam ? 'btn-active' : ''}`}
          >
            {showGradcam ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            AI overlay
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 bg-slate-900 p-2">
        <div className={`grid flex-1 gap-2 ${compareMode ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <DicomViewport
            label={compareMode ? 'Current — ACL tear' : 'Current study'}
            study={primaryStudy}
            isNormal={!compareMode && sampleId.includes('normal')}
            gradcam={gradcam}
            showGradcam={showGradcam}
            opacity={opacity}
            currentIntensity={currentIntensity}
            level={level}
            width={width}
            plane={plane}
            currentSlice={currentSlice}
            sliceCount={sliceCount}
            seriesLabel={seriesLabel}
            annotations={visibleAnnotations(primaryStudy)}
            pendingPin={pendingPin}
            pinMode={pinMode}
            compact={compareMode}
            onPin={handlePin}
          />

          {compareMode && (
            <DicomViewport
              label="Prior — normal reference"
              study="normal"
              isNormal
              gradcam={gradcam ? { ...gradcam, intensity: 0.22 } : null}
              showGradcam={showGradcam}
              opacity={opacity}
              currentIntensity={0.3}
              level={level}
              width={width}
              plane={plane}
              currentSlice={currentSlice}
              sliceCount={sliceCount}
              seriesLabel={seriesLabel}
              annotations={visibleAnnotations('normal')}
              pendingPin={pendingPin}
              pinMode={pinMode}
              compact
              onPin={handlePin}
            />
          )}
        </div>

        {/* Slice navigation sits directly against the viewport, as in a PACS */}
        <div className="viewport-controls rounded border border-slate-800 bg-slate-950 px-3 py-2">
          <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold uppercase tracking-wide">Series navigation</span>
            <span className="data-mono text-slate-300">
              Image {currentSlice} of {sliceCount}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={sliceCount}
            value={currentSlice}
            onChange={(event) => setCurrentSlice(Number(event.target.value))}
            aria-label="Series navigation"
          />
        </div>
      </div>

      {/* Annotation entry */}
      {pendingPin && (
        <div className="flex flex-wrap items-center gap-2 border-t border-surface-border bg-amber-50 px-3 py-2">
          <MapPin className="h-4 w-4 text-amber-600" />
          <span className="text-xs font-semibold text-amber-900">
            Annotation on image {currentSlice}
          </span>
          <input
            autoFocus
            value={noteDraft}
            onChange={(event) => setNoteDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') saveAnnotation(event.currentTarget.value);
              if (event.key === 'Escape') setPendingPin(null);
            }}
            placeholder="Describe the finding at this location…"
            className="min-w-[200px] flex-1 rounded border border-amber-300 bg-white px-2 py-1 text-xs text-slate-800 outline-none focus:border-clinical-500"
          />
          <button
            onClick={() => saveAnnotation()}
            disabled={!noteDraft.trim()}
            className="btn btn-primary"
          >
            Save annotation
          </button>
          <button onClick={() => setPendingPin(null)} className="btn">
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
        </div>
      )}

      {/* Windowing and overlay controls */}
      <div className="border-t border-surface-border bg-surface-muted px-3 py-2.5">
        <div className="grid gap-x-6 gap-y-3 lg:grid-cols-3">
          <label className="block">
            <span className="mb-1 flex items-center justify-between">
              <span className="field-label flex items-center gap-1">
                <Contrast className="h-3 w-3" />
                Window level
              </span>
              <span className="data-mono text-[11px] font-semibold text-slate-700">{level}</span>
            </span>
            <input
              type="range"
              min={0}
              max={1000}
              step={10}
              value={level}
              onChange={(event) => setLevel(Number(event.target.value))}
            />
          </label>

          <label className="block">
            <span className="mb-1 flex items-center justify-between">
              <span className="field-label">Window width</span>
              <span className="data-mono text-[11px] font-semibold text-slate-700">{width}</span>
            </span>
            <input
              type="range"
              min={100}
              max={2000}
              step={20}
              value={width}
              onChange={(event) => setWidth(Number(event.target.value))}
            />
          </label>

          <label className="block">
            <span className="mb-1 flex items-center justify-between">
              <span className="field-label">AI overlay opacity</span>
              <span className="data-mono text-[11px] font-semibold text-slate-700">
                {Math.round(opacity * 100)}%
              </span>
            </span>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={opacity}
              disabled={!showGradcam}
              onChange={(event) => setOpacity(Number(event.target.value))}
            />
          </label>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-surface-border pt-2.5">
          <span className="field-label mr-1">Presets</span>
          {WINDOW_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset.level, preset.width)}
              className={`btn ${
                level === preset.level && width === preset.width ? 'btn-active' : ''
              }`}
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={() => applyPreset(DEFAULT_WINDOW.level, DEFAULT_WINDOW.width)}
            className="btn"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>

          {annotations.length > 0 && (
            <button
              onClick={() => setAnnotations([])}
              className="btn ml-auto text-severity-critical"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear {annotations.length} annotation{annotations.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>

      {/* Annotation register */}
      {annotations.length > 0 && (
        <div className="border-t border-surface-border bg-white px-3 py-2">
          <div className="field-label mb-1.5">Annotation register</div>
          <ul className="space-y-1">
            {annotations.map((annotation, index) => (
              <li
                key={annotation.id}
                className="flex items-start gap-2 text-xs leading-snug text-slate-700"
              >
                <span className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-slate-900">
                  {index + 1}
                </span>
                <span className="data-mono shrink-0 text-slate-500">Im {annotation.slice}</span>
                <span className="min-w-0 flex-1">{annotation.note}</span>
                <button
                  onClick={() =>
                    setAnnotations((items) => items.filter((item) => item.id !== annotation.id))
                  }
                  className="shrink-0 text-slate-400 transition-colors hover:text-severity-critical"
                  aria-label="Delete annotation"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
