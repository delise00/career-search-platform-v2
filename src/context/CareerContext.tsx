/**
 * Job Search & Saved Jobs State Context
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { JobListing, McpOverallHealth } from '../types.ts';
import { api } from '../services/api.ts';

export type AppTab = 'search' | 'saved';

interface CareerContextType {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  selectedJob: JobListing | null;
  setSelectedJob: (job: JobListing | null) => void;
  savedJobs: JobListing[];
  toggleSaveJob: (job: JobListing) => void;
  isJobSaved: (jobId: string) => boolean;
  mcpHealth: McpOverallHealth | null;
  isHealthChecking: boolean;
  refreshMcpHealth: () => Promise<void>;
  isMcpModalOpen: boolean;
  setIsMcpModalOpen: (open: boolean) => void;
}

const CareerContext = createContext<CareerContextType | undefined>(undefined);

const LOCAL_STORAGE_SAVED_JOBS = 'indeed_mcp_saved_jobs_v1';

export const CareerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<AppTab>('search');
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [savedJobs, setSavedJobs] = useState<JobListing[]>([]);
  const [mcpHealth, setMcpHealth] = useState<McpOverallHealth | null>(null);
  const [isHealthChecking, setIsHealthChecking] = useState(false);
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_SAVED_JOBS);
      if (stored) {
        setSavedJobs(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    refreshMcpHealth();
  }, []);

  const refreshMcpHealth = async () => {
    setIsHealthChecking(true);
    try {
      const health = await api.getMcpHealth();
      setMcpHealth(health);
    } catch (err) {
      console.warn('Could not fetch Indeed MCP health:', err);
    } finally {
      setIsHealthChecking(false);
    }
  };

  const toggleSaveJob = (job: JobListing) => {
    setSavedJobs((prev) => {
      const exists = prev.some((j) => j.id === job.id);
      let updated: JobListing[];
      if (exists) {
        updated = prev.filter((j) => j.id !== job.id);
      } else {
        updated = [job, ...prev];
      }
      localStorage.setItem(LOCAL_STORAGE_SAVED_JOBS, JSON.stringify(updated));
      return updated;
    });
  };

  const isJobSaved = (jobId: string) => {
    return savedJobs.some((j) => j.id === jobId);
  };

  return (
    <CareerContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedJob,
        setSelectedJob,
        savedJobs,
        toggleSaveJob,
        isJobSaved,
        mcpHealth,
        isHealthChecking,
        refreshMcpHealth,
        isMcpModalOpen,
        setIsMcpModalOpen,
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
