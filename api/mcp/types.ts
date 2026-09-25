/**
 * Types and interfaces for Job Search, CV Drafting, and Scoring Platform
 */

export interface McpToolSchema {
  name: string;
  description: string;
  gate?: string;
  inputSchema?: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
  };
}

export interface McpServerHealth {
  id: string;
  name: string;
  category: 'jobs' | 'cv' | 'scoring';
  endpoint: string;
  reachable: boolean;
  status: 'connected' | 'simulated' | 'error' | 'disconnected';
  latencyMs: number;
  lastPing: string;
  discoveredTools: McpToolSchema[];
  errorMessage?: string;
  protocolVersion?: string;
}

export interface MultiMcpHealthResponse {
  jobdatalake: McpServerHealth;
  cvpop: McpServerHealth;
  calibrd: McpServerHealth;
  timestamp: string;
}

export interface JobFilterParams {
  query?: string;
  remote_type?: 'fully_remote' | 'hybrid' | 'on_site' | 'all';
  seniority?: string; // Entry, Mid Level, Senior, Staff, Principal, Manager, Director, C Level
  job_function?: string; // eng, data, design, sales, ops, marketing, security, product, finance, hr, legal
  employment_type?: 'full_time' | 'part_time' | 'contract' | 'internship' | 'all';
  salary_min?: number;
  salary_max?: number;
  skills?: string; // Comma-separated (AND mode)
  location?: string;
  countries?: string; // US, GB, DE, JP
  posted_within?: '24h' | '7d' | '30d' | 'all';
  sort_by?: 'posted_at:desc' | 'salary_max_usd:desc' | 'salary_min_usd:asc';
  company?: string;
  page?: number;
  per_page?: number;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: {
    currency: string;
    min?: number;
    max?: number;
    period: 'yearly' | 'monthly' | 'hourly';
  };
  description: string;
  requirements: string[];
  skillsRequired: string[];
  experienceLevel: 'Entry / Junior' | 'Mid-Level' | 'Senior' | 'Lead / Director';
  jobType: 'Full-time' | 'Contract' | 'Part-time' | 'Internship' | 'Remote';
  industry: string;
  postedDate: string;
  source: string;
  applyLink?: string;
}

export interface SavedJobItem {
  id: string;
  job: JobListing;
  savedAt: string;
  notes?: string;
}

export interface CvDraftPayload {
  personalInfo: {
    firstName: string;
    lastName: string;
    summary?: string;
  };
  contactInfo?: {
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
  };
  works?: Array<{
    company: string;
    position: string;
    responsibility: string;
    period?: {
      from?: { year: number; month?: number };
      to?: { year: number; month?: number };
      current?: boolean;
    };
  }>;
  educations?: Array<{
    organisation: string;
    qualification: string;
    description: string;
  }>;
  skills?: string[];
  style?: {
    modelType?: 'london' | 'rio' | 'newyork' | 'tokyo' | 'helsinki' | 'paris' | 'amsterdam';
    modelBaseColor?: string;
    modelBaseFont?: string;
  };
}

export interface CalibrdScoreResult {
  score: number;
  level: string;
  summary: string;
  matches: string[];
  gaps: string[];
  recommendations: string[];
  recruiterScore?: number;
  atsScore?: number;
  atsIssues?: string[];
}
