/**
 * Main Job Search Application (Indeed MCP Only)
 */

import React from 'react';
import { CareerProvider, useCareer } from './context/CareerContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { JobSearch } from './components/JobSearch.tsx';
import { McpHealthModal } from './components/McpHealthModal.tsx';
import { Server } from 'lucide-react';

const MainContent: React.FC = () => {
  const { setIsMcpModalOpen } = useCareer();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      <main className="flex-1 pb-16">
        <JobSearch />
      </main>

      {/* Developer Indeed MCP Health Modal */}
      <McpHealthModal />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-300">Indeed MCP Job Search</span>
            <span>•</span>
            <span>Connected via Model Context Protocol</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMcpModalOpen(true)}
              className="hover:text-cyan-400 transition-colors flex items-center space-x-1 font-mono text-[11px]"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Indeed MCP Diagnostics</span>
            </button>
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
