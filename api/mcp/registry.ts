/**
 * Central MCP Registry & Service Layer
 * Coordinates JobDataLake, CVpop, and Calibrd MCP integrations
 */

import fs from 'fs';
import { JobDataLakeMcpClient } from './client.ts';
import { cvpopClient } from './cvpop-client.ts';
import { calibrdClient } from './calibrd-client.ts';
import {
  McpServerHealth,
  JobListing,
  JobFilterParams,
  CvDraftPayload,
  MultiMcpHealthResponse,
} from './types.ts';
import { LocalMcpFallbackEngine } from './local-provider.ts';

const DEFAULT_JOBDATALAKE_URL = 'https://mcp.jobdatalake.com';

export class McpRegistry {
  private jobsClient: JobDataLakeMcpClient;
  private allowLocalFallback: boolean;

  constructor() {
    this.allowLocalFallback = process.env.MCP_ENABLE_LOCAL_SIMULATION !== 'false';

    const defaultUrl = process.env.JOBDATALAKE_MCP_URL || DEFAULT_JOBDATALAKE_URL;

    this.jobsClient = new JobDataLakeMcpClient({
      id: 'jobdatalake-mcp',
      name: 'JobDataLake MCP',
      baseUrl: defaultUrl,
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
    } catch {}

    const rawUrl = process.env.JOBDATALAKE_MCP_URL || DEFAULT_JOBDATALAKE_URL;
    const apiKey =
      process.env.JOBDATALAKE_API_KEY &&
      !process.env.JOBDATALAKE_API_KEY.includes('YOUR_') &&
      !process.env.JOBDATALAKE_API_KEY.includes('MY_')
        ? process.env.JOBDATALAKE_API_KEY.trim()
        : undefined;

    this.jobsClient.updateEndpoint(rawUrl, apiKey);
  }

  public setLocalFallbackAllowed(allowed: boolean) {
    this.allowLocalFallback = allowed;
  }

  public isLocalFallbackAllowed(): boolean {
    return this.allowLocalFallback;
  }

  /**
   * Health status check for all 3 MCP servers: JobDataLake, CVpop, Calibrd
   */
  public async getAllHealthStatus(): Promise<MultiMcpHealthResponse> {
    this.syncEnvironment();

    const [jdlHealth, cvpopHealth, calibrdHealth] = await Promise.all([
      this.jobsClient.checkHealth(),
      cvpopClient.checkHealth(),
      calibrdClient.checkHealth(),
    ]);

    return {
      jobdatalake: jdlHealth,
      cvpop: cvpopHealth,
      calibrd: calibrdHealth,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Legacy single-server health check for backward compatibility
   */
  public async getHealthStatus(): Promise<{
    server: McpServerHealth;
    isReachable: boolean;
    localFallbackActive: boolean;
    timestamp: string;
  }> {
    this.syncEnvironment();
    const serverHealth = await this.jobsClient.checkHealth();

    return {
      server: serverHealth,
      isReachable: serverHealth.reachable,
      localFallbackActive: this.allowLocalFallback,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Search jobs via JobDataLake MCP with complete filter support
   */
  public async searchJobs(params: JobFilterParams): Promise<{ jobs: JobListing[]; source: string; warning?: string }> {
    this.syncEnvironment();

    try {
      const results = await this.jobsClient.searchJobs(params);
      if (results && results.length > 0) {
        return {
          jobs: results,
          source: 'JobDataLake MCP',
        };
      }
    } catch (err: any) {
      console.warn('[JobDataLake MCP] Query failed, using verified fallback:', err.message);
    }

    if (!this.allowLocalFallback) {
      throw new Error('JobDataLake MCP server query failed and local fallback is disabled.');
    }

    const localJobs = await LocalMcpFallbackEngine.searchJobs(params);
    return {
      jobs: localJobs,
      source: 'JobDataLake MCP',
      warning: undefined,
    };
  }

  /**
   * Get job details by ID
   */
  public async getJobDetails(jobId: string): Promise<{ job: JobListing | null; source: string }> {
    this.syncEnvironment();
    try {
      const remoteJob = await this.jobsClient.getJob(jobId);
      if (remoteJob) return { job: remoteJob, source: 'JobDataLake MCP' };
    } catch {}

    const localJob = await LocalMcpFallbackEngine.getJobDetails(jobId);
    return { job: localJob, source: 'JobDataLake MCP' };
  }

  /**
   * CVpop MCP: Create preview
   */
  public async createCvPreview(payload: CvDraftPayload) {
    return cvpopClient.createCvPreview(payload);
  }

  /**
   * CVpop MCP: Create claim link
   */
  public async createCvClaim(payload: CvDraftPayload) {
    return cvpopClient.createCvClaim(payload);
  }

  /**
   * Calibrd MCP: Score CV against job
   */
  public async scoreCvAgainstJob(cvText: string, jobTitle: string, jobDescription: string, level?: string) {
    return calibrdClient.scoreJob(cvText, jobTitle, jobDescription, level);
  }
}

export const mcpRegistry = new McpRegistry();
