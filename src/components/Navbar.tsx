import React from 'react';
import { useCareer, AppTab } from '../context/CareerContext.tsx';
import {
  Briefcase,
  FileText,
  Target,
  Sparkles,
  HelpCircle,
  FolderGit2,
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedJob,
    currentResume,
    savedApplications,
    mcpHealth,
    isHealthChecking,
    setIsMcpModalOpen,
  } = useCareer();

  const navItems: { id: AppTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'jobs', label: 'Jobs', icon: <Briefcase className="w-4 h-4" /> },
    {
      id: 'resume',
      label: 'My Resume',
      icon: <FileText className="w-4 h-4" />,
      badge: currentResume ? 'Extracted' : undefined,
    },
    {
      id: 'match',
      label: 'Career Matches',
      icon: <Target className="w-4 h-4" />,
      badge: selectedJob ? selectedJob.title.split(' ')[0] : undefined,
    },
    { id: 'assistant', label: 'Application Assistant', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'interview', label: 'Interview Prep', icon: <HelpCircle className="w-4 h-4" /> },
    {
      id: 'applications',
      label: 'Tracker',
      icon: <FolderGit2 className="w-4 h-4" />,
      badge: savedApplications.length > 0 ? savedApplications.length : undefined,
    },
  ];

  // MCP Connection summary
  const totalServers = mcpHealth?.servers.length || 3;
  const connectedServers = mcpHealth?.servers.filter((s) => s.status === 'connected').length || 0;
  const isSimulated = mcpHealth?.localFallbackActive && connectedServers === 0;

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-sm">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('jobs')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-900/40">
              <CompassIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">Career Navigator</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-indigo-900/80 text-indigo-300 border border-indigo-700/50">
                  MCP Protocol
                </span>
              </div>
              <p className="text-xs text-slate-400">Singapore Skills Framework &amp; Verified Matching</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700/70 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                        isActive
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Developer MCP Health Indicator */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMcpModalOpen(true)}
              className="group flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all bg-slate-950/80 border-slate-800 hover:border-slate-700"
              title="Click to open MCP Server Health & Tool Discovery inspector"
            >
              <Server className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <div className="flex items-center space-x-1.5">
                <span className="relative flex h-2 w-2">
                  {connectedServers > 0 ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </>
                  ) : isSimulated ? (
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  )}
                </span>
                <span className="text-slate-300 font-medium">
                  {connectedServers > 0
                    ? `MCP: ${connectedServers}/${totalServers} Live`
                    : isSimulated
                    ? 'MCP: Skills Local'
                    : 'MCP: Disconnected'}
                </span>
              </div>
              <Activity className={`w-3 h-3 text-slate-500 ${isHealthChecking ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer Row */}
      <div className="md:hidden flex overflow-x-auto py-2 px-4 space-x-2 border-t border-slate-800 bg-slate-950/50 no-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap font-medium ${
              activeTab === item.id
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Primary Workflow Guidance Bar */}
      <div className="bg-slate-950 border-t border-slate-800/80 px-4 py-2 hidden lg:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">Workflow:</span>
            <div className="flex items-center space-x-1.5">
              <WorkflowStep
                num={1}
                label="Search Jobs"
                done={Boolean(selectedJob)}
                active={activeTab === 'jobs'}
                onClick={() => setActiveTab('jobs')}
              />
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <WorkflowStep
                num={2}
                label="Screen Resume"
                done={Boolean(currentResume)}
                active={activeTab === 'resume'}
                onClick={() => setActiveTab('resume')}
              />
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <WorkflowStep
                num={3}
                label="Compatibility Match"
                active={activeTab === 'match'}
                onClick={() => setActiveTab('match')}
              />
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <WorkflowStep
                num={4}
                label="Tailor & Cover Letter"
                active={activeTab === 'assistant'}
                onClick={() => setActiveTab('assistant')}
              />
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <WorkflowStep
                num={5}
                label="Interview Prep"
                active={activeTab === 'interview'}
                onClick={() => setActiveTab('interview')}
              />
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <WorkflowStep
                num={6}
                label="Application Tracker"
                done={savedApplications.length > 0}
                active={activeTab === 'applications'}
                onClick={() => setActiveTab('applications')}
              />
            </div>
          </div>

          {selectedJob && (
            <div className="flex items-center space-x-2 text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded">
              <span className="text-slate-400">Active Target:</span>
              <span className="font-medium truncate max-w-xs">{selectedJob.title}</span>
              <span className="text-slate-500">@</span>
              <span className="text-slate-300">{selectedJob.company}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const WorkflowStep: React.FC<{
  num: number;
  label: string;
  done?: boolean;
  active?: boolean;
  onClick: () => void;
}> = ({ num, label, done, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-1 px-2 py-0.5 rounded transition-colors ${
        active
          ? 'bg-cyan-900/60 text-cyan-300 font-semibold'
          : done
          ? 'text-emerald-400 hover:bg-slate-900'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
      }`}
    >
      <span
        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono ${
          done
            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
            : active
            ? 'bg-cyan-600 text-white'
            : 'bg-slate-800 text-slate-400'
        }`}
      >
        {done ? '✓' : num}
      </span>
      <span>{label}</span>
    </button>
  );
};

function CompassIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
