import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

const SITE_URL = 'https://notes2cards.study';

export const metadata: Metadata = {
  title: 'Terms of Service — notes2cards',
  description: 'Read the Terms of Service for notes2cards, the AI-powered Anki flashcard generator.',
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/terms`,
    siteName: 'notes2cards',
    title: 'Terms of Service — notes2cards',
    description: 'Read the Terms of Service for notes2cards, the AI-powered Anki flashcard generator.',
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
    title: 'Terms of Service — notes2cards',
    description: 'Read the Terms of Service for notes2cards, the AI-powered Anki flashcard generator.',
    images: ['/og-image-1200x630.png'],
  },
};


export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white/80 py-20 px-6"
      style={{ fontFamily: 'Outfit, sans-serif' }}>
      <div className="max-w-3xl mx-auto">

        <Link href="/" className="text-[#6DB5FF] hover:underline mb-8 inline-block text-sm">
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-white/40 text-sm mb-12">Last updated: June 2026</p>

        <p className="mb-8 leading-relaxed">
          These Terms of Service (&quot;Terms&quot;) govern your access to and use of notes2cards
          (&quot;the Service&quot;), operated by notes2cards (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;).
          By creating an account or using the Service, you agree to be bound by these Terms.
          If you do not agree, do not use the Service.
        </p>

        {/* ── 1 ── */}
        <Section title="1. Eligibility">
          <p>
            You must be at least 13 years old to use this Service. If you are under 18, you
            represent that a parent or guardian has reviewed and agreed to these Terms on your
            behalf. By using the Service, you represent that you have the legal capacity to
            enter into a binding contract.
          </p>
        </Section>

        {/* ── 2 ── */}
        <Section title="2. Description of Service">
          <p>
            notes2cards is an AI-powered tool that converts uploaded study materials (PDFs,
            images, and PowerPoint files) into Anki-compatible flashcard decks. The Service
            uses third-party AI models (including Google Gemini) to process your files and
            generate flashcard content.
          </p>
          <p className="mt-4">
            AI-generated content may contain inaccuracies. You are responsible for reviewing
            all generated flashcards before using them in academic or professional settings.
          </p>
        </Section>

        {/* ── 3 ── */}
        <Section title="3. Accounts">
          <p>
            You may sign up using email/password or a supported OAuth provider (Google, Apple).
            You are responsible for maintaining the confidentiality of your account credentials
            and for all activity that occurs under your account. Notify us immediately via our{' '}
            <a href="/contact" className="text-[#6DB5FF] hover:underline">
              contact form
            </a>{' '}
            if you suspect unauthorized access.
          </p>
          <p className="mt-4">
            We reserve the right to suspend or terminate accounts that violate these Terms,
            engage in abuse of the Service, or attempt to circumvent usage limits.
          </p>
        </Section>

        {/* ── 4 ── */}
        <Section title="4. Subscription Plans & Billing">
          <p>
            We offer the following plans, measured in <strong>page-equivalents</strong> (1 page =
            one PDF page, one PPTX slide, or one image):
          </p>
          <ul className="mt-4 space-y-2 list-disc list-inside text-white/70">
            <li><strong>Free:</strong> 40 pages per month, up to 20 pages per file</li>
            <li><strong>Pro Monthly:</strong> 600 pages per month, up to 60 pages per file</li>
            <li><strong>Pro Yearly:</strong> 600 pages per month, up to 60 pages per file (billed annually)</li>
            <li><strong>Lifetime:</strong> 800 pages per month, up to 80 pages per file (one-time payment)</li>
          </ul>
          <p className="mt-4">
            Monthly quotas reset 30 days from your last reset date. Payments are processed by
            Lemon Squeezy. We do not store your payment card details.
          </p>
          <p className="mt-4">
            Subscription prices are displayed at checkout and may change with notice. Price
            changes will not affect active subscription periods; they apply at the next renewal.
          </p>
        </Section>

        {/* ── 5 ── */}
        <Section title="5. Refunds">
          <p>
            Refund requests may be made within <strong>7 days of purchase</strong> via our{' '}
            <a href="/contact" className="text-[#6DB5FF] hover:underline">
              contact form
            </a>
            , provided fewer than 100 pages have been processed under the new plan.
          </p>
          <p className="mt-4">
            Lifetime purchases are non-refundable after 14 days. Monthly and annual subscriptions
            may be cancelled at any time; you retain access until the end of the current billing period.
            No partial refunds are issued for unused days.
          </p>
        </Section>

        {/* ── 6 ── */}
        <Section title="6. Acceptable Use">
          <p>You agree <strong>not</strong> to use the Service to:</p>
          <ul className="mt-4 space-y-2 list-disc list-inside text-white/70">
            <li>Upload or process copyrighted material you do not have the right to use</li>
            <li>Generate content that is unlawful, harmful, defamatory, or violates any third-party rights</li>
            <li>Circumvent usage limits through automation, fake accounts, or other technical means</li>
            <li>Resell, redistribute, or sublicense generated flashcard content commercially</li>
            <li>Attempt to reverse-engineer, decompile, or extract the underlying AI models or infrastructure</li>
            <li>Interfere with or disrupt the integrity or performance of the Service</li>
          </ul>
          <p className="mt-4">
            Violation of these rules may result in immediate account termination without refund.
          </p>
        </Section>

        {/* ── 7 ── */}
        <Section title="7. Intellectual Property">
          <p>
            You retain full ownership of all files you upload. By uploading, you grant us a
            limited, temporary, royalty-free licence to process your files solely for the
            purpose of generating flashcards for you. This licence terminates immediately after
            processing; files are deleted from our servers and third-party AI servers within
            seconds of completion.
          </p>
          <p className="mt-4">
            Generated flashcard content is yours to use for personal, non-commercial educational
            purposes. We do not claim ownership over AI-generated output derived from your materials.
          </p>
          <p className="mt-4">
            All other elements of the Service — including the website, software, design, and
            branding — are owned by notes2cards and protected by intellectual property laws.
          </p>
        </Section>

        {/* ── 8 ── */}
        <Section title="8. Privacy">
          <p>
            Our collection and use of your personal data is described in our{' '}
            <Link href="/privacy" className="text-[#6DB5FF] hover:underline">Privacy Policy</Link>,
            which is incorporated into these Terms by reference. By using the Service, you
            consent to our data practices as described therein.
          </p>
        </Section>

        {/* ── 9 ── */}
        <Section title="9. Disclaimer of Warranties">
          <p>
            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY
            KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY,
            FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
          </p>
          <p className="mt-4">
            We do not warrant that: (a) the Service will be uninterrupted or error-free;
            (b) AI-generated flashcards will be accurate, complete, or suitable for your purposes;
            (c) any defects will be corrected.
          </p>
        </Section>

        {/* ── 10 ── */}
        <Section title="10. Limitation of Liability">
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, NOTES2CARDS SHALL NOT BE LIABLE FOR ANY
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT
            NOT LIMITED TO LOSS OF DATA, LOSS OF PROFITS, OR LOSS OF GOODWILL, ARISING FROM
            YOUR USE OF OR INABILITY TO USE THE SERVICE.
          </p>
          <p className="mt-4">
            Our total aggregate liability to you shall not exceed the amounts paid by you to
            us in the twelve (12) months preceding the claim, or ₹500 INR (whichever is greater).
          </p>
        </Section>

        {/* ── 11 ── */}
        <Section title="11. Indemnification">
          <p>
            You agree to indemnify and hold harmless notes2cards, its officers, directors,
            employees, and agents from any claims, damages, losses, or expenses (including
            reasonable legal fees) arising from: (a) your use of the Service; (b) your
            violation of these Terms; (c) your violation of any third-party rights; or (d)
            any content you upload or generate through the Service.
          </p>
        </Section>

        {/* ── 12 ── */}
        <Section title="12. Modifications to the Service & Terms">
          <p>
            We reserve the right to modify, suspend, or discontinue the Service at any time,
            with or without notice. We may update these Terms from time to time. Material
            changes will be communicated via email or a prominent notice on the Service.
            Continued use after changes take effect constitutes acceptance of the updated Terms.
          </p>
        </Section>

        {/* ── 13 ── */}
        <Section title="13. Governing Law & Dispute Resolution">
          <p>
            These Terms are governed by the laws of India, without regard to conflict of law
            principles. Any disputes arising from these Terms or your use of the Service shall
            be resolved through binding arbitration in accordance with the Arbitration and
            Conciliation Act, 1996, with the seat of arbitration in New Delhi, India.
          </p>
          <p className="mt-4">
            You waive the right to participate in a class action lawsuit or class-wide arbitration.
          </p>
        </Section>

        <Section title="14. Contact">
          <p>
            For questions about these Terms, please{' '}
            <a href="/contact" className="text-[#6DB5FF] hover:underline">
              use our contact form
            </a>
            .
          </p>
        </Section>

        <div className="mt-16 pt-8 border-t border-white/[0.06]">
          <Link href="/" className="text-[#6DB5FF] hover:underline text-sm">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
      <div className="text-white/65 leading-relaxed text-[15px]">{children}</div>
    </div>
  );
}
