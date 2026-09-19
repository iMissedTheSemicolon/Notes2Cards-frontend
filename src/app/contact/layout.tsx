import type { Metadata } from 'next';

const SITE_URL = 'https://notes2cards.study';

export const metadata: Metadata = {
  title: 'Contact Us — notes2cards',
  description: 'Get in touch with the notes2cards team. Submit feature requests, report bugs, or ask general questions.',
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/contact`,
    siteName: 'notes2cards',
    title: 'Contact Us — notes2cards',
    description: 'Get in touch with the notes2cards team. Submit feature requests, report bugs, or ask general questions.',
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
    title: 'Contact Us — notes2cards',
    description: 'Get in touch with the notes2cards team. Submit feature requests, report bugs, or ask general questions.',
    images: ['/og-image-1200x630.png'],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
