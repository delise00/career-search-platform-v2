/**
 * Main Application View with Tabs for Jobs, Saved Jobs, CV Builder, and CV Scorer
 */

import React from 'react';
import { CareerProvider, useCareer } from './context/CareerContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { JobSearch } from './components/JobSearch.tsx';
import { CvBuilder } from './components/CvBuilder.tsx';
import { CvScorer } from './components/CvScorer.tsx';
import { McpHealthModal } from './components/McpHealthModal.tsx';
import { Server, FileText, Target, Briefcase } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, setIsMcpModalOpen, theme } = useCareer();

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      theme === 'dark'
        ? 'bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200'
        : 'bg-slate-50 text-slate-900 selection:bg-cyan-500/30 selection:text-cyan-800'
    }`}>
      <Navbar />

      <main className="flex-1 pb-16">
        {activeTab === 'search' || activeTab === 'saved' ? (
          <JobSearch />
        ) : activeTab === 'cv-builder' ? (
          <CvBuilder />
        ) : (
          <CvScorer />
        )}
      </main>

      {/* Developer Multi-MCP Health Modal */}
      <McpHealthModal />

      {/* Footer */}
      <footer className={`border-t py-6 text-xs transition-colors duration-200 ${
        theme === 'dark'
          ? 'border-slate-800/80 bg-slate-900/60 text-slate-400'
          : 'border-slate-200 bg-white text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">Career Navigator Platform</span>
            <span>•</span>
            <span className="text-cyan-500">JobDataLake MCP</span>
            <span>•</span>
            <span className="text-emerald-500">CVpop MCP</span>
            <span>•</span>
            <span className="text-purple-500">Calibrd MCP</span>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="/api/mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-500 transition-colors flex items-center space-x-1 font-mono text-[11px]"
            >
              <Server className="w-3.5 h-3.5" />
              <span>/api/mcp Status</span>
            </a>

            <button
              onClick={() => setIsMcpModalOpen(true)}
              className="hover:text-cyan-500 transition-colors flex items-center space-x-1 font-mono text-[11px]"
            >
              <Server className="w-3.5 h-3.5" />
              <span>MCP Ecosystem Health</span>
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
