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
  HelpCircle,
  Layers,
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
  kaggle_score: number;
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
    short_name: 'Phase 1 (Sagittal)',
    architecture: '2D ResNet-18 + BiGRU (Temporal Max-Pooling)',
    latency_ms: 14,
    gpu_memory: '1.8 GB',
    training_dataset: 'RSNA Knee MRI Dataset (224x224x24 Slices)',
    best_for: 'Cruciate ligament tears (ACL 0.885 AUC) & Baker cysts (0.949 AUC)',
    overall_auc: 0.7488,
    kaggle_score: 0.784,
    pros: [
      'Highest solo Kaggle Public Leaderboard score (0.784 LB)',
      'Sagittal view dominates cruciate ligament & meniscal tearing patterns',
      'Lightweight single-plane inference (~14ms per scan)',
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
    kaggle_score: 0.782,
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

  const pathologyKeys = Object.keys(modelA.label_performance);

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="panel p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-clinical-600" />
              <h2 className="text-lg font-bold text-slate-900">RSNA Knee MRI Clinical Benchmarks</h2>
              <span className="chip chip-neutral">N = 58 Gold Human Validation Cohort</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 max-w-3xl">
              Comparative performance statistics across all 12 RSNA knee pathology attributes evaluated on the human-annotated Gold N=58 validation dataset and Kaggle Public Leaderboard.
            </p>
          </div>

          <div className="flex items-center gap-2 border-l border-surface-border pl-4">
            <span className="field-label">Active Model:</span>
            <span className="chip chip-info font-bold">
              {selectedModelId === modelA.id ? modelA.short_name : modelB.short_name}
            </span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Model Specs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {DEFAULT_MODELS.map((model) => {
          const isSelected = selectedModelId === model.id;

          return (
            <div
              key={model.id}
              className={`panel transition-all ${
                isSelected ? 'ring-2 ring-clinical-600 border-clinical-500' : ''
              }`}
            >
              <div className="panel-header">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-clinical-700">
                    {model.short_name}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">{model.name}</h3>
                </div>
                {isSelected ? (
                  <span className="chip chip-normal">
                    <CheckCircle2 className="h-3 w-3" />
                    Active Model
                  </span>
                ) : (
                  <button
                    onClick={() => onSelectModel(model.id)}
                    className="btn btn-primary"
                  >
                    Select Model
                  </button>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs border-b border-surface-border pb-3">
                  <div>
                    <span className="field-label flex items-center gap-1">
                      <Cpu className="h-3 w-3" /> Architecture
                    </span>
                    <span className="font-semibold text-slate-800 truncate block mt-0.5" title={model.architecture}>
                      {model.architecture}
                    </span>
                  </div>
                  <div>
                    <span className="field-label flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Inference Latency
                    </span>
                    <span className="data-mono font-bold text-slate-900 mt-0.5 block">
                      {model.latency_ms} ms / scan
                    </span>
                  </div>
                  <div>
                    <span className="field-label flex items-center gap-1">
                      <Database className="h-3 w-3" /> Gold Val AUC (N=58)
                    </span>
                    <span className="data-mono font-bold text-slate-800 mt-0.5 block">
                      {model.overall_auc.toFixed(4)} AUC
                    </span>
                  </div>
                  <div>
                    <span className="field-label flex items-center gap-1">
                      <Activity className="h-3 w-3" /> Public Kaggle LB
                    </span>
                    <span className="data-mono font-bold text-clinical-700 mt-0.5 block">
                      {model.kaggle_score} LB Score
                    </span>
                  </div>
                </div>

                <div>
                  <span className="field-label text-slate-500 block mb-1">Clinical Assessment</span>
                  <p className="text-xs font-semibold text-slate-800 bg-clinical-50/60 rounded p-2 border border-clinical-100">
                    {model.best_for}
                  </p>
                </div>

                {/* Pros & Cons */}
                <div className="grid grid-cols-1 gap-2 pt-1 text-xs">
                  <div>
                    <span className="field-label text-emerald-800 font-bold block mb-1">Architectural Takeaway</span>
                    <ul className="space-y-1">
                      {model.pros.map((pro) => (
                        <li key={pro} className="flex items-start gap-1.5 text-slate-700">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-2">
                    <span className="field-label text-amber-800 font-bold block mb-1">Trade-offs</span>
                    <ul className="space-y-1">
                      {model.cons.map((con) => (
                        <li key={con} className="flex items-start gap-1.5 text-slate-600">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
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
            <Layers className="h-4 w-4 text-clinical-600" />
            <h3 className="panel-title">12 Knee Pathology Target Statistics</h3>
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
          <table className="w-full min-w-[750px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-surface-border bg-surface-muted">
                <th className="field-label px-4 py-2.5">Pathology Attribute</th>
                <th className="field-label px-4 py-2.5">Phase 1 Sagittal ({filterMetric.toUpperCase()})</th>
                <th className="field-label px-4 py-2.5">Phase 4 3-Plane ({filterMetric.toUpperCase()})</th>
                <th className="field-label px-4 py-2.5">Optimal Architecture Routing</th>
              </tr>
            </thead>
            <tbody>
              {pathologyKeys.map((target) => {
                const perfA = modelA.label_performance[target];
                const perfB = modelB.label_performance[target];

                const valA = perfA[filterMetric];
                const valB = perfB[filterMetric];

                const winner = valA > valB ? modelA : valB > valA ? modelB : null;

                return (
                  <tr key={target} className="border-b border-surface-border hover:bg-surface-muted/50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{target}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="data-mono font-bold text-slate-900 w-12">
                          {(valA * 100).toFixed(1)}%
                        </span>
                        <div className="h-2 w-32 bg-slate-100 rounded-sm overflow-hidden">
                          <div
                            className="h-full bg-clinical-600 rounded-sm"
                            style={{ width: `${valA * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="data-mono font-bold text-slate-900 w-12">
                          {(valB * 100).toFixed(1)}%
                        </span>
                        <div className="h-2 w-32 bg-slate-100 rounded-sm overflow-hidden">
                          <div
                            className="h-full bg-clinical-800 rounded-sm"
                            style={{ width: `${valB * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {winner ? (
                        <span
                          className={`chip ${
                            winner.id === modelA.id ? 'chip-neutral' : 'chip-info'
                          }`}
                        >
                          <Zap className="h-3 w-3" />
                          {winner.short_name} (+{(Math.abs(valA - valB) * 100).toFixed(1)}%)
                        </span>
                      ) : (
                        <span className="chip chip-neutral">Equivalent</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clinical Guidance Box */}
      <div className="panel p-4 bg-clinical-50/50 border-clinical-200">
        <div className="flex items-start gap-3">
          <HelpCircle className="h-5 w-5 text-clinical-700 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-slate-700">
            <h4 className="font-bold text-slate-900 text-sm mb-1">Architectural Takeaways & Label Routing</h4>
            <p>
              Use <strong className="text-slate-900">Phase 1: 1-Plane Sagittal ResNet-18 + BiGRU</strong> (0.784 Public LB) for highest single-view efficiency on Baker's Cysts (0.949 AUC), Medial OA (0.905 AUC), and ACL tears (0.885 AUC). Select <strong className="text-slate-900">Phase 4: 3-Plane ResNet-18 + BiGRU</strong> (0.7699 Gold Val N=58) when multi-plane alignment is required for Medial Meniscus tears (0.786 AUC), Lateral OA (0.845 AUC), and Bone Fractures (0.706 AUC).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
