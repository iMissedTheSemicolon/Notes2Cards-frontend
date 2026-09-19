import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

const SITE_URL = 'https://notes2cards.study';

export const metadata: Metadata = {
  title: 'Refund Policy — notes2cards',
  description: 'Refund and returns policy for notes2cards, the AI-powered Anki flashcard generator.',
  alternates: {
    canonical: `${SITE_URL}/refunds`,
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/refunds`,
    siteName: 'notes2cards',
    title: 'Refund Policy — notes2cards',
    description: 'Refund and returns policy for notes2cards, the AI-powered Anki flashcard generator.',
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
    title: 'Refund Policy — notes2cards',
    description: 'Refund and returns policy for notes2cards, the AI-powered Anki flashcard generator.',
    images: ['/og-image-1200x630.png'],
  },
};

export default function RefundsPolicy() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white/80 font-sans py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-[#6DB5FF] hover:underline mb-8 inline-block">&larr; Back to Home</Link>
        <h1 className="text-4xl font-bold text-white mb-6">Refunds & Returns</h1>
        <p className="mb-4">Last updated: June 2026</p>
        
        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Digital Goods</h2>
        <p className="mb-4">Since notes2cards is a digital service providing immediately accessible AI generation features, we generally do not offer refunds once the service has been used.</p>
        
        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Exceptions</h2>
        <p className="mb-4">We may offer a refund at our sole discretion if:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>You were incorrectly charged due to a technical error.</li>
          <li>The service was entirely non-functional for an extended period, preventing you from using what you paid for.</li>
          <li>You request a refund within 7 days of purchase and have generated fewer than 5 decks.</li>
        </ul>
        
        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. How to Request</h2>
        <p className="mb-4">To request a refund, please use our <a href="/contact" className="text-[#6DB5FF] hover:underline">contact form</a> with your account email and the reason for your request. We will review your request within 3-5 business days.</p>
      </div>
    </div>
  );
}
