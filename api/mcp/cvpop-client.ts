/**
 * CVpop MCP Client (https://mcp.cvpop.com/mcp)
 * Handles:
 * - createCvPreview: Create or update a CV preview
 * - createCvClaim: Continue in CVpop
 */

import https from 'https';
import { CvDraftPayload, McpServerHealth, McpToolSchema } from './types.ts';

export const CVPOP_TOOL_SCHEMAS: McpToolSchema[] = [
  {
    name: 'createCvPreview',
    description: 'Create or update a CV preview in CVpop format with formatting and structure validation.',
    gate: 'Free',
    inputSchema: {
      type: 'object',
      properties: {
        cv: { type: 'object', description: 'CV data payload' },
        style: { type: 'object', description: 'Template and styling options' },
      },
      required: ['cv'],
    },
  },
  {
    name: 'createCvClaim',
    description: 'Continue and finalize the CV in CVpop web app, generating a claim URL.',
    gate: 'Free',
    inputSchema: {
      type: 'object',
      properties: {
        cv: { type: 'object', description: 'CV data payload' },
        style: { type: 'object', description: 'Template and styling options' },
      },
      required: ['cv'],
    },
  },
];

export class CvPopMcpClient {
  public readonly id = 'cvpop-mcp';
  public readonly name = 'CVpop MCP';
  public readonly endpoint = 'https://mcp.cvpop.com/mcp';

  public async checkHealth(): Promise<McpServerHealth> {
    const start = Date.now();
    try {
      // Test tools/list with proper Accept header
      await this.callRpc('tools/list', {});
      const latencyMs = Date.now() - start;
      return {
        id: this.id,
        name: this.name,
        category: 'cv',
        endpoint: this.endpoint,
        reachable: true,
        status: 'connected',
        latencyMs,
        lastPing: new Date().toISOString(),
        discoveredTools: CVPOP_TOOL_SCHEMAS,
        protocolVersion: 'MCP SSE / Streamable HTTP',
      };
    } catch (err: any) {
      return {
        id: this.id,
        name: this.name,
        category: 'cv',
        endpoint: this.endpoint,
        reachable: false,
        status: 'error',
        latencyMs: Date.now() - start,
        lastPing: new Date().toISOString(),
        discoveredTools: CVPOP_TOOL_SCHEMAS,
        errorMessage: err.message,
      };
    }
  }

  public async createCvPreview(payload: CvDraftPayload) {
    const formattedCv = this.formatCvLight(payload);
    return this.callRpc('tools/call', {
      name: 'createCvPreview',
      arguments: {
        cv: formattedCv,
        style: {
          modelType: payload.style?.modelType || 'london',
          modelBaseColor: payload.style?.modelBaseColor || '#0284C7',
          modelBaseFont: payload.style?.modelBaseFont || 'Roboto',
        },
      },
    });
  }

  public async createCvClaim(payload: CvDraftPayload) {
    const formattedCv = this.formatCvLight(payload);
    return this.callRpc('tools/call', {
      name: 'createCvClaim',
      arguments: {
        cv: formattedCv,
        style: {
          modelType: payload.style?.modelType || 'london',
          modelBaseColor: payload.style?.modelBaseColor || '#0284C7',
          modelBaseFont: payload.style?.modelBaseFont || 'Roboto',
        },
      },
    });
  }

  private formatCvLight(payload: CvDraftPayload) {
    return {
      language: 'en',
      personalInfo: {
        firstName: payload.personalInfo.firstName || 'Candidate',
        lastName: payload.personalInfo.lastName || '',
      },
      contactInfo: {
        email: payload.contactInfo?.email || 'candidate@example.com',
        phones: payload.contactInfo?.phone
          ? [{ value: payload.contactInfo.phone, type: 'mobile' }]
          : undefined,
        address: payload.contactInfo?.location
          ? { municipality: payload.contactInfo.location }
          : undefined,
        websites: payload.contactInfo?.website
          ? [{ value: payload.contactInfo.website, type: 'portfolio' }]
          : undefined,
        socials: payload.contactInfo?.linkedin
          ? [{ value: payload.contactInfo.linkedin, type: 'linkedin' }]
          : undefined,
      },
      summary: payload.personalInfo.summary || undefined,
      works: (payload.works || []).map((w) => ({
        company: w.company,
        position: w.position,
        responsibility: w.responsibility,
        period: w.period
          ? {
              current: w.period.current,
              from: w.period.from ? { year: w.period.from.year, month: w.period.from.month || 1 } : undefined,
              to: w.period.to ? { year: w.period.to.year, month: w.period.to.month || 1 } : undefined,
            }
          : undefined,
      })),
      educations: (payload.educations || []).map((e) => ({
        organisation: e.organisation,
        qualification: e.qualification,
        description: e.description,
      })),
      keywords: payload.skills || [],
    };
  }

  private callRpc(method: string, params: Record<string, any>): Promise<any> {
    return new Promise((resolve, reject) => {
      const parsed = new URL(this.endpoint);
      const postData = JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params,
      });

      const req = https.request(
        {
          hostname: parsed.hostname,
          port: parsed.port || 443,
          path: parsed.pathname + parsed.search,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/event-stream',
            'User-Agent': 'CareerPlatform/2.0',
          },
          timeout: 8000,
        },
        (res) => {
          let buffer = '';
          res.on('data', (c) => (buffer += c.toString()));
          res.on('end', () => {
            // Check if SSE format
            if (buffer.includes('event: message') || buffer.includes('data:')) {
              const lines = buffer.split('\n');
              for (const line of lines) {
                if (line.startsWith('data:')) {
                  try {
                    const parsedData = JSON.parse(line.slice(5).trim());
                    if (parsedData.result) return resolve(parsedData.result);
                    if (parsedData.error) return reject(new Error(parsedData.error.message || 'CVpop error'));
                  } catch {}
                }
              }
            }

            try {
              const json = JSON.parse(buffer);
              if (json.result) return resolve(json.result);
              if (json.error) return reject(new Error(json.error.message || 'CVpop error'));
              return resolve(json);
            } catch {
              if (res.statusCode && res.statusCode >= 400) {
                return reject(new Error(`CVpop returned HTTP ${res.statusCode}: ${buffer.slice(0, 100)}`));
              }
              return resolve(buffer);
            }
          });
        }
      );

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('CVpop request timed out'));
      });

      req.write(postData);
      req.end();
    });
  }
}

export const cvpopClient = new CvPopMcpClient();
