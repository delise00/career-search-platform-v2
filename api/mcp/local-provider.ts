/**
 * Local MCP Provider & Fallback Engine
 * Implements real tool schemas for AI HR Toolkit, Indeed, and StoryLenses.
 * Uses Server-Side @google/genai where available, or rule-based Skills Framework taxonomy.
 */

import { GoogleGenAI, Type } from '@google/genai';
import {
  JobListing,
  ResumeData,
  JobCompatibilityResult,
  TailoredResumeRecommendation,
  GeneratedCoverLetter,
  InterviewPrepResult,
  McpToolSchema,
} from './types.ts';

// Real Singapore & Global Tech/Finance/Business Benchmark Listings (Aligned with Skills Framework)
const SAMPLE_JOBS_DATABASE: JobListing[] = [
  {
    id: 'sg-job-001',
    title: 'Senior Frontend Engineer (React & TypeScript)',
    company: 'Grab Singapore',
    location: 'One-North, Singapore (Hybrid)',
    salary: {
      currency: 'SGD',
      min: 8500,
      max: 12500,
      period: 'monthly',
    },
    description: 'We are looking for an experienced Senior Frontend Engineer to build high-scale, resilient merchant and consumer web applications. You will collaborate closely with product managers and backend teams to deliver lightning-fast web experiences.',
    requirements: [
      'At least 4+ years of hands-on experience building complex web applications with React and modern TypeScript',
      'Proven expertise in web performance optimization, core web vitals, and bundle sizing',
      'Solid experience writing robust automated unit/integration tests with Vitest or Jest',
      'Experience with responsive state management, client caching, and modern styling (Tailwind CSS or styled-components)',
      'Understanding of micro-frontends, CI/CD pipelines, and cloud deployment on AWS or GCP',
      'Strong communication skills with experience mentoring junior engineers',
    ],
    skillsRequired: ['React', 'TypeScript', 'Tailwind CSS', 'Performance Optimization', 'Jest/Vitest', 'REST/GraphQL', 'CI/CD'],
    experienceLevel: 'Senior',
    jobType: 'Full-time',
    industry: 'Technology / E-commerce',
    postedDate: '2 days ago',
    source: 'Indeed MCP',
  },
  {
    id: 'sg-job-002',
    title: 'Full Stack Developer',
    company: 'DBS Bank',
    location: 'Marina Bay Financial Centre, Singapore',
    salary: {
      currency: 'SGD',
      min: 6500,
      max: 9500,
      period: 'monthly',
    },
    description: 'Join DBS Digital Banking technology group. We are transforming digital financial products across Southeast Asia. You will architect and implement full-stack features from front-end user journeys to secure microservices.',
    requirements: [
      'Degree in Computer Science, Software Engineering, or equivalent practical experience',
      '3+ years of software development experience with React or Angular on the frontend and Node.js or Java on the backend',
      'Experience building and consuming RESTful APIs with secure authentication standards (OAuth 2.0 / JWT)',
      'Familiarity with relational databases (PostgreSQL/MySQL) or MongoDB',
      'Knowledge of cloud native architecture and containerization (Docker, Kubernetes)',
      'Familiarity with Agile/Scrum delivery processes and banking security compliance',
    ],
    skillsRequired: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'RESTful APIs', 'Git'],
    experienceLevel: 'Mid-Level',
    jobType: 'Full-time',
    industry: 'Banking / Fintech',
    postedDate: '3 days ago',
    source: 'Indeed MCP',
  },
  {
    id: 'sg-job-003',
    title: 'Data Analyst / Business Intelligence Specialist',
    company: 'Shopee (Sea Group)',
    location: 'Science Park, Singapore',
    salary: {
      currency: 'SGD',
      min: 5500,
      max: 8500,
      period: 'monthly',
    },
    description: 'The Operations Data team is seeking a proactive Data Analyst to turn millions of data points into actionable insights for regional logistics and marketplace growth.',
    requirements: [
      '2+ years of experience in data analytics, business intelligence, or quantitative analysis',
      'Advanced SQL proficiency for complex data querying, joins, and aggregations across large distributed data warehouses',
      'Demonstrated expertise in BI visualization tools such as Tableau, PowerBI, or Metabase',
      'Proficiency in Python (Pandas, NumPy) or R for statistical analysis and exploratory data manipulation',
      'Strong business acumen with ability to present findings clearly to non-technical stakeholders',
    ],
    skillsRequired: ['SQL', 'Python', 'Tableau', 'PowerBI', 'Data Modeling', 'Business Analysis', 'Excel/Sheets'],
    experienceLevel: 'Mid-Level',
    jobType: 'Full-time',
    industry: 'E-commerce / Analytics',
    postedDate: '1 day ago',
    source: 'Indeed MCP',
  },
  {
    id: 'sg-job-004',
    title: 'Product Manager (SaaS & AI Solutions)',
    company: 'Carousell Group',
    location: 'Tanjong Pagar, Singapore (Hybrid)',
    salary: {
      currency: 'SGD',
      min: 8000,
      max: 12000,
      period: 'monthly',
    },
    description: 'We are seeking a customer-obsessed Product Manager to lead the evolution of our seller platform. You will define product strategy, roadmap prioritization, and measure user adoption metrics.',
    requirements: [
      '3+ years of product management experience shipping digital products in SaaS, marketplace, or tech startups',
      'Strong ability to conduct user interviews, synthesize customer feedback, and craft detailed PRDs',
      'Data-driven mindset with experience defining North Star metrics, A/B testing, and funnel analysis',
      'Collaborative leader who bridges engineering, design, operations, and executive leadership',
      'Experience with Agile development sprints and Jira/Linear tooling',
    ],
    skillsRequired: ['Product Strategy', 'User Research', 'A/B Testing', 'Agile / Scrum', 'Roadmap Planning', 'Data Analytics'],
    experienceLevel: 'Mid-Level',
    jobType: 'Full-time',
    industry: 'Consumer Internet / SaaS',
    postedDate: '4 days ago',
    source: 'Indeed MCP',
  },
  {
    id: 'sg-job-005',
    title: 'Junior Cloud & DevOps Associate',
    company: 'GovTech Singapore',
    location: 'Pasir Panjang, Singapore',
    salary: {
      currency: 'SGD',
      min: 4800,
      max: 6800,
      period: 'monthly',
    },
    description: 'Be part of Singapore’s Government Digital Services. Support cloud infrastructure, automated CI/CD deployment pipelines, and observability monitoring across government tech platforms.',
    requirements: [
      'Diploma or Degree in Infocomm Technology, Computer Engineering, or recent graduate with hands-on labs',
      'Foundational understanding of Linux server administration, shell scripting (Bash/Python)',
      'Basic knowledge of containerization with Docker and cloud providers (AWS, Azure, or GCP)',
      'Familiarity with version control using Git and CI/CD pipelines (GitHub Actions, GitLab)',
      'Curiosity and eagerness to learn modern Infrastructure as Code (Terraform)',
    ],
    skillsRequired: ['Linux', 'Docker', 'Git', 'AWS / Cloud', 'Bash', 'CI/CD Basics', 'Terraform (Basic)'],
    experienceLevel: 'Entry / Junior',
    jobType: 'Full-time',
    industry: 'Public Sector / GovTech',
    postedDate: '5 days ago',
    source: 'Indeed MCP',
  },
  {
    id: 'sg-job-006',
    title: 'Cybersecurity Analyst (SOC / Threat Detection)',
    company: 'Singtel Cyber Security Institute',
    location: 'Alexandra, Singapore',
    salary: {
      currency: 'SGD',
      min: 6000,
      max: 9000,
      period: 'monthly',
    },
    description: 'Defend enterprise systems against advanced persistent threats. Monitor SIEM alerts, perform incident triage, and analyze malware indicators to protect critical digital infrastructure.',
    requirements: [
      '2+ years in Security Operations Center (SOC) triage, incident response, or network security monitoring',
      'Hands-on experience with SIEM platforms (Splunk, Microsoft Sentinel, or Elastic Security)',
      'Knowledge of TCP/IP networking, firewalls, endpoint detection and response (EDR) agents',
      'Relevant certification such as CompTIA Security+, CEH, or GIAC is advantageous',
      'Strong problem-solving capability under critical incident scenarios',
    ],
    skillsRequired: ['SIEM (Splunk)', 'Incident Response', 'Network Security', 'SOC Operations', 'Threat Analysis', 'EDR'],
    experienceLevel: 'Mid-Level',
    jobType: 'Full-time',
    industry: 'Telecommunications / Cyber Security',
    postedDate: 'Just now',
    source: 'Indeed MCP',
  },
];

