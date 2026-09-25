/**
 * Career Navigator Global State & Workflow Context
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  JobListing,
  ResumeData,
  ApplicationTrackerItem,
  ApplicationStatus,
  McpOverallHealth,
} from '../types.ts';
import { api } from '../services/api.ts';
import { SAMPLE_RESUMES } from '../data/sampleResumes.ts';

export type AppTab = 'jobs' | 'resume' | 'match' | 'assistant' | 'interview' | 'applications';

interface CareerContextType {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  currentResume: ResumeData | null;
  setCurrentResume: (resume: ResumeData | null) => void;
  rawResumeText: string;
  setRawResumeText: (text: string) => void;
  selectedJob: JobListing | null;
  setSelectedJob: (job: JobListing | null) => void;
  savedApplications: ApplicationTrackerItem[];
  saveJobToTracker: (job: JobListing, status?: ApplicationStatus, score?: number) => void;
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void;
  updateApplicationNotes: (id: string, notes: string) => void;
  deleteApplication: (id: string) => void;
  mcpHealth: McpOverallHealth | null;
  isHealthChecking: boolean;
  refreshMcpHealth: () => Promise<void>;
  isMcpModalOpen: boolean;
  setIsMcpModalOpen: (open: boolean) => void;
  startJobWorkflow: (job: JobListing) => void;
  loadSampleResumePreset: (sampleId: string) => void;
}

const CareerContext = createContext<CareerContextType | undefined>(undefined);

const LOCAL_STORAGE_RESUME_KEY = 'career_nav_resume_v1';
const LOCAL_STORAGE_RAW_TEXT_KEY = 'career_nav_raw_text_v1';
const LOCAL_STORAGE_APPLICATIONS_KEY = 'career_nav_apps_v1';

export const CareerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<AppTab>('jobs');
  const [currentResume, setCurrentResumeState] = useState<ResumeData | null>(null);
  const [rawResumeText, setRawResumeTextState] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [savedApplications, setSavedApplications] = useState<ApplicationTrackerItem[]>([]);
  const [mcpHealth, setMcpHealth] = useState<McpOverallHealth | null>(null);
  const [isHealthChecking, setIsHealthChecking] = useState(false);
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const storedResume = localStorage.getItem(LOCAL_STORAGE_RESUME_KEY);
      if (storedResume) {
        setCurrentResumeState(JSON.parse(storedResume));
      }
      const storedRaw = localStorage.getItem(LOCAL_STORAGE_RAW_TEXT_KEY);
      if (storedRaw) {
        setRawResumeTextState(storedRaw);
      } else if (!storedResume) {
        // Pre-fill with Sarah Chen sample so new visitors immediately have a working profile
        setRawResumeTextState(SAMPLE_RESUMES[0].rawText);
      }

      const storedApps = localStorage.getItem(LOCAL_STORAGE_APPLICATIONS_KEY);
      if (storedApps) {
        setSavedApplications(JSON.parse(storedApps));
      }
    } catch (e) {
      console.warn('LocalStorage retrieval error:', e);
    }

    // Initial MCP Health Check
    refreshMcpHealth();
  }, []);

  const setCurrentResume = (resume: ResumeData | null) => {
    setCurrentResumeState(resume);
    if (resume) {
      localStorage.setItem(LOCAL_STORAGE_RESUME_KEY, JSON.stringify(resume));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_RESUME_KEY);
    }
  };

  const setRawResumeText = (text: string) => {
    setRawResumeTextState(text);
    localStorage.setItem(LOCAL_STORAGE_RAW_TEXT_KEY, text);
  };

  const refreshMcpHealth = async () => {
    setIsHealthChecking(true);
    try {
      const health = await api.getMcpHealth();
      setMcpHealth(health);
    } catch (err) {
      console.warn('Could not fetch MCP health:', err);
    } finally {
      setIsHealthChecking(false);
    }
  };

  const saveJobToTracker = (job: JobListing, status: ApplicationStatus = 'Saved', score?: number) => {
    setSavedApplications((prev) => {
      const existing = prev.find((a) => a.jobId === job.id);
      const now = new Date().toISOString();
      let updated: ApplicationTrackerItem[];

      if (existing) {
        updated = prev.map((item) =>
          item.jobId === job.id
            ? {
                ...item,
                status: status || item.status,
                matchScore: score !== undefined ? score : item.matchScore,
                lastUpdated: now,
              }
            : item,
        );
      } else {
        const salaryText = job.salary
          ? `${job.salary.currency} ${job.salary.min?.toLocaleString()} - ${job.salary.max?.toLocaleString()} / ${job.salary.period}`
          : undefined;

        const newItem: ApplicationTrackerItem = {
          id: `app-${Date.now()}`,
          jobId: job.id,
          jobTitle: job.title,
          company: job.company,
          location: job.location,
          salaryText,
          status,
          dateAdded: now,
          lastUpdated: now,
          notes: `Added from job search (${job.source}).`,
          matchScore: score,
        };
        updated = [newItem, ...prev];
      }

      localStorage.setItem(LOCAL_STORAGE_APPLICATIONS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const updateApplicationStatus = (id: string, status: ApplicationStatus) => {
    setSavedApplications((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, status, lastUpdated: new Date().toISOString() } : item,
      );
      localStorage.setItem(LOCAL_STORAGE_APPLICATIONS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const updateApplicationNotes = (id: string, notes: string) => {
    setSavedApplications((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, notes, lastUpdated: new Date().toISOString() } : item,
      );
      localStorage.setItem(LOCAL_STORAGE_APPLICATIONS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteApplication = (id: string) => {
    setSavedApplications((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem(LOCAL_STORAGE_APPLICATIONS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const startJobWorkflow = (job: JobListing) => {
    setSelectedJob(job);
    if (!currentResume) {
      setActiveTab('resume');
    } else {
      setActiveTab('match');
    }
  };

  const loadSampleResumePreset = (sampleId: string) => {
    const preset = SAMPLE_RESUMES.find((s) => s.id === sampleId);
    if (preset) {
      setRawResumeText(preset.rawText);
      setCurrentResume(null); // Force screening trigger
    }
  };

  return (
    <CareerContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentResume,
        setCurrentResume,
        rawResumeText,
        setRawResumeText,
        selectedJob,
        setSelectedJob,
        savedApplications,
        saveJobToTracker,
        updateApplicationStatus,
        updateApplicationNotes,
        deleteApplication,
        mcpHealth,
        isHealthChecking,
        refreshMcpHealth,
        isMcpModalOpen,
        setIsMcpModalOpen,
        startJobWorkflow,
        loadSampleResumePreset,
      }}
    >
      {children}
    </CareerContext.Provider>
  );
};

export const useCareer = () => {
  const context = useContext(CareerContext);
  if (!context) throw new Error('useCareer must be used within a CareerProvider');
  return context;
};
