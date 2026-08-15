"""
Sample DICOM MRI datasets for 1-click instant judge demonstration.
Includes realistic 2.5D volumetric slice representations, Grad-CAM coordinates, and 12-pathology probabilities.
"""
from typing import List, Dict, Any

SAMPLES_DB: Dict[str, Dict[str, Any]] = {
    "sample-acl-tear": {
        "id": "sample-acl-tear",
        "name": "Sample 1: ACL Tear",
        "patient_info": {
            "age": 28,
            "gender": "Male",
            "mri_type": "Knee Sagittal T2-Weighted FS DICOM",
            "acquisition_date": "2026-08-10",
            "study_description": "Right Knee MRI - Acute Pivot Shift Injury"
        },
        "slice_count": 24,
        "key_slice_index": 12,
        "pathology_probabilities": {
            "ACL Tear": 0.94,
            "Joint Effusion": 0.88,
            "Bone Marrow Edema": 0.79,
            "Medial Meniscus Tear": 0.35,
            "Lateral Meniscus Tear": 0.22,
            "PCL Tear": 0.04,
            "MCL Injury": 0.41,
            "LCL Injury": 0.08,
            "Patellar Tendinopathy": 0.12,
            "Cartilage Lesion": 0.28,
            "Baker Cyst": 0.15,
            "Normal Joint": 0.02
        },
        "gradcam_region": {
            "center_x": 0.48,
            "center_y": 0.52,
            "radius": 0.28,
            "intensity": 0.95,
            "primary_target": "ACL Intercondylar Notch Region"
        },
        "findings_summary": "High-grade complete disruption of the Anterior Cruciate Ligament (ACL) mid-substance with secondary bone contusions over the lateral femoral condyle and posterior tibial plateau."
    },
    "sample-meniscus-tear": {
        "id": "sample-meniscus-tear",
        "name": "Sample 2: Meniscus Tear",
        "patient_info": {
            "age": 42,
            "gender": "Female",
            "mri_type": "Knee Coronal & Sagittal PD-Weighted DICOM",
            "acquisition_date": "2026-08-12",
            "study_description": "Left Knee MRI - Medial Joint Line Pain"
        },
        "slice_count": 24,
        "key_slice_index": 15,
        "pathology_probabilities": {
            "ACL Tear": 0.08,
            "Joint Effusion": 0.62,
            "Bone Marrow Edema": 0.31,
            "Medial Meniscus Tear": 0.91,
            "Lateral Meniscus Tear": 0.14,
            "PCL Tear": 0.02,
            "MCL Injury": 0.18,
            "LCL Injury": 0.05,
            "Patellar Tendinopathy": 0.09,
            "Cartilage Lesion": 0.54,
            "Baker Cyst": 0.47,
            "Normal Joint": 0.05
        },
        "gradcam_region": {
            "center_x": 0.68,
            "center_y": 0.64,
            "radius": 0.22,
            "intensity": 0.91,
            "primary_target": "Medial Meniscus Posterior Horn"
        },
        "findings_summary": "Complex horizontal-oblique tear extending to the articular surface of the posterior horn of the medial meniscus. Moderate associated medial joint space narrowing."
    },
    "sample-normal-knee": {
        "id": "sample-normal-knee",
        "name": "Sample 3: Normal Knee",
        "patient_info": {
            "age": 31,
            "gender": "Female",
            "mri_type": "Knee Multi-Planar T1/T2 DICOM",
            "acquisition_date": "2026-08-14",
            "study_description": "Right Knee MRI - Routine Screening"
        },
        "slice_count": 24,
        "key_slice_index": 12,
        "pathology_probabilities": {
            "ACL Tear": 0.02,
            "Joint Effusion": 0.05,
            "Bone Marrow Edema": 0.03,
            "Medial Meniscus Tear": 0.04,
            "Lateral Meniscus Tear": 0.03,
            "PCL Tear": 0.01,
            "MCL Injury": 0.02,
            "LCL Injury": 0.01,
            "Patellar Tendinopathy": 0.04,
            "Cartilage Lesion": 0.06,
            "Baker Cyst": 0.02,
            "Normal Joint": 0.96
        },
        "gradcam_region": {
            "center_x": 0.50,
            "center_y": 0.50,
            "radius": 0.15,
            "intensity": 0.10,
            "primary_target": "Unremarkable Joint Architecture"
        },
        "findings_summary": "Unremarkable MRI scan of the knee. ACL, PCL, collateral ligaments, and bilateral menisci are intact with normal signal intensity. No joint effusion or bone contusion."
    }
}

def get_all_samples():
    return list(SAMPLES_DB.values())

def get_sample_by_id(sample_id: str):
    return SAMPLES_DB.get(sample_id)
