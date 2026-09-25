import React, { useState, useEffect } from 'react';
import { useCareer } from '../context/CareerContext.tsx';
import { api } from '../services/api.ts';
import { JobListing } from '../types.ts';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Filter,
  Bookmark,
  Building,
  AlertCircle,
  X,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const JobSearch: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    savedJobs,
    toggleSaveJob,
    isJobSaved,
    theme,
  } = useCareer();

  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [experienceFilter, setExperienceFilter] = useState('All');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [searchWarning, setSearchWarning] = useState<string | null>(null);
  const [searchSource, setSearchSource] = useState<string>('JobDataLake MCP');
  const [activeJobModal, setActiveJobModal] = useState<JobListing | null>(null);

  const fetchJobs = async () => {
    setIsLoading(true);
    setSearchWarning(null);
    try {
      const response = await api.searchJobs({
        keywords: searchQuery,
        location: locationFilter === 'All' ? undefined : locationFilter,
        experienceLevel: experienceFilter === 'All' ? undefined : experienceFilter,
        industry: industryFilter === 'All' ? undefined : industryFilter,
      });

      setJobs(response.jobs);
      setSearchSource(response.source);
      if (response.warning) {
        setSearchWarning(response.warning);
      }
    } catch (err: any) {
      setSearchWarning(err.message || 'JobDataLake MCP search is temporarily unavailable.');
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [locationFilter, experienceFilter, industryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const displayedJobs = activeTab === 'saved' ? savedJobs : jobs;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {activeTab === 'saved' ? 'Saved Jobs' : 'Explore Jobs'}
          </h1>
          <p className="text-sm mt-1 opacity-75">
            {activeTab === 'saved'
              ? `You have bookmarked ${savedJobs.length} position${savedJobs.length === 1 ? '' : 's'}.`
              : 'Search and filter 1M+ active positions powered by JobDataLake MCP.'}
          </p>
        </div>

        {activeTab === 'saved' && (
          <button
            onClick={() => setActiveTab('search')}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold self-start sm:self-auto transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Search All Jobs</span>
          </button>
        )}
      </div>

      {/* Warning banner if fallback active */}
      {searchWarning && activeTab === 'search' && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{searchWarning}</span>
          </div>
          <span className="font-mono text-[11px] text-amber-400/80 bg-amber-900/40 px-2 py-0.5 rounded">
            JobDataLake Fallback
          </span>
        </div>
      )}

      {/* Search Bar & Filter Controls (only in search view) */}
      {activeTab === 'search' && (
        <div className={`border rounded-2xl p-4 shadow-sm space-y-4 transition-colors ${
          theme === 'dark'
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-white border-slate-200 shadow-slate-200/50'
        }`}>
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search JobDataLake by role, company, or skills (e.g. React, Full Stack, Python, AWS)..."
                className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 transition-colors ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-all flex items-center justify-center space-x-2 shadow-md shadow-cyan-900/20 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{isLoading ? 'Searching...' : 'Search JobDataLake'}</span>
            </button>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/40 text-xs">
            <div className="flex items-center space-x-1.5 opacity-70">
              <Filter className="w-3.5 h-3.5" />
              <span className="font-semibold">Filters:</span>
            </div>

            {/* Location */}
            <div className="flex items-center space-x-1">
              <span className="opacity-60">Location:</span>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className={`border rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-500 ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-slate-800 text-slate-200'
                    : 'bg-slate-100 border-slate-300 text-slate-800'
                }`}
              >
                <option value="All">All Locations</option>
                <option value="United States">United States</option>
                <option value="Singapore">Singapore</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            {/* Experience */}
            <div className="flex items-center space-x-1">
              <span className="opacity-60">Experience:</span>
              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                className={`border rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-500 ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-slate-800 text-slate-200'
                    : 'bg-slate-100 border-slate-300 text-slate-800'
                }`}
              >
                <option value="All">All Levels</option>
                <option value="Entry / Junior">Entry / Junior</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
              </select>
            </div>

            {/* Industry */}
            <div className="flex items-center space-x-1">
              <span className="opacity-60">Industry:</span>
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className={`border rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-500 ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-slate-800 text-slate-200'
                    : 'bg-slate-100 border-slate-300 text-slate-800'
                }`}
              >
                <option value="All">All Industries</option>
                <option value="Technology">Technology / Software</option>
                <option value="Banking">Banking / Fintech</option>
                <option value="GovTech">Public Sector / GovTech</option>
                <option value="Cyber">Cyber Security</option>
              </select>
            </div>

            <div className="ml-auto font-mono text-[11px] opacity-70">
              Source: <span className="text-cyan-500 font-semibold">{searchSource}</span>
            </div>
          </div>
        </div>
      )}

      {/* Jobs Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm opacity-75">Querying JobDataLake MCP server...</p>
        </div>
      ) : displayedJobs.length === 0 ? (
        <div className={`py-16 text-center rounded-2xl border p-8 space-y-3 ${
          theme === 'dark'
            ? 'bg-slate-900/50 border-slate-800'
            : 'bg-slate-100/70 border-slate-200'
        }`}>
          <Briefcase className="w-12 h-12 opacity-40 mx-auto" />
          <h3 className="text-base font-semibold">
            {activeTab === 'saved' ? 'No saved jobs yet' : 'No jobs found matching your criteria'}
          </h3>
          <p className="text-xs opacity-75 max-w-md mx-auto">
            {activeTab === 'saved'
              ? 'Click the bookmark icon on any job card to save positions you want to review later.'
              : 'Try clearing your filters or changing keywords.'}
          </p>
          {activeTab === 'saved' ? (
            <button
              onClick={() => setActiveTab('search')}
              className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-medium hover:bg-cyan-500 transition-colors"
            >
              Browse Jobs
            </button>
          ) : (
            <button
              onClick={() => {
                setSearchQuery('');
                setLocationFilter('All');
                setExperienceFilter('All');
                setIndustryFilter('All');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
              }`}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedJobs.map((job) => {
            const saved = isJobSaved(job.id);
            return (
              <div
                key={job.id}
                className={`flex flex-col justify-between rounded-2xl border transition-all duration-150 p-5 shadow-sm space-y-4 ${
                  theme === 'dark'
                    ? 'border-slate-800 bg-slate-900/90 hover:bg-slate-900 hover:border-slate-700'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  {/* Top badges & save button */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded border ${
                      theme === 'dark'
                        ? 'bg-slate-800 text-slate-300 border-slate-700'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {job.experienceLevel}
                    </span>
                    <button
                      onClick={() => toggleSaveJob(job)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        saved
                          ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                          : theme === 'dark'
                          ? 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title={saved ? 'Remove from saved' : 'Save job'}
                    >
                      <Bookmark className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* Title & Company */}
                  <div>
                    <h3 className="font-bold text-base line-clamp-1 hover:text-cyan-500 cursor-pointer"
                        onClick={() => setActiveJobModal(job)}>
                      {job.title}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-xs opacity-75 mt-1">
                      <Building className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-medium line-clamp-1">{job.company}</span>
                    </div>
                  </div>

                  {/* Meta items: Location, Salary, Type */}
                  <div className="space-y-1.5 text-xs opacity-80 pt-1">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                      <span className="line-clamp-1">{job.location}</span>
                    </div>

                    {job.salary && (job.salary.min || job.salary.max) && (
                      <div className="flex items-center space-x-1.5 text-emerald-500 font-mono">
                        <DollarSign className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          ${(job.salary.min || 0).toLocaleString()}
                          {job.salary.max ? ` - $${job.salary.max.toLocaleString()}` : '+'}
                          <span className="text-[11px] opacity-75"> / {job.salary.period}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Skills badges */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {job.skillsRequired.slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          theme === 'dark'
                            ? 'bg-slate-950 text-slate-300 border-slate-800'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skillsRequired.length > 4 && (
                      <span className="text-[10px] font-mono px-1 py-0.5 opacity-50">
                        +{job.skillsRequired.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action footer */}
                <div className={`pt-3 border-t flex items-center justify-between text-xs ${
                  theme === 'dark' ? 'border-slate-800/80' : 'border-slate-100'
                }`}>
                  <span className="text-[11px] opacity-60">{job.postedDate}</span>
                  <button
                    onClick={() => setActiveJobModal(job)}
                    className="flex items-center space-x-1 text-cyan-500 hover:text-cyan-400 font-medium text-xs group"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Job Details Modal */}
      {activeJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden ${
            theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className={`px-6 py-5 border-b flex items-start justify-between ${
              theme === 'dark' ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="space-y-1 pr-6">
                <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded border ${
                  theme === 'dark' ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}>
                  {activeJobModal.experienceLevel} • {activeJobModal.jobType}
                </span>
                <h3 className="text-xl font-bold mt-2">{activeJobModal.title}</h3>
                <div className="flex items-center space-x-3 text-xs opacity-75 pt-0.5">
                  <span className="font-semibold text-cyan-500">{activeJobModal.company}</span>
                  <span>•</span>
                  <span>{activeJobModal.location}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveJobModal(null)}
                className="p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
              <div>
                <h4 className="font-semibold text-xs uppercase tracking-wider mb-2 opacity-60">
                  Role Description
                </h4>
                <p className="leading-relaxed text-xs sm:text-sm whitespace-pre-line opacity-90">
                  {activeJobModal.description}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-xs uppercase tracking-wider mb-2 opacity-60">
                  Qualifications &amp; Requirements
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm opacity-90">
                  {activeJobModal.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 shrink-0"></span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-xs uppercase tracking-wider mb-2 opacity-60">
                  Key Skills &amp; Highlights
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeJobModal.skillsRequired.map((s, idx) => (
                    <span
                      key={idx}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono border ${
                        theme === 'dark'
                          ? 'bg-slate-800 text-cyan-300 border-slate-700'
                          : 'bg-slate-100 text-cyan-700 border-slate-200'
                      }`}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`px-6 py-4 border-t flex items-center justify-between ${
              theme === 'dark' ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-slate-50'
            }`}>
              <span className="text-xs font-mono opacity-60">
                Source: {activeJobModal.source}
              </span>

              <div className="flex items-center space-x-3">
                {activeJobModal.applyLink && (
                  <a
                    href={activeJobModal.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shadow-sm"
                  >
                    <span>Apply on Job Board</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={() => toggleSaveJob(activeJobModal)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium border transition-colors ${
                    isJobSaved(activeJobModal.id)
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                      : theme === 'dark'
                      ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                      : 'bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300'
                  }`}
                >
                  <Bookmark className="w-4 h-4" fill={isJobSaved(activeJobModal.id) ? 'currentColor' : 'none'} />
                  <span>{isJobSaved(activeJobModal.id) ? 'Saved' : 'Save Job'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
