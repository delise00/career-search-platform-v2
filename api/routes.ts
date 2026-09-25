/**
 * API Routes for Career Navigator MCP Integration
 */

import { Router, Request, Response } from 'express';
import { mcpRegistry } from './mcp/registry.ts';

const router = Router();

// 1. Developer Health Check Endpoint
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
      error: 'Failed to inspect MCP servers health: ' + err.message,
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

// 3. Resume Screening & Extraction (AI HR Toolkit MCP)
router.post('/resume/screen', async (req: Request, res: Response) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText || typeof resumeText !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Please provide valid resume text to parse.',
      });
      return;
    }

    const { resume, source } = await mcpRegistry.screenResume(resumeText);
    res.json({
      success: true,
      data: resume,
      source,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Resume screening failed.',
    });
  }
});

// 4. Job Compatibility Assessment (AI HR Toolkit MCP)
router.post('/resume/match', async (req: Request, res: Response) => {
  try {
    const { resume, job } = req.body;
    if (!resume || !job) {
      res.status(400).json({
        success: false,
        error: 'Both resume profile and target job specifications are required.',
      });
      return;
    }

    const { result, source } = await mcpRegistry.matchJob(resume, job);
    res.json({
      success: true,
      data: result,
      source,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Compatibility calculation failed.',
    });
  }
});

// 5. Tailor Resume Bullet Points (StoryLenses MCP)
router.post('/application/tailor', async (req: Request, res: Response) => {
  try {
    const { resume, job } = req.body;
    if (!resume || !job) {
      res.status(400).json({
        success: false,
        error: 'Both resume and job specifications are required for tailoring.',
      });
      return;
    }

    const { result, source } = await mcpRegistry.tailorResume(resume, job);
    res.json({
      success: true,
      data: result,
      source,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Resume tailoring failed.',
    });
  }
});

// 6. Generate Truthful Cover Letter (StoryLenses MCP)
router.post('/application/cover-letter', async (req: Request, res: Response) => {
  try {
    const { resume, job, emphasisNotes } = req.body;
    if (!resume || !job) {
      res.status(400).json({
        success: false,
        error: 'Both resume and job specifications are required for cover letter synthesis.',
      });
      return;
    }

    const { letter, source } = await mcpRegistry.generateCoverLetter(resume, job, emphasisNotes);
    res.json({
      success: true,
      data: letter,
      source,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Cover letter generation failed.',
    });
  }
});

// 7. Interview Preparation Questions
router.post('/interview/prep', async (req: Request, res: Response) => {
  try {
    const { resume, job } = req.body;
    if (!resume || !job) {
      res.status(400).json({
        success: false,
        error: 'Both resume and job are required for interview question preparation.',
      });
      return;
    }

    const { prep, source } = await mcpRegistry.generateInterviewPrep(resume, job);
    res.json({
      success: true,
      data: prep,
      source,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Interview preparation failed.',
    });
  }
});

export default router;
