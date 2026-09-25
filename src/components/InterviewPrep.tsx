import React, { useState, useEffect } from 'react';
import { useCareer } from '../context/CareerContext.tsx';
import { api } from '../services/api.ts';
import { InterviewPrepResult, InterviewQuestion } from '../types.ts';
import {
  HelpCircle,
  AlertCircle,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Briefcase,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const InterviewPrep: React.FC = () => {
  const { currentResume, selectedJob, setActiveTab } = useCareer();

  const [prepResult, setPrepResult] = useState<InterviewPrepResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [practiceNotes, setPracticeNotes] = useState<Record<string, string>>({});

  const handleGeneratePrep = async () => {
    if (!currentResume || !selectedJob) return;
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const response = await api.generateInterviewPrep(currentResume, selectedJob);
      setPrepResult(response.prep);
      if (response.prep.questions.length > 0) {
        setExpandedQuestionId(response.prep.questions[0].id);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate interview prep questions.');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (currentResume && selectedJob && !prepResult) {
      handleGeneratePrep();
    }
  }, [currentResume?.id, selectedJob?.id]);

  if (!currentResume || !selectedJob) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <HelpCircle className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">Select Resume &amp; Job First</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Interview questions are tailored specifically to your target role and verified resume experience.
        </p>
        <div className="flex justify-center space-x-3">
          <button
            onClick={() => setActiveTab('resume')}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700"
          >
            My Resume
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold hover:bg-cyan-500 shadow-md"
          >
            Find a Job
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
            <span>Interview Preparation For:</span>
            <span className="text-cyan-400 font-semibold">{selectedJob.title}</span>
            <span>@</span>
            <span className="text-slate-300">{selectedJob.company}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Interview Coaching &amp; Rehearsal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Grounded in your real profile to prepare strategic STAR answers and navigate potential experience gaps.
          </p>
        </div>

        <button
          onClick={handleGeneratePrep}
          disabled={isGenerating}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Generating...' : 'Regenerate Questions'}</span>
        </button>
      </div>

      {/* Mandatory Disclaimer Label */}
      <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 text-xs text-amber-200 flex items-start space-x-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300">Possible Interview Questions:</strong> The questions below are generated practice simulations based on the target job requirements and your demonstrated resume experience. They are not confirmed actual employer questions.
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs">
          {errorMsg}
        </div>
      )}

      {isGenerating ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-300 font-medium">
            Generating targeted practice questions and answer frameworks...
          </p>
        </div>
      ) : prepResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Overall Tips */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
              <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-sm">
                <Lightbulb className="w-4 h-4" />
                <span>Strategic Preparation Tips</span>
              </div>
              <ul className="space-y-2 text-slate-300">
                {prepResult.overallPreparationTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start space-x-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
              <div className="font-semibold text-slate-200 text-sm">STAR Method Guide</div>
              <div className="space-y-2 text-slate-400">
                <div>
                  <strong className="text-cyan-300">Situation:</strong> Set the scene (context, scale, challenge).
                </div>
                <div>
                  <strong className="text-cyan-300">Task:</strong> Your specific responsibility and ownership.
                </div>
                <div>
                  <strong className="text-cyan-300">Action:</strong> Technical decisions and collaborative steps taken.
                </div>
                <div>
                  <strong className="text-cyan-300">Result:</strong> Measurable outcome (latency, uptime, user metrics).
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Question Cards */}
          <div className="lg:col-span-8 space-y-4">
            {prepResult.questions.map((q, idx) => {
              const isExpanded = expandedQuestionId === q.id;
              return (
                <div
                  key={q.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 transition-all space-y-3 shadow-sm"
                >
                  <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}>
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                          {q.category}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">Question #{idx + 1}</span>
                      </div>
                      <h3 className="font-bold text-white text-base leading-snug">{q.question}</h3>
                    </div>

                    <button className="text-slate-400 hover:text-white p-1">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="pt-3 border-t border-slate-800 space-y-4 text-xs">
                      {/* Context */}
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block mb-0.5">
                          Why Interviewers Ask This:
                        </span>
                        <p className="text-slate-300 leading-relaxed">{q.contextWhyAsked}</p>
                      </div>

                      {/* Suggested Answer Strategy */}
                      <div>
                        <span className="text-[10px] font-mono uppercase text-cyan-400 font-semibold block mb-1">
                          Suggested Strategy (STAR Framework):
                        </span>
                        <p className="text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                          {q.suggestedAnswerStrategy}
                        </p>
                      </div>

                      {/* What to highlight vs Pitfalls */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Highlight From Your Resume:</span>
                          </span>
                          <ul className="space-y-1 text-slate-300 list-disc list-inside">
                            {q.pointsToHighlightFromResume.map((pt, i) => (
                              <li key={i}>{pt}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-rose-400 font-semibold flex items-center space-x-1">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Pitfalls to Avoid:</span>
                          </span>
                          <ul className="space-y-1 text-slate-300 list-disc list-inside">
                            {q.potentialPitfallsToAvoid.map((pit, i) => (
                              <li key={i}>{pit}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Practice Notes */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Your Practice Notes / Bullet Outline:
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Jot down your key STAR talking points for this question..."
                          value={practiceNotes[q.id] || ''}
                          onChange={(e) =>
                            setPracticeNotes({ ...practiceNotes, [q.id]: e.target.value })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};
