"use client"

import React, { useState, useCallback, useEffect } from 'react';
import { NodeCanvas } from '@/components/canvas/NodeCanvas';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { FeatureRequestModal } from '@/components/modals/FeatureRequestModal';
import { AccountModal } from '@/components/modals/AccountModal';
import { HistoryPanel } from '@/components/sidebar/HistoryPanel';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { getLimits } from '@/lib/planLimits';

interface AppClientProps {
  user: any;
  profile: any;
}

export function AppClient({ user, profile }: AppClientProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [featureOpen, setFeatureOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountTab, setAccountTab] = useState<'profile' | 'billing' | 'danger'>('profile');
  const [historyOpen, setHistoryOpen] = useState(false);

  const plan = profile?.plan || 'free';
  const planLimits = getLimits(plan);

  const cycleResetDate = profile?.cycle_reset_at;
  const resetDate = cycleResetDate
    ? new Date(new Date(cycleResetDate).getTime() + 30 * 24 * 60 * 60 * 1000)
        .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : undefined;

  // Live usage state for demo
  const [usageData, setUsageData] = useState({
    used: profile?.pages_used_this_cycle ?? 14,
    limit: planLimits.pagesPerMonth,
    resetDate,
  });

  const refreshUsage = useCallback(async (newUsed?: number) => {
    if (typeof newUsed === 'number') {
      setUsageData(prev => ({ ...prev, used: newUsed }));
    }
  }, []);

  const handleSignOut = useCallback(() => {
    window.location.href = '/';
  }, []);

  const handleAccount = useCallback((tab?: 'profile' | 'billing' | 'danger') => {
    setAccountTab(tab || 'profile');
    setAccountOpen(true);
  }, []);

  return (
    <ToastProvider>
      <div className="flex w-full h-screen overflow-hidden bg-[var(--bg-canvas)]">
        <Sidebar
          user={{
            email: user.email,
            name: user.user_metadata?.full_name || profile?.full_name,
            avatar: user.user_metadata?.avatar_url,
          }}
          usage={usageData}
          plan={plan}
          onSignOut={handleSignOut}
          onSettings={() => setSettingsOpen(true)}
          onFeatureRequest={() => setFeatureOpen(true)}
          onHistory={() => setHistoryOpen(prev => !prev)}
          onAccount={() => handleAccount('profile')}
          onBilling={() => handleAccount('billing')}
          onUpgrade={() => {
            window.open('https://notes2cards.lemonsqueezy.com/checkout', '_blank');
          }}
        />
        <main className="flex-1 relative h-full">
          <NodeCanvas 
            onUsageRefresh={refreshUsage} 
            usageData={usageData}
            plan={plan}
          />
        </main>

        <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        <FeatureRequestModal isOpen={featureOpen} onClose={() => setFeatureOpen(false)} />
        <AccountModal
          isOpen={accountOpen}
          onClose={() => setAccountOpen(false)}
          initialTab={accountTab}
          user={user}
          profile={profile}
        />
        <HistoryPanel isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
      </div>
    </ToastProvider>
  );
}
