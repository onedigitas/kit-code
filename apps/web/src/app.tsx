/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ActivityDashboard } from './components/activity-dashboard';
import { GeoBlockView } from './components/geo-block-view';
import { Header } from './components/header';
import { ProjectGateway } from './components/project-gateway';
import { RegistrationForm } from './components/registration-form';
import { Sidebar } from './components/sidebar';
import { useKitCodeServer } from './hooks/use-kitcode-server';

export default function App() {
  const [view, setView] = useState<'dashboard' | 'geoblock'>('dashboard');
  const kitCode = useKitCodeServer();
  const summary = kitCode.summary;
  const shouldShowGateway = !kitCode.isConnected || !summary || summary.global.trackingProjects === 0;

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
      
        <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-auto p-3 lg:grid-cols-[240px_minmax(300px,360px)_minmax(0,1fr)] lg:overflow-hidden">
          <Sidebar />
          <RegistrationForm />
          <ActivityDashboard
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

    </div>
  );
}
