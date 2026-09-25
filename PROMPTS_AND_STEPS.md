# Developer Prompts & Build Notes (Raw & Unfiltered)

This log captures the raw, practical, conversational instructions, actual command line snippets, and implementation hurdles encountered while hacking together this multi-MCP career platform.

---

## 1. Raw Prompts Log

### 01: Initial Prototype & Job Board Basics
> "hey build me a clean job search app in react + vite with typescript and tailwind. I need to search by title, location, salary min/max, seniority, and industry. Let me bookmark jobs and save them in localstorage so they don't disappear on refresh. Dark mode too please, and keep the UI clean, no AI bot junk or fake chat windows."

### 02: Switch to Real JobDataLake MCP Endpoint
> "drop the google jobs smithery endpoint and switch to JobDataLake MCP directly (https://mcp.jobdatalake.com). Use SSE protocol with proper json-rpc 2.0 payloads. Don't break if their endpoint rate limits or fails on certain queries—write a resilient fallback so the user always sees real jobs. Also make an /api/mcp endpoint so I can hit it in the browser and verify the server is actually responding and check the latency."

### 03: Wire Up ALL the JobDataLake Filters
> "JobDataLake has way more filters than just query and location. Expose the full schema in the UI!
> - `remote_type` (fully_remote, hybrid, on_site)
> - `seniority` (Entry, Mid Level, Senior, Staff, Principal, Manager, Director, C Level)
> - `job_function` (eng, data, design, sales, ops, marketing, security, product, finance, hr, legal)
> - `employment_type` (full_time, part_time, contract, internship)
> - numeric `salary_min` and `salary_max`
> - `skills` (comma-separated, AND mode like 'Python,AWS,Kubernetes')
> - `countries` (US, GB, DE, SG, JP)
> - `posted_within` (24h, 7d, 30d)
> - `sort_by` (posted_at:desc, salary_max_usd:desc, salary_min_usd:asc)
> - `company` domain
> Put quick chips up top for fast clicks, and put the heavy filters into an expandable drawer so the UI stays tidy."

### 04: CVpop MCP Integration (Drafting & Claim Links)
> "now add a tab to draft CVs using the CVpop MCP server (https://mcp.cvpop.com/mcp).
> We need two tools:
> 1. `createCvPreview` -> takes personal info, work experience, education, skills, and template style (london, paris, tokyo, etc.) and validates the structured preview.
> 2. `createCvClaim` -> generates a link so the user can claim and edit the full CV on cvpop.com.
> Remember to send `Accept: application/json, text/event-stream` or the SSE transport might reject the POST request."

### 05: Calibrd MCP Integration (Job-CV Fit Scorer)
> "add Calibrd MCP (https://www.calibrd.com/mcp) so users can score their CV against any job in the search results.
> On every job card add a quick 'Score CV' button that grabs the job title and requirements, pops into a side-by-side comparison screen, and calls the Calibrd scoring tool.
> Show an overall score (0-100), ATS readability score, recruiter score, bullet points of matched skills, gaps at their seniority level, and concrete recommendations."

### 06: Unified Health Check & Developer Tools
> "I want to see all MCP servers at a glance. Update `/api/mcp` so if I open it in a browser it shows a slick dark HTML status page with latency and tools for JobDataLake, CVpop, and Calibrd. If I hit it with `?format=json` or from code, return clean JSON. Also add a floating/modal status inspector inside the app with a 'Ping All' button."

### 07: ATS Resume Writer Exploration & Revert Note
> "tried out mutamiri-sudo/ats-resume-writer-mcp for Workday/Taleo/Greenhouse resume rewriting with truthfulness guardrails, but then rolled back the working tree to commit `e6fbe90` to keep the core 3-server setup (JobDataLake + CVpop + Calibrd) rock solid."

---

## 2. Real Implementation Notes & Gotchas

### Streaming & SSE Header Gotchas
- **Streamable HTTP / SSE**: MCP endpoints like `https://mcp.cvpop.com/mcp` and `https://mcp.jobdatalake.com` send responses back as chunked Server-Sent Events (`event: message\ndata: {...}`).
- **Required Header**: If you don't explicitly pass `Accept: application/json, text/event-stream`, requests can fail with 406 or close prematurely.
- **Node `https.request` Buffer**: You have to accumulate chunks and split by `\n`, stripping out the `data:` prefix before passing to `JSON.parse()`.

### Port & Dev Server Nuances
- App runs Express backend with Vite middleware on port 3000 (`"dev": "tsx server.ts"`).
- Backend routes under `/api/*` handle MCP proxying, avoiding CORS issues from the browser.
- Client state is stored in `CareerContext` with localStorage caching so users never lose saved jobs or theme settings on reload.

### Filter Mapping Tricks
- `skills` in JobDataLake requires comma-separated AND logic (e.g. `Python,AWS,PostgreSQL`).
- Quick filter chips (Remote, Engineering, Senior, $120k+) toggle specific parameters while keeping custom keyword searches intact.
- Salary sliders map cleanly to `salary_min` and `salary_max` integer USD params.

---

## 3. Git History Checkpoints

- `e6fbe90`: Baseline stable release with full JobDataLake filters, CVpop drafting & claims, Calibrd scoring, and 3-server health monitoring.
- `75233e0`: Added documentation and prompts summary.
