"use client"

import { useMemo } from 'react'

interface PasswordStrengthBarProps {
  password: string
}

function getStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: 'transparent' }

  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/\d/.test(password)) score++
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) score++

  const levels: Record<number, { label: string; color: string }> = {
    0: { label: '', color: 'transparent' },
    1: { label: 'Weak', color: '#FF4D4D' },
    2: { label: 'Fair', color: '#FFA500' },
    3: { label: 'Good', color: '#FEFA3D' },
    4: { label: 'Strong', color: '#00FF88' },
  }

  return { score, ...levels[score] }
}

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const { score, label, color } = useMemo(() => getStrength(password), [password])

  if (!password) return null

  return (
    <div className="mt-2 space-y-1.5">
      {/* 4-segment bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            className="h-[3px] flex-1 rounded-full transition-all duration-300"
            style={{
              background: segment <= score ? color : 'rgba(255,255,255,0.08)',
            }}
          />
        ))}
      </div>
      {/* Label */}
      <p
        className="text-[11px] font-medium transition-colors duration-300"
        style={{ color, fontFamily: 'Outfit, sans-serif' }}
      >
        {label}
      </p>
    </div>
  )
}
