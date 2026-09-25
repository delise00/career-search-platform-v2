import React, { useState } from 'react';
import { useCareer } from '../context/CareerContext.tsx';
import { api } from '../services/api.ts';
import { SAMPLE_RESUMES } from '../data/sampleResumes.ts';
import { ResumeData } from '../types.ts';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  Edit3,
  Plus,
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Award,
  Briefcase,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const ResumeScreening: React.FC = () => {
  const {
    currentResume,
    setCurrentResume,
    rawResumeText,
    setRawResumeText,
    loadSampleResumePreset,
    selectedJob,
    setActiveTab,
  } = useCareer();

  const [isScreening, setIsScreening] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [screeningSource, setScreeningSource] = useState<string | null>(null);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isEditingSummary, setIsEditingSummary] = useState(false);

  const handleScreenResume = async () => {
    if (!rawResumeText || rawResumeText.trim().length < 20) {
      setErrorMsg('Please paste or upload a resume with at least 20 characters.');
      return;
    }

    setIsScreening(true);
    setErrorMsg(null);
    try {
      const response = await api.screenResume(rawResumeText);
      setCurrentResume(response.resume);
      setScreeningSource(response.source);
    } catch (err: any) {
      setErrorMsg(err.message || 'AI HR Screening service failed. Please check your MCP connection.');
    } finally {
      setIsScreening(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawResumeText(content);
        // Reset current resume to allow screening
        setCurrentResume(null);
      }
    };
    reader.readAsText(file);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillInput.trim() || !currentResume) return;
    const skill = newSkillInput.trim();
    if (!currentResume.technicalSkills.includes(skill)) {
      setCurrentResume({
        ...currentResume,
        technicalSkills: [...currentResume.technicalSkills, skill],
      });
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (!currentResume) return;
    setCurrentResume({
      ...currentResume,
      technicalSkills: currentResume.technicalSkills.filter((s) => s !== skillToRemove),
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Resume Analysis &amp; Screening
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Extract experience, competencies, and qualifications objectively using AI HR Management Toolkit MCP.
          </p>
        </div>

        {currentResume && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (selectedJob) {
                  setActiveTab('match');
                } else {
                  setActiveTab('jobs');
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md transition-all"
            >
              <span>{selectedJob ? 'Evaluate Selected Job Match' : 'Find Matching Jobs'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Preset Profiles & Upload Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input text / upload */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-200 text-sm flex items-center space-x-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Provide Resume Content</span>
              </h3>
              <label className="cursor-pointer text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center space-x-1">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload .txt / .md</span>
                <input
                  type="file"
                  accept=".txt,.md,.text"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Quick Sample Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Or Load Benchmark Profile:
              </span>
              <div className="flex flex-col gap-2">
                {SAMPLE_RESUMES.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => loadSampleResumePreset(preset.id)}
                    className="text-left p-2.5 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-800/80 hover:border-slate-700 transition-all text-xs"
                  >
                    <div className="font-semibold text-slate-200">{preset.name}</div>
                    <div className="text-slate-400 text-[11px] truncate mt-0.5">
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div>
              <div className="flex justify-between items-center mb-1 text-xs text-slate-400">
                <span>Resume Text / Markdown</span>
                <span>{rawResumeText.length} characters</span>
              </div>
              <textarea
                rows={11}
                value={rawResumeText}
                onChange={(e) => setRawResumeText(e.target.value)}
                placeholder="Paste full resume text or markdown here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>

            {/* Trigger Button */}
            <button
              onClick={handleScreenResume}
              disabled={isScreening || !rawResumeText.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-cyan-950 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {isScreening ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI HR Toolkit MCP is Screening...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Screen &amp; Extract Qualifications</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Extracted Profile Review & Editor */}
        <div className="lg:col-span-7">
          {!currentResume ? (
            <div className="h-full min-h-[400px] border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-slate-900/30 text-slate-400 space-y-3">
              <FileText className="w-12 h-12 text-slate-600" />
              <div className="font-semibold text-slate-300 text-sm">
                No Extracted Resume Loaded Yet
              </div>
              <p className="text-xs text-slate-500 max-w-sm">
                Select a benchmark candidate profile on the left or paste your own resume, then click "Screen &amp; Extract Qualifications" to inspect extracted competencies.
              </p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-white">{currentResume.name}</h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Verified Extract
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5">
                    {currentResume.email && (
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>{currentResume.email}</span>
                      </div>
                    )}
                    {currentResume.phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{currentResume.phone}</span>
                      </div>
                    )}
                    {currentResume.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{currentResume.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-800">
                    Source: {screeningSource || 'AI HR Management Toolkit'}
                  </span>
                </div>
              </div>

              {/* Summary */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Professional Summary
                  </h4>
                  <button
                    onClick={() => setIsEditingSummary(!isEditingSummary)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isEditingSummary ? 'Done' : 'Edit'}</span>
                  </button>
                </div>
                {isEditingSummary ? (
                  <textarea
                    rows={3}
                    value={currentResume.summary}
                    onChange={(e) =>
                      setCurrentResume({ ...currentResume, summary: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                ) : (
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    {currentResume.summary}
                  </p>
                )}
              </div>

              {/* Technical Skills */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Demonstrated Technical Skills ({currentResume.technicalSkills.length})
                  </h4>
                  <span className="text-[10px] text-slate-500">Click &times; to remove</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentResume.technicalSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="group inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-mono bg-slate-800 text-cyan-300 border border-slate-700/80"
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-slate-500 hover:text-rose-400 ml-1"
                        title="Remove skill"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add new skill inline */}
                <form onSubmit={handleAddSkill} className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add verified skill (e.g. Docker, Redux)..."
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-52"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3 text-cyan-400" />
                    <span>Add</span>
                  </button>
                </form>
              </div>

              {/* Work Experience */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Verified Work Experience
                </h4>
                <div className="space-y-3">
                  {currentResume.experiences.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between font-semibold text-slate-200">
                        <span className="text-cyan-300">{exp.role}</span>
                        <span className="text-slate-400 text-[11px] font-normal font-mono">
                          {exp.company} • {exp.period}
                        </span>
                      </div>
                      <ul className="space-y-1 text-slate-300 list-disc list-inside">
                        {exp.highlights.map((h, i) => (
                          <li key={i} className="leading-relaxed">
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education & Certifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Education</span>
                  </h4>
                  {currentResume.education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs"
                    >
                      <div className="font-semibold text-slate-200">{edu.degree}</div>
                      <div className="text-slate-400 text-[11px]">
                        {edu.institution} ({edu.year})
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Award className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Certifications &amp; Accreditations</span>
                  </h4>
                  {currentResume.certifications.length > 0 ? (
                    currentResume.certifications.map((cert, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300"
                      >
                        {cert}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 text-xs italic">
                      None explicitly listed in resume.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
