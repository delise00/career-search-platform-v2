import React, { useState, useEffect } from 'react';
import { useCareer } from '../context/CareerContext.tsx';
import { api } from '../services/api.ts';
import {
  TailoredResumeRecommendation,
  GeneratedCoverLetter,
} from '../types.ts';
import {
  Sparkles,
  FileText,
  Copy,
  Check,
  Download,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Edit3,
  Bookmark,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const ApplicationAssistant: React.FC = () => {
  const {
    currentResume,
    selectedJob,
    setActiveTab,
    savedApplications,
    saveJobToTracker,
  } = useCareer();

  const [activeSubTab, setActiveSubTab] = useState<'coverLetter' | 'tailorResume'>('coverLetter');
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [isTailoringResume, setIsTailoringResume] = useState(false);
  const [emphasisNotes, setEmphasisNotes] = useState('');
  const [coverLetter, setCoverLetter] = useState<GeneratedCoverLetter | null>(null);
  const [tailorResult, setTailorResult] = useState<TailoredResumeRecommendation | null>(null);
  const [editableLetterText, setEditableLetterText] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generate Cover letter
  const handleGenerateCoverLetter = async () => {
    if (!currentResume || !selectedJob) return;
    setIsGeneratingLetter(true);
    setErrorMsg(null);
    try {
      const response = await api.generateCoverLetter(currentResume, selectedJob, emphasisNotes);
      setCoverLetter(response.letter);
      setEditableLetterText(response.letter.fullLetter);
      // Save to application tracker
      saveJobToTracker(selectedJob, 'Applied');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate cover letter.');
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  // Tailor Resume
  const handleTailorResume = async () => {
    if (!currentResume || !selectedJob) return;
    setIsTailoringResume(true);
    setErrorMsg(null);
    try {
      const response = await api.tailorResume(currentResume, selectedJob);
      setTailorResult(response.result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to tailor resume.');
    } finally {
      setIsTailoringResume(false);
    }
  };

  useEffect(() => {
    if (currentResume && selectedJob && !coverLetter) {
      handleGenerateCoverLetter();
    }
  }, [currentResume?.id, selectedJob?.id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editableLetterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([editableLetterText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cover_Letter_${selectedJob?.company || 'Job'}_${currentResume?.name || 'Applicant'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!currentResume || !selectedJob) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <Sparkles className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">Select Resume &amp; Job First</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          The StoryLenses Application Assistant requires both a screened resume and an active job description to craft a customized, non-hallucinated cover letter.
        </p>
        <div className="flex justify-center space-x-3">
          <button
            onClick={() => setActiveTab('resume')}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700"
          >
            Go to My Resume
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold hover:bg-cyan-500 shadow-md"
          >
            Explore Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
            <span>Tailoring For:</span>
            <span className="text-cyan-400 font-semibold">{selectedJob.title}</span>
            <span>@</span>
            <span className="text-slate-300">{selectedJob.company}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Application Assistant
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            StoryLenses MCP synthesizes targeted narratives and bullet alignments using strictly your verified background.
          </p>
        </div>

        {/* Sub-tab toggle */}
        <div className="flex items-center space-x-1 p-1 bg-slate-950 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('coverLetter')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSubTab === 'coverLetter'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cover Letter
          </button>
          <button
            onClick={() => {
              setActiveSubTab('tailorResume');
              if (!tailorResult) handleTailorResume();
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSubTab === 'tailorResume'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tailor Resume Bullets
          </button>
        </div>
      </div>

      {/* Strict Factual Guardrail Notice */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-white">Strict Factual Guarantee:</strong> This application assistant will never fabricate metrics, qualifications, or phantom experiences. Every claim is strictly grounded in your verified profile.
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 shrink-0">
          Zero Hallucination
        </span>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Subtab 1: Cover Letter */}
      {activeSubTab === 'coverLetter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Controls: Tone & Emphasis */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
              <h3 className="font-bold text-white text-sm">Cover Letter Parameters</h3>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Custom Focus / Emphasis Notes
                </label>
                <textarea
                  rows={4}
                  value={emphasisNotes}
                  onChange={(e) => setEmphasisNotes(e.target.value)}
                  placeholder="e.g. Emphasize my experience leading agile sprints, or focus on my web vitals performance improvements..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                onClick={handleGenerateCoverLetter}
                disabled={isGeneratingLetter}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-950 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                {isGeneratingLetter ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>StoryLenses Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Regenerate Cover Letter</span>
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
                <div className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
                  StoryLenses Method:
                </div>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Anchors opening on proven competencies</li>
                  <li>Cites actual projects &amp; technologies</li>
                  <li>Never invents unverified achievements</li>
                </ul>
              </div>
            </div>

            {/* Quick Next Step to Interview Prep */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
              <div className="font-bold text-white text-sm">Ready for the Next Stage?</div>
              <p className="text-slate-400 text-xs">
                Prepare for potential technical and behavioral interview questions tailored to this role and resume.
              </p>
              <button
                onClick={() => setActiveTab('interview')}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center space-x-2"
              >
                <span>Go to Interview Preparation</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            </div>
          </div>

          {/* Right Editor: Generated Letter */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <h3 className="font-bold text-white text-base">Generated Cover Letter</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Feel free to review and edit the text directly before submitting.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownload}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {isGeneratingLetter ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-slate-300 font-medium">
                    StoryLenses MCP is synthesizing your cover letter...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea
                    rows={17}
                    value={editableLetterText}
                    onChange={(e) => setEditableLetterText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs sm:text-sm text-slate-200 font-serif leading-relaxed focus:outline-none focus:border-cyan-500 shadow-inner"
                  />

                  {coverLetter?.factualVerificationNote && (
                    <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-[11px] text-emerald-300 font-mono flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{coverLetter.factualVerificationNote}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Tailor Resume Bullets */}
      {activeSubTab === 'tailorResume' && (
        <div className="space-y-6">
          {isTailoringResume ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-slate-300 font-medium">
                StoryLenses MCP is aligning resume bullet points...
              </p>
            </div>
          ) : tailorResult ? (
            <div className="space-y-6">
              {/* Keywords Alignment */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-white text-sm">
                  Recommended Target Keywords for ATS &amp; Hiring Managers
                </h3>
                <p className="text-xs text-slate-400">{tailorResult.roleAlignmentSummary}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {tailorResult.targetedKeywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-mono bg-slate-950 text-cyan-300 border border-slate-800"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Side-by-side bullet point optimizations */}
              <div className="space-y-4">
                <h3 className="font-bold text-white text-sm">
                  Actionable Bullet Point Refinements (Truth-Preserving)
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {tailorResult.bulletPointOptimizations.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                          <span className="font-mono text-[10px] text-slate-400 uppercase font-semibold">
                            Original Bullet:
                          </span>
                          <p className="text-slate-300 leading-relaxed">{item.originalBullet}</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-900/50 space-y-1">
                          <span className="font-mono text-[10px] text-cyan-300 uppercase font-semibold">
                            Tailored for {selectedJob.title}:
                          </span>
                          <p className="text-cyan-100 leading-relaxed font-medium">
                            {item.improvedBullet}
                          </p>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-400 italic">
                        <strong>Rationale:</strong> {item.rationale}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
