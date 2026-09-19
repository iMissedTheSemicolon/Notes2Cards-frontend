"use client"

import { useEffect, useRef } from 'react'

interface ProgressGlowProps {
  progress: number // 0 to 100
  isActive: boolean
  children: React.ReactNode
  className?: string
}

export function ProgressGlow({ progress, isActive, children, className = '' }: ProgressGlowProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    let color = 'transparent'
    
    if (isActive) {
      if (progress <= 33) {
        // Red to Orange
        color = `color-mix(in srgb, var(--glow-red) ${100 - (progress * 3)}%, var(--glow-orange))`
      } else if (progress <= 66) {
        // Orange to Yellow
        const p = (progress - 33) * 3
        color = `color-mix(in srgb, var(--glow-orange) ${100 - p}%, var(--glow-yellow))`
      } else if (progress < 100) {
        // Yellow to Green
        const p = (progress - 66) * 3
        color = `color-mix(in srgb, var(--glow-yellow) ${100 - p}%, var(--glow-green))`
      } else {
        color = 'var(--glow-green)'
      }
    }

    const angle = `${(progress / 100) * 360}deg`
    
    ref.current.style.setProperty('--progress-color', color)
    ref.current.style.setProperty('--progress-angle', angle)
    
    if (isActive) {
       if (progress === 100) {
           ref.current.style.setProperty('--progress-opacity', '0.8')
           // Steady pulse effect could be added here via CSS animation class if needed
       } else {
           ref.current.style.setProperty('--progress-opacity', '1')
       }
    } else {
        ref.current.style.setProperty('--progress-opacity', '0')
    }
    
  }, [progress, isActive])

  return (
    <div ref={ref} className={`node-box ${className}`}>
      {children}
    </div>
  )
}
