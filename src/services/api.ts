/**
 * Client API Service communicating with the server-side Google Jobs SerpApi endpoints
 */

import { JobListing, McpOverallHealth } from '../types.ts';

async function safeJsonFetch(url: string, options?: RequestInit): Promise<any> {
  const res = await fetch(url, options);
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    return { ok: res.ok, status: res.status, json };
  } catch {
    throw new Error(
      `Server returned HTTP ${res.status} (${res.statusText || 'Error'}) instead of JSON: ${text.slice(0, 120)}`
    );
  }
}

export const api = {
  /**
   * Fetch Google Jobs health status
   */
  async getMcpHealth(): Promise<McpOverallHealth> {
    const { ok, json } = await safeJsonFetch('/api/mcp/health');
    if (!ok || !json.success) throw new Error(json?.error || 'Failed to fetch Google Jobs health');
    return json.data;
  },

  /**
   * Toggle MCP Local Fallback / Strict Remote Mode
   */
  async toggleMcpFallback(allowLocalFallback: boolean): Promise<boolean> {
    const { ok, json } = await safeJsonFetch('/api/mcp/toggle-fallback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allowLocalFallback }),
    });
    if (!ok || !json.success) throw new Error(json?.error || 'Failed to toggle fallback');
    return json.localFallbackActive;
  },

  /**
   * Search jobs via Google Jobs
   */
  async searchJobs(params: {
    keywords?: string;
    location?: string;
    experienceLevel?: string;
    industry?: string;
    minSalary?: number;
  }): Promise<{ jobs: JobListing[]; source: string; warning?: string }> {
    const { ok, json } = await safeJsonFetch('/api/jobs/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!ok || !json.success) throw new Error(json?.error || 'Failed to search jobs');
    return {
      jobs: json.data || [],
      source: json.source || 'Google Jobs',
      warning: json.warning,
    };
  },

  /**
   * Get job details
   */
  async getJobDetails(jobId: string): Promise<JobListing> {
    const { ok, json } = await safeJsonFetch(`/api/jobs/${encodeURIComponent(jobId)}`);
    if (!ok || !json.success) throw new Error(json?.error || 'Failed to fetch job details');
    return json.data;
  },
};
