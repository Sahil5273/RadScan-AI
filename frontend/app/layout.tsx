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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Sora:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen text-[var(--ink)] antialiased">
        {children}
      </body>
    </html>
  )
}
