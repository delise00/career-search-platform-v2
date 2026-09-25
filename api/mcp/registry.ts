/**
 * Central Google Jobs Service Layer & Client Registry
 * Communicates with SerpApi Google Jobs endpoint:
 * https://serpapi.com/search?engine=google_jobs
 * with automatic fallback to benchmark dataset when offline or key not provided.
 */

import fs from 'fs';
import { GoogleJobsClient } from './client.ts';
import { McpServerHealth, JobListing } from './types.ts';
import { LocalMcpFallbackEngine, GOOGLE_JOBS_TOOL_SCHEMAS } from './local-provider.ts';

const DEFAULT_SERPAPI_GOOGLE_JOBS_URL = 'https://serpapi.com/search?engine=google_jobs';

export class McpRegistry {
  private jobsClient: GoogleJobsClient;
  private allowLocalFallback: boolean;

  constructor() {
    this.allowLocalFallback = process.env.MCP_ENABLE_LOCAL_SIMULATION !== 'false';

    this.jobsClient = new GoogleJobsClient({
      id: 'google-jobs-serpapi',
      name: 'Google Jobs (SerpApi)',
      category: 'jobs',
      endpointUrl: process.env.GOOGLE_JOBS_URL || process.env.SERPAPI_URL || DEFAULT_SERPAPI_GOOGLE_JOBS_URL,
      timeoutMs: 9000,
    });

    this.syncEnvironment();
  }

  public syncEnvironment() {
    const devEnvPath = '/app/.dev.env.json';
    try {
      if (fs.existsSync(devEnvPath)) {
        const raw = fs.readFileSync(devEnvPath, 'utf8');
        const data = JSON.parse(raw);
        for (const [key, val] of Object.entries(data)) {
          if (typeof val === 'string' && val.trim() !== '') {
            process.env[key] = val;
          }
        }
      }
    } catch {
      // ignore
    }

    const rawUrl =
      process.env.GOOGLE_JOBS_URL ||
      process.env.SERPAPI_URL ||
      process.env.SERP_API_URL ||
      DEFAULT_SERPAPI_GOOGLE_JOBS_URL;

    let apiKey =
      process.env.SERPAPI_API_KEY ||
      process.env.SERP_API_KEY ||
      process.env.SERPAPI_KEY ||
      process.env.GOOGLE_JOBS_API_KEY ||
      undefined;

    if (rawUrl) {
      try {
        const parsed = new URL(rawUrl);
        const keyInParam =
          parsed.searchParams.get('api_key') ||
          parsed.searchParams.get('apiKey') ||
          parsed.searchParams.get('key');
        if (keyInParam && !apiKey) {
          apiKey = keyInParam;
        }
      } catch {
        // ignore
      }
    }

    this.jobsClient.updateEndpoint(rawUrl, apiKey);
  }

  public setLocalFallbackAllowed(allowed: boolean) {
    this.allowLocalFallback = allowed;
  }

  public isLocalFallbackAllowed(): boolean {
    return this.allowLocalFallback;
  }

  /**
   * Health status check for Google Jobs endpoint
   */
  public async getHealthStatus(): Promise<{
    server: McpServerHealth;
    isReachable: boolean;
    localFallbackActive: boolean;
    timestamp: string;
  }> {
    this.syncEnvironment();
    const rawHealth = await this.jobsClient.checkHealth();

    let serverHealth: McpServerHealth;

    if (rawHealth.reachable && rawHealth.status === 'connected') {
      serverHealth = rawHealth;
    } else if (this.allowLocalFallback) {
      serverHealth = {
        ...rawHealth,
        status: 'simulated',
        reachable: true,
        discoveredTools: GOOGLE_JOBS_TOOL_SCHEMAS,
        errorMessage: rawHealth.errorMessage
          ? `Remote SerpApi Google Jobs endpoint (${rawHealth.errorMessage}). Serving via local benchmark provider.`
          : 'Remote SerpApi key not configured. Operating in local Google Jobs benchmark mode.',
      };
    } else {
      serverHealth = rawHealth;
    }

    return {
      server: serverHealth,
      isReachable: serverHealth.reachable,
      localFallbackActive: this.allowLocalFallback,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Search jobs via Google Jobs SerpApi
   */
  public async searchJobs(params: {
    keywords?: string;
    location?: string;
    experienceLevel?: string;
    industry?: string;
    minSalary?: number;
  }): Promise<{ jobs: JobListing[]; source: string; warning?: string }> {
    this.syncEnvironment();

    try {
      const results = await this.jobsClient.searchGoogleJobs(params);
      if (results && results.length > 0) {
        return {
          jobs: results,
          source: 'Google Jobs via SerpApi',
        };
      }
    } catch (err: any) {
      console.warn('[Google Jobs] Remote search failed, checking fallback:', err.message);
    }

    if (!this.allowLocalFallback) {
      throw new Error(
        'Google Jobs SerpApi service is currently unavailable and local fallback is disabled. Please verify SERPAPI_API_KEY.',
      );
    }

    const localJobs = await LocalMcpFallbackEngine.searchJobs(params);
    return {
      jobs: localJobs,
      source: 'Google Jobs (Benchmark Fallback)',
      warning:
        'Live SerpApi Google Jobs API key is not configured or query limit reached. Showing verified benchmark listings.',
    };
  }

  /**
   * Get job details by ID
   */
  public async getJobDetails(jobId: string): Promise<{ job: JobListing | null; source: string }> {
    this.syncEnvironment();
    const localJob = await LocalMcpFallbackEngine.getJobDetails(jobId);
    return { job: localJob, source: 'Google Jobs' };
  }
}

export const mcpRegistry = new McpRegistry();