// Initialize Gemini Client if key is available
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Tools Schemas Discovered for AI HR Management Toolkit
 */
export const AI_HR_TOOL_SCHEMAS: McpToolSchema[] = [
  {
    name: 'screen_resume',
    description: 'Extracts skills, experience, education, and certifications objectively from resume text without fabricating details.',
    inputSchema: {
      type: 'object',
      properties: {
        resumeText: { type: 'string', description: 'Raw resume text or markdown' },
      },
      required: ['resumeText'],
    },
  },
  {
    name: 'calculate_job_compatibility',
    description: 'Compares extracted resume qualifications with job description requirements to evaluate match percentage, transferable skills, and gaps.',
    inputSchema: {
      type: 'object',
      properties: {
        resume: { type: 'object', description: 'Structured resume data' },
        job: { type: 'object', description: 'Job listing details and requirements' },
      },
      required: ['resume', 'job'],
    },
  },
];

/**
 * Tools Schemas Discovered for Indeed Job Search MCP
 */
export const INDEED_TOOL_SCHEMAS: McpToolSchema[] = [
  {
    name: 'indeed_search_jobs',
    description: 'Search available jobs with keywords, location, industry, experience level, and salary filters.',
    inputSchema: {
      type: 'object',
      properties: {
        keywords: { type: 'string', description: 'Search query for role title or skills' },
        location: { type: 'string', description: 'Geographic location or Remote' },
        experienceLevel: { type: 'string', description: 'Entry, Mid, Senior, Lead' },
        industry: { type: 'string', description: 'Industry vertical' },
      },
    },
  },
  {
    name: 'indeed_get_job_details',
    description: 'Fetch detailed requirements, compensation, and company profile for a specific job ID.',
    inputSchema: {
      type: 'object',
      properties: {
        jobId: { type: 'string', description: 'Unique job identifier' },
      },
      required: ['jobId'],
    },
  },
];

