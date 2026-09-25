/**
 * Client API Service communicating with the server-side JobDataLake, CVpop, and Calibrd MCP endpoints
 */

import {
  JobListing,
  JobFilterParams,
  MultiMcpHealthResponse,
  CvDraftPayload,
  CalibrdScoreResult,
} from '../types.ts';

async function safeJsonFetch(url: string, options?: RequestInit): Promise<any> {
  const res = await fetch(url, options);
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    return { ok: res.ok, status: res.status, json };
  } catch {
    throw new Error(
      `Server returned HTTP ${res.status} (${res.statusText || 'Error'}): ${text.slice(0, 120)}`
    );
  }
}

export const api = {
  /**
   * Fetch all MCP health statuses (JobDataLake, CVpop, Calibrd)
   */
  async getMultiMcpHealth(): Promise<MultiMcpHealthResponse> {
    const { ok, json } = await safeJsonFetch('/api/mcp?format=json');
    if (!ok || !json.success) throw new Error(json?.error || 'Failed to fetch MCP ecosystem health');
    return json.servers;
  },

  /**
   * Search jobs via JobDataLake MCP with complete filter parameters
   */
  async searchJobs(params: JobFilterParams): Promise<{ jobs: JobListing[]; source: string; warning?: string }> {
    const { ok, json } = await safeJsonFetch('/api/jobs/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!ok || !json.success) throw new Error(json?.error || 'Failed to search jobs');
    return {
      jobs: json.data || [],
      source: json.source || 'JobDataLake MCP',
      warning: json.warning,
    };
  },

  /**
   * Fetch full job details
   */
  async getJobDetails(id: string): Promise<JobListing> {
    const { ok, json } = await safeJsonFetch(`/api/jobs/${encodeURIComponent(id)}`);
    if (!ok || !json.success) throw new Error(json?.error || 'Failed to fetch job details');
    return json.data;
  },

  /**
   * Create CV preview via CVpop MCP
   */
  async createCvPreview(payload: CvDraftPayload) {
    const { ok, json } = await safeJsonFetch('/api/cv/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!ok || !json.success) throw new Error(json?.error || 'Failed to create CV preview');
    return json.data;
  },

  /**
   * Create CV claim link to continue in CVpop
   */
  async createCvClaim(payload: CvDraftPayload) {
    const { ok, json } = await safeJsonFetch('/api/cv/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!ok || !json.success) throw new Error(json?.error || 'Failed to generate CV claim URL');
    return json.data;
  },

  /**
   * Score CV against Job Description via Calibrd MCP
   */
  async scoreCvAgainstJob(params: {
    cv_text: string;
    job_title: string;
    job_description: string;
    level?: string;
  }): Promise<CalibrdScoreResult> {
    const { ok, json } = await safeJsonFetch('/api/scoring/score-job', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!ok || !json.success) throw new Error(json?.error || 'Failed to score CV');
    return json.data;
  },
};
