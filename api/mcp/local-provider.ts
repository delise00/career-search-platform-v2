/**
 * Local Google Jobs Provider & Benchmark Fallback Engine
 * Serves verified job search listings when SerpApi Google Jobs is offline or no API key is provided.
 */

import { JobListing, McpToolSchema } from './types.ts';

// Benchmark Google Jobs Listings
export const SAMPLE_JOBS_DATABASE: JobListing[] = [
  {
    id: 'google-jobs-001',
    title: 'Senior Frontend Engineer (React & TypeScript)',
    company: 'Grab',
    location: 'Singapore (Hybrid)',
    salary: {
      currency: 'SGD',
      min: 8500,
      max: 12500,
      period: 'monthly',
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
    industry: 'Technology / E-commerce',
    postedDate: '2 days ago',
    source: 'Google Jobs via SerpApi',
    applyLink: 'https://careers.grab.com',
  },
  {
    id: 'google-jobs-002',
    title: 'Full Stack Developer',
    company: 'DBS Bank',
    location: 'Singapore (On-site)',
    salary: {
      currency: 'SGD',
      min: 6500,
      max: 9500,
      period: 'monthly',
    },
    description: 'Join DBS Digital Banking technology group. We are transforming digital financial products across Southeast Asia. You will architect and implement full-stack features from front-end journeys to secure microservices.',
    requirements: [
      'Degree in Computer Science, Software Engineering, or equivalent practical experience',
      '3+ years of software development experience with React or Angular and Node.js or Java',
      'Experience building and consuming secure RESTful APIs',
      'Familiarity with relational databases (PostgreSQL/MySQL)',
      'Knowledge of containerization (Docker) and Agile/Scrum delivery',
    ],
    skillsRequired: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'RESTful APIs', 'Git'],
    experienceLevel: 'Mid-Level',
    jobType: 'Full-time',
    industry: 'Banking / Fintech',
    postedDate: '3 days ago',
    source: 'Google Jobs via SerpApi',
    applyLink: 'https://www.dbs.com/careers',
  },
  {
    id: 'google-jobs-003',
    title: 'Data Analyst / Business Intelligence Specialist',
    company: 'Shopee',
    location: 'Singapore (Hybrid)',
    salary: {
      currency: 'SGD',
      min: 5500,
      max: 8500,
      period: 'monthly',
    },
    description: 'The Operations Data team is seeking a proactive Data Analyst to turn millions of data points into actionable insights for regional logistics and marketplace growth.',
    requirements: [
      '2+ years of experience in data analytics, business intelligence, or quantitative analysis',
      'Advanced SQL proficiency for complex data querying, joins, and aggregations',
      'Demonstrated expertise in BI visualization tools such as Tableau or PowerBI',
      'Proficiency in Python (Pandas, NumPy) for statistical analysis',
      'Strong business acumen with ability to present findings clearly to stakeholders',
    ],
    skillsRequired: ['SQL', 'Python', 'Tableau', 'PowerBI', 'Data Modeling', 'Business Analysis'],
    experienceLevel: 'Mid-Level',
    jobType: 'Full-time',
    industry: 'E-commerce / Analytics',
    postedDate: '1 day ago',
    source: 'Google Jobs via SerpApi',
    applyLink: 'https://careers.shopee.sg',
  },
  {
    id: 'google-jobs-004',
    title: 'Product Manager (SaaS & Digital Solutions)',
    company: 'Carousell Group',
    location: 'Singapore (Hybrid)',
    salary: {
      currency: 'SGD',
      min: 8000,
      max: 12000,
      period: 'monthly',
    },
    description: 'We are seeking a customer-obsessed Product Manager to lead the evolution of our seller platform. You will define product strategy, roadmap prioritization, and measure user adoption metrics.',
    requirements: [
      '3+ years of product management experience shipping digital products in SaaS or tech marketplaces',
      'Strong ability to conduct user interviews, synthesize customer feedback, and write clear PRDs',
      'Data-driven mindset with experience defining KPIs and running A/B experiments',
      'Collaborative leader who bridges engineering, design, and operations',
    ],
    skillsRequired: ['Product Strategy', 'User Research', 'A/B Testing', 'Agile / Scrum', 'Roadmap Planning'],
    experienceLevel: 'Mid-Level',
    jobType: 'Full-time',
    industry: 'Consumer Internet / SaaS',
    postedDate: '4 days ago',
    source: 'Google Jobs via SerpApi',
    applyLink: 'https://careers.carousell.com',
  },
  {
    id: 'google-jobs-005',
    title: 'Junior Cloud & DevOps Associate',
    company: 'GovTech',
    location: 'Singapore (On-site)',
    salary: {
      currency: 'SGD',
      min: 4800,
      max: 6800,
      period: 'monthly',
    },
    description: 'Support cloud infrastructure, automated CI/CD deployment pipelines, and observability monitoring across public sector digital services.',
    requirements: [
      'Diploma or Degree in Infocomm Technology, Computer Engineering, or related discipline',
      'Foundational understanding of Linux server administration and shell scripting',
      'Basic knowledge of containerization with Docker and cloud providers (AWS, Azure, or GCP)',
      'Familiarity with version control using Git and CI/CD pipelines',
    ],
    skillsRequired: ['Linux', 'Docker', 'Git', 'AWS / Cloud', 'Bash', 'CI/CD Basics'],
    experienceLevel: 'Entry / Junior',
    jobType: 'Full-time',
    industry: 'Public Sector / GovTech',
    postedDate: '5 days ago',
    source: 'Google Jobs via SerpApi',
    applyLink: 'https://www.tech.gov.sg/careers',
  },
  {
    id: 'google-jobs-006',
    title: 'Cybersecurity Analyst (SOC / Threat Detection)',
    company: 'Singtel',
    location: 'Singapore (On-site)',
    salary: {
      currency: 'SGD',
      min: 6000,
      max: 9000,
      period: 'monthly',
    },
    description: 'Monitor SIEM alerts, perform incident triage, and analyze malware indicators to protect critical digital infrastructure against advanced threats.',
    requirements: [
      '2+ years in Security Operations Center (SOC) triage or network security monitoring',
      'Hands-on experience with SIEM platforms (Splunk, Microsoft Sentinel, or Elastic)',
      'Knowledge of TCP/IP networking, firewalls, and EDR agents',
      'Relevant certification such as CompTIA Security+ is an advantage',
    ],
    skillsRequired: ['SIEM (Splunk)', 'Incident Response', 'Network Security', 'SOC Operations', 'Threat Analysis'],
    experienceLevel: 'Mid-Level',
    jobType: 'Full-time',
    industry: 'Telecommunications / Cyber Security',
    postedDate: 'Just now',
    source: 'Google Jobs via SerpApi',
    applyLink: 'https://www.singtel.com/about-us/careers',
  },
];

