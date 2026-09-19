"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, CheckCircle2 } from 'lucide-react'
import { PasswordStrengthBar } from '@/components/ui/PasswordStrengthBar'
import { EmailInput, isDisposableEmail } from '@/components/ui/EmailInput'

/* ── Legal Content ─────────────────────────────────────────── */
const TERMS_CONTENT = `Terms of Service — notes2cards
Last updated: June 2025

1. Acceptance of Terms
By creating an account and using notes2cards, you agree to these terms. If you do not agree, do not use the service.

2. Description of Service
notes2cards is an AI-powered tool that converts uploaded study materials into Anki-compatible flashcard decks. We use advanced AI models to process your files.

3. User Content
You retain ownership of all files you upload. By uploading, you grant us a temporary licence to process your files solely for the purpose of generating flashcards. Files are deleted from our servers immediately after processing and are never stored or used for training AI models.

4. Acceptable Use
You may not use notes2cards to process copyrighted content you do not have the right to use, generate content that is harmful or illegal, circumvent usage limits through automation or fake accounts, or resell or redistribute generated content commercially.

5. Payment & Refunds
Paid plans are processed by Lemon Squeezy. One-time lifetime purchases are non-refundable after 7 days. Monthly and annual subscriptions may be cancelled at any time; access continues until the end of the paid period. Refund requests within 7 days of purchase will be honoured if fewer than 10 files have been processed.

6. Service Availability
We aim for high availability but do not guarantee uninterrupted service. We are not liable for losses arising from downtime or errors in generated flashcard content. AI-generated content should be reviewed before use in academic settings.

7. Account Termination
We reserve the right to terminate accounts that violate these terms. You may delete your account at any time from account settings.

8. Changes to Terms
We may update these terms. Continued use after changes constitutes acceptance. Material changes will be communicated via email.

9. Governing Law
These terms are governed by the laws of India.

Contact: https://www.notes2cards.com/contact`;

const PRIVACY_CONTENT = `Privacy Policy — notes2cards
Last updated: June 2025

What we collect:
• Email address (for account and login)
• Full name (for personalisation)
• Files you upload (processed immediately, never stored)
• Usage data (files processed per month, plan type)
• Payment information (handled entirely by Lemon Squeezy — we never see card details)

What we do NOT collect:
• The content of your flashcards (generated on your device after June 2025)
• Your location beyond country-level (for regional pricing only)
• Browsing behaviour or tracking pixels

How we use your data:
• To provide the service and track your usage limits
• To send transactional emails (receipt, usage alerts) if you opted in
• To send marketing emails only if you explicitly opted in at signup

Data retention:
• Uploaded files: deleted immediately after processing
• Account data: retained until you delete your account
• Payment records: retained as required by financial regulations

Your rights:
• Delete your account and all data at any time from account settings
• Request a copy of your data via our contact page: https://www.notes2cards.com/contact
• Opt out of marketing emails at any time

Contact: https://www.notes2cards.com/contact`;

