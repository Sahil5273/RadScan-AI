# Phase 16 Foundation Model Handoff (DINOv2 / Swin3D)

This checklist starts immediately after Phase 15 outputs `phase15_clean_soft_labels.csv`.

## 1) Freeze the Phase 15 data contract

- Input labels: `study_id` + 12 pathology columns with soft targets (`0.90` / `0.10` by default)
- Ensure train/val split is study-level and leak-free.
- Persist immutable artifact versions:
  - `phase15_clean_soft_labels.csv`
  - `phase15_audit.json`
  - Optional `phase15_study_audit.csv`

## 2) Build a backbone-agnostic dataloader

- Keep current 3-plane sample extraction as default contract:
  - Sagittal, coronal, axial slice tensors
- Add a model switch:
  - `resnet18_3plane` (baseline warm-start path)
  - `dinov2_2d` (per-slice feature encoder)
  - `swin3d` (native volumetric encoder)

## 3) Phase 16A: DINOv2 baseline (lowest risk first)

- Initialize DINOv2 encoder (frozen first 1-2 epochs, then gradual unfreeze).
- Reuse existing head and loss format from Phase 13/15 for apples-to-apples comparison.
- Train for short-run sanity pass (15-25 minutes) before full run.
- Track per-class AUC, then public LB score.

## 4) Phase 16B: Swin3D volumetric run

- Use identical cleaned labels and split.
- Keep optimizer and scheduler close to DINOv2 run initially.
- Add gradient checkpointing if VRAM becomes a bottleneck.

## 5) Promotion / stop rules

- Keep current champion (`0.802`) as active reference.
- Promote only if candidate beats champion on:
  - local validation consistency
  - public LB
- If candidate underperforms, preserve as documented ablation and continue to next architecture.

## 6) Minimal experiment log template

For each run, store:

- `run_id`
- `backbone`
- `label_artifact_version`
- `train_minutes`
- `val_auc_macro`
- `kaggle_public_lb`
- `notes` (failure mode, observed drift, class-specific behavior)
