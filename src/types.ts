/**
 * Frontend Types for Google Jobs Search Platform
 */

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

export interface McpToolSchema {
  name: string;
  description: string;
  inputSchema?: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
  };
}

export interface McpServerHealth {
  id: string;
  name: string;
  category: 'jobs';
  endpoint: string;
  reachable: boolean;
  status: 'connected' | 'simulated' | 'error' | 'disconnected';
  latencyMs: number;
  lastPing: string;
  discoveredTools: McpToolSchema[];
  errorMessage?: string;
  protocolVersion?: string;
}

export interface McpOverallHealth {
  server: McpServerHealth;
  isReachable: boolean;
  localFallbackActive: boolean;
  timestamp: string;
}
