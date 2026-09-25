/**
 * JobDataLake MCP Client (https://mcp.jobdatalake.com)
 * Native Model Context Protocol (MCP) Client over HTTP Server-Sent Events (SSE).
 * Connects to JobDataLake 1M+ job database with 20K+ companies.
 */

import https from 'https';
import { JobListing, McpServerHealth, McpToolSchema } from './types.ts';

export const JOBDATALAKE_TOOL_SCHEMAS: McpToolSchema[] = [
  {
    name: 'search_jobs',
    description:
      'Search 1M+ job listings from 20K+ companies. Supports keyword search, AI semantic search, location, salary, remote type, and seniority.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Keyword search (title, company, skills)' },
        semantic_query: { type: 'string', description: 'AI semantic search for remote + tech jobs' },
        location: { type: 'string', description: 'Location filter, e.g. "Remote", "Singapore", "San Francisco"' },
        remote_type: { type: 'string', enum: ['fully_remote', 'hybrid', 'on_site'] },
        seniority: { type: 'string', description: 'Entry, Mid Level, Senior, Staff, Principal, Director' },
        employment_type: { type: 'string', enum: ['full_time', 'part_time', 'contract', 'internship'] },
        salary_min: { type: 'number', description: 'Minimum annual salary in USD' },
        page: { type: 'number', default: 1 },
        per_page: { type: 'number', default: 20 },
      },
    },
  },
  {
    name: 'get_job',
    description: 'Get full details for a specific job listing including description, requirements, salary, and apply link.',
    inputSchema: {
      type: 'object',
      properties: {
        job_id: { type: 'string', description: 'Job handle ID from search results' },
      },
      required: ['job_id'],
    },
  },
  {
    name: 'get_company',
    description: 'Get company profile including open job count, industry, size, and career page URL.',
    inputSchema: {
      type: 'object',
      properties: {
        company: { type: 'string', description: 'Company domain (e.g. "stripe.com") or handle' },
      },
      required: ['company'],
    },
  },
  {
    name: 'find_similar_jobs',
    description: 'Find jobs similar to a given job listing using AI vector similarity.',
    inputSchema: {
      type: 'object',
      properties: {
        job_id: { type: 'string', description: 'Job handle from search results' },
        per_page: { type: 'number', default: 10 },
      },
      required: ['job_id'],
    },
  },
];

export interface JobDataLakeClientOptions {
  id: string;
  name: string;
  category?: 'jobs';
  baseUrl: string;
  apiKey?: string;
  timeoutMs?: number;
}

export class JobDataLakeMcpClient {
  public readonly id: string;
  public readonly name: string;
  public readonly category: 'jobs' = 'jobs';
  private baseUrl: string;
  private apiKey?: string;
  private timeoutMs: number;
  private lastHealthCheck: McpServerHealth;

  constructor(options: JobDataLakeClientOptions) {
    this.id = options.id;
    this.name = options.name;
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.apiKey = options.apiKey;
    this.timeoutMs = options.timeoutMs || 9000;

    this.lastHealthCheck = {
      id: this.id,
      name: this.name,
      category: 'jobs',
      endpoint: this.baseUrl,
      reachable: false,
      status: 'disconnected',
      latencyMs: 0,
      lastPing: new Date().toISOString(),
      discoveredTools: JOBDATALAKE_TOOL_SCHEMAS,
      errorMessage: 'Initialized',
      protocolVersion: 'MCP SSE (2024-11-05)',
    };
  }

  public updateEndpoint(url: string, apiKey?: string) {
    this.baseUrl = (url || 'https://mcp.jobdatalake.com').replace(/\/+$/, '');
    if (apiKey !== undefined) this.apiKey = apiKey;
    this.lastHealthCheck.endpoint = this.baseUrl;
  }

  public getLastHealth(): McpServerHealth {
    return this.lastHealthCheck;
  }

  public getDiscoveredTools(): McpToolSchema[] {
    return JOBDATALAKE_TOOL_SCHEMAS;
  }

