/**
 * Frontend Type Definitions
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
}

export interface ResumeData {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  summary: string;
  technicalSkills: string[];
  softSkills: string[];
  experiences: {
    id: string;
    role: string;
    company: string;
    period: string;
    highlights: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  certifications: string[];
}

export interface RequirementMatch {
  requirement: string;
  status: 'matched' | 'partial' | 'not_demonstrated';
  evidence?: string;
  reasoning: string;
}

export interface JobCompatibilityResult {
  jobId: string;
  overallScore: number;
  verdict: 'High Match' | 'Moderate Match' | 'Low Match / Stretch Role';
  matchedRequirements: RequirementMatch[];
  partialMatches: RequirementMatch[];
  unmetRequirements: RequirementMatch[];
  transferableSkills: {
    skill: string;
    relevance: string;
  }[];
  skillGaps: {
    skill: string;
    importance: 'Critical' | 'Preferred' | 'Nice-to-have';
    learningRecommendation: string;
  }[];
  summaryAnalysis: string;
  dataSource: string;
}

export interface TailoredResumeRecommendation {
  roleAlignmentSummary: string;
  targetedKeywords: string[];
  bulletPointOptimizations: {
    originalBullet: string;
    improvedBullet: string;
    rationale: string;
  }[];
}

export interface GeneratedCoverLetter {
  recipient: string;
  jobTitle: string;
  company: string;
  salutation: string;
  openingParagraph: string;
  bodyParagraphs: string[];
  closingParagraph: string;
  signoff: string;
  fullLetter: string;
  factualVerificationNote: string;
  dataSource: string;
}

export interface InterviewQuestion {
  id: string;
  category: 'Technical & Architecture' | 'Behavioral & Culture (STAR)' | 'Addressing Experience Gaps' | 'Role & Motivation';
  question: string;
  contextWhyAsked: string;
  suggestedAnswerStrategy: string;
  pointsToHighlightFromResume: string[];
  potentialPitfallsToAvoid: string[];
}

export interface InterviewPrepResult {
  disclaimer: string;
  jobTitle: string;
  company: string;
  questions: InterviewQuestion[];
  overallPreparationTips: string[];
}

export type ApplicationStatus = 'Saved' | 'Applied' | 'Interview' | 'Offer' | 'Rejected';

export interface ApplicationTrackerItem {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  salaryText?: string;
  status: ApplicationStatus;
  dateAdded: string;
  lastUpdated: string;
  notes: string;
  interviewDate?: string;
  customCoverLetter?: string;
  matchScore?: number;
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
  category: 'screening' | 'jobs' | 'coverletter';
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
  servers: McpServerHealth[];
  allReachable: boolean;
  localFallbackActive: boolean;
  geminiAiReady: boolean;
  timestamp: string;
}
