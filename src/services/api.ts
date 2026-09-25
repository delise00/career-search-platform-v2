/**
 * Client API Service communicating with the server-side MCP endpoints
 */

import {
  JobListing,
  ResumeData,
  JobCompatibilityResult,
  TailoredResumeRecommendation,
  GeneratedCoverLetter,
  InterviewPrepResult,
  McpOverallHealth,
} from '../types.ts';

export const api = {
  /**
   * Fetch developer MCP health status
   */
  async getMcpHealth(): Promise<McpOverallHealth> {
    const res = await fetch('/api/mcp/health');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch MCP health');
    return json.data;
  },

  /**
   * Toggle MCP Local Fallback / Strict Remote Mode
   */
  async toggleMcpFallback(allowLocalFallback: boolean): Promise<boolean> {
    const res = await fetch('/api/mcp/toggle-fallback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allowLocalFallback }),
    });
    const json = await res.json();
    return json.localFallbackActive;
  },

  /**
   * Search jobs via Indeed MCP
   */
  async searchJobs(params: {
    keywords?: string;
    location?: string;
    experienceLevel?: string;
    industry?: string;
    minSalary?: number;
  }): Promise<{ jobs: JobListing[]; source: string; warning?: string }> {
    const res = await fetch('/api/jobs/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to search jobs');
    return {
      jobs: json.data || [],
      source: json.source || 'Indeed MCP',
      warning: json.warning,
    };
  },

  /**
   * Screen resume via AI HR Management Toolkit MCP
   */
  async screenResume(resumeText: string): Promise<{ resume: ResumeData; source: string }> {
    const res = await fetch('/api/resume/screen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to screen resume');
    return {
      resume: json.data,
      source: json.source,
    };
  },

  /**
   * Compute job compatibility via AI HR Toolkit MCP
   */
  async matchCompatibility(
    resume: ResumeData,
    job: JobListing,
  ): Promise<{ result: JobCompatibilityResult; source: string }> {
    const res = await fetch('/api/resume/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume, job }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to evaluate compatibility');
    return {
      result: json.data,
      source: json.source,
    };
  },

  /**
   * Tailor resume suggestions via StoryLenses MCP
   */
  async tailorResume(
    resume: ResumeData,
    job: JobListing,
  ): Promise<{ result: TailoredResumeRecommendation; source: string }> {
    const res = await fetch('/api/application/tailor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume, job }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to tailor resume');
    return {
      result: json.data,
      source: json.source,
    };
  },

  /**
   * Generate truthful cover letter via StoryLenses MCP
   */
  async generateCoverLetter(
    resume: ResumeData,
    job: JobListing,
    emphasisNotes?: string,
  ): Promise<{ letter: GeneratedCoverLetter; source: string }> {
    const res = await fetch('/api/application/cover-letter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume, job, emphasisNotes }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to generate cover letter');
    return {
      letter: json.data,
      source: json.source,
    };
  },

  /**
   * Generate interview prep questions
   */
  async generateInterviewPrep(
    resume: ResumeData,
    job: JobListing,
  ): Promise<{ prep: InterviewPrepResult; source: string }> {
    const res = await fetch('/api/interview/prep', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume, job }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to prepare interview questions');
    return {
      prep: json.data,
      source: json.source,
    };
  },
};
