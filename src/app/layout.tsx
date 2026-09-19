import type { Metadata } from "next";
import { Lora, Outfit, JetBrains_Mono } from 'next/font/google';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NavigationProgress } from "@/components/ui/NavigationProgress";
import "./globals.css";

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
});

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const SITE_URL = 'https://notes2cards.study';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'notes2cards — Turn Your Notes Into Anki Flashcards Instantly',
    template: '%s | notes2cards',
  },
  description:
    'Upload any PDF, PowerPoint, or image and get AI-generated Anki flashcards in seconds. Used by 10,000+ students to study smarter, not harder.',
  keywords: [
    'anki flashcards generator',
    'notes to flashcards',
    'AI flashcard maker',
    'PDF to flashcards',
    'study tool',
    'Anki',
    'spaced repetition',
    'notes2cards',
  ],
  authors: [{ name: 'notes2cards', url: SITE_URL }],
  creator: 'notes2cards',
  publisher: 'notes2cards',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'notes2cards',
    title: 'notes2cards — Turn Your Notes Into Anki Flashcards Instantly',
    description:
      'Upload any PDF, PowerPoint, or image and get AI-generated Anki flashcards in seconds. Used by 10,000+ students to study smarter, not harder.',
    images: [
      {
        url: '/og-image-1200x630.png',
        width: 1200,
        height: 630,
        alt: 'notes2cards — AI-powered Anki flashcard generator',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@notes2cards',
    creator: '@notes2cards',
    title: 'notes2cards — Turn Your Notes Into Anki Flashcards Instantly',
    description:
      'Upload any PDF, PowerPoint, or image and get AI-generated Anki flashcards in seconds.',
    images: ['/og-image-1200x630.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: '/apple-touch-icon-180x180.png',
    other: [
      { rel: 'mask-icon', url: '/icon.svg', color: '#5865F2' },
    ],
  },
  manifest: '/site.webmanifest',
};

// Structured data (WebSite + SiteLinks SearchBox for Google)
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'notes2cards',
      description: 'AI-powered Anki flashcard generator',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/app?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'notes2cards',
      applicationCategory: 'EducationApplication',
      operatingSystem: 'Web',
      url: SITE_URL,
      description:
        'Upload any PDF, PowerPoint, or image and get AI-generated Anki flashcards in seconds.',
      offers: [
        { '@type': 'Offer', price: '0', priceCurrency: 'USD', name: 'Free Plan' },
        { '@type': 'Offer', price: '5', priceCurrency: 'USD', name: 'Pro Monthly' },
        { '@type': 'Offer', price: '32', priceCurrency: 'USD', name: 'Pro Yearly' },
        { '@type': 'Offer', price: '69.99', priceCurrency: 'USD', name: 'Lifetime' },
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '347',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://va.vercel-insights.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${lora.variable} ${outfit.variable} ${jetbrains.variable} antialiased`}
        style={{ fontFamily: 'var(--font-lora), Lora, serif' }}
        suppressHydrationWarning
      >
        <NavigationProgress />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
