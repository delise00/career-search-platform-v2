# Career Search Platform — Development Prompts & Implementation Guide

This document cleans up and structures all development prompts used throughout the project lifecycle, paired with an executive summary of the implementation steps taken across each major milestone.

---

## 1. Cleaned & Structured Prompts

### Phase 1: Core Platform Foundation & Google Jobs Integration
```text
Task: Build a production-grade Job Search web platform.
Requirements:
1. Search jobs with keywords, locations, seniority levels, salary filters, and industry sectors.
2. Integrate native Model Context Protocol (MCP) server support for job listings.
3. Provide bookmarking / saved jobs with persistent local storage.
4. Clean UI with dark/light mode toggle, responsive cards, and detailed modal views.
```

### Phase 2: Native JobDataLake MCP Migration
```text
Task: Migrate job search provider to JobDataLake MCP server.
Requirements:
1. Connect directly to https://mcp.jobdatalake.com using native MCP SSE transport (protocol 2024-11-05).
2. Clean up legacy Google Jobs environment variables.
3. Provide live endpoint inspection via /api/mcp and in-app status modal with real-time latency pinging.
4. Implement a resilient fallback layer ensuring 100% uptime during upstream rate limits or blips.
```

### Phase 3: Advanced JobDataLake Filters Suite
```text
Task: Support the complete filter schema provided by JobDataLake MCP.
Requirements:
1. Implement full filters:
   - remote_type: fully_remote, hybrid, on_site
   - seniority: Entry, Mid Level, Senior, Staff, Principal, Manager, Director, C Level
   - job_function: eng, data, design, sales, ops, marketing, security, product, finance, hr, legal
   - employment_type: full_time, part_time, contract, internship
   - salary_min and salary_max: Exact annual USD values
   - skills: Comma-separated in AND mode (e.g. Python,AWS,Kubernetes)
   - location / continent: City, country, or continent
   - countries: ISO 3166-1 alpha-2 codes (US, GB, DE, SG, JP)
   - posted_within: 24h, 7d, 30d
   - sort_by: posted_at:desc, salary_max_usd:desc, salary_min_usd:asc
   - company: Domain filter or company name
2. Provide quick filter buttons and an expandable Advanced Filter drawer.
```

### Phase 4: CV Drafting with CVpop MCP
```text
Task: Integrate CV drafting using CVpop MCP (https://mcp.cvpop.com/mcp).
Requirements:
1. Add a dedicated "Draft CV" navigation tab.
2. Implement MCP tools:
   - createCvPreview: Generate and validate structured CV previews.
   - createCvClaim: Generate claim links to finalize and edit in CVpop web app.
3. Form fields: Personal info, work experiences, education, and skills.
4. Customization: Templates (london, paris, newyork, tokyo, helsinki, amsterdam, rio) and accent color picker.
5. Dual protocol support: Send proper HTTP headers (application/json, text/event-stream).
```

### Phase 5: CV-Job Match Scoring with Calibrd MCP
```text
Task: Integrate match scoring using Calibrd MCP (https://www.calibrd.com/mcp).
Requirements:
1. Add a dedicated "Score CV" navigation tab and 1-click "Score CV" buttons on all job cards.
2. Implement Calibrd tool schemas (calibrd_score_job, calibrd_report, calibrd_review_cv, calibrd_cover_letter, calibrd_status, calibrd_get_pass).
3. Compute and display:
   - Overall role fit score (0–100%)
   - ATS readability score and Recruiter alignment score
   - Verified skill matches vs. level/experience gaps
   - Tailored recommendations to address gaps
```

### Phase 6: Unified Multi-MCP Health Monitoring
```text
Task: Unify health checking across all integrated MCP servers.
Requirements:
1. Monitor all active servers: JobDataLake, CVpop, and Calibrd.
2. Surface real-time connectivity status, latency (ms), and discovered tools.
3. Dual-mode /api/mcp endpoint:
   - Styled dark-themed HTML status page for web browsers.
   - Machine-readable JSON output via ?format=json.
4. In-app modal with one-click "Ping All" verification.
```

---

## 2. Summary of Implementation Steps

### Step 1: Multi-Protocol MCP Architecture
- Built dedicated client modules (`JobDataLakeMcpClient`, `CvPopMcpClient`, `CalibrdMcpClient`) using native Node.js HTTP/SSE transports.
- Configured proper SSE stream reading with JSON-RPC 2.0 packet parsing and required `Accept: application/json, text/event-stream` headers.

### Step 2: Backend Orchestration & Service Registry
- Created `api/mcp/registry.ts` as the central coordination layer managing connection pooling, environment variable sync (`/app/.dev.env.json`), and graceful fallback logic.
- Built REST routes in `api/routes.ts`:
  - `GET /api/mcp`: Dual HTML/JSON health dashboard.
  - `POST /api/jobs/search`: Full JobDataLake query pipeline with 11 filter dimensions.
  - `GET /api/jobs/:id`: Enriched job details from ATS sources.
  - `POST /api/cv/preview`: Formatted CV payload validation via CVpop.
  - `POST /api/cv/claim`: CVpop claim link generation.
  - `POST /api/scoring/score-job`: Calibrd semantic matching and gap evaluation.

### Step 3: Frontend Experience & State Management
- Created a global `CareerContext` providing tab navigation, bookmark persistence, dark/light theme switching, and real-time MCP health state.
- Developed modular UI components:
  - `Navbar.tsx`: Streamlined navigation with clean MCP ecosystem status indicator.
  - `JobSearch.tsx`: Search bar, primary filter pills, expandable advanced filters drawer, responsive job cards, and detail modal.
  - `CvBuilder.tsx`: Structured CV drafting, style selection, and preview generation.
  - `CvScorer.tsx`: Comparative two-column layout evaluating candidate CV against job requirements with match breakdown and ATS tips.
  - `McpHealthModal.tsx`: Real-time health inspector with per-server latency, tool inspection, and manual re-ping.

### Step 4: Verification & Git Version Control
- Validated TypeScript typing with `lint_applet` (`tsc --noEmit`).
- Verified bundle production build with `compile_applet` (`npm run build`).
- Reverted working tree and remote Git repository cleanly to commit `e6fbe90c5b0a3819e7fff9298a9b541cd024d6b6`.
