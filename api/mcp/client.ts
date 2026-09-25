/**
 * Client for Google Jobs via Smithery MCP (https://server.smithery.ai/google/jobs)
 * or SerpApi (https://serpapi.com/search?engine=google_jobs)
 */

import { JobListing, McpServerHealth, McpToolSchema } from './types.ts';
import { GOOGLE_JOBS_TOOL_SCHEMAS } from './local-provider.ts';

export interface GoogleJobsClientOptions {
  id: string;
  name: string;
  category?: 'jobs';
  endpointUrl: string;
  apiKey?: string;
  smitheryToken?: string;
  timeoutMs?: number;
}

export class GoogleJobsClient {
  public readonly id: string;
  public readonly name: string;
  public readonly category: 'jobs';
  private endpointUrl: string;
  private apiKey?: string;
  private smitheryToken?: string;
  private timeoutMs: number;
  private lastHealthCheck: McpServerHealth;

  constructor(options: GoogleJobsClientOptions) {
    this.id = options.id;
    this.name = options.name;
    this.category = options.category || 'jobs';
    this.endpointUrl = options.endpointUrl;
    this.apiKey = options.apiKey;
    this.smitheryToken = options.smitheryToken;
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

  public updateEndpoint(url: string, apiKey?: string, smitheryToken?: string) {
    this.endpointUrl = url;
    if (apiKey !== undefined) this.apiKey = apiKey;
    if (smitheryToken !== undefined) this.smitheryToken = smitheryToken;
    this.lastHealthCheck.endpoint = this.maskEndpoint(this.endpointUrl);
  }

  public isSmitheryEndpoint(): boolean {
    return (
      this.endpointUrl.includes('smithery.ai') ||
      this.endpointUrl.includes('run.tools')
    );
  }

  public hasValidCredentials(): boolean {
    if (this.isSmitheryEndpoint()) {
      return Boolean(
        this.smitheryToken &&
        this.smitheryToken.trim() !== '' &&
        !this.smitheryToken.includes('MY_') &&
        !this.smitheryToken.includes('YOUR_')
      );
    }
    return Boolean(
      this.apiKey &&
      this.apiKey.trim() !== '' &&
      !this.apiKey.includes('MY_') &&
      !this.apiKey.includes('YOUR_') &&
      this.apiKey !== 'undefined'
    );
  }

  public hasValidApiKey(): boolean {
    return this.hasValidCredentials();
  }

  public maskEndpoint(url: string): string {
    if (!url) return 'Not configured';
    try {
      const parsed = new URL(url);
      return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
    } catch {
      return url.replace(/([?&]api[-_]?key=)[^&]+/i, '$1***');
    }
  }

  public getLastHealth(): McpServerHealth {
    return this.lastHealthCheck;
  }

  public getDiscoveredTools(): McpToolSchema[] {
    return GOOGLE_JOBS_TOOL_SCHEMAS;
  }

  /**
   * Health ping to the configured Google Jobs endpoint
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

    if (!this.hasValidCredentials()) {
      const msg = this.isSmitheryEndpoint()
        ? 'Smithery MCP endpoint configured (https://server.smithery.ai/google/jobs). Ready in benchmark mode (or configure SMITHERY_API_KEY for live queries).'
        : 'Google Jobs endpoint configured. Operating in benchmark mode (or configure SERPAPI_API_KEY for live queries).';

      this.lastHealthCheck = {
        id: this.id,
        name: this.isSmitheryEndpoint() ? 'Google Jobs (Smithery MCP)' : this.name,
        category: this.category,
        endpoint: this.maskEndpoint(this.endpointUrl),
        reachable: true,
        status: 'simulated',
        latencyMs: 1,
        lastPing: nowIso,
        discoveredTools: GOOGLE_JOBS_TOOL_SCHEMAS,
        errorMessage: msg,
      };
      return this.lastHealthCheck;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      if (this.isSmitheryEndpoint()) {
        const res = await fetch(this.endpointUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.smitheryToken}`,
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/list',
            params: {},
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const latencyMs = Date.now() - startTime;

        if (!res.ok) {
          const errorText = await res.text();
          let message = `HTTP ${res.status}: ${res.statusText}`;
          try {
            const parsed = JSON.parse(errorText);
            if (parsed.error_description) message = parsed.error_description;
            else if (parsed.message) message = parsed.message;
            else if (parsed.error) message = typeof parsed.error === 'string' ? parsed.error : JSON.stringify(parsed.error);
          } catch {
            // ignore
          }
          this.lastHealthCheck = {
            id: this.id,
            name: 'Google Jobs (Smithery MCP)',
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
        const tools = Array.isArray(data.result?.tools) ? data.result.tools : GOOGLE_JOBS_TOOL_SCHEMAS;

        this.lastHealthCheck = {
          id: this.id,
          name: 'Google Jobs (Smithery MCP)',
          category: this.category,
          endpoint: this.maskEndpoint(this.endpointUrl),
          reachable: true,
          status: 'connected',
          latencyMs,
          lastPing: nowIso,
          discoveredTools: tools,
          protocolVersion: 'Smithery MCP / JSON-RPC 2.0',
        };
        return this.lastHealthCheck;
      }

      // SerpApi endpoint
      const targetUrl = new URL(this.endpointUrl);
      if (this.apiKey && !targetUrl.searchParams.has('api_key')) {
        targetUrl.searchParams.set('api_key', this.apiKey);
      }
      if (!targetUrl.searchParams.has('engine')) {
        targetUrl.searchParams.set('engine', 'google_jobs');
      }
      if (!targetUrl.searchParams.has('q')) {
        targetUrl.searchParams.set('q', 'developer');
      }

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
   * Search jobs using Google Jobs (Smithery MCP or SerpApi)
   */
  public async searchGoogleJobs(params: {
    keywords?: string;
    location?: string;
    experienceLevel?: string;
    industry?: string;
    minSalary?: number;
  }): Promise<JobListing[]> {
    if (!this.hasValidCredentials()) {
      throw new Error('No API credentials configured');
    }

    if (this.isSmitheryEndpoint()) {
      return this.searchViaSmitheryMcp(params);
    }
    return this.searchViaSerpApi(params);
  }

  private async searchViaSmitheryMcp(params: {
    keywords?: string;
    location?: string;
    experienceLevel?: string;
    industry?: string;
    minSalary?: number;
  }): Promise<JobListing[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    const queryParts: string[] = [];
    if (params.keywords && params.keywords.trim()) queryParts.push(params.keywords.trim());
    else queryParts.push('software developer');
    if (params.industry && params.industry !== 'All') queryParts.push(params.industry);
    if (params.experienceLevel && params.experienceLevel !== 'All') queryParts.push(params.experienceLevel);

    const res = await fetch(this.endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.smitheryToken}`,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: 'search_jobs',
          arguments: {
            query: queryParts.join(' '),
            location: params.location && params.location !== 'All' ? params.location : undefined,
          },
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const text = await res.text();
      let errMsg = `Smithery MCP error HTTP ${res.status}`;
      try {
        const j = JSON.parse(text);
        if (j.error_description) errMsg = j.error_description;
        else if (j.message) errMsg = j.message;
        else if (j.error) errMsg = typeof j.error === 'string' ? j.error : JSON.stringify(j.error);
      } catch {
        // ignore
      }
      throw new Error(errMsg);
    }

    const data = await res.json();
    if (data.error) {
      throw new Error(typeof data.error === 'string' ? data.error : data.error.message || 'Smithery error');
    }

    let parsedContent: any = null;
    const content = data.result?.content;
    if (Array.isArray(content) && content.length > 0) {
      const textBlock = content.find((c: any) => c.type === 'text' || typeof c.text === 'string');
      if (textBlock?.text) {
        try {
          parsedContent = JSON.parse(textBlock.text);
        } catch {
          parsedContent = textBlock.text;
        }
      }
    }

    const jobResults = Array.isArray(parsedContent?.jobs_results)
      ? parsedContent.jobs_results
      : Array.isArray(parsedContent)
      ? parsedContent
      : [];

    return jobResults.map((raw: any, index: number): JobListing => {
      const title = raw.title || 'Untitled Role';
      const company = raw.company_name || raw.company || 'Hiring Organization';
      const location = raw.location || 'Multiple Locations';
      const description = raw.description || '';
      const applyLink = raw.apply_options?.[0]?.link || raw.share_link || raw.link || undefined;

      return {
        id: raw.job_id || `smithery-job-${index}-${Date.now()}`,
        title,
        company,
        location,
        salary: raw.salary ? { currency: 'USD', period: 'yearly' } : undefined,
        description,
        requirements: ['See full description on Google Jobs.'],
        skillsRequired: ['Google Jobs Verified', 'Smithery MCP'],
        experienceLevel: params.experienceLevel && params.experienceLevel !== 'All' ? (params.experienceLevel as any) : 'Mid-Level',
        jobType: 'Full-time',
        industry: params.industry && params.industry !== 'All' ? params.industry : 'Technology',
        postedDate: raw.posted_at || 'Recently posted',
        source: 'Google Jobs via Smithery MCP',
        applyLink,
      };
    });
  }

  private async searchViaSerpApi(params: {
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

      const postedDate = extensions.find((e) => e.toLowerCase().includes('ago') || e.toLowerCase().includes('yesterday') || e.toLowerCase().includes('just')) || 'Recently posted';
      const jobTypeStr = extensions.find((e) => e.toLowerCase().includes('full-time') || e.toLowerCase().includes('part-time') || e.toLowerCase().includes('contract'));
      const jobType: JobListing['jobType'] = jobTypeStr?.toLowerCase().includes('part') ? 'Part-time' : jobTypeStr?.toLowerCase().includes('contract') ? 'Contract' : 'Full-time';
      const applyLink = raw.apply_options?.[0]?.link || raw.share_link || undefined;

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
