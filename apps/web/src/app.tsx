/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Check, Gift, X } from 'lucide-react';
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

const legendaryGiftOptions = [
  'KitKat Break Box',
  'Focus Desk Kit',
  'Coffee Refill Pass',
  'Premium Snack Pack',
  'Developer Hoodie',
  'Wireless Charger',
  'Team Pizza Drop',
  'Mystery Legendary Pack',
];

function isEngagementComplete(summary: Summary) {
  return summary.reward.tiers.some((tier) => tier.percent === 30 && tier.unlocked);
}

export default function App() {
  const [view, setView] = useState<AppView>('dashboard');
  const [isMediumStakeFormOpen, setIsMediumStakeFormOpen] = useState(false);
  const [isLegendaryGiftDialogOpen, setIsLegendaryGiftDialogOpen] = useState(false);
  const [shouldOpenLegendaryAfterLogin, setShouldOpenLegendaryAfterLogin] = useState(false);
  const [selectedLegendaryGift, setSelectedLegendaryGift] = useState(legendaryGiftOptions[0]);
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

    if (shouldOpenLegendaryAfterLogin) {
      setShouldOpenLegendaryAfterLogin(false);
      setIsLegendaryGiftDialogOpen(true);
    }
  }

  function handleLogout() {
    clearDeveloperProfile();
    setDeveloperProfile(null);
    setIsLegendaryGiftDialogOpen(false);
    setShouldOpenLegendaryAfterLogin(false);
  }

  function handleStartLegendaryGift() {
    if (!developerProfile) {
      setShouldOpenLegendaryAfterLogin(true);
      setIsMediumStakeFormOpen(true);
      return;
    }

    setIsLegendaryGiftDialogOpen(true);
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
              onStartLegendaryGift={handleStartLegendaryGift}
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

      {isLegendaryGiftDialogOpen && developerProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3">
          <div className="relative max-h-[calc(100vh-32px)] w-full max-w-[760px] overflow-auto border border-[#ffd84a] bg-brand-bg shadow-[0_0_40px_rgba(255,216,74,0.22)]">
            <button
              aria-label="Close Legendary Gift dialog"
              className="terminal-button absolute right-3 top-3 z-10 h-8 w-8 justify-center border-brand-border p-0 text-brand-gray"
              onClick={() => setIsLegendaryGiftDialogOpen(false)}
              type="button"
            >
              <X size={14} />
            </button>
            <section className="terminal-pane border-[#ffd84a]/60" data-active="true">
              <div className="terminal-pane-title">
                legendary-gift.tsx
                <span className="ml-auto text-brand-gray">100% unlock</span>
              </div>
              <div className="p-4 sm:p-5">
                <div className="mb-5 flex items-start gap-3 border-b border-brand-border pb-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center border border-[#ffd84a] text-[#ffd84a]">
                    <Gift size={18} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-title text-4xl uppercase leading-none text-[#ffd84a]">Choose Your Gift</h2>
                    <p className="mt-2 text-xs leading-relaxed text-brand-gray">
                      Logged in as {developerProfile.name}. Pick one legendary reward from 8 campaign parts.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {legendaryGiftOptions.map((giftOption, index) => {
                    const isSelected = selectedLegendaryGift === giftOption;

                    return (
                      <button
                        aria-pressed={isSelected}
                        className={[
                          'reward-card reward-card-gold flex min-h-[86px] items-center justify-between gap-3 p-4 text-left transition-colors',
                          isSelected ? 'reward-card-selected reward-card-ready' : '',
                        ].join(' ')}
                        key={giftOption}
                        onClick={() => setSelectedLegendaryGift(giftOption)}
                        type="button"
                      >
                        <span>
                          <span className="block text-[10px] uppercase text-brand-gray">part {index + 1}/8</span>
                          <span className="mt-1 block text-sm font-bold uppercase text-white">{giftOption}</span>
                        </span>
                        <span className="grid h-8 w-8 shrink-0 place-items-center border border-[#ffd84a] text-[#ffd84a]">
                          {isSelected && <Check size={16} />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  className="claim-now-button terminal-button mt-5 w-full justify-between font-bold"
                  onClick={() => setIsLegendaryGiftDialogOpen(false)}
                  type="button"
                >
                  <span>:confirm gift</span>
                  <span className="ml-auto">CONFIRM {selectedLegendaryGift}</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
