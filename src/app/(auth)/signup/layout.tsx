import type { Metadata } from 'next';

const SITE_URL = 'https://notes2cards.study';

export const metadata: Metadata = {
  title: 'Sign Up — notes2cards',
  description: 'Create your free notes2cards account and start converting PDFs, slides, and images into Anki flashcards with AI.',
  alternates: {
    canonical: `${SITE_URL}/signup`,
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/signup`,
    siteName: 'notes2cards',
    title: 'Sign Up — notes2cards',
    description: 'Create your free notes2cards account and start converting PDFs, slides, and images into Anki flashcards with AI.',
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
    title: 'Sign Up — notes2cards',
    description: 'Create your free notes2cards account and start converting PDFs, slides, and images into Anki flashcards with AI.',
    images: ['/og-image-1200x630.png'],
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
