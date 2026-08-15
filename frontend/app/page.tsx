'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SampleSelector from '@/components/SampleSelector';
import MriViewer from '@/components/MriViewer';
import PathologyBreakdown from '@/components/PathologyBreakdown';
import ReportGenerator from '@/components/ReportGenerator';

export default function Home() {
  const [activeSampleId, setActiveSampleId] = useState<string>('sample-acl-tear');
  const [predictionData, setPredictionData] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoadingPredict, setIsLoadingPredict] = useState<boolean>(false);
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);

  // Fetch prediction data when sample changes
  const fetchPrediction = async (sampleId: str) => {
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
    <div className="min-h-screen bg-medical-dark flex flex-col font-sans">
      <Header />

      <main className="flex-1 mx-auto max-w-7xl w-full p-4 sm:p-6 space-y-6">
        {/* 1-Click Judge Sample Selector */}
        <SampleSelector
          activeSampleId={activeSampleId}
          onSelectSample={(id) => {
            setActiveSampleId(id);
            fetchPrediction(id);
          }}
          onUploadCustom={handleUploadCustom}
          isLoading={isLoadingPredict}
        />

        {/* Main 2-Column Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Multi-Planar MRI Viewer */}
          <div className="lg:col-span-7">
            <MriViewer
              sampleId={activeSampleId}
              gradcam={predictionData?.gradcam || null}
              sliceCount={predictionData?.slice_count || 24}
              keySliceIndex={predictionData?.key_slice_index || 12}
            />
          </div>

          {/* Right Column: 12-Target Risk Breakdown */}
          <div className="lg:col-span-5">
            <PathologyBreakdown
              pathologies={predictionData?.pathologies || {}}
              primaryDiagnosis={predictionData?.primary_diagnosis || 'Evaluating...'}
            />
          </div>
        </div>

        {/* Full-Width Bottom Section: Gemini Report Generator */}
        <ReportGenerator
          report={reportData}
          onGenerateReport={() => fetchReport()}
          isGenerating={isLoadingReport}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-medical-dark/90 py-4 px-6 text-center text-xs text-slate-500">
        RadScan AI • Powered by Google Cloud Platform (Cloud Run L4 GPU & Vertex AI Gemini 1.5 Pro) • Hackathon Showcase Build
      </footer>
    </div>
  );
}
