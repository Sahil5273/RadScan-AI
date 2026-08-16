'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PatientBanner from '@/components/PatientBanner';
import SampleSelector from '@/components/SampleSelector';
import MriViewer from '@/components/MriViewer';
import PathologyBreakdown from '@/components/PathologyBreakdown';
import ReportGenerator from '@/components/ReportGenerator';
import InteractiveTour from '@/components/InteractiveTour';

export default function Home() {
  const [activeSampleId, setActiveSampleId] = useState<string>('sample-acl-tear');
  const [predictionData, setPredictionData] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoadingPredict, setIsLoadingPredict] = useState<boolean>(false);
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);

  // Fetch prediction data when sample changes
  const fetchPrediction = async (sampleId: string) => {
    setIsLoadingPredict(true);
    try {
      const formData = new FormData();
      formData.append('sample_id', sampleId);

      const res = await fetch('/api/v1/predict', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to fetch prediction');
      }

      const data = await res.json();
      setPredictionData(data);
      // Auto trigger report update when sample changes
      fetchReport(data);
    } catch (err) {
      console.error('Error loading prediction:', err);
    } finally {
      setIsLoadingPredict(false);
    }
  };

  // Upload custom file
  const handleUploadCustom = async (file: File) => {
    setIsLoadingPredict(true);
    setActiveSampleId('custom');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/v1/predict', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setPredictionData(data);
      fetchReport(data);
    } catch (err) {
      console.error('Error uploading custom file:', err);
    } finally {
      setIsLoadingPredict(false);
    }
  };

  // Fetch Gemini report
  const fetchReport = async (predictPayload?: any) => {
    const payload = predictPayload || predictionData;
    if (!payload) return;

    setIsLoadingReport(true);
    try {
      const res = await fetch('/api/v1/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sample_id: payload.sample_id,
          primary_diagnosis: payload.primary_diagnosis,
          pathologies: payload.pathologies,
          patient_info: payload.patient_info,
        }),
      });

      const data = await res.json();
      setReportData(data);
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setIsLoadingReport(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPrediction('sample-acl-tear');
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header onOpenTour={() => setIsTourOpen(true)} />

      <InteractiveTour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />

      <main className="mx-auto w-full max-w-[1680px] flex-1 space-y-3 p-3 sm:p-4">
        <PatientBanner
          sampleId={activeSampleId}
          patientInfo={predictionData?.patient_info || null}
          primaryDiagnosis={predictionData?.primary_diagnosis || ''}
          isLoading={isLoadingPredict}
        />

        <SampleSelector
          activeSampleId={activeSampleId}
          onSelectSample={(id) => {
            setActiveSampleId(id);
            fetchPrediction(id);
          }}
          onUploadCustom={handleUploadCustom}
          isLoading={isLoadingPredict}
        />

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <MriViewer
              sampleId={activeSampleId}
              gradcam={predictionData?.gradcam || null}
              sliceCount={predictionData?.slice_count || 24}
              keySliceIndex={predictionData?.key_slice_index || 12}
              studyDescription={predictionData?.patient_info?.study_description}
            />
          </div>

          <div className="xl:col-span-4">
            <PathologyBreakdown
              pathologies={predictionData?.pathologies || {}}
              primaryDiagnosis={predictionData?.primary_diagnosis || 'Awaiting analysis'}
              findingsSummary={predictionData?.findings_summary}
              modelVersion={predictionData?.model_version}
            />
          </div>
        </div>

        <ReportGenerator
          report={reportData}
          onGenerateReport={() => fetchReport()}
          isGenerating={isLoadingReport}
        />
      </main>

      <footer className="border-t border-surface-border bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-[1680px] flex-col gap-2 text-[11px] leading-relaxed text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-3xl">
            <strong className="font-semibold text-slate-700">
              Investigational decision support.
            </strong>{' '}
            RadScan AI is intended to assist qualified radiologists and is not cleared for primary
            diagnosis. All outputs require clinical correlation and radiologist attestation.
          </p>
          <div className="flex shrink-0 items-center gap-3">
            <span>DICOM de-identified</span>
            <span className="text-surface-strong">|</span>
            <span>Access logged for audit</span>
            <span className="text-surface-strong">|</span>
            <span>v2.5</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
