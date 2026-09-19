"use client"

import React, { useState, useCallback, useRef, useEffect } from 'react';

// ── Maps internal/Gemini error strings to friendly user-facing messages ──────
function friendlyError(msg: string): string {
  if (!msg) return 'Something went wrong. Please try again.'
  const m = msg.toLowerCase()
  if (m.includes('unreadable_pdf') || m.includes('corrupt') || m.includes('password'))
    return "We couldn't read this file. Make sure it isn't password-protected or corrupted."
  if (m.includes('unreadable_pptx'))
    return "We couldn't read this PowerPoint file. Try re-saving it and uploading again."
  if (m.includes('gemini_zero_cards'))
    return "Gemini couldn't extract any flashcards from this file. This can happen with very image-heavy or scanned PDFs — try disabling 'Extract & Include Images' and re-generating."
  if (m.includes('too little') || m.includes('empty response') || m.includes('insufficient content') || m.includes('skipped'))
    return "This file didn't have enough text for us to work with. Try a notes-heavy PDF or PPTX instead."
  if (m.includes('json') || m.includes('unexpected character') || m.includes('unexpected token'))
    return 'Our AI returned an unexpected response for this file. Please try again — it usually works on a second attempt.'
  if (m.includes('gemini upload failed') || m.includes('upload failed'))
    return 'Upload to AI processor failed. Please try again in a moment.'
  if (m.includes('never became active'))
    return 'The AI processor timed out on this file. Try a smaller file or try again.'
  if (m.includes('429') || m.includes('rate limit') || m.includes('too many requests'))
    return 'Service is temporarily busy. Please wait a moment and try again.'
  if (m.includes('503') || m.includes('capacity') || m.includes('unavailable'))
    return 'Service is temporarily at capacity. Please try again shortly.'
  if (m.includes('quota') || m.includes('batch_quota') || m.includes('pages left'))
    return msg
  if (m.includes('unsupported format') || m.includes('unsupported type') || m.includes('could not read'))
    return 'Unsupported file type. Please upload a PDF, PNG, JPG, or PPTX.'
  if (m.includes('20mb') || m.includes('file size') || m.includes('exceeds'))
    return 'This file is too large. Maximum file size is 20 MB.'
  if (m.includes('network') || m.includes('fetch'))
    return 'Network error. Check your connection and try again.'
  
  // If we don't recognize the error, show the actual error message 
  // instead of a generic "Something went wrong" so we can debug it.
  return msg
}

import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  BackgroundVariant,
  CoordinateExtent
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './FlashcardNodes.css'; 
import {
  generateAndDownloadApkg,
  generateAndDownloadAllAsZip,
} from '@/lib/ankiExport.client';
import { LOADING_MESSAGES } from '@/constants/loadingMessages';
import { useToast } from '@/components/ui/ToastProvider';
import { PDFDocument } from 'pdf-lib';
import { getLimits } from '@/lib/planLimits';

// --- CUSTOM NODES ---

