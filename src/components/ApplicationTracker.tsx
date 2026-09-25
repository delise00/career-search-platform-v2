import React, { useState } from 'react';
import { useCareer } from '../context/CareerContext.tsx';
import { ApplicationStatus, ApplicationTrackerItem } from '../types.ts';
import {
  FolderGit2,
  Bookmark,
  Send,
  Calendar,
  CheckCircle,
  XCircle,
  Trash2,
  Edit2,
  Plus,
  Building,
  MapPin,
  Target,
  Sparkles,
  HelpCircle,
  Search,
  ExternalLink,
} from 'lucide-react';

export const ApplicationTracker: React.FC = () => {
  const {
    savedApplications,
    updateApplicationStatus,
    updateApplicationNotes,
    deleteApplication,
    setSelectedJob,
    setActiveTab,
  } = useCareer();

  const [statusFilter, setStatusFilter] = useState<'All' | ApplicationStatus>('All');
  const [searchFilter, setSearchFilter] = useState('');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  const statuses: ApplicationStatus[] = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'];

  const filteredApps = savedApplications.filter((app) => {
    if (statusFilter !== 'All' && app.status !== statusFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        app.jobTitle.toLowerCase().includes(q) ||
        app.company.toLowerCase().includes(q) ||
        app.location.toLowerCase().includes(q) ||
        app.notes.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Saved':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'Applied':
        return 'bg-cyan-950 text-cyan-300 border-cyan-800';
      case 'Interview':
        return 'bg-indigo-950 text-indigo-300 border-indigo-800';
      case 'Offer':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'Rejected':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const handleStartEditNotes = (app: ApplicationTrackerItem) => {
    setEditingNotesId(app.id);
    setNotesDraft(app.notes);
  };

  const handleSaveNotes = (id: string) => {
    updateApplicationNotes(id, notesDraft);
    setEditingNotesId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Application Tracker
            </h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Browser Storage
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Organize and monitor your job applications from bookmark to offer without external databases.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('jobs')}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md self-start md:self-auto"
        >
          <Search className="w-4 h-4" />
          <span>Search More Jobs</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'All'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({savedApplications.length})
            </button>
            {statuses.map((st) => {
              const count = savedApplications.filter((a) => a.status === st).length;
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === st
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st} ({count})
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="w-full sm:w-64 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search saved apps..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/40 rounded-2xl border border-slate-800 p-8 space-y-3">
          <FolderGit2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-semibold text-slate-300 text-sm">No applications found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Bookmark jobs from the Jobs tab or submit cover letters to automatically organize your pipeline here.
          </p>
          <button
            onClick={() => setActiveTab('jobs')}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700"
          >
            Explore Jobs
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 transition-all hover:border-slate-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${getStatusBadge(
                        app.status,
                      )}`}
                    >
                      {app.status}
                    </span>
                    {app.matchScore !== undefined && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {app.matchScore}% Match
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-base mt-1.5">{app.jobTitle}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="font-medium text-slate-200">{app.company}</span>
                    <span>•</span>
                    <span>{app.location}</span>
                    {app.salaryText && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-400 font-mono">{app.salaryText}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status Switcher Dropdown */}
                <div className="flex items-center space-x-2">
                  <select
                    value={app.status}
                    onChange={(e) => updateApplicationStatus(app.id, e.target.value as ApplicationStatus)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-medium"
                  >
                    {statuses.map((st) => (
                      <option key={st} value={st}>
                        Status: {st}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => deleteApplication(app.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Remove from tracker"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notes Area */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                    Application Notes:
                  </span>
                  {editingNotesId === app.id ? (
                    <button
                      onClick={() => handleSaveNotes(app.id)}
                      className="text-cyan-400 hover:text-cyan-300 text-[11px] font-medium"
                    >
                      Save Notes
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartEditNotes(app)}
                      className="text-slate-500 hover:text-slate-300 text-[11px] flex items-center space-x-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {editingNotesId === app.id ? (
                  <textarea
                    rows={2}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                ) : (
                  <p className="text-slate-300 leading-relaxed">
                    {app.notes || 'No notes added yet.'}
                  </p>
                )}
              </div>

              {/* Action bar for this tracked job */}
              <div className="pt-2 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-slate-500 text-[11px] font-mono">
                  Saved: {new Date(app.dateAdded).toLocaleDateString()}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedJob({
                        id: app.jobId,
                        title: app.jobTitle,
                        company: app.company,
                        location: app.location,
                        description: 'Saved application',
                        requirements: [],
                        skillsRequired: [],
                        experienceLevel: 'Mid-Level',
                        jobType: 'Full-time',
                        industry: 'General',
                        postedDate: app.dateAdded,
                        source: 'Application Tracker',
                      });
                      setActiveTab('match');
                    }}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                  >
                    <Target className="w-3.5 h-3.5 text-cyan-400" />
                    <span>View Match</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedJob({
                        id: app.jobId,
                        title: app.jobTitle,
                        company: app.company,
                        location: app.location,
                        description: 'Saved application',
                        requirements: [],
                        skillsRequired: [],
                        experienceLevel: 'Mid-Level',
                        jobType: 'Full-time',
                        industry: 'General',
                        postedDate: app.dateAdded,
                        source: 'Application Tracker',
                      });
                      setActiveTab('assistant');
                    }}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Cover Letter</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedJob({
                        id: app.jobId,
                        title: app.jobTitle,
                        company: app.company,
                        location: app.location,
                        description: 'Saved application',
                        requirements: [],
                        skillsRequired: [],
                        experienceLevel: 'Mid-Level',
                        jobType: 'Full-time',
                        industry: 'General',
                        postedDate: app.dateAdded,
                        source: 'Application Tracker',
                      });
                      setActiveTab('interview');
                    }}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Interview Prep</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
