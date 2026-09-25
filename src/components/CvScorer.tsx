import React, { useState } from 'react';
import { useCareer } from '../context/CareerContext.tsx';
import { api } from '../services/api.ts';
import { CalibrdScoreResult } from '../types.ts';
import {
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Briefcase,
  FileText,
  TrendingUp,
  Award,
} from 'lucide-react';

export const CvScorer: React.FC = () => {
  const { theme, selectedJobForScoring } = useCareer();

  const [jobTitle, setJobTitle] = useState(
    selectedJobForScoring?.title || 'Senior Frontend Engineer (React & TypeScript)'
  );
  const [targetLevel, setTargetLevel] = useState<string>(
    selectedJobForScoring?.experienceLevel || 'Senior'
  );
  const [jobDescription, setJobDescription] = useState(
    selectedJobForScoring
      ? `${selectedJobForScoring.description}\n\nRequirements:\n${selectedJobForScoring.requirements.join('\n')}\n\nSkills:\n${selectedJobForScoring.skillsRequired.join(', ')}`
      : `We are looking for a Senior Frontend Engineer to build web applications using React, TypeScript, and modern state architectures. Requirements: 4+ years of React and TypeScript experience, automated testing with Vitest/Jest, cloud CI/CD pipelines, and high performance bundle optimization.`
  );

  const [cvText, setCvText] = useState(
    `Alex Chen — Senior Full-Stack Engineer
alex.chen@example.com | San Francisco, CA | https://linkedin.com/in/alexchen-dev

Professional Summary:
Senior Full-Stack Engineer with 5+ years building distributed React, TypeScript, and Node.js applications. Strong expertise in performance optimization, automated test pipelines, and microservices architecture.

Technical Skills:
React, TypeScript, JavaScript, Node.js, GraphQL, REST, PostgreSQL, Docker, AWS, Jest, Vitest, CI/CD, Tailwind CSS, Redis.

Work Experience:
Senior Software Engineer | TechCorp Solutions (2022 – Present)
- Architected modular frontend applications with React and TypeScript, decreasing page load latency by 40%.
- Implemented comprehensive Vitest test suites and GitHub Actions CI/CD workflows.
- Mentored mid-level and junior software engineers in design patterns and code quality.

Software Developer | DataFlow Inc. (2019 – 2022)
- Built high-performance backend microservices using Node.js and PostgreSQL.
- Created reusable UI components and dashboards for 50k+ daily users.`
  );

  const [isLoading, setIsLoading] = useState(false);
  const [scoreResult, setScoreResult] = useState<CalibrdScoreResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleScore = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await api.scoreCvAgainstJob({
        cv_text: cvText,
        job_title: jobTitle,
        job_description: jobDescription,
        level: targetLevel,
      });
      setScoreResult(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to score CV against Job Description');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Score CV Against Job</h1>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              Calibrd MCP
            </span>
          </div>
          <p className="text-sm mt-1 opacity-75">
            Calibrd evaluates ATS score, recruiter alignment, match score (0–100), and specific level gaps.
          </p>
        </div>

        <button
          onClick={handleScore}
          disabled={isLoading}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/20 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isLoading ? 'Evaluating with Calibrd...' : 'Run Calibrd Evaluation'}</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Input Comparison Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Target Job Description */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-cyan-500" />
              <span>Target Job Posting</span>
            </h3>
            <span className="text-[11px] font-mono opacity-60">JobDataLake</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs opacity-75 mb-1">Target Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className={`w-full text-xs rounded-lg px-3 py-2 border focus:outline-none focus:border-cyan-500 ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs opacity-75 mb-1">Seniority Level</label>
              <select
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value)}
                className={`w-full text-xs rounded-lg px-3 py-2 border focus:outline-none focus:border-cyan-500 ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="Entry / Junior">Entry / Junior</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead / Director">Lead / Director</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs opacity-75 mb-1">Job Description &amp; Requirements</label>
            <textarea
              rows={11}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description or requirements here..."
              className={`w-full text-xs font-mono rounded-lg p-3 border focus:outline-none focus:border-cyan-500 ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>
        </div>

        {/* Right: Candidate CV Content */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center space-x-2">
              <FileText className="w-4 h-4 text-cyan-500" />
              <span>Candidate CV Content</span>
            </h3>
            <span className="text-[11px] font-mono opacity-60">CVpop / Plaintext</span>
          </div>

          <div>
            <label className="block text-xs opacity-75 mb-1">Resume / CV Text</label>
            <textarea
              rows={14}
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Paste your CV text here..."
              className={`w-full text-xs font-mono rounded-lg p-3 border focus:outline-none focus:border-cyan-500 ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Calibrd Results Section */}
      {scoreResult && (
        <div className={`p-6 rounded-2xl border space-y-6 ${
          theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-md'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/40 pb-5">
            <div>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-cyan-500">
                Calibrd Match Score Result
              </span>
              <h2 className="text-xl font-bold mt-1">Role Fit: {jobTitle}</h2>
              <p className="text-xs opacity-75 mt-0.5">{scoreResult.summary}</p>
            </div>

            {/* Score Badges */}
            <div className="flex items-center gap-4">
              <div className="text-center p-3 rounded-xl bg-slate-950 border border-slate-800 min-w-24">
                <div className="text-3xl font-extrabold text-cyan-400 font-mono">
                  {scoreResult.score}%
                </div>
                <div className="text-[10px] font-semibold opacity-60 uppercase mt-0.5">Overall Fit</div>
              </div>

              {scoreResult.atsScore && (
                <div className="text-center p-3 rounded-xl bg-slate-950 border border-slate-800 min-w-24">
                  <div className="text-2xl font-bold text-emerald-400 font-mono">
                    {scoreResult.atsScore}%
                  </div>
                  <div className="text-[10px] font-semibold opacity-60 uppercase mt-0.5">ATS Readability</div>
                </div>
              )}

              {scoreResult.recruiterScore && (
                <div className="text-center p-3 rounded-xl bg-slate-950 border border-slate-800 min-w-24">
                  <div className="text-2xl font-bold text-blue-400 font-mono">
                    {scoreResult.recruiterScore}%
                  </div>
                  <div className="text-[10px] font-semibold opacity-60 uppercase mt-0.5">Recruiter Score</div>
                </div>
              )}
            </div>
          </div>

          {/* Breakdown: Matches vs Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Matches */}
            <div className={`p-4 rounded-xl border space-y-3 ${
              theme === 'dark' ? 'bg-emerald-950/20 border-emerald-900/40' : 'bg-emerald-50/60 border-emerald-200'
            }`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Verified Match Areas</span>
              </h4>
              <ul className="space-y-1.5 text-xs">
                {scoreResult.matches.map((match, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                    <span className="capitalize">{match}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Gaps */}
            <div className={`p-4 rounded-xl border space-y-3 ${
              theme === 'dark' ? 'bg-rose-950/20 border-rose-900/40' : 'bg-rose-50/60 border-rose-200'
            }`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Level &amp; Skill Gaps to Address</span>
              </h4>
              <ul className="space-y-1.5 text-xs">
                {scoreResult.gaps.map((gap, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0"></span>
                    <span className="capitalize">{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Calibrd Recommendations */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            theme === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
              <Lightbulb className="w-4 h-4 text-cyan-400" />
              <span>Tailoring Recommendations</span>
            </h4>
            <div className="space-y-2 text-xs opacity-90">
              {scoreResult.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start space-x-2">
                  <span className="font-mono text-cyan-400 font-bold">{i + 1}.</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
