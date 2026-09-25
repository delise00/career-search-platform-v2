/**
 * API Routes for JobDataLake MCP
 */

import { Router, Request, Response } from 'express';
import { mcpRegistry } from './mcp/registry.ts';

const router = Router();

// Handler for MCP connection & health check
const handleMcpStatus = async (req: Request, res: Response) => {
  try {
    const health = await mcpRegistry.getHealthStatus();
    
    // If browser requested HTML (or accepts HTML over json) and format is not explicitly json:
    if (req.query.format !== 'json' && req.accepts(['html', 'json']) === 'html') {
      const isOk = health.server.status === 'connected';
      const statusColor = isOk ? '#10b981' : health.server.status === 'simulated' ? '#f59e0b' : '#ef4444';
      const statusText = health.server.status.toUpperCase();

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>JobDataLake MCP Connection Status</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #090d16;
      color: #f1f5f9;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      box-sizing: border-box;
    }
    .card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 16px;
      max-width: 650px;
      width: 100%;
      padding: 32px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.05em;
      background: ${statusColor}22;
      color: ${statusColor};
      border: 1px solid ${statusColor}66;
    }
    h1 { margin: 16px 0 8px 0; font-size: 24px; color: #fff; }
    p { color: #94a3b8; font-size: 14px; margin: 0 0 20px 0; }
    .grid {
      background: #020617;
      border: 1px solid #1e293b;
      border-radius: 10px;
      padding: 16px;
      font-family: monospace;
      font-size: 13px;
      line-height: 1.6;
      margin-bottom: 20px;
      word-break: break-all;
    }
    .grid div { margin-bottom: 6px; }
    .key { color: #38bdf8; }
    .val { color: #e2e8f0; }
    .tools-list {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #1e293b;
    }
    .tool-tag {
      display: inline-block;
      background: #1e293b;
      color: #cbd5e1;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      margin: 2px 4px 2px 0;
      font-family: monospace;
    }
    .btn {
      display: inline-block;
      background: #0284c7;
      color: #fff;
      padding: 10px 18px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      transition: background 0.2s;
    }
    .btn:hover { background: #0369a1; }
    .btn-secondary {
      background: #1e293b;
      color: #cbd5e1;
      margin-left: 10px;
    }
    .btn-secondary:hover { background: #334155; }
  </style>
</head>
<body>
  <div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <span class="badge">${statusText}</span>
      <span style="font-family:monospace; font-size:12px; color:#64748b;">${health.server.latencyMs}ms latency</span>
    </div>
    <h1>JobDataLake MCP Connection</h1>
    <p>Live Model Context Protocol integration serving 1M+ active job postings across 20K+ companies.</p>

    <div class="grid">
      <div><span class="key">Endpoint:</span> <span class="val">${health.server.endpoint}</span></div>
      <div><span class="key">Protocol:</span> <span class="val">${health.server.protocolVersion || 'MCP SSE (2024-11-05)'}</span></div>
      <div><span class="key">Status:</span> <span class="val" style="color:${statusColor}">${health.server.status}</span></div>
      <div><span class="key">Reachable:</span> <span class="val">${health.isReachable ? 'Yes' : 'No'}</span></div>
      <div><span class="key">Fallback Active:</span> <span class="val">${health.localFallbackActive ? 'Enabled' : 'Disabled'}</span></div>
      <div><span class="key">Last Checked:</span> <span class="val">${health.timestamp}</span></div>
    </div>

    <div class="tools-list">
      <div style="font-size:12px; font-weight:600; color:#94a3b8; margin-bottom:8px;">DISCOVERED MCP TOOLS:</div>
      ${(health.server.discoveredTools || [])
        .map((t) => `<span class="tool-tag" title="${t.description}">🔧 ${t.name}</span>`)
        .join(' ')}
    </div>

    <div style="margin-top:24px;">
      <a href="/" class="btn">Return to App</a>
      <a href="/api/mcp?format=json" class="btn btn-secondary">Raw JSON</a>
    </div>
  </div>
</body>
</html>
      `);
    }

    // Default JSON response
    res.json({
      success: true,
      service: 'JobDataLake MCP',
      endpoint: health.server.endpoint,
      status: health.server.status,
      data: health,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to inspect JobDataLake MCP server health: ' + err.message,
    });
  }
};

// 1. Root MCP Connection Check Endpoints (both /api/mcp and /api/mcp/health)
router.get('/mcp', handleMcpStatus);
router.get('/mcp/health', handleMcpStatus);

// Toggle Local Fallback / Strict Mode
router.post('/mcp/toggle-fallback', (req: Request, res: Response) => {
  const { allowLocalFallback } = req.body;
  if (typeof allowLocalFallback === 'boolean') {
    mcpRegistry.setLocalFallbackAllowed(allowLocalFallback);
  }
  res.json({
    success: true,
    localFallbackActive: mcpRegistry.isLocalFallbackAllowed(),
  });
});

// 2. Job Search Endpoint (JobDataLake MCP)
router.post('/jobs/search', async (req: Request, res: Response) => {
  try {
    const { keywords, location, experienceLevel, industry, minSalary } = req.body;
    const result = await mcpRegistry.searchJobs({
      keywords,
      location,
      experienceLevel,
      industry,
      minSalary: typeof minSalary === 'number' ? minSalary : undefined,
    });

    res.json({
      success: true,
      data: result.jobs,
      source: result.source,
      warning: result.warning,
    });
  } catch (err: any) {
    res.status(503).json({
      success: false,
      error: err.message || 'Job search service encountered an error.',
    });
  }
});

// 3. Job Details Endpoint (JobDataLake MCP)
router.get('/jobs/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await mcpRegistry.getJobDetails(id);
    if (!result.job) {
      res.status(404).json({ success: false, error: 'Job not found' });
      return;
    }
    res.json({
      success: true,
      data: result.job,
      source: result.source,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch job details.',
    });
  }
});

export default router;
