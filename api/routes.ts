/**
 * API Routes for Indeed MCP Job Search
 */

import { Router, Request, Response } from 'express';
import { mcpRegistry } from './mcp/registry.ts';

const router = Router();

// 1. Developer Indeed MCP Health Check Endpoint
router.get('/mcp/health', async (_req: Request, res: Response) => {
  try {
    const health = await mcpRegistry.getHealthStatus();
    res.json({
      success: true,
      data: health,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to inspect Indeed MCP server health: ' + err.message,
    });
  }
});

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

// 2. Job Search Endpoint (Indeed MCP)
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

// 3. Job Details Endpoint (Indeed MCP)
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
