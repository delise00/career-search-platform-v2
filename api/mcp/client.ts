/**
 * Client for Google Jobs via SerpApi (https://serpapi.com/search?engine=google_jobs)
 * or MCP endpoints.
 */

import { JobListing, McpServerHealth, McpToolSchema } from './types.ts';
import { GOOGLE_JOBS_TOOL_SCHEMAS } from './local-provider.ts';

export interface GoogleJobsClientOptions {
  id: string;
  name: string;
  category?: 'jobs';
  endpointUrl: string;
  apiKey?: string;
  timeoutMs?: number;
}

export class GoogleJobsClient {
  public readonly id: string;
  public readonly name: string;
  public readonly category: 'jobs';
  private endpointUrl: string;
  private apiKey?: string;
  private timeoutMs: number;
  private lastHealthCheck: McpServerHealth;

  constructor(options: GoogleJobsClientOptions) {
    this.id = options.id;
    this.name = options.name;
    this.category = options.category || 'jobs';
    this.endpointUrl = options.endpointUrl;
    this.apiKey = options.apiKey;
    this.timeoutMs = options.timeoutMs || 8000;

    this.lastHealthCheck = {
      id: this.id,
      name: this.name,
      category: this.category,
      endpoint: this.maskEndpoint(this.endpointUrl),
      reachable: false,
      status: 'disconnected',
      latencyMs: 0,
      lastPing: new Date().toISOString(),
      discoveredTools: GOOGLE_JOBS_TOOL_SCHEMAS,
      errorMessage: 'Not initialized yet',
    };
  }

  public updateEndpoint(url: string, apiKey?: string) {
    this.endpointUrl = url;
    if (apiKey !== undefined) this.apiKey = apiKey;
    this.lastHealthCheck.endpoint = this.maskEndpoint(this.endpointUrl);
  }

  public getLastHealth(): McpServerHealth {
    return this.lastHealthCheck;
  }

  public getDiscoveredTools(): McpToolSchema[] {
    return GOOGLE_JOBS_TOOL_SCHEMAS;
  }

  private maskEndpoint(url: string): string {
    if (!url) return 'Not configured';
    try {
      const parsed = new URL(url);
      return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
    } catch {
      return url.replace(/([?&]api[-_]?key=)[^&]+/i, '$1***');
    }
  }

  /**
   * Health ping to the SerpApi Google Jobs endpoint
   */
  public async checkHealth(): Promise<McpServerHealth> {
    const startTime = Date.now();
    const nowIso = new Date().toISOString();

    if (!this.endpointUrl || this.endpointUrl.trim() === '') {
      this.lastHealthCheck = {
        id: this.id,
        name: this.name,
        category: this.category,
        endpoint: 'Not configured',
        reachable: false,
        status: 'disconnected',
        latencyMs: 0,
        lastPing: nowIso,
        discoveredTools: GOOGLE_JOBS_TOOL_SCHEMAS,
        errorMessage: 'Endpoint URL is not set.',
      };
      return this.lastHealthCheck;
    }

    try {
      const targetUrl = new URL(this.endpointUrl);
      if (this.apiKey && !targetUrl.searchParams.has('api_key')) {
        targetUrl.searchParams.set('api_key', this.apiKey);
      }
      if (!targetUrl.searchParams.has('engine')) {
        targetUrl.searchParams.set('engine', 'google_jobs');
      }
      // Send a lightweight test query
      if (!targetUrl.searchParams.has('q')) {
        targetUrl.searchParams.set('q', 'developer');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const res = await fetch(targetUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CareerNavigator/2.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      if (!res.ok) {
        const errorText = await res.text();
        let message = `HTTP ${res.status}: ${res.statusText}`;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed.error) message = parsed.error;
        } catch {
          // ignore
        }
        this.lastHealthCheck = {
          id: this.id,
          name: this.name,
          category: this.category,
          endpoint: this.maskEndpoint(this.endpointUrl),
          reachable: false,
          status: 'error',
          latencyMs,
          lastPing: nowIso,
          discoveredTools: GOOGLE_JOBS_TOOL_SCHEMAS,
          errorMessage: message,
        };
        return this.lastHealthCheck;
      }

      const data = await res.json();
      if (data.error) {
        this.lastHealthCheck = {
          id: this.id,
          name: this.name,
          category: this.category,
          endpoint: this.maskEndpoint(this.endpointUrl),
          reachable: false,
          status: 'error',
          latencyMs,
          lastPing: nowIso,
          discoveredTools: GOOGLE_JOBS_TOOL_SCHEMAS,
          errorMessage: data.error,
        };
        return this.lastHealthCheck;
      }

      this.lastHealthCheck = {
        id: this.id,
        name: this.name,
        category: this.category,
        endpoint: this.maskEndpoint(this.endpointUrl),
        reachable: true,
        status: 'connected',
        latencyMs,
        lastPing: nowIso,
        discoveredTools: GOOGLE_JOBS_TOOL_SCHEMAS,
        protocolVersion: 'SerpApi Google Jobs',
      };
      return this.lastHealthCheck;
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      this.lastHealthCheck = {
        id: this.id,
        name: this.name,
        category: this.category,
        endpoint: this.maskEndpoint(this.endpointUrl),
        reachable: false,
        status: 'error',
        latencyMs,
        lastPing: nowIso,
        discoveredTools: GOOGLE_JOBS_TOOL_SCHEMAS,
        errorMessage: err.message || 'Connection failed',
      };
      return this.lastHealthCheck;
    }
  }

