'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkle, Bug, ChatTeardropText, Wrench } from '@phosphor-icons/react';

// ─── Replace these with your actual Tally form IDs ───────────────────────────
const TALLY_FEATURE_REQUEST_ID = 'YOUR_FEATURE_REQUEST_FORM_ID';
const TALLY_BUG_REPORT_ID      = 'YOUR_BUG_REPORT_FORM_ID';
const TALLY_OTHER_ID           = 'YOUR_GENERAL_QUESTIONS_FORM_ID';
// ─────────────────────────────────────────────────────────────────────────────

type Tab = 'feature' | 'bug' | 'other';

const tabs: { id: Tab; label: string; icon: React.ElementType; color: string; desc: string }[] = [
  { id: 'feature', label: 'Feature Request', icon: Sparkle, color: '#FF5DE7', desc: 'Got an idea that would make notes2cards better? We want to hear it.' },
  { id: 'bug',     label: 'Report a Bug',    icon: Bug, color: '#00FF88', desc: 'Something broken? Tell us exactly what happened and we\'ll fix it fast.' },
  { id: 'other',   label: 'Other',           icon: ChatTeardropText, color: '#6DB5FF', desc: 'General questions, account help, or anything else on your mind.' },
];

export default function ContactPage() {
  const [active, setActive] = useState<Tab>('feature');

  const currentTab = tabs.find(t => t.id === active)!;

  const tallyId = active === 'feature'
    ? TALLY_FEATURE_REQUEST_ID
    : active === 'bug'
    ? TALLY_BUG_REPORT_ID
    : TALLY_OTHER_ID;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        color: '#fff',
        fontFamily: 'var(--font-outfit, Outfit, sans-serif)',
        padding: '0',
      }}
    >
      {/* ── Background glow ───────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(109,181,255,0.08) 0%, transparent 70%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto', padding: '60px 24px 100px' }}>

        {/* ── Nav ─────────────────────────────────────────────────────────── */}
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: '#6DB5FF', textDecoration: 'none', fontSize: 14, marginBottom: 48,
          opacity: 0.8, transition: 'opacity 0.2s',
        }}>
          ← Back to Home
        </Link>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, rgba(109,181,255,0.15), rgba(0,255,136,0.1))',
            border: '1px solid rgba(109,181,255,0.25)',
            borderRadius: 12, padding: '6px 16px', fontSize: 13,
            color: '#6DB5FF', marginBottom: 20, fontWeight: 500,
          }}>
            We actually read every message
          </div>
          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, lineHeight: 1.15,
            margin: '0 0 16px',
            background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Get in Touch
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 17, lineHeight: 1.6, maxWidth: 520 }}>
            We respond to every message within 24 hours. Feature requests go straight to our product backlog.
          </p>
        </div>

        {/* ── Tab Switcher ─────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 32,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14, padding: 6,
        }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isSelected = active === tab.id;
            return (
              <button
                key={tab.id}
                id={`contact-tab-${tab.id}`}
                onClick={() => setActive(tab.id)}
                style={{
                  flex: 1, padding: '10px 16px',
                  borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: 500, transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(109,181,255,0.2), rgba(109,181,255,0.08))'
                    : 'transparent',
                  color: isSelected ? '#6DB5FF' : 'rgba(255,255,255,0.45)',
                  boxShadow: isSelected
                    ? 'inset 0 0 0 1px rgba(109,181,255,0.3)'
                    : 'none',
                }}
              >
                <Icon size={18} weight="duotone" color={isSelected ? '#6DB5FF' : tab.color} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Tab description ───────────────────────────────────────────────── */}
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
          {currentTab.desc}
        </p>

        {/* ── Tally form OR "Other" fallback ────────────────────────────────── */}
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, overflow: 'hidden',
          minHeight: 340,
        }}>
          {tallyId && !tallyId.startsWith('YOUR_') ? (
            /* ── Tally embed ──── */
            <iframe
              data-tally-src={`https://tally.so/embed/${tallyId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`}
              loading="lazy"
              width="100%"
              height="420"
              frameBorder="0"
              style={{ display: 'block', minHeight: 340 }}
              title={currentTab.label}
            />
          ) : (
            /* ── Placeholder (before form ID is added) ──── */
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', minHeight: 340, padding: 48, textAlign: 'center',
            }}>
              <div style={{ marginBottom: 16 }}>
                <Wrench size={40} weight="duotone" color="#6DB5FF" />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>
                Form coming soon — check back shortly!
              </p>
            </div>
          )}
        </div>

        {/* ── Response time badge ────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginTop: 24,
          color: 'rgba(255,255,255,0.3)', fontSize: 13,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00FF88', display: 'inline-block' }} />
          Typical response time: under 24 hours
        </div>
      </div>

      {/* ── Load Tally embed script ────────────────────────────────────────── */}
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script async src="https://tally.so/widgets/embed.js" />
    </div>
  );
}
