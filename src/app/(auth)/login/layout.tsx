import type { Metadata } from 'next';

const SITE_URL = 'https://notes2cards.study';

export const metadata: Metadata = {
  title: 'Log In — notes2cards',
  description: 'Log in to notes2cards and start turning your notes into Anki flashcards instantly.',
  alternates: {
    canonical: `${SITE_URL}/login`,
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/login`,
    siteName: 'notes2cards',
    title: 'Log In — notes2cards',
    description: 'Log in to notes2cards and start turning your notes into Anki flashcards instantly.',
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
    title: 'Log In — notes2cards',
    description: 'Log in to notes2cards and start turning your notes into Anki flashcards instantly.',
    images: ['/og-image-1200x630.png'],
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