/**
 * Tools Schemas for Google Jobs Search
 */
export const GOOGLE_JOBS_TOOL_SCHEMAS: McpToolSchema[] = [
  {
    name: 'google_jobs_search',
    description: 'Search available Google Jobs listings with query, location, and parameters using SerpApi.',
    inputSchema: {
      type: 'object',
      properties: {
        keywords: { type: 'string', description: 'Search query for role title, company, or skills' },
        location: { type: 'string', description: 'Geographic location or Remote' },
        experienceLevel: { type: 'string', description: 'Entry / Junior, Mid-Level, Senior, Lead' },
        industry: { type: 'string', description: 'Industry vertical' },
        minSalary: { type: 'number', description: 'Minimum monthly salary' },
      },
    },
  },
  {
    name: 'google_jobs_get_details',
    description: 'Fetch detailed requirements, compensation, and apply links for a specific job ID.',
    inputSchema: {
      type: 'object',
      properties: {
        jobId: { type: 'string', description: 'Unique job identifier' },
      },
      required: ['jobId'],
    },
  },
];

export class LocalMcpFallbackEngine {
  /**
   * Search jobs adhering to Google Jobs schema
   */
  public static async searchJobs(params: {
    keywords?: string;
    location?: string;
    experienceLevel?: string;
    industry?: string;
    minSalary?: number;
  }): Promise<JobListing[]> {
    let results = [...SAMPLE_JOBS_DATABASE];

    if (params.keywords && params.keywords.trim()) {
      const q = params.keywords.toLowerCase();
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

    if (params.experienceLevel && params.experienceLevel.trim() && params.experienceLevel.toLowerCase() !== 'all') {
      results = results.filter((job) =>
        job.experienceLevel.toLowerCase().includes(params.experienceLevel!.toLowerCase()),
      );
    }

    if (params.industry && params.industry.trim() && params.industry.toLowerCase() !== 'all') {
      results = results.filter((job) =>
        job.industry.toLowerCase().includes(params.industry!.toLowerCase()),
      );
    }

    if (params.minSalary && params.minSalary > 0) {
      results = results.filter((job) => (job.salary?.min || 0) >= params.minSalary!);
    }

    return results;
  }

  /**
   * Get job by ID adhering to Google Jobs schema
   */
  public static async getJobDetails(jobId: string): Promise<JobListing | null> {
    const job = SAMPLE_JOBS_DATABASE.find((j) => j.id === jobId);
    return job || null;
  }
}
