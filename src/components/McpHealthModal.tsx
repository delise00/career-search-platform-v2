import React, { useState } from 'react';
import { useCareer } from '../context/CareerContext.tsx';
import {
  Server,
  X,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Terminal,
  ShieldCheck,
  FileText,
  Target,
  Briefcase,
} from 'lucide-react';
import { McpToolSchema } from '../types.ts';

export const McpHealthModal: React.FC = () => {
  const { isMcpModalOpen, setIsMcpModalOpen, multiMcpHealth, isHealthChecking, refreshMcpHealth } = useCareer();
  const [selectedTool, setSelectedTool] = useState<McpToolSchema | null>(null);

  if (!isMcpModalOpen) return null;

  const servers = [
    {
      title: 'JobDataLake MCP',
      icon: Briefcase,
      color: 'text-cyan-400',
      badgeColor: 'border-cyan-800 text-cyan-300 bg-cyan-950',
      data: multiMcpHealth?.jobdatalake,
    },
    {
      title: 'CVpop MCP',
      icon: FileText,
      color: 'text-emerald-400',
      badgeColor: 'border-emerald-800 text-emerald-300 bg-emerald-950',
      data: multiMcpHealth?.cvpop,
    },
    {
      title: 'Calibrd MCP',
      icon: Target,
      color: 'text-purple-400',
      badgeColor: 'border-purple-800 text-purple-300 bg-purple-950',
      data: multiMcpHealth?.calibrd,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-950 border border-blue-700/50 text-blue-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Model Context Protocol (MCP) Ecosystem</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  3 Servers Connected
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Live monitoring for JobDataLake, CVpop, and Calibrd
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => refreshMcpHealth()}
              disabled={isHealthChecking}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isHealthChecking ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isHealthChecking ? 'Pinging...' : 'Ping All'}</span>
            </button>
            <button
              onClick={() => setIsMcpModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security Banner */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-emerald-400 font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Native Streamable HTTP &amp; SSE Protocols Active</span>
          </div>

          <a
            href="/api/mcp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono text-cyan-400 hover:underline"
          >
            Open /api/mcp endpoint ↗
          </a>
        </div>

        {/* Server Cards List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {servers.map((srv, idx) => {
            const data = srv.data;
            const Icon = srv.icon;
            const isConn = data?.status === 'connected';

            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {isConn ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-4 h-4 ${srv.color}`} />
                        <h3 className="font-semibold text-white text-sm">{srv.title}</h3>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.2 rounded border ${
                            isConn
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border-amber-800'
                          }`}
                        >
                          {isConn ? 'Connected' : 'Active'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-mono break-all">
                        Endpoint: <span className="text-slate-300">{data?.endpoint}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-xs font-mono text-slate-400">
                    Latency: <span className="text-cyan-400 font-semibold">{data?.latencyMs || 0}ms</span>
                  </div>
                </div>

                {data?.errorMessage && (
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 font-mono">
                    {data.errorMessage}
                  </div>
                )}

                {/* Available Tools */}
                {data?.discoveredTools && data.discoveredTools.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Available Tools ({data.discoveredTools.length}):</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {data.discoveredTools.map((tool) => (
                        <span
                          key={tool.name}
                          onClick={() => setSelectedTool(selectedTool?.name === tool.name ? null : tool)}
                          className="cursor-pointer text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 hover:border-cyan-600 transition-colors"
                        >
                          {tool.name} {tool.gate ? `(${tool.gate})` : ''}
                        </span>
                      ))}
                    </div>

                    {selectedTool && data.discoveredTools.some((t) => t.name === selectedTool.name) && (
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono mt-2">
                        <div className="font-semibold text-cyan-300">{selectedTool.name}</div>
                        <div className="text-slate-400 text-xs mt-1 font-sans">{selectedTool.description}</div>
                        {selectedTool.inputSchema && (
                          <pre className="mt-2 p-2 rounded bg-slate-950 text-[10px] text-slate-300 overflow-x-auto border border-slate-800">
                            {JSON.stringify(selectedTool.inputSchema, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>JobDataLake • CVpop • Calibrd</span>
          <button
            onClick={() => setIsMcpModalOpen(false)}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
