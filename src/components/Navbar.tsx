import React from 'react';
import { useCareer } from '../context/CareerContext.tsx';
import { Briefcase, Bookmark, Server, Sun, Moon, FileText, Target } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    savedJobs,
    setIsMcpModalOpen,
    theme,
    toggleTheme,
  } = useCareer();

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setActiveTab('search')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-900/40">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">Job Search</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  JobDataLake
                </span>
              </div>
              <p className="text-xs text-slate-400">Powered by JobDataLake MCP Server</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'search'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Jobs</span>
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'saved'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved</span>
              {savedJobs.length > 0 && (
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {savedJobs.length}
                </span>
              )}
            </button>

            {/* CV Builder Tab (CVpop MCP) */}
            <button
              onClick={() => setActiveTab('cv-builder')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'cv-builder'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Draft CV</span>
            </button>

            {/* Match Scorer Tab (Calibrd MCP) */}
            <button
              onClick={() => setActiveTab('cv-scorer')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'cv-scorer'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Score CV</span>
            </button>
          </nav>

          {/* Controls: Theme Toggle & MCP Ecosystem Status */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-700/80 bg-slate-800/80 text-slate-300 hover:text-cyan-400 hover:border-slate-600 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-cyan-300" />
              )}
            </button>

            {/* MCP Health Check Button */}
            <button
              onClick={() => setIsMcpModalOpen(true)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300"
              title="Inspect JobDataLake, CVpop, and Calibrd MCP connections"
            >
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">MCP Status (3)</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
