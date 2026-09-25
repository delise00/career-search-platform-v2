import React, { useState, useEffect } from 'react';
import { useCareer } from '../context/CareerContext.tsx';
import { api } from '../services/api.ts';
import { JobCompatibilityResult } from '../types.ts';
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Briefcase,
  Building,
  RefreshCw,
  Bookmark,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

export const JobCompatibility: React.FC = () => {
  const {
    currentResume,
    selectedJob,
    setSelectedJob,
    setActiveTab,
    saveJobToTracker,
  } = useCareer();

  const [matchResult, setMatchResult] = useState<JobCompatibilityResult | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  const runCompatibilityCheck = async () => {
    if (!currentResume || !selectedJob) return;
    setIsMatching(true);
    setMatchError(null);
    try {
      const response = await api.matchCompatibility(currentResume, selectedJob);
      setMatchResult(response.result);
      // Automatically update tracker with match score if saved
      saveJobToTracker(selectedJob, 'Saved', response.result.overallScore);
    } catch (err: any) {
      setMatchError(err.message || 'Compatibility check failed.');
    } finally {
      setIsMatching(false);
    }
  };

  useEffect(() => {
    if (currentResume && selectedJob) {
      runCompatibilityCheck();
    }
  }, [currentResume?.id, selectedJob?.id]);

  if (!currentResume) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <Target className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">No Resume Loaded</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Please upload or select a resume first so the AI HR Management Toolkit MCP can assess qualification alignment.
        </p>
        <button
          onClick={() => setActiveTab('resume')}
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md"
        >
          Go to My Resume
        </button>
      </div>
    );
  }

  if (!selectedJob) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">No Target Job Selected</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Select a role from the Jobs tab to evaluate your compatibility, matched competencies, and potential skill gaps.
        </p>
        <button
          onClick={() => setActiveTab('jobs')}
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md"
        >
          Explore Available Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
            <span>Evaluating Target:</span>
            <span className="text-cyan-400 font-semibold">{selectedJob.company}</span>
            <span>•</span>
            <span>Candidate: {currentResume.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{selectedJob.title}</h1>
          <div className="text-xs text-slate-400 flex items-center space-x-3">
            <span>Location: {selectedJob.location}</span>
            <span>•</span>
            <span>Industry: {selectedJob.industry}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('jobs')}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
          >
            Switch Job
          </button>
          <button
            onClick={runCompatibilityCheck}
            disabled={isMatching}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isMatching ? 'animate-spin' : ''}`} />
            <span>{isMatching ? 'Re-evaluating...' : 'Re-run Evaluation'}</span>
          </button>
        </div>
      </div>

      {matchError && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs">
          {matchError}
        </div>
      )}

      {isMatching ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-300 font-medium">
            AI HR Toolkit MCP is evaluating qualification alignment...
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Cross-referencing verified resume evidence against target requirements without assuming unproven skills.
          </p>
        </div>
      ) : matchResult ? (
        <div className="space-y-8">
          {/* Compatibility Scorecard Banner */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm items-center">
            {/* Score dial */}
            <div className="md:col-span-4 flex items-center space-x-5 border-b md:border-b-0 md:border-r border-slate-800 pb-5 md:pb-0 md:pr-5">
              <div
                className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-bold font-mono border shadow-lg ${
                  matchResult.overallScore >= 75
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 shadow-emerald-950/40'
                    : matchResult.overallScore >= 50
                    ? 'bg-amber-950/80 text-amber-300 border-amber-700/80 shadow-amber-950/40'
                    : 'bg-rose-950/80 text-rose-300 border-rose-700/80 shadow-rose-950/40'
                }`}
              >
                <span className="text-2xl leading-none">{matchResult.overallScore}%</span>
                <span className="text-[10px] uppercase tracking-wider font-sans font-semibold mt-1">
                  Match
                </span>
              </div>

              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Assessment Verdict
                </div>
                <div className="text-base font-bold text-white mt-0.5">{matchResult.verdict}</div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  Engine: {matchResult.dataSource}
                </div>
              </div>
            </div>

            {/* Qualitative Summary & Next steps */}
            <div className="md:col-span-8 flex flex-col justify-between h-full space-y-3">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  AI HR Screening Analysis
                </span>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-1">
                  {matchResult.summaryAnalysis}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('assistant')}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tailor Resume &amp; Cover Letter</span>
                </button>
                <button
                  onClick={() => setActiveTab('interview')}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Generate Interview Prep</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4-Way Breakdown Grid adhering to strict prompt requirements */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Fully Matched Requirements */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">
                    Demonstrated Requirements ({matchResult.matchedRequirements.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Verified Match
                </span>
              </div>

              <div className="space-y-3">
                {matchResult.matchedRequirements.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No direct 100% requirement matches detected.</p>
                ) : (
                  matchResult.matchedRequirements.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs"
                    >
                      <div className="font-semibold text-slate-200">{item.requirement}</div>
                      {item.evidence && (
                        <div className="p-2 rounded bg-emerald-950/30 border border-emerald-900/40 text-[11px] text-emerald-300 font-mono">
                          Evidence: "{item.evidence}"
                        </div>
                      )}
                      <p className="text-slate-400 text-[11px] leading-relaxed">{item.reasoning}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 2. Partial Alignment */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-white text-sm">
                    Partial Matches ({matchResult.partialMatches.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  Foundational
                </span>
              </div>

              <div className="space-y-3">
                {matchResult.partialMatches.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No partial matches.</p>
                ) : (
                  matchResult.partialMatches.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs"
                    >
                      <div className="font-semibold text-slate-200">{item.requirement}</div>
                      {item.evidence && (
                        <div className="p-2 rounded bg-amber-950/30 border border-amber-900/40 text-[11px] text-amber-300 font-mono">
                          Overlap: "{item.evidence}"
                        </div>
                      )}
                      <p className="text-slate-400 text-[11px] leading-relaxed">{item.reasoning}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 3. Requirements Not Demonstrated */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <h3 className="font-bold text-white text-sm">
                    Not Demonstrated ({matchResult.unmetRequirements.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  No Prior Record
                </span>
              </div>

              <div className="space-y-3">
                {matchResult.unmetRequirements.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">All requirements have demonstrated coverage.</p>
                ) : (
                  matchResult.unmetRequirements.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs"
                    >
                      <div className="font-semibold text-slate-200">{item.requirement}</div>
                      <p className="text-rose-300/80 text-[11px] leading-relaxed">{item.reasoning}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Transferable Skills & Skill Gaps row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transferable Skills */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Transferable Skills &amp; Domain Relevance</h3>
              </div>
              <div className="space-y-2">
                {matchResult.transferableSkills.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start space-x-3 text-xs"
                  >
                    <span className="font-mono text-cyan-300 font-semibold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 shrink-0">
                      {item.skill}
                    </span>
                    <span className="text-slate-300 leading-relaxed">{item.relevance}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Gaps & Recommended Upskilling (Singapore Skills Framework) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-white text-sm">
                  Identified Skill Gaps &amp; Skills Framework Guidance
                </h3>
              </div>
              <div className="space-y-2">
                {matchResult.skillGaps.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No critical skill gaps identified.</p>
                ) : (
                  matchResult.skillGaps.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{item.skill}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                          {item.importance}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        {item.learningRecommendation}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
