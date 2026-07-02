/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ActivityDashboard } from './components/activity-dashboard';
import { AdminPage } from './components/admin-page';
import { GeoBlockView } from './components/geo-block-view';
import { Header } from './components/header';
import { ProjectGateway } from './components/project-gateway';
import { RegistrationForm } from './components/registration-form';
import { Sidebar } from './components/sidebar';
import { useKitCodeServer } from './hooks/use-kitcode-server';
import {
  clearDeveloperProfile,
  createDeveloperProfile,
  DeveloperProfile,
  DeveloperProfileInput,
  readDeveloperProfile,
  writeDeveloperProfile,
} from './lib/developer-profile';
import type { Summary } from './lib/kitcode-api';

type AppView = 'dashboard' | 'admin' | 'geoblock';

function isEngagementComplete(summary: Summary) {
  return summary.reward.tiers.some((tier) => tier.percent === 30 && tier.unlocked);
}

export default function App() {
  const [view, setView] = useState<AppView>('dashboard');
  const [isMediumStakeFormOpen, setIsMediumStakeFormOpen] = useState(false);
  const [developerProfile, setDeveloperProfile] = useState<DeveloperProfile | null>(() => readDeveloperProfile());
  const kitCode = useKitCodeServer();
  const summary = kitCode.summary;
  const engagementComplete = summary ? isEngagementComplete(summary) : false;
  const shouldShowGateway = !kitCode.isConnected || !summary || summary.global.trackingProjects === 0;

  useEffect(() => {
    if (!engagementComplete) {
      setIsMediumStakeFormOpen(false);
    }
  }, [engagementComplete]);

  function handleRegistrationSubmit(profileInput: DeveloperProfileInput) {
    const profile = createDeveloperProfile(profileInput);

    writeDeveloperProfile(profile);
    setDeveloperProfile(profile);
    setIsMediumStakeFormOpen(false);
  }

  function handleLogout() {
    clearDeveloperProfile();
    setDeveloperProfile(null);
  }

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
    <div className="h-screen bg-brand-bg text-brand-gray font-mono selection:bg-brand-matcha selection:text-white flex flex-col overflow-hidden lg:px-3 lg:py-2">
      <div className="terminal-frame flex min-h-0 flex-1 flex-col overflow-hidden">
        <Header
          activeView={view}
          onNavigateAdmin={() => setView('admin')}
          onNavigateDashboard={() => setView('dashboard')}
          onNavigateGeoBlock={() => setView('geoblock')}
        />
      
        <main
          className={[
            'grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden px-3 py-0',
            view === 'admin' ? 'lg:grid-cols-1' : 'lg:grid-cols-[280px_minmax(0,1fr)]',
          ].join(' ')}
        >
          {view !== 'admin' && <Sidebar developerProfile={developerProfile} onLogout={handleLogout} />}
          {view === 'admin' ? (
            <AdminPage />
          ) : (
            <ActivityDashboard
              onStartMediumStake={() => setIsMediumStakeFormOpen(true)}
              summary={summary}
              onRedeem={kitCode.redeem}
            />
          )}
        </main>
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
            <RegistrationForm onSubmit={handleRegistrationSubmit} />
          </div>
        </div>
      )}
    </div>
  );
}
