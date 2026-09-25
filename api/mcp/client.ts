/**
 * JSON-RPC 2.0 Client for Model Context Protocol (MCP) Servers
 */

import { McpToolSchema, McpServerHealth } from './types.ts';

export interface McpClientOptions {
  id: string;
  name: string;
  category: 'screening' | 'jobs' | 'coverletter';
  endpointUrl: string;
  apiKey?: string;
  timeoutMs?: number;
}

export class McpClient {
  public readonly id: string;
  public readonly name: string;
  public readonly category: 'screening' | 'jobs' | 'coverletter';
  private endpointUrl: string;
  private apiKey?: string;
  private timeoutMs: number;
  private requestId = 0;
  private discoveredTools: McpToolSchema[] = [];
  private lastHealthCheck: McpServerHealth;

  constructor(options: McpClientOptions) {
    this.id = options.id;
    this.name = options.name;
    this.category = options.category;
    this.endpointUrl = options.endpointUrl;
    this.apiKey = options.apiKey;
    this.timeoutMs = options.timeoutMs || 6000;

    this.lastHealthCheck = {
      id: this.id,
      name: this.name,
      category: this.category,
      endpoint: this.maskEndpoint(this.endpointUrl),
      reachable: false,
      status: 'disconnected',
      latencyMs: 0,
      lastPing: new Date().toISOString(),
      discoveredTools: [],
      errorMessage: 'Not initialized yet',
    };
  }

  public updateEndpoint(url: string, apiKey?: string) {
    this.endpointUrl = url;
    if (apiKey !== undefined) this.apiKey = apiKey;
    this.lastHealthCheck.endpoint = this.maskEndpoint(this.endpointUrl);
  }

  public getDiscoveredTools(): McpToolSchema[] {
    return this.discoveredTools;
  }

  public getLastHealth(): McpServerHealth {
    return this.lastHealthCheck;
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
   * Send JSON-RPC 2.0 message to the remote MCP server
   */
  private async sendJsonRpc(method: string, params: Record<string, any> = {}): Promise<any> {
    if (!this.endpointUrl || !this.endpointUrl.startsWith('http')) {
      throw new Error(`MCP Server "${this.name}" endpoint URL is not configured or invalid.`);
    }

    const currentId = ++this.requestId;
    const body = {
      jsonrpc: '2.0',
      id: currentId,
      method,
      params,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'User-Agent': 'CareerNavigator-MCP-Client/1.0',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
      headers['x-api-key'] = this.apiKey;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(this.endpointUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} from MCP Server: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await response.json();
        if (json.error) {
          throw new Error(`MCP JSON-RPC Error [${json.error.code}]: ${json.error.message}`);
        }
        return json.result;
      }

      // Handle SSE response if server responded as stream
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        if (json.error) throw new Error(json.error.message);
        return json.result;
      } catch {
        // Parse SSE data: lines
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr) {
              const parsed = JSON.parse(dataStr);
              if (parsed.result) return parsed.result;
              if (parsed.error) throw new Error(parsed.error.message);
            }
          }
        }
        throw new Error('Invalid response format received from MCP server.');
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error(`Timeout after ${this.timeoutMs}ms connecting to MCP server ${this.name}`);
      }
      throw err;
    }
  }

  /**
   * Performs an MCP handshake and tools discovery:
   * 1. initialize
   * 2. notifications/initialized
   * 3. tools/list
   */
  public async checkHealth(): Promise<McpServerHealth> {
    const startTime = Date.now();
    const nowIso = new Date().toISOString();

    if (!this.endpointUrl || this.endpointUrl.trim() === '') {
      this.lastHealthCheck = {
        id: this.id,
        name: this.name,
        category: this.category,
        endpoint: 'Not configured (check environment variables)',
        reachable: false,
        status: 'disconnected',
        latencyMs: 0,
        lastPing: nowIso,
        discoveredTools: [],
        errorMessage: `Endpoint URL for ${this.name} is not set.`,
      };
      return this.lastHealthCheck;
    }

    try {
      // 1. Initialize
      const initResult = await this.sendJsonRpc('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: { listChanged: true },
        },
        clientInfo: {
          name: 'CareerNavigatorClient',
          version: '1.0.0',
        },
      });

      const protocolVersion = initResult?.protocolVersion || '2024-11-05';

      // 2. Discover Tools
      let tools: McpToolSchema[] = [];
      try {
        const listResult = await this.sendJsonRpc('tools/list', {});
        if (listResult && Array.isArray(listResult.tools)) {
          tools = listResult.tools.map((t: any) => ({
            name: t.name,
            description: t.description || '',
            inputSchema: t.inputSchema,
          }));
        }
      } catch (toolErr: any) {
        console.warn(`[MCP:${this.name}] tools/list error:`, toolErr.message);
      }

      const latencyMs = Date.now() - startTime;
      this.discoveredTools = tools;

      this.lastHealthCheck = {
        id: this.id,
        name: this.name,
        category: this.category,
        endpoint: this.maskEndpoint(this.endpointUrl),
        reachable: true,
        status: 'connected',
        latencyMs,
        lastPing: nowIso,
        discoveredTools: tools,
        protocolVersion,
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
        discoveredTools: this.discoveredTools,
        errorMessage: err.message || 'Connection failed',
      };
      return this.lastHealthCheck;
    }
  }

  /**
   * Execute an MCP tool on the server
   */
  public async callTool(toolName: string, toolArguments: Record<string, any>): Promise<any> {
    const result = await this.sendJsonRpc('tools/call', {
      name: toolName,
      arguments: toolArguments,
    });

    // MCP tools return { content: [ { type: "text", text: "..." } ], isError?: boolean }
    if (result && Array.isArray(result.content)) {
      const textItem = result.content.find((c: any) => c.type === 'text');
      if (textItem && typeof textItem.text === 'string') {
        try {
          return JSON.parse(textItem.text);
        } catch {
          return textItem.text;
        }
      }
      return result.content;
    }

    return result;
  }
}