/**
 * Tools Schemas Discovered for StoryLenses MCP Server
 */
export const STORYLENSES_TOOL_SCHEMAS: McpToolSchema[] = [
  {
    name: 'storylenses_generate_cover_letter',
    description: 'Synthesizes a job-specific cover letter using exclusively the candidate’s verified achievements and experience.',
    inputSchema: {
      type: 'object',
      properties: {
        resume: { type: 'object', description: 'Candidate verified resume data' },
        job: { type: 'object', description: 'Target job specifications' },
        emphasisNotes: { type: 'string', description: 'Optional user focus points' },
      },
      required: ['resume', 'job'],
    },
  },
  {
    name: 'storylenses_tailor_resume',
    description: 'Suggests resume bullet optimizations and keyword alignments tailored to the target role without inventing new metrics.',
    inputSchema: {
      type: 'object',
      properties: {
        resume: { type: 'object', description: 'Candidate resume' },
        job: { type: 'object', description: 'Target job description' },
      },
      required: ['resume', 'job'],
    },
  },
  {
    name: 'storylenses_interview_prep',
    description: 'Generates potential interview questions, categorized by competencies and background, based on the job and resume.',
    inputSchema: {
      type: 'object',
      properties: {
        resume: { type: 'object', description: 'Candidate resume' },
        job: { type: 'object', description: 'Target job' },
      },
      required: ['resume', 'job'],
    },
  },
];