  /**
   * Search jobs using Google Jobs SerpApi endpoint
   */
  public async searchGoogleJobs(params: {
    keywords?: string;
    location?: string;
    experienceLevel?: string;
    industry?: string;
    minSalary?: number;
  }): Promise<JobListing[]> {
    const targetUrl = new URL(this.endpointUrl);
    targetUrl.searchParams.set('engine', 'google_jobs');

    if (this.apiKey && !targetUrl.searchParams.has('api_key')) {
      targetUrl.searchParams.set('api_key', this.apiKey);
    }

    // Build query
    const queryParts: string[] = [];
    if (params.keywords && params.keywords.trim()) {
      queryParts.push(params.keywords.trim());
    } else {
      queryParts.push('software developer');
    }

    if (params.industry && params.industry !== 'All') {
      queryParts.push(params.industry);
    }
    if (params.experienceLevel && params.experienceLevel !== 'All') {
      queryParts.push(params.experienceLevel);
    }

    targetUrl.searchParams.set('q', queryParts.join(' '));

    if (params.location && params.location !== 'All') {
      targetUrl.searchParams.set('location', params.location);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    const res = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const text = await res.text();
      let errMsg = `SerpApi error HTTP ${res.status}`;
      try {
        const j = JSON.parse(text);
        if (j.error) errMsg = j.error;
      } catch {
        // ignore
      }
      throw new Error(errMsg);
    }

    const data = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }

    const rawJobs: any[] = data.jobs_results || [];

    // Map SerpApi Google Jobs results to JobListing format
    return rawJobs.map((raw: any, index: number): JobListing => {
      const title = raw.title || 'Untitled Role';
      const company = raw.company_name || 'Hiring Organization';
      const location = raw.location || 'Multiple Locations';
      const description = raw.description || '';
      const extensions: string[] = Array.isArray(raw.detected_extensions)
        ? Object.values(raw.detected_extensions).filter((v): v is string => typeof v === 'string')
        : Array.isArray(raw.extensions)
        ? raw.extensions
        : [];

      // Detect salary if present in extensions
      let salary: JobListing['salary'] = undefined;
      const salaryText = extensions.find((e) =>
        e.includes('$') || e.toLowerCase().includes('salary') || e.toLowerCase().includes('a year') || e.toLowerCase().includes('an hour')
      );
      if (salaryText) {
        salary = {
          currency: 'USD',
          period: salaryText.toLowerCase().includes('hour') ? 'hourly' : 'yearly',
        };
      }

      // Detect posted date
      const postedDate = extensions.find((e) => e.toLowerCase().includes('ago') || e.toLowerCase().includes('yesterday') || e.toLowerCase().includes('just')) || 'Recently posted';

      // Detect job type
      const jobTypeStr = extensions.find((e) => e.toLowerCase().includes('full-time') || e.toLowerCase().includes('part-time') || e.toLowerCase().includes('contract'));
      const jobType: JobListing['jobType'] = jobTypeStr?.toLowerCase().includes('part') ? 'Part-time' : jobTypeStr?.toLowerCase().includes('contract') ? 'Contract' : 'Full-time';

      // Parse apply link
      const applyLink = raw.apply_options?.[0]?.link || raw.share_link || undefined;

      // Extract skills / highlights
      const skillsRequired: string[] = [];
      if (Array.isArray(raw.job_highlights)) {
        for (const highlight of raw.job_highlights) {
          if (Array.isArray(highlight.items)) {
            for (const item of highlight.items) {
              if (item.length < 40) skillsRequired.push(item);
            }
          }
        }
      }
      if (skillsRequired.length === 0) {
        skillsRequired.push('Google Jobs Verified');
      }

      // Requirements from job_highlights
      const requirements: string[] = [];
      const qualHighlight = raw.job_highlights?.find((h: any) => h.title?.toLowerCase().includes('qualification'));
      if (qualHighlight && Array.isArray(qualHighlight.items)) {
        requirements.push(...qualHighlight.items);
      }
      if (requirements.length === 0) {
        requirements.push('See full description for qualifications and specifications.');
      }

      return {
        id: raw.job_id || `google-job-${index}-${Date.now()}`,
        title,
        company,
        location,
        salary,
        description,
        requirements,
        skillsRequired: skillsRequired.slice(0, 8),
        experienceLevel: params.experienceLevel && params.experienceLevel !== 'All' ? (params.experienceLevel as any) : 'Mid-Level',
        jobType,
        industry: params.industry && params.industry !== 'All' ? params.industry : 'Technology',
        postedDate,
        source: 'Google Jobs via SerpApi',
        applyLink,
      };
    });
  }
}
