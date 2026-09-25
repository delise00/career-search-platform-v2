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
  Check,
  ArrowRight,
  PlusCircle,
  AlertCircle,
  Building,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  X,
} from 'lucide-react';

export const JobSearch: React.FC = () => {
  const {
    selectedJob,
    setSelectedJob,
    saveJobToTracker,
    savedApplications,
    startJobWorkflow,
    currentResume,
    setActiveTab,
  } = useCareer();

  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [experienceFilter, setExperienceFilter] = useState('All');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [searchWarning, setSearchWarning] = useState<string | null>(null);
  const [searchSource, setSearchSource] = useState<string>('Indeed MCP');
  const [activeJobDetail, setActiveJobDetail] = useState<JobListing | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // Custom Job input state
  const [customTitle, setCustomTitle] = useState('');
  const [customCompany, setCustomCompany] = useState('');
  const [customLocation, setCustomLocation] = useState('Singapore');
  const [customSalary, setCustomSalary] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customRequirements, setCustomRequirements] = useState('');

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
      setSearchWarning(err.message || 'Job search service is temporarily unavailable.');
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

  const handleAddCustomJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customCompany || !customRequirements) return;

    const requirementsList = customRequirements
      .split('\n')
      .map((r) => r.trim().replace(/^[-*•\d.]+\s*/, ''))
      .filter((r) => r.length > 5);

    const newJob: JobListing = {
      id: `custom-job-${Date.now()}`,
      title: customTitle,
      company: customCompany,
      location: customLocation || 'Singapore',
      description: customDescription || 'Custom job description entered by user.',
      requirements: requirementsList.length > 0 ? requirementsList : ['Demonstrated engineering experience'],
      skillsRequired: customTitle.split(' ').slice(0, 4),
      experienceLevel: 'Mid-Level',
      jobType: 'Full-time',
      industry: 'Custom Role',
      postedDate: 'Direct Entry',
      source: 'Direct Entry',
    };

    setJobs([newJob, ...jobs]);
    setIsCustomModalOpen(false);
    setActiveJobDetail(newJob);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Explore Opportunities
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Discover roles powered by Indeed MCP and aligned with the Singapore Skills Framework.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-cyan-400" />
            <span>Paste Custom Job Listing</span>
          </button>
        </div>
      </div>

      {/* Warning/Degraded banner if MCP remote is offline */}
      {searchWarning && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{searchWarning}</span>
          </div>
          <span className="font-mono text-[11px] text-amber-400/80 bg-amber-900/40 px-2 py-0.5 rounded">
            Skills Fallback Mode
          </span>
        </div>
      )}

      {/* Search Bar & Filter Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, skills (e.g. React, Python, Data, Cybersecurity)..."
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-all flex items-center justify-center space-x-2 shadow-md shadow-cyan-900/20 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>{isLoading ? 'Searching...' : 'Search Jobs'}</span>
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/60 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-300">Filters:</span>
          </div>

          {/* Location */}
          <div className="flex items-center space-x-1">
            <span className="text-slate-500">Location:</span>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Locations</option>
              <option value="Singapore">Singapore</option>
              <option value="One-North">One-North</option>
              <option value="Marina Bay">Marina Bay</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          {/* Experience */}
          <div className="flex items-center space-x-1">
            <span className="text-slate-500">Experience:</span>
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Levels</option>
              <option value="Entry / Junior">Entry / Junior</option>
              <option value="Mid-Level">Mid-Level</option>
              <option value="Senior">Senior</option>
            </select>
          </div>

          {/* Industry */}
          <div className="flex items-center space-x-1">
            <span className="text-slate-500">Industry:</span>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Industries</option>
              <option value="Technology">Technology / E-commerce</option>
              <option value="Banking">Banking / Fintech</option>
              <option value="GovTech">Public Sector / GovTech</option>
              <option value="Cyber">Cyber Security</option>
            </select>
          </div>

          <div className="ml-auto text-slate-400 font-mono text-[11px]">
            Source: <span className="text-cyan-400">{searchSource}</span>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400">Querying Indeed MCP for active listings...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/50 rounded-2xl border border-slate-800 p-8 space-y-4">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">No matching job listings found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search criteria, clearing filters, or pasting a custom job description.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setLocationFilter('All');
              setExperienceFilter('All');
              setIndustryFilter('All');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => {
            const isSelected = selectedJob?.id === job.id;
            const isSaved = savedApplications.some((a) => a.jobId === job.id);

            return (
              <div
                key={job.id}
                className={`flex flex-col justify-between rounded-2xl border transition-all duration-150 p-5 bg-slate-900/90 hover:bg-slate-900 hover:border-slate-700 shadow-sm ${
                  isSelected ? 'border-cyan-500/80 ring-1 ring-cyan-500/30' : 'border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  {/* Top tags */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {job.experienceLevel}
                    </span>
                    <button
                      onClick={() => saveJobToTracker(job, 'Saved')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isSaved
                          ? 'text-cyan-400 bg-cyan-950/80 border border-cyan-800'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      title={isSaved ? 'Saved in Application Tracker' : 'Save to Tracker'}
                    >
                      <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* Title & Company */}
                  <div>
                    <h3 className="font-bold text-slate-100 text-base leading-snug line-clamp-2 hover:text-cyan-300 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-1 font-medium">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      <span>{job.company}</span>
                    </div>
                  </div>

                  {/* Location & Salary */}
                  <div className="space-y-1 text-xs text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{job.location}</span>
                    </div>

                    {job.salary && (
                      <div className="flex items-center space-x-1.5 text-emerald-400 font-mono text-[11px]">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>
                          {job.salary.currency} {job.salary.min?.toLocaleString()} -{' '}
                          {job.salary.max?.toLocaleString()} / {job.salary.period}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description preview */}
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {job.skillsRequired.slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skillsRequired.length > 4 && (
                      <span className="text-[10px] text-slate-500 self-center">
                        +{job.skillsRequired.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveJobDetail(job)}
                    className="text-xs text-slate-300 hover:text-white font-medium underline-offset-4 hover:underline py-1.5"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => startJobWorkflow(job)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <span>Check Match</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Job Details Modal */}
      {activeJobDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
            {/* Modal Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/60">
              <div>
                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  {activeJobDetail.industry}
                </span>
                <h2 className="text-xl font-bold text-white mt-1.5">{activeJobDetail.title}</h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="font-semibold text-slate-200">{activeJobDetail.company}</span>
                  <span>•</span>
                  <span>{activeJobDetail.location}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-mono">
                    {activeJobDetail.salary
                      ? `${activeJobDetail.salary.currency} ${activeJobDetail.salary.min?.toLocaleString()} - ${activeJobDetail.salary.max?.toLocaleString()} / ${activeJobDetail.salary.period}`
                      : 'Salary Competitive'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveJobDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
              <div>
                <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-2">
                  Role Overview
                </h4>
                <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                  {activeJobDetail.description}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-2">
                  Key Requirements &amp; Qualifications
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                  {activeJobDetail.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0"></span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-2">
                  Target Competencies (Skills Framework)
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeJobDetail.skillsRequired.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-mono bg-slate-800 text-cyan-300 border border-slate-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <button
                onClick={() => {
                  saveJobToTracker(activeJobDetail, 'Saved');
                  setActiveJobDetail(null);
                }}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                <Bookmark className="w-4 h-4 text-cyan-400" />
                <span>Save to Application Tracker</span>
              </button>

              <button
                onClick={() => {
                  const job = activeJobDetail;
                  setActiveJobDetail(null);
                  startJobWorkflow(job);
                }}
                className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-all"
              >
                <span>Assess Compatibility with Resume</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Job Insertion Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center space-x-2.5">
                <PlusCircle className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Paste Custom Job Posting</h3>
              </div>
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomJob} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Backend Engineer (Node/Go)"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Tech Singapore"
                    value={customCompany}
                    onChange={(e) => setCustomCompany(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Singapore (Hybrid)"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Job Description</label>
                <textarea
                  rows={3}
                  placeholder="Paste brief job description summary..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Job Requirements (one per line) *
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="- 4+ years experience with Node.js and TypeScript&#10;- Hands-on experience with PostgreSQL and Redis&#10;- Familiarity with Docker and Kubernetes"
                  value={customRequirements}
                  onChange={(e) => setCustomRequirements(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md"
                >
                  Add Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
