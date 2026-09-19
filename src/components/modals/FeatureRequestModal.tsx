"use client"

import { useState, useRef, useEffect } from 'react'
import { Bug, Sparkle, ChatTeardropText, Tray, CaretDown, Check } from '@phosphor-icons/react'

const CATEGORIES = [
  { 
    value: 'bug_report', 
    label: 'Bug Report', 
    icon: Bug, 
    color: '#00FF88' 
  },
  { 
    value: 'feature_request', 
    label: 'Feature Request', 
    icon: Sparkle, 
    color: '#FF5DE7' 
  },
  { 
    value: 'feedback', 
    label: 'General Feedback', 
    icon: ChatTeardropText, 
    color: '#6DB5FF' 
  },
  { 
    value: 'other', 
    label: 'Other', 
    icon: Tray, 
    color: '#FEFA3D' 
  },
] as const

type Category = typeof CATEGORIES[number]['value']

export function FeatureRequestModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [category, setCategory] = useState<Category>('feedback')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!isOpen) return null

  const selectedCat = CATEGORIES.find(c => c.value === category) || CATEGORIES[2]
  const SelectedIcon = selectedCat.icon

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return
    setStatus('loading')
    setErrorMsg('')

    await new Promise(r => setTimeout(r, 600))
    setStatus('success')
      setTimeout(() => {
        onClose()
        setCategory('feedback')
        setSubject('')
        setMessage('')
        setStatus('idle')
        setErrorMsg('')
      }, 2000)
    }
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setCategory('feedback')
      setSubject('')
      setMessage('')
      setStatus('idle')
      setErrorMsg('')
      setDropdownOpen(false)
    }, 200)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={handleClose}>
      <div
        className="w-full max-w-md p-6 relative bg-[#0D0D0D] rounded-2xl border border-white/10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button onClick={handleClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <h2 className="text-xl font-bold mb-1 text-white">Report or Request a Feature</h2>
        <p className="text-[13px] text-white/50 mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Found a bug or have an idea to make notes2cards better?
        </p>
        
        {status === 'success' ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-12 h-12 rounded-full bg-[#00FF88]/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#00FF88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-[#00FF88] font-bold text-[15px]">Thanks for your feedback!</p>
            <p className="text-[12px] text-white/40">We read every message and will get back to you if needed.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Custom Category dropdown */}
            <div>
              <label className="block text-[11px] text-white/40 uppercase tracking-wider mb-1.5 font-semibold"
                style={{ fontFamily: 'Outfit, sans-serif' }}>
                Category
              </label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between bg-white/[0.03] text-white border border-white/10 rounded-xl px-3.5 py-2.5 text-[14px] outline-none focus:border-[#6DB5FF] transition-all hover:bg-white/[0.05]"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  <div className="flex items-center gap-2.5">
                    <SelectedIcon size={18} weight="duotone" color={selectedCat.color} />
                    <span className="font-medium text-white/90">{selectedCat.label}</span>
                  </div>
                  <CaretDown size={14} className={`text-white/40 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-[#141414] border border-white/10 rounded-xl shadow-2xl py-1 overflow-hidden backdrop-blur-xl">
                    {CATEGORIES.map(cat => {
                      const Icon = cat.icon
                      const isSelected = cat.value === category
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => {
                            setCategory(cat.value)
                            setDropdownOpen(false)
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 text-[13px] transition-colors ${
                            isSelected ? 'bg-white/[0.08] text-white' : 'text-white/70 hover:bg-white/[0.04] hover:text-white'
                          }`}
                          style={{ fontFamily: 'Outfit, sans-serif' }}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon size={18} weight="duotone" color={cat.color} />
                            <span>{cat.label}</span>
                          </div>
                          {isSelected && <Check size={14} className="text-[#6DB5FF]" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Subject field */}
            <div>
              <label className="block text-[11px] text-white/40 uppercase tracking-wider mb-1.5 font-semibold"
                style={{ fontFamily: 'Outfit, sans-serif' }}>
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-white/[0.03] text-white border border-white/10 rounded-xl px-3.5 py-2.5 text-[14px] outline-none focus:border-[#6DB5FF] transition-colors"
                style={{ fontFamily: 'Outfit, sans-serif' }}
                placeholder="Brief summary of your feedback"
                required
              />
            </div>

            {/* Message body */}
            <div>
              <label className="block text-[11px] text-white/40 uppercase tracking-wider mb-1.5 font-semibold"
                style={{ fontFamily: 'Outfit, sans-serif' }}>
                Details
              </label>
              <textarea 
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full h-28 bg-white/[0.03] text-white border border-white/10 rounded-xl p-3 text-[14px] outline-none focus:border-[#6DB5FF] resize-none transition-colors"
                style={{ fontFamily: 'Outfit, sans-serif' }}
                placeholder="Describe the issue or feature in detail..."
                required
              />
            </div>

            {/* Error message */}
            {status === 'error' && (
              <div className="text-[#FF5DE7] text-[12px] p-2.5 bg-[#FF5DE7]/10 rounded-xl border border-[#FF5DE7]/20">
                {errorMsg}
              </div>
            )}

            {/* Submit button */}
            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="w-full py-3 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-all disabled:opacity-50 text-[14px]"
            >
              {status === 'loading' ? 'Sending...' : 'Send Report'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
