import React, { useState } from 'react';
import { useCareer } from '../context/CareerContext.tsx';
import { api } from '../services/api.ts';
import { CvDraftPayload } from '../types.ts';
import {
  FileText,
  Send,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Sparkles,
  Palette,
} from 'lucide-react';

export const CvBuilder: React.FC = () => {
  const { theme, setActiveTab } = useCareer();

  const [firstName, setFirstName] = useState('Alex');
  const [lastName, setLastName] = useState('Chen');
  const [email, setEmail] = useState('alex.chen@example.com');
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [location, setLocation] = useState('San Francisco, CA');
  const [linkedin, setLinkedin] = useState('https://linkedin.com/in/alexchen-dev');
  const [website, setWebsite] = useState('https://alexchen.dev');
  const [summary, setSummary] = useState(
    'Experienced Full-Stack Software Engineer with 5+ years specializing in React, TypeScript, Node.js, and cloud native architectures. Proven record designing scalable microservices and resilient user interfaces.'
  );

  const [skills, setSkills] = useState('React, TypeScript, Node.js, Next.js, PostgreSQL, Docker, AWS, GraphQL, Tailwind CSS');

  const [works, setWorks] = useState([
    {
      company: 'TechCorp Solutions',
      position: 'Senior Software Engineer',
      responsibility: 'Led frontend architecture migration to React and TypeScript, cutting load times by 40%. Mentored junior engineers and designed internal design system components.',
      fromYear: 2022,
      toYear: 2026,
      current: true,
    },
    {
      company: 'DataFlow Inc.',
      position: 'Software Developer',
      responsibility: 'Developed high-throughput REST APIs and interactive dashboards consumed by 50,000+ daily active enterprise users.',
      fromYear: 2019,
      toYear: 2022,
      current: false,
    },
  ]);

  const [educations, setEducations] = useState([
    {
      organisation: 'University of California, Berkeley',
      qualification: 'B.S. in Computer Science',
      description: 'Coursework in Distributed Systems, Algorithms, and Software Engineering.',
    },
  ]);

  const [modelType, setModelType] = useState<'london' | 'rio' | 'newyork' | 'tokyo' | 'helsinki' | 'paris' | 'amsterdam'>('london');
  const [modelBaseColor, setModelBaseColor] = useState('#0284C7');

  const [isLoading, setIsLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [claimUrl, setClaimUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const buildPayload = (): CvDraftPayload => {
    return {
      personalInfo: {
        firstName,
        lastName,
        summary,
      },
      contactInfo: {
        email,
        phone,
        location,
        linkedin,
        website,
      },
      skills: skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      works: works.map((w) => ({
        company: w.company,
        position: w.position,
        responsibility: w.responsibility,
        period: {
          from: { year: w.fromYear },
          to: w.current ? undefined : { year: w.toYear },
          current: w.current,
        },
      })),
      educations: educations.map((e) => ({
        organisation: e.organisation,
        qualification: e.qualification,
        description: e.description,
      })),
      style: {
        modelType,
        modelBaseColor,
        modelBaseFont: 'Roboto',
      },
    };
  };

  const handleCreatePreview = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const payload = buildPayload();
      const res = await api.createCvPreview(payload);
      setPreviewResult(res);
      setStatusMessage('CV preview generated successfully via CVpop MCP (createCvPreview).');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate CV preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClaim = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const payload = buildPayload();
      const res = await api.createCvClaim(payload);
      const url = res?.structuredContent?.claimUrl || res?.claimUrl;
      if (url) {
        setClaimUrl(url);
        setStatusMessage('CV Claim Link ready! You can now continue in CVpop.');
      } else {
        setStatusMessage('CV claimed. Direct link received.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate CV claim link');
    } finally {
      setIsLoading(false);
    }
  };

  const addWork = () => {
    setWorks([
      ...works,
      {
        company: '',
        position: '',
        responsibility: '',
        fromYear: new Date().getFullYear() - 1,
        toYear: new Date().getFullYear(),
        current: false,
      },
    ]);
  };

  const removeWork = (index: number) => {
    setWorks(works.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    setEducations([
      ...educations,
      {
        organisation: '',
        qualification: '',
        description: '',
      },
    ]);
  };

  const removeEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Draft Your CV</h1>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              CVpop MCP
            </span>
          </div>
          <p className="text-sm mt-1 opacity-75">
            Create structured professional CVs and publish them instantly via CVpop MCP (<code className="text-cyan-500">createCvPreview</code> &amp; <code className="text-cyan-500">createCvClaim</code>).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreatePreview}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Generate Preview</span>
          </button>

          <button
            onClick={handleCreateClaim}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 shadow-md shadow-cyan-900/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Continue in CVpop</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          {claimUrl && (
            <a
              href={claimUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 underline text-emerald-300 font-semibold"
            >
              <span>Open in CVpop</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: CV Details Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <h3 className="font-bold text-sm flex items-center space-x-2">
              <FileText className="w-4 h-4 text-cyan-500" />
              <span>Personal Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs opacity-75 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`w-full text-xs rounded-lg px-3 py-2 border focus:outline-none focus:border-cyan-500 ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs opacity-75 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`w-full text-xs rounded-lg px-3 py-2 border focus:outline-none focus:border-cyan-500 ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs opacity-75 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full text-xs rounded-lg px-3 py-2 border focus:outline-none focus:border-cyan-500 ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs opacity-75 mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full text-xs rounded-lg px-3 py-2 border focus:outline-none focus:border-cyan-500 ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs opacity-75 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`w-full text-xs rounded-lg px-3 py-2 border focus:outline-none focus:border-cyan-500 ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs opacity-75 mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className={`w-full text-xs rounded-lg px-3 py-2 border focus:outline-none focus:border-cyan-500 ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs opacity-75 mb-1">Professional Summary</label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className={`w-full text-xs rounded-lg p-3 border focus:outline-none focus:border-cyan-500 ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs opacity-75 mb-1">Key Skills (Comma-separated)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className={`w-full text-xs rounded-lg px-3 py-2 border focus:outline-none focus:border-cyan-500 ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Work Experiences */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-cyan-500" />
                <span>Work Experience</span>
              </h3>
              <button
                onClick={addWork}
                className="flex items-center space-x-1 text-xs text-cyan-500 hover:text-cyan-400 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Role</span>
              </button>
            </div>

            {works.map((work, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border space-y-3 ${
                  theme === 'dark' ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-cyan-400">Position #{idx + 1}</span>
                  {works.length > 1 && (
                    <button
                      onClick={() => removeWork(idx)}
                      className="text-rose-400 hover:text-rose-300 text-xs p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs opacity-75 mb-1">Company</label>
                    <input
                      type="text"
                      value={work.company}
                      onChange={(e) => {
                        const copy = [...works];
                        copy[idx].company = e.target.value;
                        setWorks(copy);
                      }}
                      className={`w-full text-xs rounded-lg px-3 py-1.5 border focus:outline-none focus:border-cyan-500 ${
                        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs opacity-75 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={work.position}
                      onChange={(e) => {
                        const copy = [...works];
                        copy[idx].position = e.target.value;
                        setWorks(copy);
                      }}
                      className={`w-full text-xs rounded-lg px-3 py-1.5 border focus:outline-none focus:border-cyan-500 ${
                        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs opacity-75 mb-1">Key Responsibilities &amp; Achievements</label>
                  <textarea
                    rows={2}
                    value={work.responsibility}
                    onChange={(e) => {
                      const copy = [...works];
                      copy[idx].responsibility = e.target.value;
                      setWorks(copy);
                    }}
                    className={`w-full text-xs rounded-lg p-2.5 border focus:outline-none focus:border-cyan-500 ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-cyan-500" />
                <span>Education</span>
              </h3>
              <button
                onClick={addEducation}
                className="flex items-center space-x-1 text-xs text-cyan-500 hover:text-cyan-400 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Education</span>
              </button>
            </div>

            {educations.map((edu, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border space-y-3 ${
                  theme === 'dark' ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs opacity-75 mb-1">Institution</label>
                    <input
                      type="text"
                      value={edu.organisation}
                      onChange={(e) => {
                        const copy = [...educations];
                        copy[idx].organisation = e.target.value;
                        setEducations(copy);
                      }}
                      className={`w-full text-xs rounded-lg px-3 py-1.5 border focus:outline-none focus:border-cyan-500 ${
                        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs opacity-75 mb-1">Degree / Qualification</label>
                    <input
                      type="text"
                      value={edu.qualification}
                      onChange={(e) => {
                        const copy = [...educations];
                        copy[idx].qualification = e.target.value;
                        setEducations(copy);
                      }}
                      className={`w-full text-xs rounded-lg px-3 py-1.5 border focus:outline-none focus:border-cyan-500 ${
                        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Style Options & Actions */}
        <div className="space-y-6">
          {/* Template & Styling */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <h3 className="font-bold text-sm flex items-center space-x-2">
              <Palette className="w-4 h-4 text-cyan-500" />
              <span>CVpop Template &amp; Theme</span>
            </h3>

            <div>
              <label className="block text-xs opacity-75 mb-1">Template Style</label>
              <select
                value={modelType}
                onChange={(e: any) => setModelType(e.target.value)}
                className={`w-full text-xs rounded-lg px-3 py-2 border focus:outline-none focus:border-cyan-500 ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="london">London (Executive Clean)</option>
                <option value="paris">Paris (Modern Elegant)</option>
                <option value="newyork">New York (High Impact)</option>
                <option value="tokyo">Tokyo (Minimalist Tech)</option>
                <option value="helsinki">Helsinki (Nordic Structured)</option>
                <option value="amsterdam">Amsterdam (Creative Bold)</option>
                <option value="rio">Rio (Vibrant Dynamic)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs opacity-75 mb-1">Accent Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={modelBaseColor}
                  onChange={(e) => setModelBaseColor(e.target.value)}
                  className="w-10 h-9 rounded cursor-pointer border border-slate-700 bg-transparent"
                />
                <span className="font-mono text-xs opacity-80">{modelBaseColor}</span>
              </div>
            </div>
          </div>

          {/* Quick Score Action */}
          <div className={`p-5 rounded-2xl border space-y-3 ${
            theme === 'dark' ? 'bg-cyan-950/20 border-cyan-800/60' : 'bg-cyan-50/70 border-cyan-200'
          }`}>
            <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-500">Next Step: Score this CV</h4>
            <p className="text-xs opacity-80 leading-relaxed">
              Run this drafted CV through the <strong>Calibrd MCP</strong> evaluator to receive a match score against any JobDataLake listing.
            </p>
            <button
              onClick={() => setActiveTab('cv-scorer')}
              className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors"
            >
              Go to Match Scorer
            </button>
          </div>

          {/* Live Preview Raw Output */}
          {previewResult && (
            <div className={`p-5 rounded-2xl border space-y-3 ${
              theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-400">CVpop MCP Output</h4>
              <pre className="p-3 rounded-xl bg-slate-950 text-[11px] font-mono overflow-x-auto text-slate-300 max-h-60 border border-slate-800">
                {JSON.stringify(previewResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
