"use client"

import { useState, useEffect } from 'react';
import {
  UserRound,
  SlidersHorizontal,
  History,
  CreditCard,
  Sparkles,
  Pin, PinOff,
  LogOut,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SIDEBAR_COLLAPSED_W = 56;
const SIDEBAR_EXPANDED_W  = 220;

interface SidebarProps {
  user: {
    email?: string;
    name?: string;
    avatar?: string;
  };
  usage: {
    used: number;
    limit: number;
    resetDate?: string;
  };
  plan?: string;
  onSignOut?: () => void;
  onSettings?: () => void;
  onFeatureRequest?: () => void;
  onHistory?: () => void;
  onAccount?: () => void;
  onBilling?: () => void;
  onUpgrade?: () => void;
}

export function Sidebar({
  user, usage, plan = 'free',
  onSignOut, onSettings, onFeatureRequest,
  onHistory, onAccount, onBilling, onUpgrade,
}: SidebarProps) {
  const [expanded, setExpanded] = useState(false);
  const [pinned, setPinned] = useState(false);

  // Restore pin state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar_pinned');
      if (saved === 'true') {
        setPinned(true);
        setExpanded(true);
      }
    } catch {}
  }, []);

  const togglePin = () => {
    const next = !pinned;
    setPinned(next);
    setExpanded(next);
    try { localStorage.setItem('sidebar_pinned', String(next)); } catch {}
  };

  const handleMouseEnter = () => { if (!pinned) setExpanded(true); };
  const handleMouseLeave = () => { if (!pinned) setExpanded(false); };

  const isExpanded = expanded || pinned;
  const usagePercent = usage.limit > 0 ? (usage.used / usage.limit) * 100 : 0;
  const usageColor = usagePercent > 85 ? '#FF5DE7'
                   : usagePercent > 60 ? '#FEFA3D'
                   : '#6DB5FF';

  const showUpgrade = plan === 'free' || plan === 'monthly';

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'fixed',
        left: 0, top: 0, bottom: 0,
        width: isExpanded ? SIDEBAR_EXPANDED_W : SIDEBAR_COLLAPSED_W,
        background: 'rgba(13, 13, 13, 0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
        transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 8px',
        zIndex: 100,
        overflow: 'hidden',
        fontFamily: 'var(--font-outfit), Outfit, sans-serif',
      }}
    >
      {/* ── TOP SECTION ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

        {/* Brand Logo */}
        <div style={{ 
          padding: isExpanded ? '4px 12px 16px 12px' : '4px 8px 16px 8px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: isExpanded ? 'flex-start' : 'center',
          height: 48
        }}>
          {isExpanded ? (
            <img src="/logo-horizontal-dark.svg" alt="notes2cards" style={{ height: 26, width: 'auto' }} />
          ) : (
            <img src="/icon.svg" alt="notes2cards" style={{ height: 26, width: 26 }} />
          )}
        </div>

        {/* Profile */}
        <SidebarItem
          icon={
            user.avatar ? (
              <img
                src={user.avatar}
                alt=""
                style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6DB5FF 0%, #FF5DE7 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#000',
              }}>
                {(user.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
              </div>
            )
          }
          label={user.name || user.email?.split('@')[0] || 'Account'}
          sublabel={user.name ? user.email : undefined}
          expanded={isExpanded}
          onClick={onAccount}
        />

        {/* Usage arc */}
        <SidebarItem
          icon={
            <div style={{ position: 'relative', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" fill="none" />
                <circle cx="12" cy="12" r="9"
                  stroke={usageColor}
                  strokeWidth="2.5"
                  fill="none"
                  strokeDasharray={`${(Math.min(usagePercent, 100) / 100) * 56.5} 56.5`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.4s ease, stroke 0.3s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', fontSize: 8, fontWeight: 700, color: '#fff' }}>
                {usage.used}
              </div>
            </div>
          }
          label={`${usage.used} / ${usage.limit} pages this month`}
          sublabel={usage.resetDate ? `Resets ${usage.resetDate}` : undefined}
          expanded={isExpanded}
          onClick={onAccount}
        />

        <Divider />

        {/* Settings */}
        <SidebarItem
          icon={<SlidersHorizontal size={18} />}
          label="Settings"
          expanded={isExpanded}
          onClick={onSettings}
        />

        {/* History */}
        <SidebarItem
          icon={<History size={18} />}
          label="History"
          expanded={isExpanded}
          onClick={onHistory}
        />

        {/* Billing */}
        <SidebarItem
          icon={<CreditCard size={18} />}
          label="Billing"
          expanded={isExpanded}
          onClick={onBilling}
        />

        <Divider />

        {/* Feature Request */}
        <SidebarItem
          icon={<Sparkles size={18} />}
          label="Feedback"
          expanded={isExpanded}
          onClick={onFeatureRequest}
        />
      </div>

      {/* ── BOTTOM SECTION ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

        {/* Upgrade CTA */}
        {showUpgrade && (
          <SidebarItem
            icon={<Zap size={18} />}
            label="Upgrade"
            expanded={isExpanded}
            onClick={onUpgrade}
            gradient
          />
        )}

        {/* Pin / Unpin */}
        <SidebarItem
          icon={pinned ? <PinOff size={18} /> : <Pin size={18} />}
          label={pinned ? 'Unpin sidebar' : 'Pin sidebar'}
          expanded={isExpanded}
          onClick={togglePin}
          dimmed
        />

        {/* Sign out */}
        <SidebarItem
          icon={<LogOut size={18} />}
          label="Sign out"
          expanded={isExpanded}
          onClick={onSignOut}
          dimmed
        />
      </div>
    </div>
  );
}

/* ── Divider ── */
function Divider() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '6px 8px' }} />;
}

/* ── SidebarItem ── */
function SidebarItem({
  icon, label, sublabel, expanded, onClick, dimmed = false, gradient = false,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  expanded: boolean;
  onClick?: () => void;
  dimmed?: boolean;
  gradient?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const bg = gradient
    ? 'linear-gradient(135deg, rgba(255,93,231,0.25) 0%, rgba(109,181,255,0.25) 100%)'
    : hovered && onClick
      ? 'rgba(255,255,255,0.05)'
      : 'transparent';

  const textColor = gradient
    ? '#fff'
    : hovered && onClick
      ? '#fff'
      : dimmed
        ? 'rgba(255,255,255,0.35)'
        : 'rgba(255,255,255,0.65)';

  const iconColor = gradient
    ? '#fff'
    : hovered && onClick
      ? '#6DB5FF'
      : 'inherit';

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        background: bg,
        border: gradient ? '1px solid rgba(255,255,255,0.1)' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        width: '100%',
        textAlign: 'left',
        color: textColor,
        borderRadius: 10,
        transition: 'background 0.15s, color 0.15s',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        fontWeight: gradient ? 700 : 500,
        fontSize: 13,
        fontFamily: 'inherit',
      }}
    >
      {/* Icon — fixed width, always visible */}
      <div style={{
        width: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
        color: iconColor,
        transition: 'color 0.15s',
      }}>
        {icon}
      </div>

      {/* Label — only visible when expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}
          >
            <span style={{
              fontSize: 13,
              fontWeight: gradient ? 700 : 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {label}
            </span>
            {sublabel && (
              <span style={{ fontSize: 11, opacity: 0.45, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {sublabel}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