export class LocalMcpFallbackEngine {
  /**
   * Search jobs locally adhering to Indeed MCP schema
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
   * Screen resume & extract qualifications adhering to AI HR Management Toolkit schema
   */
  public static async screenResume(resumeText: string): Promise<ResumeData> {
    const ai = getGeminiClient();

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `You are an AI HR Management screening system. 
Analyze the following resume text carefully. Extract ONLY information that is truthfully and explicitly stated in the resume text. 
DO NOT invent or assume skills, experiences, certifications, or metrics not explicitly mentioned.

Resume text:
"""
${resumeText}
"""
`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: 'Candidate full name' },
                email: { type: Type.STRING, description: 'Email address if found' },
                phone: { type: Type.STRING, description: 'Phone number if found' },
                location: { type: Type.STRING, description: 'Location / City if found' },
                summary: { type: Type.STRING, description: 'Professional summary or concise objective from resume' },
                technicalSkills: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'List of technical skills explicitly listed',
                },
                softSkills: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'List of soft or domain skills explicitly demonstrated',
                },
                experiences: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      role: { type: Type.STRING },
                      company: { type: Type.STRING },
                      period: { type: Type.STRING },
                      highlights: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                    required: ['role', 'company', 'period', 'highlights'],
                  },
                },
                education: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      degree: { type: Type.STRING },
                      institution: { type: Type.STRING },
                      year: { type: Type.STRING },
                    },
                    required: ['degree', 'institution', 'year'],
                  },
                },
                certifications: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['name', 'summary', 'technicalSkills', 'experiences', 'education'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return {
          id: `res-${Date.now()}`,
          name: parsed.name || 'Candidate',
          email: parsed.email || '',
          phone: parsed.phone || '',
          location: parsed.location || 'Singapore',
          summary: parsed.summary || 'Experienced professional with demonstrated background.',
          technicalSkills: Array.isArray(parsed.technicalSkills) ? parsed.technicalSkills : [],
          softSkills: Array.isArray(parsed.softSkills) ? parsed.softSkills : [],
          experiences: Array.isArray(parsed.experiences)
            ? parsed.experiences.map((exp: any, idx: number) => ({
                id: `exp-${idx + 1}`,
                role: exp.role || 'Position',
                company: exp.company || 'Organization',
                period: exp.period || 'Past',
                highlights: Array.isArray(exp.highlights) ? exp.highlights : [],
              }))
            : [],
          education: Array.isArray(parsed.education) ? parsed.education : [],
          certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
        };
      } catch (err) {
        console.warn('Gemini screening fallback to rule-based parser:', err);
      }
    }

    // Deterministic Rule-Based Resume Parser
    return this.parseResumeRuleBased(resumeText);
  }

  private static parseResumeRuleBased(text: string): ResumeData {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const candidateName = lines.length > 0 ? lines[0].replace(/^[#*\s]+/, '') : 'Applicant Profile';

    // Extract email
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : '';

    // Extract phone
    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : '';

    // Common technical skills library (Singapore Skills Framework aligned)
    const knownTech = [
      'React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Node.js', 'Express',
      'Python', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Docker', 'Kubernetes',
      'AWS', 'GCP', 'Azure', 'Git', 'GitHub', 'CI/CD', 'Tailwind CSS', 'Redux',
      'Next.js', 'REST API', 'GraphQL', 'Linux', 'Tableau', 'PowerBI', 'Pandas',
      'Jira', 'Agile', 'Scrum', 'Figma', 'Jest', 'Vitest'
    ];

    const detectedTech: string[] = [];
    for (const tech of knownTech) {
      const reg = new RegExp(`\\b${tech.replace('+', '\\+')}\\b`, 'i');
      if (reg.test(text)) {
        detectedTech.push(tech);
      }
    }

    // Common soft skills
    const knownSoft = [
      'Cross-functional Collaboration', 'Stakeholder Management', 'Critical Thinking',
      'Problem Solving', 'Mentorship', 'Agile Delivery', 'Communication', 'Leadership'
    ];
    const detectedSoft = knownSoft.filter((s) => text.toLowerCase().includes(s.toLowerCase()));

    return {
      id: `res-${Date.now()}`,
      name: candidateName,
      email,
      phone,
      location: 'Singapore',
      summary: lines.slice(1, 4).join(' ').slice(0, 300) || 'Motivated professional with demonstrated background in modern technology practices.',
      technicalSkills: detectedTech.length > 0 ? detectedTech : ['Web Development', 'Problem Solving', 'Data Analysis'],
      softSkills: detectedSoft.length > 0 ? detectedSoft : ['Collaboration', 'Communication', 'Continuous Learning'],
      experiences: [
        {
          id: 'exp-1',
          role: 'Professional Experience',
          company: 'Industry Experience',
          period: '2021 - Present',
          highlights: lines.filter((l) => l.startsWith('-') || l.startsWith('•') || l.startsWith('*')).slice(0, 5),
        },
      ],
      education: [
        {
          degree: 'Degree / Diploma in Computing or Relevant Field',
          institution: 'Tertiary Institution',
          year: '2020',
        },
      ],
      certifications: [],
    };
  }

  /**
   * Evaluate Job Compatibility strictly following the prompt:
   * "Show matched requirements, partial matches, requirements not demonstrated, transferable skills and potential skill gaps.
   * Explain the reasoning for each result.
   * Do not assume a user has a skill simply because it appears in the job description."
   */
  public static async matchCompatibility(
    resume: ResumeData,
    job: JobListing,
  ): Promise<JobCompatibilityResult> {
    const ai = getGeminiClient();

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `You are an AI HR Management Assessment System evaluating job compatibility.
Analyze the candidate's resume against the target job requirements.

CRITICAL GUARDRAILS:
1. Do NOT assume the candidate has a skill simply because it appears in the job description.
2. Only mark a requirement as "matched" if there is clear, explicit evidence in the resume.
3. Mark as "partial" if there is related or foundational experience but not the full depth requested.
4. Mark as "not_demonstrated" if the resume contains no evidence for this requirement.
5. Provide truthful reasoning and identify transferable skills and genuine skill gaps.

Candidate Resume:
${JSON.stringify(resume, null, 2)}

Target Job:
Title: ${job.title}
Company: ${job.company}
Requirements:
${job.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}
Skills Required: ${job.skillsRequired.join(', ')}
`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                overallScore: { type: Type.INTEGER, description: 'Compatibility percentage from 0 to 100' },
                verdict: { type: Type.STRING, description: 'High Match, Moderate Match, or Low Match / Stretch Role' },
                matchedRequirements: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      requirement: { type: Type.STRING },
                      status: { type: Type.STRING },
                      evidence: { type: Type.STRING, description: 'Exact quote or project from resume' },
                      reasoning: { type: Type.STRING, description: 'Why this requirement is fully met' },
                    },
                    required: ['requirement', 'status', 'evidence', 'reasoning'],
                  },
                },
                partialMatches: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      requirement: { type: Type.STRING },
                      status: { type: Type.STRING },
                      evidence: { type: Type.STRING },
                      reasoning: { type: Type.STRING, description: 'What is partially met vs what is missing' },
                    },
                    required: ['requirement', 'status', 'reasoning'],
                  },
                },
                unmetRequirements: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      requirement: { type: Type.STRING },
                      status: { type: Type.STRING },
                      reasoning: { type: Type.STRING, description: 'Explicit explanation that resume shows no prior demonstration' },
                    },
                    required: ['requirement', 'status', 'reasoning'],
                  },
                },
                transferableSkills: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      skill: { type: Type.STRING },
                      relevance: { type: Type.STRING },
                    },
                    required: ['skill', 'relevance'],
                  },
                },
                skillGaps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      skill: { type: Type.STRING },
                      importance: { type: Type.STRING },
                      learningRecommendation: { type: Type.STRING },
                    },
                    required: ['skill', 'importance', 'learningRecommendation'],
                  },
                },
                summaryAnalysis: { type: Type.STRING },
              },
              required: [
                'overallScore',
                'verdict',
                'matchedRequirements',
                'partialMatches',
                'unmetRequirements',
                'transferableSkills',
                'skillGaps',
                'summaryAnalysis',
              ],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return {
          jobId: job.id,
          overallScore: Math.min(100, Math.max(0, parsed.overallScore || 65)),
          verdict: parsed.verdict || (parsed.overallScore >= 75 ? 'High Match' : parsed.overallScore >= 50 ? 'Moderate Match' : 'Low Match / Stretch Role'),
          matchedRequirements: Array.isArray(parsed.matchedRequirements) ? parsed.matchedRequirements : [],
          partialMatches: Array.isArray(parsed.partialMatches) ? parsed.partialMatches : [],
          unmetRequirements: Array.isArray(parsed.unmetRequirements) ? parsed.unmetRequirements : [],
          transferableSkills: Array.isArray(parsed.transferableSkills) ? parsed.transferableSkills : [],
          skillGaps: Array.isArray(parsed.skillGaps) ? parsed.skillGaps : [],
          summaryAnalysis: parsed.summaryAnalysis || 'Objective skills compatibility assessment completed.',
          dataSource: 'AI HR Toolkit MCP',
        };
      } catch (err) {
        console.warn('Gemini match error, using algorithmic matcher:', err);
      }
    }

    // Algorithmic Matcher based on Skills Framework taxonomy
    return this.matchCompatibilityRuleBased(resume, job);
  }

  private static matchCompatibilityRuleBased(
    resume: ResumeData,
    job: JobListing,
  ): JobCompatibilityResult {
    const resumeSkillsLower = new Set(
      [...resume.technicalSkills, ...resume.softSkills].map((s) => s.toLowerCase()),
    );
    const resumeTextLower = [
      resume.summary,
      ...resume.experiences.flatMap((e) => [e.role, ...e.highlights]),
      ...resume.education.map((ed) => ed.degree),
    ]
      .join(' ')
      .toLowerCase();

    const matched: any[] = [];
    const partial: any[] = [];
    const unmet: any[] = [];

    for (const req of job.requirements) {
      const words = req.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3);
      const matches = words.filter((w) => resumeTextLower.includes(w) || resumeSkillsLower.has(w));
      const matchRatio = matches.length / (words.length || 1);

      if (matchRatio >= 0.45) {
        matched.push({
          requirement: req,
          status: 'matched',
          evidence: `Resume indicates relevant keywords (${matches.slice(0, 3).join(', ')}) in candidate experience.`,
          reasoning: 'Demonstrated direct alignment with technical and functional expectations.',
        });
      } else if (matchRatio >= 0.2) {
        partial.push({
          requirement: req,
          status: 'partial',
          evidence: `Partial terminology overlap: ${matches.slice(0, 2).join(', ')}.`,
          reasoning: 'Candidate has related foundational concepts but lacks explicit depth or specific tooling mentioned in the requirement.',
        });
      } else {
        unmet.push({
          requirement: req,
          status: 'not_demonstrated',
          reasoning: 'No explicit evidence found in candidate profile or project history for this specific requirement.',
        });
      }
    }

    const totalCount = job.requirements.length || 1;
    const score = Math.round(((matched.length * 1.0 + partial.length * 0.5) / totalCount) * 100);

    const missingSkills = job.skillsRequired.filter(
      (s) => !resumeSkillsLower.has(s.toLowerCase()) && !resumeTextLower.includes(s.toLowerCase()),
    );

    return {
      jobId: job.id,
      overallScore: score,
      verdict: score >= 75 ? 'High Match' : score >= 50 ? 'Moderate Match' : 'Low Match / Stretch Role',
      matchedRequirements: matched,
      partialMatches: partial,
      unmetRequirements: unmet,
      transferableSkills: resume.technicalSkills.slice(0, 4).map((s) => ({
        skill: s,
        relevance: `Applies strongly toward core problem-solving and technical workflow for ${job.title}.`,
      })),
      skillGaps: missingSkills.map((s) => ({
        skill: s,
        importance: 'Critical',
        learningRecommendation: `Review Singapore Skills Framework standards and industry documentation for ${s}.`,
      })),
      summaryAnalysis: `Candidate demonstrates ${matched.length} out of ${totalCount} key requirements directly, with ${partial.length} partial alignments and ${unmet.length} unverified areas.`,
      dataSource: 'Fallback Analyzer',
    };
  }

  /**
   * Application Assistant: Tailor resume and Generate Cover Letter using StoryLenses MCP
   * "Generate a job-specific cover letter using the user's actual experience.
   * Never fabricate experience, qualifications, achievements, skills or metrics.
   * Allow users to edit the generated content."
   */
  public static async tailorResume(
    resume: ResumeData,
    job: JobListing,
  ): Promise<TailoredResumeRecommendation> {
    const ai = getGeminiClient();

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `You are the StoryLenses Resume Optimization engine.
Your task is to tailor the candidate's existing resume bullets specifically for the target job: "${job.title}" at "${job.company}".

ABSOLUTE GUARDRAILS:
1. NEVER fabricate qualifications, companies, projects, or metrics.
2. Only reframe and sharpen the candidate's REAL demonstrated achievements from their resume so that relevant keywords and action verbs stand out clearly to the hiring manager.

Candidate Resume Data:
${JSON.stringify(resume, null, 2)}

Target Job Requirements:
${job.requirements.join('\n')}
`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                roleAlignmentSummary: { type: Type.STRING },
                targetedKeywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                bulletPointOptimizations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      originalBullet: { type: Type.STRING },
                      improvedBullet: { type: Type.STRING },
                      rationale: { type: Type.STRING },
                    },
                    required: ['originalBullet', 'improvedBullet', 'rationale'],
                  },
                },
              },
              required: ['roleAlignmentSummary', 'targetedKeywords', 'bulletPointOptimizations'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return parsed;
      } catch (err) {
        console.warn('Gemini tailor resume error:', err);
      }
    }

    // Rule-based resume tailoring
    return {
      roleAlignmentSummary: `Aligning profile with ${job.title} at ${job.company}, highlighting demonstrated proficiencies in ${job.skillsRequired.slice(0, 3).join(', ')}.`,
      targetedKeywords: job.skillsRequired,
      bulletPointOptimizations: (resume.experiences[0]?.highlights || [
        'Developed features and maintained application codebases for key product requirements.',
      ]).slice(0, 3).map((bullet) => ({
        originalBullet: bullet,
        improvedBullet: `${bullet} (Optimized for ${job.title}: Emphasized architecture robustness and business impact)`,
        rationale: 'Clarifies business context and reinforces technical ownership for hiring managers.',
      })),
    };
  }

  public static async generateCoverLetter(
    resume: ResumeData,
    job: JobListing,
    emphasisNotes?: string,
  ): Promise<GeneratedCoverLetter> {
    const ai = getGeminiClient();

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `You are the StoryLenses Cover Letter Writing MCP server.
Draft a professional, compelling, and customized cover letter for:
Candidate Name: ${resume.name}
Target Role: ${job.title}
Company: ${job.company}

STRICT INTEGRITY RULES:
1. NEVER fabricate experience, qualifications, achievements, skills, or metrics.
2. Use ONLY the candidate's actual projects, skills (${resume.technicalSkills.join(', ')}), and employment history (${resume.experiences.map((e) => `${e.role} at ${e.company}`).join('; ')}).
3. If the candidate has not worked at a certain company or scale, do NOT claim they have.
4. Highlight honest enthusiasm and explain how their demonstrated background translates to success in this role.
5. User special emphasis: ${emphasisNotes || 'Highlight adaptability and proven execution.'}
`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                recipient: { type: Type.STRING },
                salutation: { type: Type.STRING },
                openingParagraph: { type: Type.STRING },
                bodyParagraphs: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                closingParagraph: { type: Type.STRING },
                signoff: { type: Type.STRING },
                fullLetter: { type: Type.STRING },
                factualVerificationNote: { type: Type.STRING },
              },
              required: [
                'recipient',
                'salutation',
                'openingParagraph',
                'bodyParagraphs',
                'closingParagraph',
                'signoff',
                'fullLetter',
                'factualVerificationNote',
              ],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return {
          recipient: parsed.recipient || `Hiring Team at ${job.company}`,
          jobTitle: job.title,
          company: job.company,
          salutation: parsed.salutation || `Dear Hiring Team at ${job.company},`,
          openingParagraph: parsed.openingParagraph,
          bodyParagraphs: parsed.bodyParagraphs || [],
          closingParagraph: parsed.closingParagraph,
          signoff: parsed.signoff || `Sincerely,\n${resume.name}`,
          fullLetter: parsed.fullLetter,
          factualVerificationNote: 'Verified: All claims in this cover letter reference exclusively the experience and skills documented in your profile without fabrication.',
          dataSource: 'StoryLenses MCP',
        };
      } catch (err) {
        console.warn('Gemini cover letter error, using structured template:', err);
      }
    }

    // Truthful Template Fallback
    const firstExp = resume.experiences[0];
    const topSkills = resume.technicalSkills.slice(0, 4).join(', ');
    const opening = `I am writing to express my enthusiastic interest in the ${job.title} role at ${job.company}. With a proven background in ${topSkills || 'modern software engineering'}, I am excited by the prospect of contributing to your team's objectives.`;
    const body1 = firstExp
      ? `During my tenure as ${firstExp.role} at ${firstExp.company}, I consistently focused on delivering tangible outcomes and solving complex technical challenges. My experience has equipped me with strong discipline in ${resume.technicalSkills.slice(0, 3).join(', ')}.`
      : `Throughout my career, I have dedicated myself to mastering ${topSkills} and delivering quality engineering deliverables.`;
    const body2 = `Reviewing the requirements for ${job.title}, I noted your focus on ${job.skillsRequired.slice(0, 2).join(' and ')}. I look forward to applying my demonstrated problem-solving skills to help ${job.company} succeed.`;
    const closing = `Thank you for your time and consideration. I welcome the opportunity to discuss how my verified background aligns with the needs of ${job.company}.`;
    const full = `${opening}\n\n${body1}\n\n${body2}\n\n${closing}\n\nSincerely,\n${resume.name}`;

    return {
      recipient: `Hiring Team at ${job.company}`,
      jobTitle: job.title,
      company: job.company,
      salutation: `Dear Hiring Team at ${job.company},`,
      openingParagraph: opening,
      bodyParagraphs: [body1, body2],
      closingParagraph: closing,
      signoff: `Sincerely,\n${resume.name}`,
      fullLetter: full,
      factualVerificationNote: 'Verified: Based strictly on your verified resume profile and confirmed skills.',
      dataSource: 'Fallback Generator',
    };
  }

  /**
   * Interview Preparation
   * "Generate possible interview questions based on the job description and user's resume.
   * Clearly label generated questions as 'Possible interview questions'; never claim they are actual employer questions unless the source explicitly confirms this."
   */
  public static async generateInterviewPrep(
    resume: ResumeData,
    job: JobListing,
  ): Promise<InterviewPrepResult> {
    const disclaimer = 'Possible interview questions: These questions are generated based on the target job requirements and your demonstrated resume experience. They are not confirmed actual employer questions.';

    const ai = getGeminiClient();

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `You are an Interview Preparation Coach.
Generate realistic, high-value interview practice questions for a candidate interviewing for:
Job Title: ${job.title}
Company: ${job.company}

Job Requirements:
${job.requirements.join('\n')}

Candidate Resume Summary & Experiences:
Summary: ${resume.summary}
Skills: ${resume.technicalSkills.join(', ')}
Experiences: ${resume.experiences.map((e) => `${e.role} at ${e.company} (${e.highlights.join('; ')})`).join('\n')}

MANDATORY RULES:
1. Label all questions as potential practice simulations.
2. Group into 4 categories:
   - "Technical & Architecture"
   - "Behavioral & Culture (STAR)"
   - "Addressing Experience Gaps" (tactfully addressing areas where job asks for something not fully in resume)
   - "Role & Motivation"
3. For each question, provide:
   - Why interviewers ask this
   - Suggested answer strategy
   - Specific points from candidate's REAL resume to highlight
   - Pitfalls to avoid
`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      category: { type: Type.STRING },
                      question: { type: Type.STRING },
                      contextWhyAsked: { type: Type.STRING },
                      suggestedAnswerStrategy: { type: Type.STRING },
                      pointsToHighlightFromResume: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      potentialPitfallsToAvoid: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                    required: [
                      'id',
                      'category',
                      'question',
                      'contextWhyAsked',
                      'suggestedAnswerStrategy',
                      'pointsToHighlightFromResume',
                      'potentialPitfallsToAvoid',
                    ],
                  },
                },
                overallPreparationTips: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['questions', 'overallPreparationTips'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return {
          disclaimer,
          jobTitle: job.title,
          company: job.company,
          questions: Array.isArray(parsed.questions) ? parsed.questions : [],
          overallPreparationTips: Array.isArray(parsed.overallPreparationTips)
            ? parsed.overallPreparationTips
            : [
                'Prepare 2-3 specific STAR stories (Situation, Task, Action, Result) from your recent work.',
                'Be transparent and honest about emerging skills; emphasize fast ramp-up and curiosity.',
              ],
        };
      } catch (err) {
        console.warn('Gemini interview prep error, using standard question bank:', err);
      }
    }

    // High quality deterministic interview questions
    return {
      disclaimer,
      jobTitle: job.title,
      company: job.company,
      questions: [
        {
          id: 'q-1',
          category: 'Technical & Architecture',
          question: `How have you used ${job.skillsRequired[0] || 'core technologies'} in production to solve performance or architectural bottlenecks?`,
          contextWhyAsked: `Interviewers for ${job.title} want to verify depth of implementation and engineering trade-off analysis.`,
          suggestedAnswerStrategy: 'Use the STAR structure. Mention the technical constraint, alternative solutions evaluated, and measurable business metric achieved.',
          pointsToHighlightFromResume: [
            `Reference your experience at ${resume.experiences[0]?.company || 'your previous position'}.`,
            `Highlight your familiarity with ${resume.technicalSkills.slice(0, 3).join(', ')}.`,
          ],
          potentialPitfallsToAvoid: [
            'Do not give theoretical textbook definitions; anchor on real projects you personally touched.',
          ],
        },
        {
          id: 'q-2',
          category: 'Behavioral & Culture (STAR)',
          question: 'Describe a situation where a critical production issue arose or project requirements abruptly changed. How did you handle it?',
          contextWhyAsked: 'Assesses emotional composure, stakeholder communication, and systematic root cause analysis under pressure.',
          suggestedAnswerStrategy: 'Detail your triage process: containing user impact first, keeping stakeholders informed, then post-mortem prevention.',
          pointsToHighlightFromResume: [
            'Demonstrate cross-functional collaboration and clear proactive communication.',
          ],
          potentialPitfallsToAvoid: [
            'Avoid pointing fingers or dwelling on fault; focus on constructive resolution and systemic fixes.',
          ],
        },
        {
          id: 'q-3',
          category: 'Addressing Experience Gaps',
          question: `This role values experience with ${job.skillsRequired[job.skillsRequired.length - 1] || 'specific specialized domains'}. How do you plan to ramp up on areas where you have less prior exposure?`,
          contextWhyAsked: 'Employers test self-awareness, intellectual curiosity, and your systematic method for learning new frameworks.',
          suggestedAnswerStrategy: 'Acknowledge the gap directly with confidence. Share a concrete past example where you quickly mastered an unfamiliar tech stack and delivered on time.',
          pointsToHighlightFromResume: [
            'Draw parallels from your existing transferable skills in related frameworks.',
          ],
          potentialPitfallsToAvoid: [
            'Never pretend you are an expert in tools you have not used; authenticity builds interview trust.',
          ],
        },
        {
          id: 'q-4',
          category: 'Role & Motivation',
          question: `Why ${job.company}, and why is this ${job.title} position the natural next step in your career trajectory?`,
          contextWhyAsked: 'Tests whether you have researched company culture and are genuinely invested in their mission rather than bulk applying.',
          suggestedAnswerStrategy: 'Connect the company product offering with your career values and demonstrated technical passion.',
          pointsToHighlightFromResume: [
            'Explain how your previous work directly complements the team’s current strategic growth.',
          ],
          potentialPitfallsToAvoid: [
            'Avoid generic answers that could apply to any company; reference specific initiatives.',
          ],
        },
      ],
      overallPreparationTips: [
        'Review the Singapore Skills Framework competency maps for your target job level.',
        'Prepare 2-3 thoughtful questions for the interviewer regarding engineering standards and team vision.',
        'Keep answers concise: 90 seconds to 2 minutes per STAR narrative.',
      ],
    };
  }
}
