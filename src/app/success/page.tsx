import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import type { Metadata } from 'next'

const SITE_URL = 'https://notes2cards.study';

export const metadata: Metadata = {
  title: 'Welcome to Pro — notes2cards',
  description: 'You are now a notes2cards Pro member. Start generating unlimited Anki flashcards.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/success`,
    siteName: 'notes2cards',
    title: 'Welcome to Pro — notes2cards',
    description: 'You are now a notes2cards Pro member. Start generating unlimited Anki flashcards.',
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
};

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-[var(--success)]/20 text-[var(--success)] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h1 className="text-4xl font-display font-bold text-[var(--foreground)] mb-4">You're now a Pro member! 🎉</h1>
          <p className="text-lg text-[var(--muted)] mb-8">
            Unlimited PDFs. For life. No subscriptions.
          </p>
          <Link href="/app">
            <Button size="lg" className="w-full">Start Generating Flashcards</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
