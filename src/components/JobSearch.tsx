import React, { useState, useEffect } from 'react';
import { useCareer } from '../context/CareerContext.tsx';
import { api } from '../services/api.ts';
import { JobListing, JobFilterParams } from '../types.ts';
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
  ChevronDown,
  ChevronUp,
  Target,
} from 'lucide-react';

export const JobSearch: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    savedJobs,
    toggleSaveJob,
    isJobSaved,
    setSelectedJobForScoring,
    theme,
  } = useCareer();

  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Full Filters as supported by JobDataLake
  const [query, setQuery] = useState('');
  const [remoteType, setRemoteType] = useState<'all' | 'fully_remote' | 'hybrid' | 'on_site'>('all');
  const [seniority, setSeniority] = useState('all');
  const [jobFunction, setJobFunction] = useState('all');
  const [employmentType, setEmploymentType] = useState<'all' | 'full_time' | 'part_time' | 'contract' | 'internship'>('all');
  const [salaryMin, setSalaryMin] = useState<string>('');
  const [salaryMax, setSalaryMax] = useState<string>('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('all');
  const [countries, setCountries] = useState('all');
  const [postedWithin, setPostedWithin] = useState<'all' | '24h' | '7d' | '30d'>('all');
  const [sortBy, setSortBy] = useState<'posted_at:desc' | 'salary_max_usd:desc' | 'salary_min_usd:asc'>('posted_at:desc');
  const [company, setCompany] = useState('');

  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [searchWarning, setSearchWarning] = useState<string | null>(null);
  const [searchSource, setSearchSource] = useState<string>('JobDataLake MCP');
  const [activeJobModal, setActiveJobModal] = useState<JobListing | null>(null);

  const fetchJobs = async () => {
    setIsLoading(true);
    setSearchWarning(null);
    try {
      const filterParams: JobFilterParams = {
        query: query.trim() || undefined,
        remote_type: remoteType !== 'all' ? remoteType : undefined,
        seniority: seniority !== 'all' ? seniority : undefined,
        job_function: jobFunction !== 'all' ? jobFunction : undefined,
        employment_type: employmentType !== 'all' ? employmentType : undefined,
        salary_min: salaryMin ? parseInt(salaryMin, 10) : undefined,
        salary_max: salaryMax ? parseInt(salaryMax, 10) : undefined,
        skills: skills.trim() || undefined,
        location: location !== 'all' ? location : undefined,
        countries: countries !== 'all' ? countries : undefined,
        posted_within: postedWithin !== 'all' ? postedWithin : undefined,
        sort_by: sortBy,
        company: company.trim() || undefined,
      };

      const response = await api.searchJobs(filterParams);
      setJobs(response.jobs);
      setSearchSource(response.source);
      if (response.warning) {
        setSearchWarning(response.warning);
      }
    } catch (err: any) {
      setSearchWarning(err.message || 'JobDataLake search is temporarily unavailable.');
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [remoteType, seniority, jobFunction, employmentType, postedWithin, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleScoreJob = (job: JobListing) => {
    setSelectedJobForScoring(job);
    setActiveTab('cv-scorer');
  };

  const displayedJobs = activeTab === 'saved' ? savedJobs : jobs;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {activeTab === 'saved' ? 'Saved Jobs' : 'Explore Jobs'}
          </h1>
          <p className="text-sm mt-1 opacity-75">
            {activeTab === 'saved'
              ? `You have bookmarked ${savedJobs.length} position${savedJobs.length === 1 ? '' : 's'}.`
              : 'Search and filter 1M+ active positions across 20,000+ companies powered by JobDataLake MCP.'}
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

      {/* Warning banner */}
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

      {/* Search Bar & Comprehensive JobDataLake Filter Controls */}
      {activeTab === 'search' && (
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 transition-colors ${
          theme === 'dark'
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-white border-slate-200 shadow-slate-200/50'
        }`}>
          {/* Main Search Row */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Keywords (title, company, skills, e.g. React, Full Stack, Python, AWS)..."
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

          {/* Primary Quick Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2 border-t border-slate-800/40 text-xs">
            {/* Remote Type */}
            <div>
              <label className="block text-[11px] opacity-60 mb-1">Remote Policy</label>
              <select
                value={remoteType}
                onChange={(e: any) => setRemoteType(e.target.value)}
                className={`w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-cyan-500 ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-800'
                }`}
              >
                <option value="all">All Remote Types</option>
                <option value="fully_remote">Fully Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="on_site">On-site</option>
              </select>
            </div>

            {/* Seniority */}
            <div>
              <label className="block text-[11px] opacity-60 mb-1">Seniority</label>
              <select
                value={seniority}
                onChange={(e) => setSeniority(e.target.value)}
                className={`w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-cyan-500 ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-800'
                }`}
              >
                <option value="all">All Seniority</option>
                <option value="Entry">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior">Senior</option>
                <option value="Staff">Staff</option>
                <option value="Principal">Principal</option>
                <option value="Manager">Manager</option>
                <option value="Director">Director</option>
                <option value="C Level">C Level</option>
              </select>
            </div>

            {/* Job Function */}
            <div>
              <label className="block text-[11px] opacity-60 mb-1">Function</label>
              <select
                value={jobFunction}
                onChange={(e) => setJobFunction(e.target.value)}
                className={`w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-cyan-500 ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-800'
                }`}
              >
                <option value="all">All Functions</option>
                <option value="eng">Engineering</option>
                <option value="data">Data / AI</option>
                <option value="design">Design</option>
                <option value="product">Product</option>
                <option value="security">Security</option>
                <option value="ops">Operations</option>
                <option value="sales">Sales</option>
                <option value="marketing">Marketing</option>
                <option value="finance">Finance</option>
                <option value="hr">HR</option>
                <option value="legal">Legal</option>
              </select>
            </div>

            {/* Employment Type */}
            <div>
              <label className="block text-[11px] opacity-60 mb-1">Contract Type</label>
              <select
                value={employmentType}
                onChange={(e: any) => setEmploymentType(e.target.value)}
                className={`w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-cyan-500 ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-800'
                }`}
              >
                <option value="all">All Types</option>
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            {/* Posted Within */}
            <div>
              <label className="block text-[11px] opacity-60 mb-1">Posted Within</label>
              <select
                value={postedWithin}
                onChange={(e: any) => setPostedWithin(e.target.value)}
                className={`w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-cyan-500 ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-800'
                }`}
              >
                <option value="all">Anytime</option>
                <option value="24h">Past 24 Hours</option>
                <option value="7d">Past 7 Days</option>
                <option value="30d">Past 30 Days</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-[11px] opacity-60 mb-1">Sort Order</label>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className={`w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-cyan-500 ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-800'
                }`}
              >
                <option value="posted_at:desc">Newest First</option>
                <option value="salary_max_usd:desc">Highest Salary</option>
                <option value="salary_min_usd:asc">Lowest Salary</option>
              </select>
            </div>
          </div>

          {/* Toggle for Advanced Filters */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
              className="flex items-center space-x-1.5 text-xs font-semibold text-cyan-500 hover:text-cyan-400 transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>
                {isAdvancedFiltersOpen ? 'Hide Advanced JobDataLake Filters' : 'Show Advanced Filters (Skills AND, Salary, Countries, Company)'}
              </span>
              {isAdvancedFiltersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <div className="font-mono text-[11px] opacity-70">
              Source: <span className="text-cyan-500 font-semibold">{searchSource}</span>
            </div>
          </div>

          {/* Advanced Filters Expandable Drawer */}
          {isAdvancedFiltersOpen && (
            <div className={`p-4 rounded-xl border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs ${
              theme === 'dark' ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              {/* Skills AND Mode */}
              <div>
                <label className="block text-[11px] opacity-75 mb-1 font-semibold">
                  Skills (AND mode)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Python,AWS,Kubernetes"
                  className={`w-full border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Location or Continent */}
              <div>
                <label className="block text-[11px] opacity-75 mb-1 font-semibold">
                  Location / Continent
                </label>
                <input
                  type="text"
                  value={location === 'all' ? '' : location}
                  onChange={(e) => setLocation(e.target.value || 'all')}
                  placeholder="e.g. Singapore, Europe, Asia"
                  className={`w-full border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Country ISO Codes */}
              <div>
                <label className="block text-[11px] opacity-75 mb-1 font-semibold">
                  Countries (ISO Codes)
                </label>
                <input
                  type="text"
                  value={countries === 'all' ? '' : countries}
                  onChange={(e) => setCountries(e.target.value || 'all')}
                  placeholder="e.g. US, GB, DE, SG, JP"
                  className={`w-full border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Company Domain */}
              <div>
                <label className="block text-[11px] opacity-75 mb-1 font-semibold">
                  Company Domain
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. stripe.com, google.com"
                  className={`w-full border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Min Salary (USD) */}
              <div>
                <label className="block text-[11px] opacity-75 mb-1 font-semibold">
                  Min Annual Salary (USD)
                </label>
                <input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="e.g. 120000 for $120k"
                  className={`w-full border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Max Salary (USD) */}
              <div>
                <label className="block text-[11px] opacity-75 mb-1 font-semibold">
                  Max Annual Salary (USD)
                </label>
                <input
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="e.g. 200000 for $200k"
                  className={`w-full border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="sm:col-span-2 flex items-end justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setRemoteType('all');
                    setSeniority('all');
                    setJobFunction('all');
                    setEmploymentType('all');
                    setSalaryMin('');
                    setSalaryMax('');
                    setSkills('');
                    setLocation('all');
                    setCountries('all');
                    setPostedWithin('all');
                    setCompany('');
                    fetchJobs();
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    theme === 'dark'
                      ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'border-slate-300 bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  Reset All Filters
                </button>
                <button
                  type="button"
                  onClick={fetchJobs}
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
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
                setQuery('');
                setRemoteType('all');
                setSeniority('all');
                setJobFunction('all');
                fetchJobs();
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
                    <h3
                      className="font-bold text-base line-clamp-1 hover:text-cyan-500 cursor-pointer"
                      onClick={() => setActiveJobModal(job)}
                    >
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

                {/* Card Action footer: Details + Score with Calibrd */}
                <div className={`pt-3 border-t flex items-center justify-between text-xs ${
                  theme === 'dark' ? 'border-slate-800/80' : 'border-slate-100'
                }`}>
                  <button
                    onClick={() => handleScoreJob(job)}
                    className="flex items-center space-x-1 text-cyan-500 hover:text-cyan-400 font-medium text-xs"
                    title="Score your CV against this posting via Calibrd MCP"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Score CV</span>
                  </button>

                  <button
                    onClick={() => setActiveJobModal(job)}
                    className="flex items-center space-x-1 text-slate-400 hover:text-slate-200 font-medium text-xs group"
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
              <button
                onClick={() => {
                  const job = activeJobModal;
                  setActiveJobModal(null);
                  handleScoreJob(job);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-cyan-600/20 text-cyan-300 border border-cyan-800 hover:bg-cyan-600/30 transition-colors"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Score My CV for this Role</span>
              </button>

              <div className="flex items-center space-x-3">
                {activeJobModal.applyLink && (
                  <a
                    href={activeJobModal.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shadow-sm"
                  >
                    <span>Apply via ATS</span>
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
