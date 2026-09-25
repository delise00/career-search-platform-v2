/**
 * Main Career Navigator Application
 */

import React from 'react';
import { CareerProvider, useCareer } from './context/CareerContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { JobSearch } from './components/JobSearch.tsx';
import { ResumeScreening } from './components/ResumeScreening.tsx';
import { JobCompatibility } from './components/JobCompatibility.tsx';
import { ApplicationAssistant } from './components/ApplicationAssistant.tsx';
import { InterviewPrep } from './components/InterviewPrep.tsx';
import { ApplicationTracker } from './components/ApplicationTracker.tsx';
import { McpHealthModal } from './components/McpHealthModal.tsx';
import { Server, ShieldCheck, ExternalLink, Heart } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setIsMcpModalOpen, mcpHealth } = useCareer();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      <main className="flex-1 pb-16">
        {activeTab === 'jobs' && <JobSearch />}
        {activeTab === 'resume' && <ResumeScreening />}
        {activeTab === 'match' && <JobCompatibility />}
        {activeTab === 'assistant' && <ApplicationAssistant />}
        {activeTab === 'interview' && <InterviewPrep />}
        {activeTab === 'applications' && <ApplicationTracker />}
      </main>

      {/* Developer MCP Health Modal */}
      <McpHealthModal />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-300">Career Navigator</span>
            <span>•</span>
            <span>Powered by Model Context Protocol (MCP) Clients</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMcpModalOpen(true)}
              className="hover:text-cyan-400 transition-colors flex items-center space-x-1 font-mono text-[11px]"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Developer MCP Status</span>
            </button>
            <span>•</span>
            <span className="text-slate-500 font-mono text-[11px]">
              Alignd with Singapore Skills Framework
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <CareerProvider>
      <MainContent />
    </CareerProvider>
  );
}
