/**
 * Benchmark fallback dataset & schema for JobDataLake MCP
 */

import { JobListing, JobFilterParams, McpToolSchema } from './types.ts';

export const SAMPLE_JOBS_DATABASE: JobListing[] = [
  {
    id: 'jdl-001',
    title: 'Senior Frontend Engineer (React & TypeScript)',
    company: 'Grab',
    location: 'Singapore (Hybrid)',
    salary: {
      currency: 'USD',
      min: 95000,
      max: 145000,
      period: 'yearly',
    },
    description: 'We are seeking an experienced Senior Frontend Engineer to build high-scale, resilient consumer and merchant web experiences. You will collaborate closely with product design and backend microservices engineers.',
    requirements: [
      '4+ years of hands-on experience building complex web applications with React and modern TypeScript',
      'Proven expertise in web performance optimization, core web vitals, and bundle sizing',
      'Solid experience writing automated unit and integration tests (Vitest or Jest)',
      'Understanding of modern styling (Tailwind CSS) and responsive client state',
      'Familiarity with CI/CD deployment pipelines and cloud infrastructure',
    ],
    skillsRequired: ['React', 'TypeScript', 'Tailwind CSS', 'Performance Optimization', 'Jest/Vitest', 'REST/GraphQL', 'CI/CD'],
    experienceLevel: 'Senior',
    jobType: 'Full-time',
    industry: 'Technology',
    postedDate: '2 days ago',
    source: 'JobDataLake MCP',
    applyLink: 'https://careers.grab.com',
  },
  {
    id: 'jdl-002',
    title: 'Full Stack Software Engineer',
    company: 'Versana',
    location: 'New York, NY (Hybrid)',
    salary: {
      currency: 'USD',
      min: 130000,
      max: 180000,
      period: 'yearly',
    },
    description: 'Versana is an industry-backed technology company modernizing the syndicated loan market. We are seeking a motivated Full Stack Software Engineer to build resilient distributed services and clean web frontends.',
    requirements: [
      '3+ years of software development experience with React and Node.js or Java / Spring Boot',
      'Experience building and consuming secure RESTful APIs and GraphQL',
      'Familiarity with relational databases (PostgreSQL/MySQL) and Docker',
      'Knowledge of agile delivery and automated testing',
    ],
    skillsRequired: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'RESTful APIs', 'Git'],
    experienceLevel: 'Mid-Level',
    jobType: 'Full-time',
    industry: 'Banking / Fintech',
    postedDate: '3 days ago',
    source: 'JobDataLake MCP',
    applyLink: 'https://jobs.lever.co/Versana',
  },
  {
    id: 'jdl-003',
    title: 'Full-Stack Product Engineer (Remote)',
    company: 'TurbineOne',
    location: 'Remote',
    salary: {
      currency: 'USD',
      min: 140000,
      max: 195000,
      period: 'yearly',
    },
    description: 'Join TurbineOne to build frontline intelligence software. Looking for a product-minded Full-Stack Engineer comfortable across frontend, backend, and machine learning model delivery pipelines.',
    requirements: [
      'Strong proficiency in modern JavaScript/TypeScript, React or Vue, and Go or Python backend',
      'Experience with gRPC, GraphQL, or REST API architecture',
      'Comfortable working in a remote-first, high-ownership team environment',
    ],
    skillsRequired: ['React', 'Go', 'Python', 'Machine Learning', 'GraphQL', 'Docker', 'Kubernetes'],
    experienceLevel: 'Mid-Level',
    jobType: 'Remote',
    industry: 'Technology',
    postedDate: '1 day ago',
    source: 'JobDataLake MCP',
    applyLink: 'https://job-boards.greenhouse.io/turbineone',
  },
  {
    id: 'jdl-004',
    title: 'AI / Machine Learning Engineer',
    company: 'GovTech Singapore',
    location: 'Singapore (On-site)',
    salary: {
      currency: 'USD',
      min: 110000,
      max: 165000,
      period: 'yearly',
    },
    description: 'Design and deploy production-grade LLM applications and machine learning pipelines for public sector impact. You will architect retrieval-augmented generation (RAG) systems and evaluate foundation models.',
    requirements: [
      'Mastery of Python, PyTorch, and transformer architectures',
      'Hands-on experience deploying embeddings, vector search databases, and RAG systems',
      'Familiarity with containerized microservices and Kubernetes orchestration',
    ],
    skillsRequired: ['Python', 'PyTorch', 'Vector DBs', 'RAG', 'LLMs', 'Docker', 'FastAPI'],
    experienceLevel: 'Senior',
    jobType: 'Full-time',
    industry: 'Technology',
    postedDate: 'Just now',
    source: 'JobDataLake MCP',
    applyLink: 'https://www.tech.gov.sg/careers',
  },
  {
    id: 'jdl-005',
    title: 'Cloud DevOps & Platform Engineer',
    company: 'Stripe',
    location: 'Remote (US/SG)',
    salary: {
      currency: 'USD',
      min: 150000,
      max: 210000,
      period: 'yearly',
    },
    description: 'Help scale global infrastructure powering billions of dollars in daily transactions. You will build internal developer platforms, improve telemetry, and harden security boundaries.',
    requirements: [
      'Experience with AWS, GCP, or Azure infrastructure at scale',
      'Deep knowledge of Kubernetes, Terraform, and GitOps workflows',
      'Proficiency in Go, Python, or Ruby for infrastructure tooling',
    ],
    skillsRequired: ['Kubernetes', 'Terraform', 'AWS', 'Go', 'CI/CD', 'Docker', 'Prometheus'],
    experienceLevel: 'Senior',
    jobType: 'Remote',
    industry: 'Banking / Fintech',
    postedDate: '4 days ago',
    source: 'JobDataLake MCP',
    applyLink: 'https://stripe.com/jobs',
  },
];

