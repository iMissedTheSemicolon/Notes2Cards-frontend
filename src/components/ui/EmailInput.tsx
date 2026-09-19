"use client"

import { useState, useRef, useEffect, useCallback } from 'react'

/* ── Reputable email providers for auto-suggest ────────────────────────── */
const EMAIL_PROVIDERS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'protonmail.com',
  'proton.me',
  'aol.com',
  'zoho.com',
  'yandex.com',
  'mail.com',
  'live.com',
  'msn.com',
  'me.com',
  'pm.me',
]

/* ── Disposable / temp-mail domains to block ───────────────────────────── */
const DISPOSABLE_DOMAINS = new Set([
  'guerrillamail.com', 'guerrillamail.de', 'guerrillamail.net', 'guerrillamail.org',
  'guerrillamailblock.com', 'grr.la', 'sharklasers.com', 'guerrillamail.info',
  'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'tempail.com',
  'throwaway.email', 'throwawaymail.com',
  'mailinator.com', 'mailinator2.com', 'mailinator.net',
  'yopmail.com', 'yopmail.fr', 'yopmail.net',
  'dispostable.com', 'maildrop.cc', 'mailnesia.com',
  'fakeinbox.com', 'fakemail.net', 'trashmail.com', 'trashmail.me', 'trashmail.net',
  'mohmal.com', 'getnada.com', 'tempinbox.com',
  'sharklasers.com', 'spam4.me', 'grr.la',
  'discard.email', 'discardmail.com', 'discardmail.de',
  'mintemail.com', 'mintmail.com',
  'harakirimail.com', 'mailexpire.com',
  'safetymail.info', 'filzmail.com',
  'emailondeck.com', 'inboxbear.com',
  'spamgourmet.com', 'jetable.org',
  'mytemp.email', 'crazymailing.com',
  'tempmailo.com', 'tempr.email',
  'burnermail.io', 'mailsac.com',
  '10minutemail.com', '10minutemail.net', '10minute.email',
  'tmail.ws', 'tmpmail.net', 'tmpmail.org',
  'mailcatch.com', 'mailscrap.com',
  'nowmymail.com', 'bugmenot.com',
  'receiveee.com', 'tempmailer.com',
  'emailfake.com', 'emkei.cz',
  'mailnull.com', 'nomail.xl.cx',
])

interface EmailInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  className?: string
  /** Returns validation error message, or empty string if valid */
  onValidation?: (error: string) => void
}

export function EmailInput({
  value,
  onChange,
  placeholder = 'Email address',
  required = false,
  className = '',
  onValidation,
}: EmailInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const validateEmail = useCallback((email: string) => {
    if (!email) return ''
    const atIndex = email.indexOf('@')
    if (atIndex === -1) return ''
    const domain = email.slice(atIndex + 1).toLowerCase()
    if (!domain) return ''
    if (DISPOSABLE_DOMAINS.has(domain)) {
      return 'Please use a permanent email address. Temporary email providers are not allowed.'
    }
    return ''
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    onChange(val)

    const atIndex = val.indexOf('@')
    if (atIndex !== -1 && atIndex < val.length) {
      const localPart = val.slice(0, atIndex)
      const domainPart = val.slice(atIndex + 1).toLowerCase()

      // Filter providers that start with what user typed after @
      const filtered = EMAIL_PROVIDERS
        .filter(p => p.startsWith(domainPart) && p !== domainPart)
        .map(p => `${localPart}@${p}`)

      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
      setSelectedIndex(-1)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }

    // Validate on change
    const error = validateEmail(val)
    onValidation?.(error)
  }

  const handleBlur = () => {
    // Small delay to allow click on suggestion
    setTimeout(() => setShowSuggestions(false), 150)
    const error = validateEmail(value)
    onValidation?.(error)
  }

  const selectSuggestion = (suggestion: string) => {
    onChange(suggestion)
    setShowSuggestions(false)
    setSuggestions([])
    inputRef.current?.focus()
    const error = validateEmail(suggestion)
    onValidation?.(error)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      selectSuggestion(suggestions[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    } else if (e.key === 'Tab' && selectedIndex >= 0) {
      e.preventDefault()
      selectSuggestion(suggestions[selectedIndex])
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="email"
        placeholder={placeholder}
        required={required}
        className={className}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoComplete="email"
      />
      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          className="absolute z-50 w-full mt-1 rounded-xl border border-white/10 bg-[#0D0D0D]/95 backdrop-blur-xl shadow-2xl overflow-hidden"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {suggestions.map((suggestion, i) => (
            <button
              key={suggestion}
              type="button"
              className="w-full text-left px-4 py-2.5 text-[13px] transition-colors"
              style={{
                color: i === selectedIndex ? '#fff' : 'rgba(255,255,255,0.6)',
                background: i === selectedIndex ? 'rgba(109,181,255,0.12)' : 'transparent',
              }}
              onMouseEnter={() => setSelectedIndex(i)}
              onMouseDown={(e) => {
                e.preventDefault() // Prevent blur
                selectSuggestion(suggestion)
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Utility: Check if an email uses a disposable domain */
export function isDisposableEmail(email: string): boolean {
  const atIndex = email.indexOf('@')
  if (atIndex === -1) return false
  const domain = email.slice(atIndex + 1).toLowerCase()
  return DISPOSABLE_DOMAINS.has(domain)
}
