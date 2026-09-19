"use client"

import { useCallback } from 'react'

// Accepted extensions and their canonical MIME types.
// Used for both the file input filter and the drop handler — keeps them in sync.
const ACCEPTED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.pptx']

const EXTENSION_MIME: Record<string, string> = {
  '.pdf':  'application/pdf',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
}

/** Normalise a File whose browser-reported type may be wrong (Windows / OS MIME gaps). */
function normaliseMime(f: File): File {
  const ext = f.name.slice(f.name.lastIndexOf('.')).toLowerCase()
  const canonical = EXTENSION_MIME[ext]
  if (canonical && (!f.type || f.type === 'application/octet-stream')) {
    return new File([f], f.name, { type: canonical })
  }
  return f
}

/** Returns true if a file is one we can process (by extension, not MIME). */
function isAccepted(f: File): boolean {
  const ext = f.name.slice(f.name.lastIndexOf('.')).toLowerCase()
  return ACCEPTED_EXTENSIONS.includes(ext)
}

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void
}

export function DropZone({ onFilesSelected }: DropZoneProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const accepted = Array.from(e.dataTransfer.files)
        .filter(isAccepted)
        .map(normaliseMime)

      if (accepted.length > 0) {
        onFilesSelected(accepted)
      } else {
        alert('Please drop PDF, PNG, JPG, or PPTX files.')
      }
    }
  }, [onFilesSelected])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const accepted = Array.from(e.target.files)
        .filter(isAccepted)
        .map(normaliseMime)
      onFilesSelected(accepted)
    }
  }

  // Accept string for the <input> — include both MIME types and extensions
  // so it works across all browsers and OSes.
  const acceptStr = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ...ACCEPTED_EXTENSIONS,
  ].join(',')

  return (
    <div 
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="border-2 border-dashed border-[var(--primary)] border-opacity-50 rounded-2xl p-12 text-center bg-[var(--surface)] hover:bg-[#1a1a24] hover:border-opacity-100 transition-all cursor-pointer relative group"
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <input 
        id="file-upload" 
        type="file" 
        accept={acceptStr}
        multiple 
        className="hidden" 
        onChange={handleFileInput}
      />
      <div className="w-16 h-16 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
      </div>
      <h3 className="text-xl font-display font-bold text-[var(--foreground)] mb-2">Drag & drop files here, or click to browse</h3>
      <p className="text-[var(--muted)]">Supports PDF, PPTX, PNG, JPG — multiple files, any size</p>
    </div>
  )
}
