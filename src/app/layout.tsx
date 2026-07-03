import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider, themeInitScript } from '@/components/theme/ThemeProvider'

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
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Great+Vibes&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
