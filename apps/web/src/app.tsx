/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ActivityDashboard } from './components/activity-dashboard';
import { GeoBlockView } from './components/geo-block-view';
import { Header } from './components/header';
import { ProjectGateway } from './components/project-gateway';
import { RegistrationForm } from './components/registration-form';
import { Sidebar } from './components/sidebar';
import { useKitCodeServer } from './hooks/use-kitcode-server';
import type { Summary } from './lib/kitcode-api';

function isEngagementComplete(summary: Summary) {
  return summary.reward.tiers.some((tier) => tier.percent === 30 && tier.unlocked);
}

export default function App() {
  const [view, setView] = useState<'dashboard' | 'geoblock'>('dashboard');
  const [isMediumStakeFormOpen, setIsMediumStakeFormOpen] = useState(false);
  const kitCode = useKitCodeServer();
  const summary = kitCode.summary;
  const engagementComplete = summary ? isEngagementComplete(summary) : false;
  const shouldShowGateway = !kitCode.isConnected || !summary || summary.global.trackingProjects === 0;

  useEffect(() => {
    if (!engagementComplete) {
      setIsMediumStakeFormOpen(false);
    }
  }, [engagementComplete]);

  if (shouldShowGateway) {
    return (
      <ProjectGateway
        isChecking={kitCode.isChecking}
        isConnected={kitCode.isConnected}
        summary={summary}
      />
    );
  }

  if (!summary) {
    return null;
  }

  if (view === 'geoblock') {
    return (
      <>
        <GeoBlockView />
        <button 
          onClick={() => setView('dashboard')}
          className="terminal-button fixed top-4 right-4 z-50"
        >
          :bd dashboard
        </button>
      </>
    );
  }

  return (
    <div className="h-screen bg-brand-bg text-brand-gray font-mono selection:bg-brand-matcha selection:text-white flex flex-col overflow-hidden lg:p-3">
      <div className="terminal-frame flex min-h-0 flex-1 flex-col overflow-hidden">
        <Header 
          onNavigateGeoBlock={() => setView('geoblock')}
        />
      
        <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-auto p-3 lg:grid-cols-[280px_minmax(0,1fr)] lg:overflow-hidden">
          <Sidebar />
          <ActivityDashboard
            onStartMediumStake={() => setIsMediumStakeFormOpen(true)}
            summary={summary}
            onRedeem={kitCode.redeem}
          />
        </main>

        <footer className="vim-statusline h-9 shrink-0 justify-between border-t">
          <div className="flex min-w-0 items-center">
            <span className="vim-mode">NORMAL</span>
            <span className="vim-status-segment text-white">kit-code</span>
            <span className="vim-status-segment text-brand-matcha">main</span>
            <span className="vim-status-segment hidden sm:inline-flex">dashboard.tsx</span>
            <span className="vim-status-segment hidden md:inline-flex">BREAK. TRACK. BUILD.</span>
          </div>
          <div className="flex items-center">
            <span className="vim-status-segment hidden sm:inline-flex">utf-8</span>
            <span className="vim-status-segment">Top</span>
            <span className="vim-status-segment border-r-0 text-white">1:1</span>
          </div>
        </footer>
      </div>

      {isMediumStakeFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3">
          <div className="relative max-h-[calc(100vh-32px)] w-full max-w-[520px] overflow-auto border border-brand-matcha bg-brand-bg shadow-[0_0_36px_rgba(139,195,74,0.22)]">
            <button
              aria-label="Close Medium Stake form"
              className="terminal-button absolute right-3 top-3 z-10 h-8 w-8 justify-center border-brand-border p-0 text-brand-gray"
              onClick={() => setIsMediumStakeFormOpen(false)}
              type="button"
            >
              <X size={14} />
            </button>
            <RegistrationForm />
          </div>
        </div>
      )}
    </div>
  );
}