export default function SignupPage() {
  const [mounted, setMounted] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [signedUp, setSignedUp] = useState(false)
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    // Pre-warm the /app route so the redirect feels instant after sign-up
    router.prefetch('/app')
  }, [])

  const handleOAuth = async (provider: 'google' | 'apple' | 'github') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!name.trim()) { setError('Please enter your name'); return }
    if (!email.trim()) { setError('Please enter your email'); return }
    if (isDisposableEmail(email)) { setError('Please use a permanent email address. Temporary email providers are not allowed.'); return }
    if (emailError) { setError(emailError); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (!termsAccepted) { setError('You must accept the terms to continue'); return }

    setLoading(true)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: name.trim(),
          marketing_emails: marketingOptIn,
        }
      }
    })
    if (signUpError) {
      setError(signUpError.message)
    } else if (data.session) {
      // Email confirmations disabled — user is immediately logged in
      window.location.href = '/app'
    } else {
      // Email confirmation required — show the "check inbox" state
      setSignedUp(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex bg-[#0A0A0A] relative overflow-hidden">
      {/* Full Screen Background Orbs */}
      <div className="absolute top-0 -left-1/4 w-[800px] h-[800px] bg-[#6DB5FF]/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-[#FF5DE7]/15 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 noise-overlay opacity-30 pointer-events-none" />

      {/* Left Column: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-4 sm:p-8 lg:p-12 relative z-10 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-md mx-auto bg-[#0D0D0D]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 sm:p-10 shadow-2xl flex flex-col relative z-10">
          <div className="mb-8">
            <i className="font-serif text-2xl tracking-wide font-medium" style={{ fontFamily: "Lora, serif" }}>notes2cards</i>
          </div>

          {/* ── Email confirmation sent state ── */}
          {signedUp ? (
            <div className="flex flex-col items-center gap-6 py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#6DB5FF]/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#6DB5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Check your inbox</h1>
                <p className="text-[15px] text-white/60 leading-relaxed">
                  We sent a confirmation link to<br />
                  <span className="text-white font-medium">{email}</span>
                </p>
              </div>
              <p className="text-[13px] text-white/40 leading-relaxed max-w-xs">
                Click the link in the email to activate your account. Check your spam folder if you don&apos;t see it.
              </p>
              <Link href="/login" className="text-[14px] text-[var(--glow-blue)] hover:underline font-medium">
                Back to sign in →
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-sans text-3xl font-bold mb-2 tracking-tight">Create your account</h1>
              <p className="text-[15px] text-white/50 mb-8">40 free pages every month. No credit card.</p>

              <div className="w-full space-y-3 mb-6">
                {/* <button onClick={() => handleOAuth('google')} className="w-full py-3 px-4 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.1)] transition flex items-center justify-center gap-3 text-[14px]">
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                  Continue with Google
                </button> */}
                <button onClick={() => handleOAuth('github')} className="w-full py-3 px-4 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.1)] transition flex items-center justify-center gap-3 text-[14px]">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                  Continue with GitHub
                </button>
              </div>

              <div className="flex items-center w-full gap-4 mb-6 opacity-50">
                <div className="h-px flex-1 bg-[var(--text-muted)]"></div>
                <span className="text-[12px] text-[var(--text-muted)] uppercase tracking-wider">or email</span>
                <div className="h-px flex-1 bg-[var(--text-muted)]"></div>
              </div>

              {!mounted ? (
                <div className="w-full space-y-4">
                  <div className="w-full h-[48px] bg-white/5 rounded-xl animate-pulse" />
                  <div className="w-full h-[48px] bg-white/5 rounded-xl animate-pulse" />
                  <div className="w-full h-[48px] bg-white/5 rounded-xl animate-pulse" />
                  <div className="w-full h-[48px] bg-white/5 rounded-xl animate-pulse mt-4" />
                </div>
              ) : (
                <form onSubmit={handleEmailSignup} className="w-full space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Your name"
                      className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 outline-none focus:border-[var(--glow-blue)] focus:bg-[rgba(255,255,255,0.05)] transition-colors text-[14px]"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <EmailInput
                      value={email}
                      onChange={setEmail}
                      placeholder="Email address"
                      required
                      className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 outline-none focus:border-[var(--glow-blue)] focus:bg-[rgba(255,255,255,0.05)] transition-colors text-[14px]"
                      onValidation={setEmailError}
                    />
                    {emailError && <p className="text-[var(--glow-pink)] text-[12px] mt-1.5">{emailError}</p>}
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Password (min 8 characters)"
                      required
                      className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 outline-none focus:border-[var(--glow-blue)] focus:bg-[rgba(255,255,255,0.05)] transition-colors text-[14px]"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <PasswordStrengthBar password={password} />
                  </div>

                  {/* Terms checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer text-[13px] text-[var(--text-secondary)]">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={e => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-white/30 bg-transparent checked:bg-[#6DB5FF] checked:border-[#6DB5FF] cursor-pointer flex-shrink-0"
                    />
                    <span>
                      I agree to the{' '}
                      <button type="button" onClick={() => setLegalModal('terms')} className="text-white underline underline-offset-2 hover:text-[var(--cyan)] transition-colors">
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button type="button" onClick={() => setLegalModal('privacy')} className="text-white underline underline-offset-2 hover:text-[var(--cyan)] transition-colors">
                        Privacy Policy
                      </button>
                    </span>
                  </label>

                  {/* Marketing opt-in */}
                  <label className="flex items-start gap-3 cursor-pointer text-[13px] text-[var(--text-secondary)]">
                    <input
                      type="checkbox"
                      checked={marketingOptIn}
                      onChange={e => setMarketingOptIn(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-white/30 bg-transparent checked:bg-[#6DB5FF] checked:border-[#6DB5FF] cursor-pointer flex-shrink-0"
                    />
                    <span>Send me product updates, tips, and offers</span>
                  </label>

                  {/* Remember Me */}
                  <label className="flex items-start gap-3 cursor-pointer text-[13px] text-[var(--text-secondary)]">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="mt-0.5 w-4 h-4 rounded border-white/30 bg-transparent checked:bg-[#6DB5FF] checked:border-[#6DB5FF] cursor-pointer flex-shrink-0"
                    />
                    <span>Remember me</span>
                  </label>

                  {error && <div className="text-[var(--glow-pink)] text-[13px] text-center p-2 bg-[rgba(255,93,231,0.1)] rounded-lg">{error}</div>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-all mt-4 disabled:opacity-50 text-[15px]"
                  >
                    {loading ? 'Creating account...' : 'Create account'}
                  </button>
                </form>
              )}

              <div className="mt-8 text-[14px] text-[var(--text-secondary)]">
                Already have an account? <Link href="/login" className="text-white hover:text-[var(--cyan)] transition-colors font-medium border-b border-[rgba(255,255,255,0.3)] pb-0.5 hover:border-[var(--cyan)]">Sign in</Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Column: Premium Visuals */}
      <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center z-10">
        <div className="max-w-lg p-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/70 mb-6" style={{ fontFamily: "Outfit, sans-serif" }}>
            <Sparkles className="w-4 h-4 text-[#6DB5FF]" />
            Premium Anki Extraction
          </div>
          <h2 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
            Stop typing.<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #FF5DE7 0%, #6DB5FF 100%)" }}>
              Start memorizing.
            </span>
          </h2>
          <p className="text-lg text-white/50 mb-12 leading-relaxed" style={{ fontFamily: "Outfit, sans-serif" }}>
            Upload PDFs, slides, or scanned notes. Our engine extracts testable facts and formats them perfectly for Anki&apos;s spaced-repetition algorithm.
          </p>

          <div className="space-y-6 border-t border-white/10 pt-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#6DB5FF]/10 text-[#6DB5FF]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-white/80" style={{ fontFamily: "Outfit, sans-serif" }}>Upload your heaviest study material</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF5DE7]/10 text-[#FF5DE7]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-white/80" style={{ fontFamily: "Outfit, sans-serif" }}>Our flashcard engine extracts high-yield facts &amp; cloze deletions</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#00FF88]/10 text-[#00FF88]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-white/80" style={{ fontFamily: "Outfit, sans-serif" }}>Double-click to import instantly to Anki</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Legal Modal ── */}
      {legalModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setLegalModal(null)}
        >
          <div
            className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-[#0D0D0D] border border-[rgba(255,255,255,0.1)] p-8 shadow-2xl custom-scrollbar"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">
                {legalModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
              </h2>
              <button
                onClick={() => setLegalModal(null)}
                className="text-white/40 hover:text-white transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>
            <pre className="text-[13px] text-white/70 whitespace-pre-wrap leading-relaxed" style={{ fontFamily: 'var(--font-outfit), Outfit, sans-serif' }}>
              {legalModal === 'terms' ? TERMS_CONTENT : PRIVACY_CONTENT}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
