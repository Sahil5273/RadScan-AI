'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import PatientBanner from '@/components/PatientBanner';
import SampleSelector from '@/components/SampleSelector';
import PathologyBreakdown from '@/components/PathologyBreakdown';
import ReportGenerator from '@/components/ReportGenerator';
import SimpleTriageView from '@/components/SimpleTriageView';

const panelFallback = (
  <div className="panel min-h-[280px] animate-pulse bg-surface-muted" aria-hidden="true" />
);

const MriViewer = dynamic(() => import('@/components/MriViewer'), {
  ssr: false,
  loading: () => <div className="panel min-h-[420px] animate-pulse bg-slate-900" aria-hidden="true" />,
});

const InteractiveTour = dynamic(() => import('@/components/InteractiveTour'), {
  ssr: false,
});

const ModelComparisonView = dynamic(() => import('@/components/ModelComparisonView'), {
  ssr: false,
  loading: () => panelFallback,
});

export default function Home() {
  const [activeSampleId, setActiveSampleId] = useState<string>('sample-acl-tear');
  const [predictionData, setPredictionData] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoadingPredict, setIsLoadingPredict] = useState<boolean>(false);
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);

  // New UI & Model State
  const [uiMode, setUiMode] = useState<'simple' | 'advanced'>('simple');
  const [currentView, setCurrentView] = useState<'workspace' | 'models'>('workspace');
  const [selectedModel, setSelectedModel] = useState<string>('phase1-sagittal-resnet18');

  // Fetch prediction data when sample or model changes
  const fetchPrediction = async (sampleId: string, modelId: string = selectedModel) => {
    setIsLoadingPredict(true);
    try {
      const formData = new FormData();
      formData.append('sample_id', sampleId);
      formData.append('model_id', modelId);

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
      formData.append('model_id', selectedModel);

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

  // Handle Model Change
  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    fetchPrediction(activeSampleId, modelId);
  };

  // Initial load
  useEffect(() => {
    fetchPrediction('sample-acl-tear', 'phase1-sagittal-resnet18');
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        onOpenTour={() => setIsTourOpen(true)}
        uiMode={uiMode}
        onToggleUiMode={(mode) => setUiMode(mode)}
        currentView={currentView}
        onChangeView={(view) => setCurrentView(view)}
        selectedModel={selectedModel}
        onSelectModel={handleSelectModel}
      />

      {isTourOpen && (
        <InteractiveTour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
      )}

      <main className="mx-auto w-full max-w-[1680px] flex-1 space-y-3 p-3 sm:p-4">
        {currentView === 'models' ? (
          <ModelComparisonView
            selectedModelId={selectedModel}
            onSelectModel={(modelId) => {
              handleSelectModel(modelId);
              setCurrentView('workspace');
            }}
          />
        ) : uiMode === 'simple' ? (
          <SimpleTriageView
            sampleId={activeSampleId}
            patientInfo={predictionData?.patient_info || null}
            primaryDiagnosis={predictionData?.primary_diagnosis || ''}
            pathologies={predictionData?.pathologies || {}}
            gradcam={predictionData?.gradcam || null}
            findingsSummary={predictionData?.findings_summary}
            report={reportData}
            onSelectSample={(id) => {
              setActiveSampleId(id);
              fetchPrediction(id, selectedModel);
            }}
            onUploadCustom={handleUploadCustom}
            isLoadingPredict={isLoadingPredict}
            onGenerateReport={() => fetchReport()}
            isGeneratingReport={isLoadingReport}
            modelName={predictionData?.model_name || 'Phase 1: 1-Plane Sagittal'}
            onSwitchToAdvanced={() => setUiMode('advanced')}
          />
        ) : (
          /* Advanced PACS Workstation View */
          <div className="space-y-3">
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
                fetchPrediction(id, selectedModel);
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
          </div>
        )}
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
            <span>Mode: {uiMode.toUpperCase()}</span>
            <span className="text-surface-strong">|</span>
            <span>Engine: {selectedModel === 'model-2.5d-bigru' ? '2.5D CNN-BiGRU' : '3D SwinUNETR'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