const InputNode = ({ data }: { data: any }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = () => {
    if (data.isActive && !data.isUploading && !data.hasFiles) {
      fileInputRef.current?.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (data.isActive && !data.hasFiles) setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!data.isActive || data.hasFiles) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      data.onUpload(Array.from(e.dataTransfer.files));
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      data.onUpload(Array.from(e.target.files));
    }
  };

  const showGlow = data.isActive || data.isCompleted;
  const isDimmed = data.isCompleted && !data.isActive;

  return (
    <div className={`gn-wrapper${showGlow ? ' glow-input' : ''}${isDimmed ? ' is-completed' : ''}`}>
      <div className="gn-frosted">
        <div className="gn-inner">
          <h3 className="gn-label text-white">Input Files</h3>
          
          <div 
            className={`gn-dropzone nodrag min-h-[130px] flex flex-col justify-center items-center ${data.hasFiles ? 'border-green-500 bg-green-500/10' : ''} ${isDragging ? 'border-[#6DB5FF] bg-[#6DB5FF]/10' : ''}`}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              className="hidden" 
              style={{ display: 'none' }}
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept="application/pdf,image/png,image/jpeg,application/vnd.openxmlformats-officedocument.presentationml.presentation,.pdf,.png,.jpg,.jpeg,.pptx"
              multiple
            />

            {data.isUploading ? (
              <div className="flex flex-col items-center gap-2 text-white">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span className="text-sm">Uploading...</span>
              </div>
            ) : data.hasFiles ? (
              <div className="flex flex-col items-center gap-2 text-[#00FF88] text-center px-2">
                <span className="text-sm font-medium">✓ Ready to process</span>
                <span className="text-xs opacity-70 truncate w-[200px]">{data.fileName || "Document.pdf"}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                <span className="text-sm text-center">{isDragging ? "Drop file here" : "Drag & drop or click to upload"}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="gn-handle" />
    </div>
  );
};

const AREA_MAP: Record<string, string> = {
  'Formulae & Equations': 'formulae',
  'Definitions': 'definitions',
  'Facts & Constants': 'facts',
  'Questions & Answers': 'questions',
  'Higher-Order Thinking': 'hots',
  'Practical Application': 'practical'
};

const ProcessingNode = ({ data }: { data: any }) => {
  const [selectedAreas, setSelectedAreas] = useState(['Definitions', 'Facts & Constants']);
  const [cardStyle, setCardStyle] = useState('Standard Q&A');
  const [depthStep, setDepthStep] = useState(4); 
  const [includeImages, setIncludeImages] = useState(true);
  const depthLabels: Record<number, string> = { 1: 'Summary', 2: 'Standard', 3: 'Detailed', 4: 'Comprehensive' };
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [tip, setTip] = useState<string | null>(null);
  const [tipFading, setTipFading] = useState(false);

  // One-time sendaway tip — shown for 15 s then fades out
  const SENDAWAY_TIPS = [
    "Deck’s in the oven. Grab a coffee, glance at yesterday’s notes, or just breathe — we’ll ping you when it’s ready.",
    "This takes a minute. Perfect time to flip through what you studied last week while the AI does the heavy lifting.",
    "You don’t need to watch this. Step away, stretch, re-read your summary — your deck will be waiting when you’re back.",
    "AI is reading so you don’t have to type. Go review your weakest topic in Anki while we handle the rest.",
    "Processing in progress. Now’s a good moment to skim your lecture outline — your brain’s doing the priming, we’re doing the grunt work.",
    "Good time to look away from the screen for a bit. We’ll send a notification the moment your cards are ready.",
    "Sit back. Your next Anki session is being assembled card by card. Feel free to wander off — there’s nothing to click here.",
    "Nothing to do on your end right now. Your AI-built deck will appear here automatically — no refreshing needed.",
  ];
  const tipIndexRef = useRef<number>(-1);

  // Snapshot of fileStatuses at the moment generation began — kept in a ref
  // so that the per-file list doesn't vanish if the parent re-renders.
  const [localStatuses, setLocalStatuses] = useState<{name: string; status: string; cardCount?: number}[]>([]);
  
  // Load defaults from localStorage on mount
  useEffect(() => {
    try {
      const savedCardType = localStorage.getItem('default_card_type');
      if (savedCardType === 'cloze') setCardStyle('Cloze Deletion');
      else if (savedCardType === 'standard') setCardStyle('Standard Q&A');

      const savedDepth = localStorage.getItem('default_depth');
      if (savedDepth) {
        const d = parseInt(savedDepth, 10);
        if (d >= 1 && d <= 4) setDepthStep(d);
      }

      const savedFocus = localStorage.getItem('default_focus_areas');
      if (savedFocus) {
        const parsed = JSON.parse(savedFocus);
        if (Array.isArray(parsed) && parsed.length > 0) setSelectedAreas(parsed);
      }
      const savedIncludeImages = localStorage.getItem('default_include_images');
      if (savedIncludeImages !== null) {
        setIncludeImages(savedIncludeImages === 'true');
      }
    } catch {}
  }, []);

  // Sync localStatuses from parent data whenever it changes during generation
  useEffect(() => {
    if (data.isGenerating && data.fileStatuses && data.fileStatuses.length > 0) {
      setLocalStatuses(data.fileStatuses);
    }
    if (!data.isGenerating) {
      setLocalStatuses([]);
    }
  }, [data.isGenerating, data.fileStatuses]);

  // One-time tip: pick a fresh message on each generation cycle, show for 15 s
  useEffect(() => {
    if (!data.isGenerating) {
      setTip(null);
      setTipFading(false);
      return;
    }
    // Pick an index different from the last one
    let nextIdx: number;
    do {
      nextIdx = Math.floor(Math.random() * SENDAWAY_TIPS.length);
    } while (nextIdx === tipIndexRef.current && SENDAWAY_TIPS.length > 1);
    tipIndexRef.current = nextIdx;
    setTip(SENDAWAY_TIPS[nextIdx]);
    setTipFading(false);

    // Start fade-out at 14.5 s, fully gone at 15 s
    const fadeTimer = setTimeout(() => setTipFading(true), 14500);
    const hideTimer = setTimeout(() => setTip(null), 15000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.isGenerating]);

  // Rotate loading messages every 4 seconds during generation
  useEffect(() => {
    if (!data.isGenerating) return;
    setLoadingMsg(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
    const interval = setInterval(() => {
      setLoadingMsg(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
    }, 4000);
    return () => clearInterval(interval);
  }, [data.isGenerating]);

  const toggleArea = (area: string) => {
    setSelectedAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);
  };

  const showGlow = data.isActive || data.isCompleted;
  const isDimmed = data.isCompleted && !data.isActive;

  return (
    <div className={`gn-wrapper${showGlow ? ' glow-processing' : ''}${isDimmed ? ' is-completed' : ''}`}>
      <Handle type="target" position={Position.Left} className="gn-handle" />
      <div className="gn-frosted">
        <div className="gn-inner">
          <h3 className="gn-label text-white">Flashcard Engine</h3>
          
          {data.isGenerating ? (
            /* ── LOADING STATE ──
               Shows per-file progress list + rotating message. ── */
            <div className="nodrag flex flex-col gap-4" style={{ minHeight: 320 }}>
              {/* Shimmer progress bar */}
              <div className="gn-progress-track">
                <div className="gn-progress-fill" />
              </div>

              {/* Per-file status list */}
              {localStatuses.length > 0 ? (
                <div className="flex flex-col gap-2 mt-2" style={{ flex: 1 }}>
                  {/* Header */}
                  <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {(() => {
                      const doneCount = localStatuses.filter(s => s.status === 'done' || s.status === 'error').length;
                      const processingIdx = localStatuses.findIndex(s => s.status === 'processing');
                      if (processingIdx !== -1) return `Processing file ${processingIdx + 1} of ${localStatuses.length}`;
                      if (doneCount === localStatuses.length) return `Finished all ${localStatuses.length} files`;
                      return `${doneCount} of ${localStatuses.length} done`;
                    })()}
                  </p>
                  {localStatuses.map((fs, idx) => {
                    const isProcessing = fs.status === 'processing';
                    const isDone = fs.status === 'done';
                    const isError = fs.status === 'error';
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-300 ${
                          isProcessing
                            ? 'bg-[#6DB5FF]/10 border border-[#6DB5FF]/30'
                            : isDone
                            ? 'bg-[#00FF88]/5 border border-[#00FF88]/15'
                            : isError
                            ? 'bg-red-500/10 border border-red-500/20'
                            : 'bg-white/[0.02] border border-white/[0.05]'
                        }`}
                      >
                        {/* Status icon */}
                        {isProcessing && (
                          <span className="inline-block w-3.5 h-3.5 border-2 border-[#6DB5FF] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        )}
                        {isDone && (
                          <svg className="w-3.5 h-3.5 text-[#00FF88] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                        )}
                        {isError && (
                          <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        )}
                        {fs.status === 'waiting' && (
                          <span className="inline-block w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0" />
                        )}
                        {/* Filename */}
                        <span
                          className={`text-[11px] truncate flex-1 ${
                            isProcessing ? 'text-[#6DB5FF] font-semibold'
                            : isDone ? 'text-[#00FF88]/80'
                            : isError ? 'text-red-400/80'
                            : 'text-white/30'
                          }`}
                          style={{ fontFamily: 'Outfit, sans-serif' }}
                          title={fs.name}
                        >
                          {fs.name.length > 22 ? fs.name.slice(0, 19) + '…' : fs.name}
                        </span>
                        {/* Card count badge */}
                        {isDone && fs.cardCount !== undefined && (
                          <span className="text-[9px] text-[#00FF88]/60 font-mono flex-shrink-0">
                            {fs.cardCount} cards
                          </span>
                        )}
                        {isProcessing && (
                          <span className="text-[9px] text-[#6DB5FF]/40 font-mono flex-shrink-0">processing</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Fallback orb if statuses haven't arrived yet */
                <div className="flex flex-col items-center justify-center gap-4" style={{ flex: 1, paddingTop: 40 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FF5DE7 0%, #6DB5FF 100%)',
                    animation: 'gnOrbPulse 2s ease-in-out infinite',
                    boxShadow: '0 0 30px rgba(109,181,255,0.4)',
                  }} />
                </div>
              )}

              {/* Rotating loading message */}
              <p
                className="text-[12px] text-white/50 text-center leading-snug"
                style={{ fontFamily: 'var(--font-outfit), Outfit, sans-serif' }}
              >
                {loadingMsg}
              </p>

              {/* One-time sendaway tip — visible for 15 s then gone */}
              {tip && (
                <div
                  style={{
                    opacity: tipFading ? 0 : 1,
                    transition: 'opacity 500ms ease',
                    borderRadius: 12,
                    padding: '16px 18px',
                    background: 'rgba(109,181,255,0.07)',
                    border: '1px solid rgba(109,181,255,0.18)',
                  }}
                >
                  <p
                    className="text-[14px] leading-relaxed text-white/70 text-center"
                    style={{ fontFamily: 'var(--font-outfit), Outfit, sans-serif' }}
                  >
                    {tip}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* ── NORMAL CONFIG STATE ── */
            <div className="nodrag flex flex-col gap-5">
              
              <div className="flex flex-col gap-3">
                <span className="text-[10px] text-white/50 uppercase tracking-widest">Focus Areas</span>
                <div className="flex flex-col gap-2">
                  {Object.keys(AREA_MAP).map(area => (
                    <label key={area} className="flex items-center gap-3 cursor-pointer text-[13px] text-white hover:text-white/80 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={selectedAreas.includes(area)}
                        onChange={() => toggleArea(area)}
                        className="w-[18px] h-[18px] rounded border-white/30 bg-transparent checked:bg-[#6DB5FF] checked:border-[#6DB5FF] focus:ring-0 transition-colors cursor-pointer"
                      />
                      {area}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                 <span className="text-[10px] text-white/50 uppercase tracking-widest">Card Style</span>
                 <div className="flex gap-2">
                   {['Standard Q&A', 'Cloze Deletion'].map(style => (
                      <button 
                        key={style}
                        onClick={() => setCardStyle(style)}
                        className={`flex-1 py-2 text-xs rounded border transition-colors ${
                          cardStyle === style ? 'bg-[#6DB5FF]/20 border-[#6DB5FF] text-[#6DB5FF]' : 'bg-transparent border-white/30 text-white hover:border-white/60'
                        }`}
                      >
                        {style}
                      </button>
                   ))}
                 </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] text-white/50 uppercase tracking-widest">Coverage Depth</span>
                  <span className="text-xs text-white font-medium">{depthLabels[depthStep]}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="4" 
                  step="1"
                  value={depthStep}
                  onChange={(e) => setDepthStep(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none bg-white/20 accent-[#6DB5FF] cursor-grab active:cursor-grabbing" 
                />
                <div className="flex justify-between text-[10px] text-white/40 mt-1">
                  <span>Summary</span>
                  <span>Comprehensive</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-3 cursor-pointer text-[13px] text-white hover:text-white/80 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={includeImages}
                    onChange={(e) => {
                      setIncludeImages(e.target.checked);
                      localStorage.setItem('default_include_images', String(e.target.checked));
                    }}
                    className="w-[18px] h-[18px] rounded border-white/30 bg-transparent checked:bg-[#6DB5FF] checked:border-[#6DB5FF] focus:ring-0 transition-colors cursor-pointer"
                  />
                  Extract &amp; Include Images (Beta)
                </label>
                <span className="text-[10px] text-white/40 leading-tight">
                  Automatically rip diagrams and images from your file into Anki cards. Processing will take slightly longer.
                </span>
              </div>

              <button 
                onClick={() => data.onGenerate(
                  selectedAreas.map(a => AREA_MAP[a]),
                  cardStyle === 'Cloze Deletion' ? 'cloze' : 'standard',
                  depthStep,
                  includeImages
                )}
                disabled={!data.isActive || data.isGenerating}
                className={`w-full py-3 mt-1 rounded border text-xs font-semibold tracking-wide transition-all duration-200 ${
                  data.isActive && !data.isGenerating
                    ? 'border-white text-white hover:bg-[#00FF88] hover:border-[#00FF88] hover:text-black cursor-pointer' 
                    : 'border-white/10 text-white/20 cursor-not-allowed'
                }`}
              >
                GENERATE FLASHCARDS
              </button>
              {data.error && (
                <p className="text-[11px] leading-tight text-center mt-1 px-2 py-1.5 rounded-lg"
                  style={{ color: '#FF5DE7', background: 'rgba(255,93,231,0.08)', border: '1px solid rgba(255,93,231,0.15)' }}>
                  {friendlyError(data.error)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="gn-handle" />
    </div>
  );
};

const OutputNode = ({ data }: { data: any }) => {
  const showGlow = data.isActive || data.isCompleted;
  // downloadingKey and handlers come from parent via data props
  // (local state would get wiped when ReactFlow re-renders the node)
  const downloadingKey: null | number | 'zip' = data.downloadingKey ?? null;

  return (
    <div className={`gn-wrapper${showGlow ? ' glow-output' : ''}`}>
      <Handle type="target" position={Position.Left} className="gn-handle" />
      <div className="gn-frosted">
        <div className="gn-inner min-h-[180px] flex flex-col justify-center items-center relative">
          <h3 className="gn-label text-white absolute top-5 left-5">Export Deck</h3>
          
          {data.isCompleted && data.results && data.results.length > 0 ? (
             <div className="flex flex-col items-center gap-3 nodrag mt-6 text-center px-4 w-full max-h-[200px] overflow-y-auto">
               <svg className="w-8 h-8 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
               <span className="text-[13px] text-white font-medium truncate w-[220px]">
                 {data.results.length > 1 ? `${data.results.length} Files Processed` : (data.results[0].status === 'success' ? `${data.results[0].baseName}_Deck.apkg` : 'Processing Failed')}
               </span>
               
               {downloadingKey !== null && (
                 <p className="text-[10px] text-white/40 italic" style={{ fontFamily: 'Outfit, sans-serif' }}>
                   Compressing deck… this may take a moment for large files.
                 </p>
               )}

               <div className="flex flex-col gap-2 w-full mt-2">
                 {data.results.map((r: any, i: number) => {
                   if (r.status === 'error' || r.status === 'skipped') {
                     const friendly = friendlyError(r.error || 'skipped');
                     const isQuota = friendly.toLowerCase().includes('quota') || friendly.toLowerCase().includes('upgrade') || friendly.toLowerCase().includes('limit');
                     return (
                       <div key={i} className="flex flex-col gap-1.5 p-3 border border-red-500/30 bg-red-500/10 rounded-lg">
                         <div className="flex items-center gap-1.5">
                           <svg className="w-3.5 h-3.5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                           <span className="text-[11px] text-red-400 font-bold truncate" title={r.fileName}>{r.fileName}</span>
                         </div>
                         <p className="text-[10px] text-red-200/80 leading-snug">{friendly}</p>
                         {isQuota ? (
                           <a
                             href="https://notes2cards.lemonsqueezy.com/checkout"
                             target="_blank"
                             rel="noopener noreferrer"
                             className="mt-0.5 inline-block text-[10px] font-bold text-black bg-[#FF5DE7] hover:bg-white transition-colors rounded px-2 py-1 text-center cursor-pointer"
                           >
                             Upgrade Plan →
                           </a>
                         ) : (
                           <p className="text-[10px] text-white/40 leading-tight italic">Try again, or use a text-heavy PDF / PPTX</p>
                         )}
                       </div>
                     );
                   }
                   const isThisDownloading = downloadingKey === i;
                   const anyDownloading = downloadingKey !== null;
                   return (
                     <button
                       key={i}
                       onClick={() => data.onDownload?.(i, r)}
                       disabled={anyDownloading}
                       className={`w-full py-2 text-black text-xs font-bold rounded transition-colors flex items-center justify-center gap-2 ${
                         anyDownloading
                           ? 'opacity-50 cursor-not-allowed bg-[#6DB5FF]'
                           : 'bg-[#6DB5FF] hover:bg-white cursor-pointer'
                       }`}
                     >
                       {isThisDownloading ? (
                         <>
                           <span className="inline-block w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                           Preparing…
                         </>
                       ) : (
                         <>↓ Download {r.baseName}.apkg</>
                       )}
                     </button>
                   );
                 })}
                 {data.results.length > 1 && data.results.some((r: any) => r.status === 'success') && (() => {
                   const isZipDownloading = downloadingKey === 'zip';
                   const anyDownloading = downloadingKey !== null;
                   return (
                     <button 
                       onClick={() => data.onZipDownload?.()}
                       disabled={anyDownloading}
                       className={`w-full py-2 mt-1 text-black text-xs font-bold rounded transition-colors flex items-center justify-center gap-2 ${
                         anyDownloading
                           ? 'opacity-50 cursor-not-allowed bg-[#00FF88]'
                           : 'bg-[#00FF88] hover:bg-white cursor-pointer'
                       }`}
                     >
                       {isZipDownloading ? (
                         <>
                           <span className="inline-block w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                           Preparing ZIP…
                         </>
                       ) : (
                         <>↓ Download All as ZIP</>
                       )}
                     </button>
                   );
                 })()}
               </div>
             </div>
          ) : (
            <div className="flex flex-col items-center gap-2 opacity-30 mt-4">
               <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               <span className="text-xs text-white">Awaiting generation...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const nodeTypes = { inputNode: InputNode, processingNode: ProcessingNode, outputNode: OutputNode };

// --- MAIN PARENT COMPONENT ---

interface NodeCanvasProps {
  /** Called after a generation completes. Optionally receives the new pagesUsed total
   *  directly from the API response so the sidebar updates instantly without a DB read. */
  onUsageRefresh?: (newPagesUsed?: number) => void;
  usageData?: { used: number; limit: number; resetDate?: string };
  plan?: string;
}

export function NodeCanvas({ onUsageRefresh, usageData, plan }: NodeCanvasProps = {}) {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [step, setStep] = useState(0); 
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [processingStatus, setProcessingStatus] = useState('idle');
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [fileStatuses, setFileStatuses] = useState<{name: string; status: 'waiting'|'processing'|'done'|'error'; cardCount?: number; errorMsg?: string}[]>([]);
  // Download state lifted here so it survives ReactFlow node re-renders
  const [downloadingKey, setDownloadingKey] = useState<null | number | 'zip'>(null);
  const downloadingRef = useRef<null | number | 'zip'>(null);
  const toast = useToast();

  const handleDownload = useCallback(async (index: number, r: any) => {
    if (downloadingRef.current !== null) return;
    downloadingRef.current = index;
    setDownloadingKey(index);
    try {
      await generateAndDownloadApkg(r.baseName, r.cards, r.cardType, r.mediaFiles, r.originalFile);
    } catch (e) {
      console.error('[Download] failed', e);
    } finally {
      downloadingRef.current = null;
      setDownloadingKey(null);
    }
  }, []);

  const handleZipDownload = useCallback(async (results: any[]) => {
    if (downloadingRef.current !== null) return;
    downloadingRef.current = 'zip';
    setDownloadingKey('zip');
    try {
      await generateAndDownloadAllAsZip(results);
    } catch (e) {
      console.error('[Download] zip failed', e);
    } finally {
      downloadingRef.current = null;
      setDownloadingKey(null);
    }
  }, []);

  const handleUploadClick = useCallback(async (files: File[]) => {
    if (step !== 0 || files.length === 0) return;

    // Fast-fail client-side page check for PDFs only (we can't count PPTX slides
    // without JSZip here — the server handles that). PPTX and images pass through.
    const pdfFiles = files.filter(f => {
      const ext = f.name.slice(f.name.lastIndexOf('.')).toLowerCase();
      return ext === '.pdf';
    });
    let totalPages = 0;
    
    // Use getLimits so monthly/annual/lifetime plans all get the correct limit
    const maxPerFile = getLimits(plan ?? 'free').maxPagesPerFile;

    for (const file of pdfFiles) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const count = pdfDoc.getPageCount();
        
        if (count > maxPerFile) {
          toast.error(`"${file.name}" has ${count} pages. Your ${plan || 'Free'} plan limit is ${maxPerFile} pages per file.`);
          return; // Abort upload
        }
        totalPages += count;
      } catch (e) {
        console.error('Failed to parse PDF on client:', e);
        toast.error(`Could not read "${file.name}". It might be corrupted or encrypted.`);
        return;
      }
    }

    if (usageData) {
      const remainingPages = usageData.limit - usageData.used;
      if (totalPages > remainingPages) {
        toast.error(`Not enough quota! These files contain ${totalPages} pages, but you only have ${remainingPages} pages left this month.`);
        return; // Abort upload
      }
    }

    setUploadedFiles(files);
    
    setNodes(nds => nds.map(node => {
      if (node.id === '1') {
        const fileName = files.length > 1 ? `${files.length} files selected` : files[0].name;
        node.data = { ...node.data, isUploading: true, isActive: true, fileName };
      }
      return node;
    }));

    setTimeout(() => {
      setStep(1);
    }, 2500);
  }, [step, setNodes, usageData, plan, toast]);

  const handleGenerateClick = useCallback(async (focusAreas: string[], cardType: 'standard' | 'cloze', depth: number, includeImages: boolean) => {
    if (step !== 1 || uploadedFiles.length === 0) return;

    // Request notification permission (non-blocking)
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    setProcessingStatus('processing');
    setError(null);
    setResults([]);

    // Initialize per-file status tracking
    const initialStatuses = uploadedFiles.map(f => ({ name: f.name, status: 'waiting' as const }));
    setFileStatuses(initialStatuses);

    const allResults: any[] = [];
    let limitReached = false;
    let latestPagesUsed: number | undefined = undefined; // track latest from API responses
    // Tracks which files have already been auto-retried once, to prevent infinite loops.
    // Unit 5 (and similar) can trigger a Vercel 504 when all 3 Gemini passes are slow;
    // a single retry almost always succeeds.
    const retriedFiles = new Set<string>();

    // Process files sequentially
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];

      setFileStatuses(prev => prev.map((fs, idx) => idx === i ? { ...fs, status: 'processing' } : fs));

      try {
        // Frontend Showcase Demo Mode: Simulates AI generation without backend API calls
        await new Promise(r => setTimeout(r, 1400));

        const baseName = file.name.replace(/\.[^/.]+$/, '');
        const mockCards = [
          {
            front: `What core concept is highlighted in "${baseName}"?`,
            back: `The document covers foundational principles and applications critical to the domain.`,
          },
          {
            front: `Why is {{c1::active recall}} scientifically superior to passive re-reading?`,
            back: `Active recall forces the brain to retrieve information without external cues, triggering synaptic plasticity and long-term consolidation.`,
          },
          {
            front: `How does {{c1::spaced repetition}} counteract the Ebbinghaus forgetting curve?`,
            back: `By scheduling review sessions at scientifically expanding intervals just as retention decays.`,
          },
          {
            front: `What format does Anki use to store media assets in .apkg packages?`,
            back: `Anki stores media assets as numbered files mapped via a JSON media index inside the zip archive.`,
          },
        ];

        const mockResults = [{
          fileName: file.name,
          baseName,
          status: 'success',
          cardCount: mockCards.length,
          cards: mockCards,
          originalFile: file,
        }];

        latestPagesUsed = (latestPagesUsed || 14) + 1;
        allResults.push(...mockResults);
        setFileStatuses(prev => prev.map((fs, idx) => idx === i ? { ...fs, status: 'done', cardCount: mockCards.length } : fs));
      } catch (err: any) {
        allResults.push({ fileName: file.name, status: 'error', error: 'Processing error' });
        setFileStatuses(prev => prev.map((fs, idx) => idx === i ? { ...fs, status: 'error', errorMsg: 'Failed' } : fs));
      }
    }

    if (allResults.length > 0 || limitReached) {
      setResults(allResults);
      setProcessingStatus('complete');
      setStep(2);

      // ── Refresh sidebar usage counter ──────────────────────────────────
      // Pass pagesUsed from the API response directly so the counter updates
      // instantly from the response data (no separate DB read needed).
      if (onUsageRefresh) {
        onUsageRefresh(latestPagesUsed);
      }

      // Save to generation history (localStorage)
      try {
        const history = JSON.parse(localStorage.getItem('generation_history') || '[]');
        const successResults = allResults.filter((r: any) => r.status === 'success');
        for (const r of successResults) {
          history.unshift({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            fileName: r.fileName,
            baseName: r.baseName,
            cardCount: r.cardCount,
            cardType: r.cardType || cardType,
            timestamp: Date.now(),
            cards: r.cards,
          });
        }
        // Cap at 20 items
        localStorage.setItem('generation_history', JSON.stringify(history.slice(0, 20)));
      } catch {}

      // Fire browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        const successCount = allResults.filter((r: any) => r.status === 'success').length;
        const totalCards = allResults.reduce((sum: number, r: any) => sum + (r.cardCount || 0), 0);
        if (successCount > 0) {
          new Notification('notes2cards ✅', {
            body: `Your ${successCount} deck${successCount > 1 ? 's are' : ' is'} ready! ${totalCards} flashcards generated.`,
            icon: '/favicon.ico',
          });
        }
      }
    } else if (!limitReached) {
      setError('Failed to process any files.');
      setProcessingStatus('idle');
    }
  }, [step, uploadedFiles, onUsageRefresh, toast]);

  useEffect(() => {
    const initialNodes = [
      { 
        id: '1', 
        type: 'inputNode', 
        position: { x: 50, y: 120 }, 
        data: { 
          onUpload: handleUploadClick, 
          fileName: uploadedFiles.length > 1 ? `${uploadedFiles.length} files` : (uploadedFiles[0]?.name || ''), 
          isUploading: step === 0 && uploadedFiles.length > 0, 
          hasFiles: step > 0, 
          isActive: step === 0, 
          isCompleted: step > 0 
        } 
      },
      { 
        id: '2', 
        type: 'processingNode', 
        position: { x: 450, y: 20 }, 
        data: { 
          onGenerate: handleGenerateClick, 
          isActive: step === 1, 
          isCompleted: step > 1,
          isGenerating: processingStatus === 'processing',
          error: error,
          fileStatuses: fileStatuses
        } 
      },
      { 
        id: '3', 
        type: 'outputNode', 
        position: { x: 880, y: 120 }, 
        data: { 
          results: results,
          isActive: step === 2, 
          isCompleted: step === 2,
          downloadingKey: downloadingKey,
          onDownload: handleDownload,
          onZipDownload: () => handleZipDownload(results),
        } 
      },
    ];
    setNodes(initialNodes as any);
    
    setEdges([
      { id: 'e1-2', source: '1', target: '2', animated: step === 1, style: { stroke: step > 0 ? '#10b981' : '#333', strokeWidth: 2, opacity: 0.6 } },
      { id: 'e2-3', source: '2', target: '3', animated: step === 2, style: { stroke: step > 1 ? '#6DB5FF' : '#333', strokeWidth: 2, opacity: 0.6 } },
    ]);
  }, [step, uploadedFiles, handleUploadClick, handleGenerateClick, setNodes, setEdges, processingStatus, error, results, fileStatuses, downloadingKey, handleDownload, handleZipDownload]);

  const handleReset = useCallback(() => {
    setStep(0);
    setUploadedFiles([]);
    setProcessingStatus('idle');
    setError(null);
    setResults([]);
    setFileStatuses([]);
    
    setNodes(nds => nds.map(node => {
      if (node.id === '1') {
        return { ...node, data: { ...node.data, isUploading: false, isActive: true, hasFiles: false, fileName: '', isCompleted: false } };
      }
      if (node.id === '2') {
        return { ...node, data: { ...node.data, isActive: false, isCompleted: false, isGenerating: false, error: null } };
      }
      if (node.id === '3') {
        return { ...node, data: { ...node.data, results: [], isActive: false, isCompleted: false } };
      }
      return node;
    }));
    setEdges(eds => eds.map(edge => {
      edge.animated = false;
      edge.style = { ...edge.style, stroke: '#333' };
      return edge;
    }));
  }, [setNodes, setEdges]);

  const nodeConstraint: CoordinateExtent = [[0, 0], [1200, 600]];
  const cameraLock: CoordinateExtent = [[-100, -50], [1400, 800]];

  return (
    <div className="relative" style={{ width: '100%', height: '100%', background: '#0A0A0A' }}>
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        onNodesChange={onNodesChange} 
        onEdgesChange={onEdgesChange} 
        nodeTypes={nodeTypes}
        panOnScroll={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false} 
        autoPanOnNodeDrag={false} 
        translateExtent={cameraLock} 
        nodesDraggable={true}
        nodeExtent={nodeConstraint}
        fitView={true} 
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={2.5} color="rgba(255, 255, 255, 0.2)" />
      </ReactFlow>

      {step === 2 && (
        <button
          onClick={handleReset}
          className="absolute bottom-6 right-6 px-6 py-3 bg-[#FF5DE7] text-black font-bold text-sm rounded-full shadow-[0_0_20px_rgba(255,93,231,0.3)] hover:scale-105 transition-transform cursor-pointer z-50"
          style={{ fontFamily: 'var(--font-outfit), Outfit, sans-serif' }}
        >
          Make more flashcards
        </button>
      )}
    </div>
  );
}
