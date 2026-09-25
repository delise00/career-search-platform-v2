/**
 * API Routes for JobDataLake, CVpop, and Calibrd MCP Services
 */

import { Router, Request, Response } from 'express';
import { mcpRegistry } from './mcp/registry.ts';

const router = Router();

// Handler for all MCP server connections & health checks
const handleMcpStatus = async (req: Request, res: Response) => {
  try {
    const multiHealth = await mcpRegistry.getAllHealthStatus();

    // If browser requested HTML (or accepts HTML over json) and format is not explicitly json:
    if (req.query.format !== 'json' && req.accepts(['html', 'json']) === 'html') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MCP Ecosystem Status — JobDataLake, CVpop, Calibrd</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #090d16;
      color: #f1f5f9;
      margin: 0;
      padding: 30px 20px;
      display: flex;
      justify-content: center;
      box-sizing: border-box;
    }
    .container {
      max-width: 800px;
      width: 100%;
    }
    .header {
      margin-bottom: 24px;
    }
    .header h1 {
      margin: 0 0 6px 0;
      font-size: 24px;
      color: #fff;
    }
    .header p {
      margin: 0;
      color: #94a3b8;
      font-size: 14px;
    }
    .card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .badge-green { background: #10b98122; color: #10b981; border: 1px solid #10b98166; }
    .badge-amber { background: #f59e0b22; color: #f59e0b; border: 1px solid #f59e0b66; }
    .badge-red { background: #ef444422; color: #ef4444; border: 1px solid #ef444466; }
    .title {
      font-size: 16px;
      font-weight: 700;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .meta-row {
      font-family: monospace;
      font-size: 12px;
      color: #94a3b8;
      margin-bottom: 6px;
    }
    .tools {
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid #1e293b;
    }
    .tool-tag {
      display: inline-block;
      background: #1e293b;
      color: #38bdf8;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      margin: 2px 4px 2px 0;
      font-family: monospace;
    }
    .actions {
      margin-top: 24px;
      display: flex;
      gap: 12px;
    }
    .btn {
      background: #0284c7;
      color: #fff;
      padding: 10px 18px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
    }
    .btn:hover { background: #0369a1; }
    .btn-secondary { background: #1e293b; color: #cbd5e1; }
    .btn-secondary:hover { background: #334155; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Model Context Protocol (MCP) Live Status</h1>
      <p>Active connections for Job Search, CV Drafting, and Job-CV Match Scoring.</p>
    </div>

    <!-- 1. JobDataLake -->
    <div class="card">
      <div class="card-top">
        <div class="title">
          <span>💼 ${multiHealth.jobdatalake.name}</span>
        </div>
        <span class="badge ${multiHealth.jobdatalake.status === 'connected' ? 'badge-green' : 'badge-amber'}">
          ${multiHealth.jobdatalake.status.toUpperCase()}
        </span>
      </div>
      <div class="meta-row">Endpoint: <span style="color:#e2e8f0;">${multiHealth.jobdatalake.endpoint}</span></div>
      <div class="meta-row">Protocol: <span style="color:#e2e8f0;">${multiHealth.jobdatalake.protocolVersion}</span> • Latency: <span style="color:#38bdf8;">${multiHealth.jobdatalake.latencyMs}ms</span></div>
      <div class="meta-row">Status Info: <span style="color:#e2e8f0;">${multiHealth.jobdatalake.errorMessage || '1M+ jobs online'}</span></div>
      <div class="tools">
        <div style="font-size:11px; color:#64748b; margin-bottom:4px; font-weight:600;">ACTIVE MCP TOOLS:</div>
        ${multiHealth.jobdatalake.discoveredTools.map((t) => `<span class="tool-tag">🔧 ${t.name}</span>`).join(' ')}
      </div>
    </div>

    <!-- 2. CVpop -->
    <div class="card">
      <div class="card-top">
        <div class="title">
          <span>📄 ${multiHealth.cvpop.name}</span>
        </div>
        <span class="badge ${multiHealth.cvpop.status === 'connected' ? 'badge-green' : 'badge-amber'}">
          ${multiHealth.cvpop.status.toUpperCase()}
        </span>
      </div>
      <div class="meta-row">Endpoint: <span style="color:#e2e8f0;">${multiHealth.cvpop.endpoint}</span></div>
      <div class="meta-row">Protocol: <span style="color:#e2e8f0;">${multiHealth.cvpop.protocolVersion || 'MCP Streamable HTTP'}</span> • Latency: <span style="color:#38bdf8;">${multiHealth.cvpop.latencyMs}ms</span></div>
      <div class="meta-row">Features: <span style="color:#e2e8f0;">Drafting CV preview & CV claim generation</span></div>
      <div class="tools">
        <div style="font-size:11px; color:#64748b; margin-bottom:4px; font-weight:600;">ACTIVE MCP TOOLS:</div>
        ${multiHealth.cvpop.discoveredTools.map((t) => `<span class="tool-tag">🔧 ${t.name} (${t.gate})</span>`).join(' ')}
      </div>
    </div>

    <!-- 3. Calibrd -->
    <div class="card">
      <div class="card-top">
        <div class="title">
          <span>🎯 ${multiHealth.calibrd.name}</span>
        </div>
        <span class="badge ${multiHealth.calibrd.status === 'connected' ? 'badge-green' : 'badge-amber'}">
          ${multiHealth.calibrd.status.toUpperCase()}
        </span>
      </div>
      <div class="meta-row">Endpoint: <span style="color:#e2e8f0;">${multiHealth.calibrd.endpoint}</span></div>
      <div class="meta-row">Protocol: <span style="color:#e2e8f0;">${multiHealth.calibrd.protocolVersion}</span> • Latency: <span style="color:#38bdf8;">${multiHealth.calibrd.latencyMs}ms</span></div>
      <div class="meta-row">Status Info: <span style="color:#e2e8f0;">${multiHealth.calibrd.errorMessage}</span></div>
      <div class="tools">
        <div style="font-size:11px; color:#64748b; margin-bottom:4px; font-weight:600;">ACTIVE MCP TOOLS:</div>
        ${multiHealth.calibrd.discoveredTools.map((t) => `<span class="tool-tag">🔧 ${t.name} (${t.gate})</span>`).join(' ')}
      </div>
    </div>

    <div class="actions">
      <a href="/" class="btn">Return to App</a>
      <a href="/api/mcp?format=json" class="btn btn-secondary">Raw JSON View</a>
    </div>
  </div>
</body>
</html>
      `);
    }

    // Default JSON response
    res.json({
      success: true,
      servers: multiHealth,
      data: {
        server: multiHealth.jobdatalake,
        isReachable: true,
        localFallbackActive: true,
        timestamp: multiHealth.timestamp,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to inspect MCP servers health: ' + err.message,
    });
  }
};

// 1. Root MCP Connection Check Endpoints
router.get('/mcp', handleMcpStatus);
router.get('/mcp/health', handleMcpStatus);

// 2. Job Search Endpoint (JobDataLake MCP with complete filters)
router.post('/jobs/search', async (req: Request, res: Response) => {
  try {
    const {
      keywords,
      query,
      location,
      countries,
      remote_type,
      seniority,
      job_function,
      employment_type,
      salary_min,
      salary_max,
      skills,
      posted_within,
      sort_by,
      company,
      page,
      per_page,
    } = req.body;

    const result = await mcpRegistry.searchJobs({
      query: query || keywords,
      location,
      countries,
      remote_type,
      seniority,
      job_function,
      employment_type,
      salary_min: typeof salary_min === 'number' ? salary_min : undefined,
      salary_max: typeof salary_max === 'number' ? salary_max : undefined,
      skills,
      posted_within,
      sort_by,
      company,
      page,
      per_page,
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

// 3. Job Details Endpoint
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

// 4. CVpop MCP: Create CV Preview
router.post('/cv/preview', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const result = await mcpRegistry.createCvPreview(payload);
    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to generate CV preview via CVpop MCP.',
    });
  }
});

// 5. CVpop MCP: Create CV Claim (Continue in CVpop)
router.post('/cv/claim', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const result = await mcpRegistry.createCvClaim(payload);
    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to generate CV claim link via CVpop MCP.',
    });
  }
});

// 6. Calibrd MCP: Score CV against Job Description
router.post('/scoring/score-job', async (req: Request, res: Response) => {
  try {
    const { cv_text, job_title, job_description, level } = req.body;
    if (!cv_text || !job_description) {
      res.status(400).json({ success: false, error: 'cv_text and job_description are required' });
      return;
    }

    const result = await mcpRegistry.scoreCvAgainstJob(cv_text, job_title || '', job_description, level);
    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to score CV against job.',
    });
  }
});

export default router;
