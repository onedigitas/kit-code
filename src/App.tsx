/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ActivityDashboard } from './components/ActivityDashboard';
import { Header } from './components/Header';
import { RegistrationForm } from './components/RegistrationForm';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';
import { GeoBlockView } from './components/GeoBlockView';

export default function App() {
  const [isToastOpen, setIsToastOpen] = useState(true);
  const [view, setView] = useState<'dashboard' | 'geoblock'>('dashboard');

  if (view === 'geoblock') {
    return (
      <>
        <GeoBlockView />
        <button 
          onClick={() => setView('dashboard')}
          className="fixed top-4 right-4 z-50 border border-brand-border bg-brand-bg px-4 py-2 text-[10px] text-brand-gray uppercase tracking-widest hover:text-white hover:border-brand-gray transition-colors rounded-sm"
        >
          Back to Dashboard
        </button>
      </>
    );
  }

  return (
    <div className="h-screen bg-brand-bg text-brand-gray font-mono selection:bg-brand-red selection:text-white flex flex-col overflow-hidden">
      <Header 
        onToggleToast={() => setIsToastOpen(!isToastOpen)} 
        onNavigateGeoBlock={() => setView('geoblock')}
      />
      
      <main className="flex-1 flex overflow-hidden px-6 gap-8">
        <Sidebar />
        <RegistrationForm />
        <ActivityDashboard onOpenToast={() => setIsToastOpen(true)} />
      </main>

      <footer className="border-t border-brand-border py-4 px-6 flex justify-between text-[10px] text-brand-gray uppercase tracking-widest shrink-0">
        <div className="flex gap-4">
          <span className="text-brand-red">COMMIT THE BREAK</span>
          <span>•</span>
          <span>BREAK. TRACK. BUILD.</span>
          <span>•</span>
          <span>EVERY SYMBOL COUNTS.</span>
        </div>
        <div className="flex gap-6">
          <span>© 2024 Commit The Break. All rights reserved.</span>
          <span>•</span>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <span>•</span>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <span>•</span>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </footer>

      {isToastOpen && <Toast onClose={() => setIsToastOpen(false)} />}
    </div>
  );
}
