"use client"

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { motion } from 'framer-motion'

const TABS = ['Appearance', 'Notifications', 'Defaults'] as const;
type TabName = typeof TABS[number];

const FOCUS_AREAS = [
  'Formulae & Equations',
  'Definitions',
  'Facts & Constants',
  'Questions & Answers',
  'Higher-Order Thinking',
  'Practical Application',
];

export function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<TabName>('Appearance');

  // ── Appearance state ──
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  // ── Notifications state ──
  const [notifyOnComplete, setNotifyOnComplete] = useState(true);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');

  // ── Defaults state ──
  const [defaultCardType, setDefaultCardType] = useState<'standard' | 'cloze'>('standard');
  const [defaultDepth, setDefaultDepth] = useState(3);
  const [defaultFocusAreas, setDefaultFocusAreas] = useState<string[]>(['Definitions', 'Facts & Constants']);

  // Load settings from localStorage on open
  useEffect(() => {
    try {
      // Font size
      const savedFontSize = localStorage.getItem('font_size') as 'small' | 'medium' | 'large' | null;
      if (savedFontSize && ['small', 'medium', 'large'].includes(savedFontSize)) {
        setFontSize(savedFontSize);
        document.documentElement.setAttribute('data-fontsize', savedFontSize);
      }

      // Notifications
      const savedNotify = localStorage.getItem('notify_on_complete');
      if (savedNotify !== null) setNotifyOnComplete(savedNotify === 'true');

      // Default card type
      const savedCardType = localStorage.getItem('default_card_type') as 'standard' | 'cloze' | null;
      if (savedCardType === 'standard' || savedCardType === 'cloze') setDefaultCardType(savedCardType);

      // Default depth (1–4 only)
      const savedDepth = localStorage.getItem('default_depth');
      if (savedDepth) {
        const d = parseInt(savedDepth, 10);
        if (d >= 1 && d <= 4) setDefaultDepth(d);
      }

      // Default focus areas
      const savedFocus = localStorage.getItem('default_focus_areas');
      if (savedFocus) {
        const parsed = JSON.parse(savedFocus);
        if (Array.isArray(parsed)) setDefaultFocusAreas(parsed);
      }

      if ('Notification' in window) setNotifPermission(Notification.permission);
    } catch {}
  }, [isOpen]);

  // ── Handlers ──

  const handleFontSize = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
    localStorage.setItem('font_size', size);
    // Apply via data attribute on <html> — CSS [data-fontsize] rule handles scaling
    document.documentElement.setAttribute('data-fontsize', size);
  };

  const handleNotifToggle = async () => {
    if (notifPermission === 'denied') return;
    if (notifPermission === 'default') {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm !== 'granted') return;
    }
    const next = !notifyOnComplete;
    setNotifyOnComplete(next);
    localStorage.setItem('notify_on_complete', String(next));
  };

  const handleCardType = (type: 'standard' | 'cloze') => {
    setDefaultCardType(type);
    localStorage.setItem('default_card_type', type);
  };

  const handleDepth = (d: number) => {
    setDefaultDepth(d);
    localStorage.setItem('default_depth', String(d));
  };

  const toggleFocusArea = (area: string) => {
    const next = defaultFocusAreas.includes(area)
      ? defaultFocusAreas.filter(a => a !== area)
      : [...defaultFocusAreas, area];
    setDefaultFocusAreas(next);
    localStorage.setItem('default_focus_areas', JSON.stringify(next));
  };

  if (!isOpen) return null;

  // 4-level depth labels matching the webapp ProcessingNode
  const depthLabels: Record<number, string> = {
    1: 'Summary',
    2: 'Standard',
    3: 'Detailed',
    4: 'Comprehensive',
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden"
        style={{
          background: 'var(--surface-modal)',
          borderColor: 'var(--border-subtle)',
          fontFamily: 'var(--font-outfit), Outfit, sans-serif',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }} className="hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 px-6 mb-4">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 text-xs rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="h-px bg-white/[0.06] mx-6" />

        {/* Tab content */}
        <div className="px-6 py-5 min-h-[240px]">

          {/* ── APPEARANCE ── */}
          {activeTab === 'Appearance' && (
            <div className="flex flex-col gap-6">

              {/* Font size */}
              <div>
                <div className="text-[14px] font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                  Font size
                </div>
                <div className="flex gap-2">
                  {(['small', 'medium', 'large'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => handleFontSize(size)}
                      className={`flex-1 py-2 text-xs rounded-lg border transition-colors capitalize ${
                        fontSize === size
                          ? 'bg-white/10 border-white/20 text-white'
                          : 'border-white/8 text-white/40 hover:text-white/70'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
                  Takes effect immediately across the entire app.
                </p>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === 'Notifications' && (
            <div className="flex flex-col gap-6">
              {/* Browser notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    Notify when generation completes
                  </div>
                  {notifPermission === 'denied' && (
                    <div className="text-[11px] text-[#FF5DE7] mt-1">
                      Blocked in browser settings. Enable in your browser → Site Settings.
                    </div>
                  )}
                </div>
                <button
                  onClick={handleNotifToggle}
                  disabled={notifPermission === 'denied'}
                  className="w-12 h-6 rounded-full relative transition-colors border border-white/10 disabled:opacity-30"
                  style={{
                    backgroundColor: notifyOnComplete && notifPermission !== 'denied'
                      ? '#6DB5FF'
                      : 'rgba(255,255,255,0.1)',
                  }}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-[3px] transition-all ${
                      notifyOnComplete && notifPermission !== 'denied' ? 'left-[27px]' : 'left-[3px]'
                    }`}
                  />
                </button>
              </div>

              {/* Email notifications (placeholder) */}
              <div className="flex items-center justify-between opacity-40">
                <div>
                  <div className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    Email me when generation completes
                  </div>
                  <div className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    Coming soon
                  </div>
                </div>
                <button
                  disabled
                  className="w-12 h-6 rounded-full relative transition-colors border border-white/10 cursor-not-allowed"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <div className="w-4 h-4 rounded-full bg-white absolute top-[3px] left-[3px]" />
                </button>
              </div>
            </div>
          )}

          {/* ── DEFAULTS ── */}
          {activeTab === 'Defaults' && (
            <div className="flex flex-col gap-6">

              {/* Default card type */}
              <div>
                <div className="text-[14px] font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                  Default card type
                </div>
                <div className="flex gap-2">
                  {([{ key: 'standard', label: 'Standard Q&A' }, { key: 'cloze', label: 'Cloze Deletion' }] as const).map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => handleCardType(opt.key)}
                      className={`flex-1 py-2.5 text-xs rounded-lg border transition-colors ${
                        defaultCardType === opt.key
                          ? 'bg-[#6DB5FF]/20 border-[#6DB5FF] text-[#6DB5FF]'
                          : 'border-white/10 text-white/50 hover:text-white/70'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default depth — 4 levels only, matching the webapp */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    Coverage depth
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {depthLabels[defaultDepth] ?? 'Standard'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={defaultDepth}
                  onChange={e => handleDepth(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none bg-white/10 accent-[#6DB5FF] cursor-grab active:cursor-grabbing"
                />
                <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  <span>Summary</span>
                  <span>Comprehensive</span>
                </div>
              </div>

              {/* Default focus areas */}
              <div>
                <div className="text-[14px] font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                  Default focus areas
                </div>
                <div className="flex flex-col gap-2">
                  {FOCUS_AREAS.map(area => (
                    <label
                      key={area}
                      className="flex items-center gap-3 cursor-pointer text-[13px] transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <input
                        type="checkbox"
                        checked={defaultFocusAreas.includes(area)}
                        onChange={() => toggleFocusArea(area)}
                        className="w-[16px] h-[16px] rounded border-white/20 bg-transparent checked:bg-[#6DB5FF] checked:border-[#6DB5FF] cursor-pointer"
                      />
                      {area}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
