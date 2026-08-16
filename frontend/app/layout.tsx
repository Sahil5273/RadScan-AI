import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RadScan AI | Musculoskeletal MRI Decision Support',
  description:
    'Clinical decision support for knee MRI review: multi-planar viewing, AI pathology probabilities with Grad-CAM localisation, and structured radiology reporting.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface-canvas text-slate-900 antialiased">
        {children}
      </body>
    </html>
  )
}
