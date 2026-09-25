/**
 * Client API Service communicating with the server-side Indeed MCP endpoints
 */

import { JobListing, McpOverallHealth } from '../types.ts';

export const api = {
  /**
   * Fetch developer Indeed MCP health status
   */
  async getMcpHealth(): Promise<McpOverallHealth> {
    const res = await fetch('/api/mcp/health');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch Indeed MCP health');
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
   * Get job details via Indeed MCP
   */
  async getJobDetails(jobId: string): Promise<JobListing> {
    const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch job details');
    return json.data;
  },
};
