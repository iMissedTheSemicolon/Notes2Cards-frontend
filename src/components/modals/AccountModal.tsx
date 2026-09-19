"use client"

import { useState, useEffect } from 'react'
import { X, Zap, Star, CreditCard } from 'lucide-react'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/ToastProvider'
import { getLimits } from '@/lib/planLimits'

const TABS = ['Profile', 'Plan & Billing', 'Danger Zone'] as const;
type TabName = typeof TABS[number];

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'profile' | 'billing' | 'danger';
  user: any;
  profile: any;
}

const TAB_MAP: Record<string, TabName> = {
  profile: 'Profile',
  billing: 'Plan & Billing',
  danger: 'Danger Zone',
};

export function AccountModal({ isOpen, onClose, initialTab = 'profile', user, profile }: AccountModalProps) {
  const [activeTab, setActiveTab] = useState<TabName>(TAB_MAP[initialTab] || 'Profile');
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const supabase = createClient();
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      setActiveTab(TAB_MAP[initialTab] || 'Profile');
      setFullName(user?.user_metadata?.full_name || profile?.full_name || '');
      setShowDeleteDialog(false);
      setDeleteConfirm('');
    }
  }, [isOpen, initialTab, user, profile]);

  if (!isOpen) return null;

  const plan = profile?.plan || 'free';
  const planLimits = getLimits(plan);
  const pagesUsed = profile?.pages_used_this_cycle || 0;
  const pageLimit = planLimits.pagesPerMonth;
  const usagePercent = pageLimit > 0 ? Math.min((pagesUsed / pageLimit) * 100, 100) : 0;

  const resetDate = profile?.cycle_reset_at
    ? new Date(profile.cycle_reset_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'N/A';

  const handleSaveProfile = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    toast.success('Profile updated ✓ (Demo mode)');
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    setDeleting(true);
    await new Promise(r => setTimeout(r, 400));
    window.location.href = '/';
  };
    setDeleting(false);
  };

  const planConfig: Record<string, { icon: React.ReactNode; label: string; price: string; detail: string; color: string }> = {
    free: {
      icon: <Zap size={16} />,
      label: 'Free Plan',
      price: '$0',
      detail: `${pageLimit} pages / month · Resets ${resetDate}`,
      color: '#6DB5FF',
    },
    monthly: {
      icon: <CreditCard size={16} />,
      label: 'Monthly Plan',
      price: '$5 / month',
      detail: `${pageLimit} pages / month · Next billing: ${resetDate}`,
      color: '#6DB5FF',
    },
    annual: {
      icon: <CreditCard size={16} />,
      label: 'Annual Plan',
      price: '$32 / year',
      detail: `${pageLimit} pages / month · Next billing: ${resetDate}`,
      color: '#6DB5FF',
    },
    lifetime: {
      icon: <Star size={16} />,
      label: 'Lifetime Plan',
      price: 'One-time purchase',
      detail: `${pageLimit} pages / month · Forever · No renewals`,
      color: '#FF5DE7',
    },
  };

  const currentPlan = planConfig[plan] || planConfig.free;

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
        className="w-full max-w-md rounded-2xl bg-[#0D0D0D] border border-[rgba(255,255,255,0.1)] shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ fontFamily: 'var(--font-outfit), Outfit, sans-serif' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-lg font-bold text-white">Account</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 px-6 mb-4">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-xs rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? tab === 'Danger Zone' ? 'bg-red-500/10 text-red-400' : 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="h-px bg-white/[0.06] mx-6" />

        {/* Tab content */}
        <div className="px-6 py-5 min-h-[280px]">

          {/* ── Profile ── */}
          {activeTab === 'Profile' && (
            <div className="flex flex-col gap-5">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: user?.user_metadata?.avatar_url ? 'transparent' : 'linear-gradient(135deg, #6DB5FF, #FF5DE7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, fontWeight: 700, color: '#000',
                  overflow: 'hidden', flexShrink: 0,
                }}>
                  {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (fullName?.[0] || user?.email?.[0] || 'U').toUpperCase()
                  )}
                </div>
                <div className="text-[12px] text-white/30">Change photo — coming soon</div>
              </div>

              {/* Name */}
              <div>
                <label className="text-[12px] text-white/50 uppercase tracking-wider mb-2 block">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2.5 outline-none focus:border-[#6DB5FF] transition-colors text-[14px] text-white"
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="text-[12px] text-white/50 uppercase tracking-wider mb-2 block">Email</label>
                <div className="w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg px-4 py-2.5 text-[14px] text-white/50">
                  {user?.email || '—'}
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full py-2.5 bg-white text-black rounded-lg font-bold text-sm transition-all hover:bg-gray-200 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          )}

          {/* ── Plan & Billing ── */}
          {activeTab === 'Plan & Billing' && (
            <div className="flex flex-col gap-5">
              {/* Current plan card */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ color: currentPlan.color }}>{currentPlan.icon}</span>
                  <span className="text-[14px] font-bold text-white">{currentPlan.label}</span>
                </div>
                <div className="text-[13px] text-white/60 mb-3">{currentPlan.detail}</div>
                {plan === 'free' && (
                  <button
                    onClick={() => window.location.href = '/#pricing'}
                    className="text-[13px] font-bold text-[#6DB5FF] hover:underline"
                  >
                    Upgrade to Pro →
                  </button>
                )}
                {(plan === 'monthly' || plan === 'annual') && (
                  <button
                    onClick={() => window.open('https://notes2cards.lemonsqueezy.com/billing', '_blank')}
                    className="text-[13px] font-bold text-[#6DB5FF] hover:underline"
                  >
                    Manage subscription →
                  </button>
                )}
              </div>

              {/* Usage bar */}
              <div>
                <div className="text-[12px] text-white/50 uppercase tracking-wider mb-2">Usage this month</div>
                <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${usagePercent}%`,
                      background: usagePercent > 85 ? '#FF5DE7' : usagePercent > 60 ? '#FEFA3D' : '#6DB5FF',
                    }}
                  />
                </div>
                <div className="text-[12px] text-white/50">
                  {pagesUsed} pages used · {Math.max(0, pageLimit - pagesUsed)} remaining · Resets {resetDate}
                </div>
              </div>

              {/* Billing history */}
              <div>
                <div className="text-[12px] text-white/50 uppercase tracking-wider mb-2">Payment History</div>
                {plan === 'free' ? (
                  <div className="text-[13px] text-white/30 italic">No payments yet. Upgrade to see billing history.</div>
                ) : (
                  <div className="text-[13px] text-white/30 italic">Payment history is not available yet.</div>
                )}
              </div>
            </div>
          )}

          {/* ── Danger Zone ── */}
          {activeTab === 'Danger Zone' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/[0.03]">
                <div className="text-[14px] font-bold text-red-400 mb-2">Delete your account</div>
                <div className="text-[13px] text-white/50 mb-4 leading-relaxed">
                  All your data will be permanently deleted. This cannot be undone.
                </div>

                {!showDeleteDialog ? (
                  <button
                    onClick={() => setShowDeleteDialog(true)}
                    className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-[13px] font-bold hover:bg-red-500/30 transition-colors"
                  >
                    Delete my account
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="text-[13px] text-white/70">Are you sure? Type <span className="font-bold text-red-400">DELETE</span> to confirm.</div>
                    <input
                      type="text"
                      value={deleteConfirm}
                      onChange={e => setDeleteConfirm(e.target.value)}
                      placeholder="Type DELETE"
                      className="w-full bg-[rgba(255,255,255,0.03)] border border-red-500/20 rounded-lg px-4 py-2 outline-none text-[14px] text-white focus:border-red-500/50"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setShowDeleteDialog(false); setDeleteConfirm(''); }}
                        className="flex-1 py-2 border border-white/10 rounded-lg text-[13px] text-white/50 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirm !== 'DELETE' || deleting}
                        className="flex-1 py-2 bg-red-500 text-white rounded-lg text-[13px] font-bold disabled:opacity-30 hover:bg-red-600 transition-colors"
                      >
                        {deleting ? 'Deleting...' : 'Permanently delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
