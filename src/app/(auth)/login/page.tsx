"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, CheckCircle2 } from 'lucide-react'
import { EmailInput } from '@/components/ui/EmailInput'

export default function LoginPage() {
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    // Pre-warm the /app route so the redirect feels instant after sign-in
    router.prefetch('/app')
  }, [])

  const handleOAuth = async (provider: 'google' | 'apple' | 'github') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      // Hard navigation to guarantee the browser sends all freshly-set
      // auth cookies. Soft router.push can race with cookie writes.
      window.location.href = '/app'
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email address above first.')
      return
    }
    setResetLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/app`,
    })
    if (error) {
      setError(error.message)
    } else {
      setResetSent(true)
    }
    setResetLoading(false)
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
          
          <h1 className="font-sans text-3xl font-bold mb-2 tracking-tight">Welcome back</h1>
          <p className="text-[15px] text-white/50 mb-8">Ready to ace your exams?</p>
          
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
                <div className="w-full h-[48px] bg-white/5 rounded-xl animate-pulse mt-4" />
              </div>
            ) : (
              <form onSubmit={handleEmailLogin} className="w-full space-y-4">
                <div>
                  <EmailInput
                    value={email}
                    onChange={setEmail}
                    placeholder="Email address"
                    required
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 outline-none focus:border-[var(--glow-blue)] focus:bg-[rgba(255,255,255,0.05)] transition-colors text-[14px]"
                  />
                </div>
                <div>
                  <input 
                    type="password" 
                    placeholder="Password" 
                    required
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 outline-none focus:border-[var(--glow-blue)] focus:bg-[rgba(255,255,255,0.05)] transition-colors text-[14px]"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="remember" 
                      className="w-4 h-4 rounded border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] accent-[var(--glow-blue)] cursor-pointer"
                      defaultChecked
                    />
                    <label htmlFor="remember" className="text-sm text-white/70 cursor-pointer select-none">
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={resetLoading}
                    className="text-[13px] text-white/50 hover:text-[var(--glow-blue)] transition-colors disabled:opacity-50"
                  >
                    {resetLoading ? 'Sending...' : 'Forgot password?'}
                  </button>
                </div>

                {resetSent && (
                  <div className="text-[#00FF88] text-[13px] text-center p-2 bg-[rgba(0,255,136,0.08)] rounded-lg border border-[rgba(0,255,136,0.15)]">
                    Password reset link sent! Check your inbox.
                  </div>
                )}

                {error && <div className="text-[var(--glow-pink)] text-[13px] text-center p-2 bg-[rgba(255,93,231,0.1)] rounded-lg">{error}</div>}
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3.5 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-all mt-4 disabled:opacity-50 text-[15px]"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
            )}

            <div className="mt-8 text-[14px] text-[var(--text-secondary)]">
              New here? <Link href="/signup" className="text-white hover:text-[var(--glow-blue)] transition-colors font-medium border-b border-[rgba(255,255,255,0.3)] pb-0.5 hover:border-[var(--glow-blue)]">Create an account</Link>
            </div>
          </div>
        </div>

      {/* Right Column: Premium Visuals */}
      <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center z-10">
        <div className="max-w-lg p-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/70 mb-6" style={{ fontFamily: "Outfit, sans-serif" }}>
            <Sparkles className="w-4 h-4 text-[#6DB5FF]" />
            Welcome Back
          </div>
          <h2 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
            Ready to ace your <br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #6DB5FF 0%, #FF5DE7 100%)" }}>
              next exam?
            </span>
          </h2>
          <p className="text-lg text-white/50 mb-12 leading-relaxed" style={{ fontFamily: "Outfit, sans-serif" }}>
            Jump back into notes2cards. Upload your latest syllabus or textbook chapters, and let the engine do the heavy lifting.
          </p>
          
          <div className="space-y-6 border-t border-white/10 pt-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#6DB5FF]/10 text-[#6DB5FF]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-white/80" style={{ fontFamily: "Outfit, sans-serif" }}>Unlimited processing for Pro users</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF5DE7]/10 text-[#FF5DE7]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-white/80" style={{ fontFamily: "Outfit, sans-serif" }}>Instant .apkg generation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
