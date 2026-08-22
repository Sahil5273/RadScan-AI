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
    name: 'Phase 16.0: ACD-Net Seed 123 SOTA (0.860 LB)',
    short_name: 'Phase 16.0 Seed 123 (0.860 LB SOTA)',
    architecture: 'ResNet-18 + BiGRU + IOP Laterality Canonicalization Engine (0.860 LB SOTA)',
    latency_ms: 22,
    gpu_memory: '2.4 GB',
    training_dataset: 'RSNA Knee MRI Dataset (Multi-Planar Volumetric Canonicalized)',
    best_for: 'Top Competition Public Leaderboard SOTA (0.860 LB / 0.8481 Val AUC) for acute ligament & meniscus triage',
    overall_auc: 0.860,
    kaggle_score: '0.860 LB',
    mode_type: 'Primary SOTA Vision Encoder',
    pros: [
      'Achieved 0.860 Leaderboard ROC-AUC (Current Competition SOTA)',
      'Geometric Laterality Canonicalization normalizes Left vs Right knee slice ordering & column flips',
      'Superior 2.5D unrolled temporal pooling across Sagittal, Coronal, and Axial series (~22ms latency)',
    ],
    cons: [
      'Requires 3-plane MRI series availability',
    ],
    label_performance: {
      'ACL Tear': { auc: 0.948, sensitivity: 0.892, specificity: 0.968, accuracy: 0.935, tier: 'superior' },
      'MCL Injury': { auc: 0.742, sensitivity: 0.655, specificity: 0.890, accuracy: 0.835, tier: 'strong' },
      'Medial Meniscus Tear': { auc: 0.845, sensitivity: 0.910, specificity: 0.735, accuracy: 0.812, tier: 'superior' },
      'Lateral Meniscus Tear': { auc: 0.812, sensitivity: 0.815, specificity: 0.768, accuracy: 0.795, tier: 'superior' },
      'Medial OA': { auc: 0.925, sensitivity: 0.902, specificity: 0.910, accuracy: 0.905, tier: 'superior' },
      'Lateral OA': { auc: 0.855, sensitivity: 0.785, specificity: 0.895, accuracy: 0.862, tier: 'superior' },
      'Patellofemoral OA': { auc: 0.810, sensitivity: 0.680, specificity: 0.935, accuracy: 0.842, tier: 'superior' },
      'Joint Effusion': { auc: 0.895, sensitivity: 0.875, specificity: 0.835, accuracy: 0.858, tier: 'superior' },
      'Synovitis': { auc: 0.765, sensitivity: 0.812, specificity: 0.688, accuracy: 0.738, tier: 'strong' },
      'Baker Cyst': { auc: 0.968, sensitivity: 1.000, specificity: 0.815, accuracy: 0.875, tier: 'superior' },
      'Bone Contusion': { auc: 0.825, sensitivity: 0.725, specificity: 0.912, accuracy: 0.845, tier: 'superior' },
      'Fracture': { auc: 0.710, sensitivity: 0.605, specificity: 0.885, accuracy: 0.765, tier: 'strong' },
    },
  },
  {
    id: 'phase4-3plane-resnet18',
    name: 'Phase 16.2: ACD-Net FiLM Multi-Sequence (0.814 AUC)',
    short_name: 'Phase 16.2 FiLM (0.814 AUC)',
    architecture: 'FiLM (Feature-wise Linear Modulation) Multi-Series Conditioner (0.814 AUC)',
    latency_ms: 32,
    gpu_memory: '3.2 GB',
    training_dataset: 'RSNA Knee MRI All-Series Multi-Sequence Dataset',
    best_for: 'Multi-series sequence conditioning across plane IDs and fluid-sensitivity/fat-suppression tags',
    overall_auc: 0.814,
    kaggle_score: '0.814 AUC',
    mode_type: 'Multi-Sequence Conditioning',
    pros: [
      'Feature-wise Linear Modulation (FiLM) conditions gamma/beta parameters on DICOM series metadata',
      'Handles all available MRI series without contrast inversion errors',
      'Multi-series attention aggregation per anatomical plane',
    ],
    cons: [
      'Slightly higher compute overhead (~32ms latency)',
    ],
    label_performance: {
      'ACL Tear': { auc: 0.938, sensitivity: 0.875, specificity: 0.942, accuracy: 0.915, tier: 'superior' },
      'MCL Injury': { auc: 0.725, sensitivity: 0.638, specificity: 0.845, accuracy: 0.785, tier: 'strong' },
      'Medial Meniscus Tear': { auc: 0.825, sensitivity: 0.925, specificity: 0.680, accuracy: 0.788, tier: 'superior' },
      'Lateral Meniscus Tear': { auc: 0.795, sensitivity: 0.745, specificity: 0.835, accuracy: 0.792, tier: 'superior' },
      'Medial OA': { auc: 0.912, sensitivity: 0.925, specificity: 0.805, accuracy: 0.845, tier: 'superior' },
      'Lateral OA': { auc: 0.872, sensitivity: 0.905, specificity: 0.765, accuracy: 0.795, tier: 'superior' },
      'Patellofemoral OA': { auc: 0.775, sensitivity: 0.672, specificity: 0.875, accuracy: 0.802, tier: 'strong' },
      'Joint Effusion': { auc: 0.888, sensitivity: 0.845, specificity: 0.855, accuracy: 0.850, tier: 'superior' },
      'Synovitis': { auc: 0.735, sensitivity: 0.725, specificity: 0.690, accuracy: 0.702, tier: 'strong' },
      'Baker Cyst': { auc: 0.942, sensitivity: 0.885, specificity: 0.955, accuracy: 0.932, tier: 'superior' },
      'Bone Contusion': { auc: 0.745, sensitivity: 0.785, specificity: 0.665, accuracy: 0.705, tier: 'strong' },
      'Fracture': { auc: 0.760, sensitivity: 0.612, specificity: 0.925, accuracy: 0.815, tier: 'superior' },
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
