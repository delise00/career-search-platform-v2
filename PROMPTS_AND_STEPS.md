# Career Search Platform — Prompts & Implementation Steps

This document provides a clean, concise record of the original prompts used during development, followed by a step-by-step summary of the implementation.

---

## 1. Original Prompts

### Prompt 1: Core Job Search App
> Build a job search platform in React, Vite, TypeScript, and Tailwind CSS. Support search by job title, location, salary range, seniority level, and industry. Include local storage bookmarking for saving jobs, full details modal, and dark/light mode toggle.

### Prompt 2: JobDataLake MCP Migration
> Migrate the job search backend to JobDataLake MCP (`https://mcp.jobdatalake.com`) using Server-Sent Events (SSE) and JSON-RPC 2.0. Remove legacy Google Jobs configurations. Create an `/api/mcp` endpoint to monitor server status and latency, with fallback logic for resilience.

### Prompt 3: Full JobDataLake Filter Integration
> Expose the complete JobDataLake MCP search filter schema:
> - `remote_type` (fully_remote, hybrid, on_site)
> - `seniority` (Entry, Mid Level, Senior, Staff, Principal, Manager, Director, C Level)
> - `job_function` (eng, data, design, sales, ops, marketing, security, product, finance, hr, legal)
> - `employment_type` (full_time, part_time, contract, internship)
> - `salary_min` and `salary_max` (numeric USD)
> - `skills` (comma-separated, AND mode)
> - `countries` (ISO 3166-1 alpha-2 codes)
> - `posted_within` (24h, 7d, 30d)
> - `sort_by` (posted_at:desc, salary_max_usd:desc, salary_min_usd:asc)
> - `company` domain
> Add quick filter pills and an expandable advanced filter drawer.

### Prompt 4: CVpop MCP Integration
> Add a "Draft CV" tab integrating CVpop MCP (`https://mcp.cvpop.com/mcp`). Implement:
> 1. `createCvPreview`: Validates and previews structured CV content (personal details, experience, education, skills, and styling options).
> 2. `createCvClaim`: Generates external claim URLs for final editing on CVpop.
> Ensure dual-mode header handling (`Accept: application/json, text/event-stream`).

### Prompt 5: Calibrd MCP Fit Scoring
> Add a "Score CV" tab and per-job "Score CV" action buttons integrating Calibrd MCP (`https://www.calibrd.com/mcp`).
> Implement `calibrd_score_job`, `calibrd_report`, and `calibrd_review_cv` to calculate:
> - Overall job-CV match percentage (0–100%)
> - ATS and recruiter alignment scores
> - Matched skills vs. level gaps
> - Actionable recommendations to improve candidacy

### Prompt 6: Multi-MCP Health Monitoring
> Unify health monitoring for all active MCP servers (JobDataLake, CVpop, and Calibrd):
> - Return an HTML status dashboard when `/api/mcp` is viewed in a browser.
> - Return JSON data when queried via `?format=json` or programmatic requests.
> - Provide an in-app health modal with per-server status, latency, and a "Ping All" trigger.

---

## 2. Summary of Implementation Steps

1. **Protocol Integration**: Implemented standalone Node.js client classes for each MCP service, supporting Streamable HTTP/SSE and JSON-RPC 2.0 communication.
2. **Backend API Layer**: Configured Express proxy routes under `/api/*` to handle CORS, query translation, and health reporting.
3. **Application State**: Centralized state management in React via `CareerContext` for active views, saved jobs, theme persistence, and MCP connection status.
4. **Search & Filter UI**: Built search inputs, quick filter chips, and an expandable advanced filters drawer mapping directly to JobDataLake parameters.
5. **CV Drafting & Scoring**: Built the `CvBuilder` component for CVpop payload construction and `CvScorer` for Calibrd job fit evaluation.
6. **Health Verification**: Created the `/api/mcp` route and `McpHealthModal` for continuous multi-server health inspection.