  /**
   * Health ping to JobDataLake MCP server
   */
  public async checkHealth(): Promise<McpServerHealth> {
    const startTime = Date.now();
    const nowIso = new Date().toISOString();

    try {
      const initResult = await this.executeMcpRpc('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'career-search-platform', version: '2.0.0' },
      });

      const latencyMs = Date.now() - startTime;
      const serverInfo = initResult?.serverInfo?.name || 'jobdatalake';
      const instructions = initResult?.instructions || '';

      this.lastHealthCheck = {
        id: this.id,
        name: `JobDataLake MCP (${serverInfo})`,
        category: 'jobs',
        endpoint: this.baseUrl,
        reachable: true,
        status: 'connected',
        latencyMs,
        lastPing: nowIso,
        discoveredTools: JOBDATALAKE_TOOL_SCHEMAS,
        protocolVersion: 'MCP SSE (2024-11-05)',
        errorMessage: instructions ? instructions.slice(0, 150) + '...' : undefined,
      };
      return this.lastHealthCheck;
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      this.lastHealthCheck = {
        id: this.id,
        name: this.name,
        category: 'jobs',
        endpoint: this.baseUrl,
        reachable: false,
        status: 'error',
        latencyMs,
        lastPing: nowIso,
        discoveredTools: JOBDATALAKE_TOOL_SCHEMAS,
        errorMessage: err.message || 'JobDataLake connection failed',
      };
      return this.lastHealthCheck;
    }
  }

  /**
   * Search jobs via JobDataLake MCP `search_jobs` tool
   */
  public async searchJobs(params: {
    keywords?: string;
    location?: string;
    experienceLevel?: string;
    industry?: string;
    minSalary?: number;
  }): Promise<JobListing[]> {
    const query = params.keywords?.trim() || '*';
    const toolArgs: Record<string, any> = {
      query,
      per_page: 25,
    };

    if (params.location && params.location !== 'All') {
      toolArgs.location = params.location;
    }

    if (params.experienceLevel && params.experienceLevel !== 'All') {
      const mapped = this.mapSeniority(params.experienceLevel);
      if (mapped) toolArgs.seniority = mapped;
    }

    if (params.minSalary && params.minSalary > 0) {
      toolArgs.salary_min = params.minSalary;
    }

    const rpcResult = await this.executeMcpRpc('tools/call', {
      name: 'search_jobs',
      arguments: toolArgs,
    });

    const rawText = rpcResult?.content?.[0]?.text || '';
    return this.parseJobsFromMcpResponse(rawText, params);
  }

  /**
   * Get job details by ID via JobDataLake MCP `get_job` tool
   */
  public async getJob(jobId: string): Promise<JobListing | null> {
    try {
      const rpcResult = await this.executeMcpRpc('tools/call', {
        name: 'get_job',
        arguments: { job_id: jobId },
      });

      const rawText = rpcResult?.content?.[0]?.text || '';
      return this.parseSingleJobDetail(jobId, rawText);
    } catch {
      return null;
    }
  }

  /**
   * Executes a standard MCP Request over the SSE transport of JobDataLake
   */
  private executeMcpRpc(method: string, params: Record<string, any>): Promise<any> {
    return new Promise((resolve, reject) => {
      let settled = false;
      const sseUrl = `${this.baseUrl}/sse`;
      const parsedSse = new URL(sseUrl);

      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          try {
            sseReq.destroy();
          } catch {}
          reject(new Error(`MCP timeout waiting for response to ${method}`));
        }
      }, this.timeoutMs);

      const sseHeaders: Record<string, string> = {
        'Accept': 'text/event-stream',
        'User-Agent': 'CareerNavigator/2.0',
      };
      if (this.apiKey) {
        sseHeaders['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const sseReq = https.request(
        {
          hostname: parsedSse.hostname,
          port: parsedSse.port || 443,
          path: parsedSse.pathname + parsedSse.search,
          method: 'GET',
          headers: sseHeaders,
        },
        (sseRes) => {
          if (sseRes.statusCode !== 200) {
            clearTimeout(timer);
            settled = true;
            sseReq.destroy();
            return reject(new Error(`SSE connection failed with HTTP ${sseRes.statusCode}`));
          }

          let sseBuffer = '';

          sseRes.on('data', (chunk) => {
            if (settled) return;
            sseBuffer += chunk.toString();

            // 1. Look for endpoint announcement
            const endpointMatch = sseBuffer.match(/event:\s*endpoint\s*\ndata:\s*([^\r\n]+)/);
            if (endpointMatch && !sseBuffer.includes('__POST_SENT__')) {
              const messagePath = endpointMatch[1].trim();
              sseBuffer += '\n__POST_SENT__\n';

              const postHeaders: Record<string, string> = {
                'Content-Type': 'application/json',
              };
              if (this.apiKey) {
                postHeaders['Authorization'] = `Bearer ${this.apiKey}`;
              }

              const postReq = https.request({
                hostname: parsedSse.hostname,
                port: parsedSse.port || 443,
                path: messagePath,
                method: 'POST',
                headers: postHeaders,
              });

              postReq.on('error', (err) => {
                if (!settled) {
                  settled = true;
                  clearTimeout(timer);
                  try {
                    sseReq.destroy();
                  } catch {}
                  reject(err);
                }
              });

              postReq.write(
                JSON.stringify({
                  jsonrpc: '2.0',
                  id: Date.now(),
                  method,
                  params,
                }),
              );
              postReq.end();
            }

            // 2. Look for JSON-RPC response in SSE stream
            const lines = sseBuffer.split(/\r?\n/);
            for (const line of lines) {
              if (line.startsWith('data: ') && line.includes('"result"')) {
                const jsonStr = line.slice(6).trim();
                try {
                  const payload = JSON.parse(jsonStr);
                  if (payload.result !== undefined) {
                    clearTimeout(timer);
                    settled = true;
                    try {
                      sseReq.destroy();
                    } catch {}
                    return resolve(payload.result);
                  }
                  if (payload.error) {
                    clearTimeout(timer);
                    settled = true;
                    try {
                      sseReq.destroy();
                    } catch {}
                    return reject(new Error(payload.error.message || JSON.stringify(payload.error)));
                  }
                } catch {
                  // Wait for more chunks
                }
              }
            }
          });

          sseRes.on('end', () => {
            if (!settled) {
              clearTimeout(timer);
              settled = true;
              reject(new Error('SSE stream closed before MCP RPC completed'));
            }
          });
        },
      );

      sseReq.on('error', (err) => {
        if (!settled) {
          clearTimeout(timer);
          settled = true;
          reject(err);
        }
      });

      sseReq.end();
    });
  }

  private mapSeniority(level: string): string | undefined {
    const l = level.toLowerCase();
    if (l.includes('entry') || l.includes('junior')) return 'Entry';
    if (l.includes('mid')) return 'Mid Level';
    if (l.includes('senior')) return 'Senior';
    if (l.includes('lead') || l.includes('director')) return 'Lead,Director';
    return undefined;
  }

  private parseJobsFromMcpResponse(
    text: string,
    filters: { industry?: string; experienceLevel?: string },
  ): JobListing[] {
    const jobs: JobListing[] = [];
    if (!text || text.trim() === '') return jobs;

    // Pattern in JobDataLake:
    // 1. **Full-Stack Product Engineer (Remote)** at TurbineOne
    //    Remote | fully_remote | Not disclosed
    //    Skills: Go, C++, C#, Java, Vue.js, React...
    //    Apply: https://job-boards.greenhouse.io/turbineone/jobs/5431405008
    //    ID: turbineone-full-stack-product-engineer-kitmh

    const blocks = text.split(/(?=\d+\.\s+\*\*)/);

    for (const block of blocks) {
      const titleMatch = block.match(/\d+\.\s+\*\*(.*?)\*\*\s+at\s+([^\r\n]+)/);
      if (!titleMatch) continue;

      const title = titleMatch[1].trim();
      const company = titleMatch[2].trim();

      // Extract details line: Location | RemoteType | Salary
      const detailsMatch = block.match(/\n\s*([^\r\n|]+)\s*\|\s*([^\r\n|]+)\s*\|\s*([^\r\n]+)/);
      const location = detailsMatch ? detailsMatch[1].trim() : 'Remote / Hybrid';
      const remoteTypeStr = detailsMatch ? detailsMatch[2].trim().toLowerCase() : '';
      const salaryStr = detailsMatch ? detailsMatch[3].trim() : '';

      // Extract skills
      const skillsMatch = block.match(/Skills:\s*([^\r\n]+)/);
      const skillsRequired = skillsMatch
        ? skillsMatch[1]
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 8)
        : ['Technology', 'Engineering'];

      // Extract Apply Link
      const applyMatch = block.match(/Apply:\s*([^\r\n]+)/);
      const applyLink = applyMatch ? applyMatch[1].trim() : undefined;

      // Extract ID
      const idMatch = block.match(/ID:\s*([^\r\n]+)/);
      const id = idMatch ? idMatch[1].trim() : `jdl-${Math.random().toString(36).slice(2, 9)}`;

      // Salary parse
      let salary: JobListing['salary'] = undefined;
      const salaryNumbers = salaryStr.match(/\$?([\d,]+)/g);
      if (salaryNumbers && salaryNumbers.length > 0) {
        const parsed = salaryNumbers.map((s) => parseInt(s.replace(/[\$,]/g, ''), 10)).filter((n) => !isNaN(n));
        if (parsed.length > 0) {
          salary = {
            currency: 'USD',
            min: parsed[0] < 1000 ? parsed[0] * 1000 : parsed[0],
            max: parsed[1] ? (parsed[1] < 1000 ? parsed[1] * 1000 : parsed[1]) : undefined,
            period: 'yearly',
          };
        }
      }

      // Map Job Type
      let jobType: JobListing['jobType'] = 'Full-time';
      if (remoteTypeStr.includes('fully_remote')) jobType = 'Remote';
      else if (remoteTypeStr.includes('contract')) jobType = 'Contract';
      else if (remoteTypeStr.includes('part_time')) jobType = 'Part-time';

      jobs.push({
        id,
        title,
        company,
        location,
        salary,
        description: `${title} at ${company}. Discover full compensation and team expectations directly through the verified JobDataLake MCP listing.`,
        requirements: [
          'Strong problem solving and architectural thinking.',
          'Experience working with modern software stacks and team collaboration tools.',
          'See apply link for complete qualifications.',
        ],
        skillsRequired,
        experienceLevel: filters.experienceLevel && filters.experienceLevel !== 'All' ? (filters.experienceLevel as any) : 'Mid-Level',
        jobType,
        industry: filters.industry && filters.industry !== 'All' ? filters.industry : 'Technology',
        postedDate: 'Recently verified on ATS',
        source: 'JobDataLake MCP',
        applyLink,
      });
    }

    return jobs;
  }

  private parseSingleJobDetail(jobId: string, text: string): JobListing | null {
    if (!text) return null;

    const titleMatch = text.match(/\*\*(.*?)\*\*\s+at\s+([^\r\n]+)/);
    const title = titleMatch ? titleMatch[1].trim() : jobId;
    const company = titleMatch ? titleMatch[2].trim() : 'Company';

    const locationMatch = text.match(/Location:\s*([^\r\n]+)/);
    const location = locationMatch ? locationMatch[1].trim() : 'Remote / Hybrid';

    const applyMatch = text.match(/Apply:\s*([^\r\n]+)/);
    const applyLink = applyMatch ? applyMatch[1].trim() : undefined;

    const skillsMatch = text.match(/Skills:\s*([^\r\n]+)/);
    const skillsRequired = skillsMatch
      ? skillsMatch[1]
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const descParts = text.split('---');
    const description = descParts[1] ? descParts[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : text;

    return {
      id: jobId,
      title,
      company,
      location,
      description,
      requirements: ['See official applicant tracking link for detailed qualifications.'],
      skillsRequired: skillsRequired.slice(0, 10),
      experienceLevel: 'Mid-Level',
      jobType: 'Full-time',
      industry: 'Technology',
      postedDate: 'Active ATS Listing',
      source: 'JobDataLake MCP',
      applyLink,
    };
  }
}
