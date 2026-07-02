import type { Metadata, Viewport } from 'next'
import './globals.css'
import '@/styles/global.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Nimi & Victor — Love in Full Bloom',
  description:
    'Nimi & Victor are getting married. Step into our garden in full bloom — our love story, the celebration details, and a gentle place to RSVP.',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    type: 'website',
    title: 'Nimi & Victor — Love in Full Bloom',
    description: 'Step into our garden in full bloom. Our love story, the details, and your invitation await.',
    images: ['/og-image.svg'],
  },
}

export const viewport: Viewport = {
  themeColor: '#f7f1e6',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..500&family=Pinyon+Script&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
