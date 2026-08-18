'use client';

import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Eye,
  FileText,
  HelpCircle,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';

interface ModelMeta {
  id: string;
  name: string;
  short_name: string;
  architecture: string;
  latency_ms: number;
  gpu_memory: string;
  training_dataset: string;
  best_for: string;
  overall_auc: number;
  kaggle_score: string;
  mode_type: string;
  pros: string[];
  cons: string[];
  label_performance: Record<
    string,
    { auc: number; sensitivity: number; specificity: number; accuracy: number; tier: string }
  >;
}

const DEFAULT_MODELS: ModelMeta[] = [
  {
    id: 'phase1-sagittal-resnet18',
    name: 'Phase 1: 1-Plane (Sagittal) ResNet-18 + BiGRU',
    short_name: 'Phase 1 (Sagittal Triage)',
    architecture: '2D ResNet-18 + BiGRU (Temporal Max-Pooling)',
    latency_ms: 14,
    gpu_memory: '1.8 GB',
    training_dataset: 'RSNA Knee MRI Dataset (224x224x24 Slices)',
    best_for: 'Unread DICOM triage for ACL tears (0.885 AUC) & Baker cysts (0.949 AUC)',
    overall_auc: 0.7488,
    kaggle_score: '0.784 LB',
    mode_type: 'Pure Vision Triage',
    pros: [
      'Highest solo Kaggle Public Leaderboard score (0.784 LB)',
      'Sagittal view dominates cruciate ligament & meniscal tearing patterns',
      'Operates on raw unread DICOM volumes without text reports (~14ms)',
    ],
    cons: [
      'Lower accuracy on collateral ligaments (MCL 0.583 AUC)',
      'Limited view for multi-planar coronal fracture alignment',
    ],
    label_performance: {
      'ACL Tear': { auc: 0.885, sensitivity: 0.792, specificity: 0.971, accuracy: 0.897, tier: 'superior' },
      'MCL Injury': { auc: 0.583, sensitivity: 0.444, specificity: 0.898, accuracy: 0.828, tier: 'challenging' },
      'Medial Meniscus Tear': { auc: 0.665, sensitivity: 0.846, specificity: 0.469, accuracy: 0.638, tier: 'moderate' },
      'Lateral Meniscus Tear': { auc: 0.647, sensitivity: 1.000, specificity: 0.371, accuracy: 0.621, tier: 'moderate' },
      'Medial OA': { auc: 0.905, sensitivity: 0.867, specificity: 0.884, accuracy: 0.879, tier: 'superior' },
      'Lateral OA': { auc: 0.729, sensitivity: 0.636, specificity: 0.872, accuracy: 0.828, tier: 'strong' },
      'Patellofemoral OA': { auc: 0.741, sensitivity: 0.524, specificity: 0.919, accuracy: 0.776, tier: 'strong' },
      'Joint Effusion': { auc: 0.841, sensitivity: 0.829, specificity: 0.783, accuracy: 0.810, tier: 'superior' },
      'Synovitis': { auc: 0.711, sensitivity: 0.778, specificity: 0.613, accuracy: 0.690, tier: 'moderate' },
      'Baker Cyst': { auc: 0.949, sensitivity: 1.000, specificity: 0.761, accuracy: 0.810, tier: 'superior' },
      'Bone Contusion': { auc: 0.764, sensitivity: 0.632, specificity: 0.872, accuracy: 0.793, tier: 'strong' },
      'Fracture': { auc: 0.565, sensitivity: 0.444, specificity: 0.750, accuracy: 0.655, tier: 'challenging' },
    },
  },
  {
    id: 'phase4-3plane-resnet18',
    name: 'Phase 4: 3-Plane (Sag + Cor + Ax) ResNet-18 + BiGRU',
    short_name: 'Phase 4 (3-Plane Fusion)',
    architecture: '3-Plane Concatenation (Sag+Cor+Ax) + BiGRU (1536 Features)',
    latency_ms: 42,
    gpu_memory: '4.2 GB',
    training_dataset: 'RSNA Knee MRI Dataset (224x224x32 Extended Slices)',
    best_for: 'Highest Gold Validation AUC (0.7699) & Meniscal / Fracture multi-plane alignment',
    overall_auc: 0.7699,
    kaggle_score: '0.782 LB',
    mode_type: 'Pure Vision Triage',
    pros: [
      'Highest Gold Human-Annotated Validation AUC (0.7699 Gold Val N=58)',
      'Multi-plane fusion improves Medial Meniscus (0.786 AUC) & Lateral OA (0.845 AUC)',
      'Robust cross-plane spatial alignment across Sagittal, Coronal & Axial views',
    ],
    cons: [
      'Higher inference latency (~42ms) due to 3-plane feature extraction',
      'Requires simultaneous multi-planar series availability',
    ],
    label_performance: {
      'ACL Tear': { auc: 0.907, sensitivity: 0.833, specificity: 0.882, accuracy: 0.862, tier: 'superior' },
      'MCL Injury': { auc: 0.560, sensitivity: 0.444, specificity: 0.755, accuracy: 0.707, tier: 'challenging' },
      'Medial Meniscus Tear': { auc: 0.786, sensitivity: 0.923, specificity: 0.594, accuracy: 0.741, tier: 'superior' },
      'Lateral Meniscus Tear': { auc: 0.749, sensitivity: 0.652, specificity: 0.829, accuracy: 0.759, tier: 'strong' },
      'Medial OA': { auc: 0.876, sensitivity: 0.933, specificity: 0.744, accuracy: 0.793, tier: 'superior' },
      'Lateral OA': { auc: 0.845, sensitivity: 0.909, specificity: 0.702, accuracy: 0.741, tier: 'superior' },
      'Patellofemoral OA': { auc: 0.717, sensitivity: 0.619, specificity: 0.838, accuracy: 0.759, tier: 'strong' },
      'Joint Effusion': { auc: 0.850, sensitivity: 0.800, specificity: 0.826, accuracy: 0.810, tier: 'superior' },
      'Synovitis': { auc: 0.681, sensitivity: 0.667, specificity: 0.645, accuracy: 0.655, tier: 'moderate' },
      'Baker Cyst': { auc: 0.908, sensitivity: 0.833, specificity: 0.957, accuracy: 0.931, tier: 'superior' },
      'Bone Contusion': { auc: 0.655, sensitivity: 0.737, specificity: 0.590, accuracy: 0.638, tier: 'moderate' },
      'Fracture': { auc: 0.706, sensitivity: 0.500, specificity: 0.925, accuracy: 0.793, tier: 'strong' },
    },
  },
  {
    id: 'phase3-multimodal-oracle',
    name: 'Phase 3: Opt Blend Multimodal Ensemble (10% Image + 90% Text)',
    short_name: 'Phase 3 (Multimodal Oracle)',
    architecture: 'ResNet-18 BiGRU + Radiology NLP Report Parsing (Optimal Blend)',
    latency_ms: 28,
    gpu_memory: '2.8 GB',
    training_dataset: 'RSNA Multimodal Benchmark (Images + Draft Radiology Reports)',
    best_for: 'Retrospective audit, clinical verification & maximum ACL detection (0.944 AUC)',
    overall_auc: 0.852,
    kaggle_score: 'N/A (Text Needed)',
    mode_type: 'Multimodal Audit & Oracle',
    pros: [
      'Highest ACL Tear accuracy: 0.944 AUC (95.8% Recall / 91.4% Accuracy)',
      'Baker Cyst detection: 0.909 AUC / 97.8% Specificity',
      'Ideal for auditing existing report drafts and resolving ambiguous scans',
    ],
    cons: [
      'Requires an existing draft radiology text report (cannot run on unread raw DICOMs alone)',
      'Relies 90% on NLP report feature parsing',
    ],
    label_performance: {
      'ACL Tear': { auc: 0.944, sensitivity: 0.958, specificity: 0.882, accuracy: 0.914, tier: 'superior' },
      'MCL Injury': { auc: 0.891, sensitivity: 0.889, specificity: 0.857, accuracy: 0.862, tier: 'superior' },
      'Medial Meniscus Tear': { auc: 0.888, sensitivity: 0.731, specificity: 0.938, accuracy: 0.845, tier: 'superior' },
      'Lateral Meniscus Tear': { auc: 0.845, sensitivity: 0.652, specificity: 0.943, accuracy: 0.828, tier: 'superior' },
      'Medial OA': { auc: 0.873, sensitivity: 0.933, specificity: 0.698, accuracy: 0.759, tier: 'superior' },
      'Lateral OA': { auc: 0.913, sensitivity: 0.818, specificity: 0.809, accuracy: 0.810, tier: 'superior' },
      'Patellofemoral OA': { auc: 0.785, sensitivity: 0.762, specificity: 0.784, accuracy: 0.776, tier: 'strong' },
      'Joint Effusion': { auc: 0.832, sensitivity: 0.771, specificity: 0.783, accuracy: 0.776, tier: 'superior' },
      'Synovitis': { auc: 0.730, sensitivity: 0.778, specificity: 0.613, accuracy: 0.690, tier: 'strong' },
      'Baker Cyst': { auc: 0.909, sensitivity: 0.833, specificity: 0.978, accuracy: 0.948, tier: 'superior' },
      'Bone Contusion': { auc: 0.768, sensitivity: 0.579, specificity: 0.872, accuracy: 0.776, tier: 'strong' },
      'Fracture': { auc: 0.825, sensitivity: 0.722, specificity: 0.850, accuracy: 0.810, tier: 'superior' },
    },
  },
];