export const JOBDATALAKE_FALLBACK_TOOLS: McpToolSchema[] = [
  {
    name: 'search_jobs',
    description: 'Search 1M+ job listings with keyword, location, seniority, and salary filters.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        location: { type: 'string' },
        seniority: { type: 'string' },
        salary_min: { type: 'number' },
      },
    },
  },
  {
    name: 'get_job',
    description: 'Get full details for a specific job listing.',
    inputSchema: {
      type: 'object',
      properties: {
        job_id: { type: 'string' },
      },
      required: ['job_id'],
    },
  },
];

export class LocalMcpFallbackEngine {
  public static async searchJobs(params: JobFilterParams): Promise<JobListing[]> {
    let results = [...SAMPLE_JOBS_DATABASE];

    const q = (params.query || '').toLowerCase().trim();
    if (q && q !== '*') {
      results = results.filter(
        (job) =>
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.description.toLowerCase().includes(q) ||
          job.skillsRequired.some((s) => s.toLowerCase().includes(q)) ||
          job.requirements.some((r) => r.toLowerCase().includes(q)),
      );
    }

    if (params.location && params.location.trim() && params.location.toLowerCase() !== 'all') {
      const loc = params.location.toLowerCase();
      results = results.filter((job) => job.location.toLowerCase().includes(loc));
    }

    if (params.remote_type && params.remote_type !== 'all') {
      if (params.remote_type === 'fully_remote') {
        results = results.filter((j) => j.jobType === 'Remote' || j.location.toLowerCase().includes('remote'));
      } else if (params.remote_type === 'hybrid') {
        results = results.filter((j) => j.location.toLowerCase().includes('hybrid'));
      } else if (params.remote_type === 'on_site') {
        results = results.filter((j) => j.location.toLowerCase().includes('on-site'));
      }
    }

    if (params.seniority && params.seniority !== 'all') {
      results = results.filter((job) =>
        job.experienceLevel.toLowerCase().includes(params.seniority!.toLowerCase()),
      );
    }

    if (params.salary_min && params.salary_min > 0) {
      results = results.filter((job) => (job.salary?.min || 0) >= params.salary_min!);
    }

    if (params.salary_max && params.salary_max > 0) {
      results = results.filter((job) => (job.salary?.max || 0) <= params.salary_max!);
    }

    if (params.skills && params.skills.trim()) {
      const requiredSkills = params.skills.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
      results = results.filter((job) => {
        const jobSkills = job.skillsRequired.map((s) => s.toLowerCase());
        return requiredSkills.every((req) => jobSkills.some((js) => js.includes(req)));
      });
    }

    if (params.company && params.company.trim()) {
      const comp = params.company.toLowerCase();
      results = results.filter((j) => j.company.toLowerCase().includes(comp));
    }

    if (params.sort_by === 'salary_max_usd:desc') {
      results.sort((a, b) => (b.salary?.max || 0) - (a.salary?.max || 0));
    } else if (params.sort_by === 'salary_min_usd:asc') {
      results.sort((a, b) => (a.salary?.min || 0) - (b.salary?.min || 0));
    }

    return results;
  }

  public static async getJobDetails(jobId: string): Promise<JobListing | null> {
    const job = SAMPLE_JOBS_DATABASE.find((j) => j.id === jobId);
    return job || null;
  }
}
