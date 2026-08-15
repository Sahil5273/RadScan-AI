import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RadScan AI - Volumetric Radiology Copilot & Diagnostic Triage',
  description: 'Multimodal AI Radiology Copilot powered by 2.5D Volumetric CNN-BiGRU (819k DICOM trained), Grad-CAM heatmaps, and Vertex AI Gemini 1.5 Pro.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-medical-dark text-slate-100 antialiased">
        {children}
      </body>
    </html>
  )
}