interface ModelComparisonViewProps {
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
}

export default function ModelComparisonView({
  selectedModelId,
  onSelectModel,
}: ModelComparisonViewProps) {
  const [filterMetric, setFilterMetric] = useState<'auc' | 'sensitivity' | 'specificity' | 'accuracy'>('auc');

  const modelA = DEFAULT_MODELS[0];
  const modelB = DEFAULT_MODELS[1];
  const modelC = DEFAULT_MODELS[2];

  const pathologyKeys = Object.keys(modelA.label_performance);

  return (
    <div id="tour-model-comparison" className="space-y-5 rise-in">
      {/* Header Banner */}
      <div className="panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-xl font-bold text-[var(--ink)] font-display">RSNA Knee MRI Clinical Benchmarks</h2>
              <span className="chip chip-neutral">N = 58 Gold Human Validation Cohort</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[var(--muted)] max-w-3xl">
              Comparative statistics across 3 model architectures: Pure Vision Triage (Phase 1 & Phase 4) vs Multimodal Text-Vision Oracle (Phase 3).
            </p>
          </div>

          <div className="flex items-center gap-2 border-l border-[var(--line)] pl-4">
            <span className="field-label">Active Model:</span>
            <span className="chip chip-info font-bold">
              {DEFAULT_MODELS.find((m) => m.id === selectedModelId)?.short_name || modelA.short_name}
            </span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Model Specs */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {DEFAULT_MODELS.map((model) => {
          const isSelected = selectedModelId === model.id;

          return (
            <div
              key={model.id}
              className={`panel transition-all flex flex-col justify-between ${
                isSelected ? 'ring-2 ring-[var(--accent)] border-[var(--accent)]' : ''
              }`}
            >
              <div>
                <div className="panel-header">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-deep)] flex items-center gap-1">
                      {model.mode_type === 'Multimodal Audit & Oracle' ? (
                        <Sparkles className="h-3 w-3 text-amber-600" />
                      ) : (
                        <Eye className="h-3 w-3 text-[var(--accent)]" />
                      )}
                      {model.mode_type}
                    </div>
                    <h3 className="text-xs font-bold text-[var(--ink)] leading-snug font-display">{model.name}</h3>
                  </div>
                  {isSelected ? (
                    <span className="chip chip-normal shrink-0">
                      <CheckCircle2 className="h-3 w-3" />
                      Active
                    </span>
                  ) : (
                    <button
                      onClick={() => onSelectModel(model.id)}
                      className="btn btn-primary text-[11px] shrink-0"
                    >
                      Select
                    </button>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-[var(--line)] pb-3">
                    <div>
                      <span className="field-label flex items-center gap-1 text-[9px]">
                        <Cpu className="h-3 w-3" /> Architecture
                      </span>
                      <span className="font-semibold text-[var(--ink)] truncate block mt-0.5" title={model.architecture}>
                        {model.architecture}
                      </span>
                    </div>
                    <div>
                      <span className="field-label flex items-center gap-1 text-[9px]">
                        <Clock className="h-3 w-3" /> Latency
                      </span>
                      <span className="data-mono font-bold text-[var(--ink)] mt-0.5 block">
                        {model.latency_ms} ms / scan
                      </span>
                    </div>
                    <div>
                      <span className="field-label flex items-center gap-1 text-[9px]">
                        <Database className="h-3 w-3" /> Gold Val AUC
                      </span>
                      <span className="data-mono font-bold text-[var(--ink)] mt-0.5 block">
                        {model.overall_auc.toFixed(4)} AUC
                      </span>
                    </div>
                    <div>
                      <span className="field-label flex items-center gap-1 text-[9px]">
                        <Activity className="h-3 w-3" /> Public LB
                      </span>
                      <span className="data-mono font-bold text-[var(--accent-deep)] mt-0.5 block">
                        {model.kaggle_score}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="field-label text-[var(--muted)] block mb-1 text-[9px]">Clinical Assessment</span>
                    <p className="text-[11px] font-semibold text-[var(--ink)] bg-[var(--highlight)] rounded-xl p-2 border border-[#99f6e4] leading-snug">
                      {model.best_for}
                    </p>
                  </div>

                  {/* Pros & Cons */}
                  <div className="space-y-1.5 pt-1 text-[11px]">
                    <div>
                      <span className="field-label text-emerald-800 font-bold block mb-0.5 text-[9px]">Strengths</span>
                      <ul className="space-y-1">
                        {model.pros.map((pro) => (
                          <li key={pro} className="flex items-start gap-1.5 text-[var(--ink)] leading-snug">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-1">
                      <span className="field-label text-amber-800 font-bold block mb-0.5 text-[9px]">Trade-offs</span>
                      <ul className="space-y-1">
                        {model.cons.map((con) => (
                          <li key={con} className="flex items-start gap-1.5 text-[var(--muted)] leading-snug">
                            <AlertCircle className="h-3 w-3 text-amber-600 shrink-0 mt-0.5" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 12-Pathology Target Matrix Comparison */}
      <div className="panel">
        <div className="panel-header flex-wrap">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[var(--accent)]" />
            <h3 className="panel-title">12 Knee Pathology Target Statistics Across All Models</h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="field-label">Metric:</span>
            <div className="segment">
              <button
                data-active={filterMetric === 'auc'}
                onClick={() => setFilterMetric('auc')}
              >
                ROC AUC
              </button>
              <button
                data-active={filterMetric === 'sensitivity'}
                onClick={() => setFilterMetric('sensitivity')}
              >
                Sensitivity
              </button>
              <button
                data-active={filterMetric === 'specificity'}
                onClick={() => setFilterMetric('specificity')}
              >
                Specificity
              </button>
              <button
                data-active={filterMetric === 'accuracy'}
                onClick={() => setFilterMetric('accuracy')}
              >
                Accuracy
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--panel-strong)]">
                <th className="field-label px-4 py-3">Pathology Attribute</th>
                <th className="field-label px-4 py-3">Phase 1 Sagittal ({filterMetric.toUpperCase()})</th>
                <th className="field-label px-4 py-3">Phase 4 3-Plane ({filterMetric.toUpperCase()})</th>
                <th className="field-label px-4 py-3">Phase 3 Multimodal ({filterMetric.toUpperCase()})</th>
              </tr>
            </thead>
            <tbody>
              {pathologyKeys.map((target) => {
                const valA = modelA.label_performance[target][filterMetric];
                const valB = modelB.label_performance[target][filterMetric];
                const valC = modelC.label_performance[target][filterMetric];

                return (
                  <tr key={target} className="border-b border-[var(--line)] hover:bg-white/50">
                    <td className="px-4 py-3 font-semibold text-[var(--ink)]">{target}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="data-mono font-bold text-[var(--ink)] w-11 text-xs">
                          {(valA * 100).toFixed(1)}%
                        </span>
                        <div className="h-1.5 w-24 bg-slate-200/80 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--accent)] rounded-full"
                            style={{ width: `${valA * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="data-mono font-bold text-[var(--ink)] w-11 text-xs">
                          {(valB * 100).toFixed(1)}%
                        </span>
                        <div className="h-1.5 w-24 bg-slate-200/80 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-800 rounded-full"
                            style={{ width: `${valB * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="data-mono font-bold text-emerald-800 w-11 text-xs">
                          {(valC * 100).toFixed(1)}%
                        </span>
                        <div className="h-1.5 w-24 bg-slate-200/80 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${valC * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clinical Guidance Box */}
      <div className="panel p-5 bg-[var(--highlight)]/40 border-[#99f6e4]">
        <div className="flex items-start gap-3">
          <HelpCircle className="h-5 w-5 text-[var(--accent-deep)] shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-[var(--muted)]">
            <h4 className="font-bold text-[var(--ink)] text-sm mb-1 font-display">Why Phase 1 & Phase 4 were selected for unread DICOM triage</h4>
            <p className="text-[var(--ink)]">
              When a new MRI scan arrives from the DICOM scanner, <strong className="text-[var(--accent-deep)]">no radiology report exists yet</strong>. Therefore, <strong className="text-[var(--accent-deep)]">Phase 1</strong> (0.784 LB) and <strong className="text-[var(--accent-deep)]">Phase 4</strong> (0.7699 Gold Val) are used for instant computer vision triage on raw unread DICOM volumes. <strong className="text-[var(--accent-deep)]">Phase 3</strong> is a Multimodal Oracle model used for retrospective verification and quality auditing when draft text reports are available.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
