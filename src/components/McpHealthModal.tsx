import React, { useState } from 'react';
import { useCareer } from '../context/CareerContext.tsx';
import { api } from '../services/api.ts';
import {
  Server,
  X,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Cpu,
  Code2,
  Terminal,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { McpServerHealth, McpToolSchema } from '../types.ts';

export const McpHealthModal: React.FC = () => {
  const { isMcpModalOpen, setIsMcpModalOpen, mcpHealth, isHealthChecking, refreshMcpHealth } = useCareer();
  const [expandedServerId, setExpandedServerId] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<McpToolSchema | null>(null);
  const [isTogglingFallback, setIsTogglingFallback] = useState(false);

  if (!isMcpModalOpen) return null;

  const handleToggleFallback = async () => {
    if (!mcpHealth) return;
    setIsTogglingFallback(true);
    try {
      await api.toggleMcpFallback(!mcpHealth.localFallbackActive);
      await refreshMcpHealth();
    } catch (e) {
      console.warn('Failed to toggle fallback:', e);
    } finally {
      setIsTogglingFallback(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-700/50 text-indigo-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Developer MCP Architecture Diagnostics</span>
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  JSON-RPC 2.0
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Live inspection of configured Model Context Protocol servers, latency, and tool discovery
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
              <span>{isHealthChecking ? 'Pinging...' : 'Ping Diagnostics'}</span>
            </button>
            <button
              onClick={() => setIsMcpModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Security & Protocol Banner */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center space-x-2 text-emerald-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300 font-mono text-[11px]">
              Security Guardrail: Protected Server-Side Credentials (zero client-side tokens exposed).
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-slate-400">Local Simulation Fallback:</span>
            <button
              onClick={handleToggleFallback}
              disabled={isTogglingFallback}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors border ${
                mcpHealth?.localFallbackActive
                  ? 'bg-amber-950/80 border-amber-700 text-amber-300 hover:bg-amber-900/60'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
              }`}
            >
              {mcpHealth?.localFallbackActive ? 'Enabled (Skills Fallback Active)' : 'Disabled (Strict Remote Only)'}
            </button>
          </div>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {mcpHealth?.servers.map((server) => {
              const isExpanded = expandedServerId === server.id;
              return (
                <div
                  key={server.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        <StatusIcon status={server.status} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-white text-base">{server.name}</h3>
                          <StatusBadge status={server.status} />
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {server.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 font-mono">
                          Endpoint: <span className="text-slate-300">{server.endpoint}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono text-slate-400">
                        Latency: <span className="text-cyan-400 font-semibold">{server.latencyMs}ms</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {server.discoveredTools.length} tool(s) discovered
                      </div>
                    </div>
                  </div>

                  {server.errorMessage && (
                    <div className="mt-3 p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300 flex items-start space-x-2 font-mono">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                      <span>{server.errorMessage}</span>
                    </div>
                  )}

                  {/* Discovered Tools Preview */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Terminal className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs text-slate-400 font-medium">Discovered MCP Capabilities:</span>
                    </div>
                    <button
                      onClick={() => setExpandedServerId(isExpanded ? null : server.id)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-mono"
                    >
                      <span>{isExpanded ? 'Hide Schemas' : 'Inspect Tools & Input Schemas'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 space-y-2 animate-in fade-in duration-150">
                      {server.discoveredTools.map((tool) => (
                        <div
                          key={tool.name}
                          className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-cyan-300 font-semibold">{tool.name}</span>
                            <button
                              onClick={() => setSelectedTool(selectedTool?.name === tool.name ? null : tool)}
                              className="text-[11px] text-indigo-400 hover:text-indigo-300 underline"
                            >
                              {selectedTool?.name === tool.name ? 'Collapse Schema' : 'View JSON Schema'}
                            </button>
                          </div>
                          <p className="text-slate-400 font-sans mt-1 text-xs">{tool.description}</p>

                          {selectedTool?.name === tool.name && tool.inputSchema && (
                            <pre className="mt-2 p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 overflow-x-auto">
                              {JSON.stringify(tool.inputSchema, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Server-side proxy running on Express (:3000)</span>
          </div>
          <button
            onClick={() => setIsMcpModalOpen(false)}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

const StatusIcon: React.FC<{ status: McpServerHealth['status'] }> = ({ status }) => {
  if (status === 'connected') return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
  if (status === 'simulated') return <AlertTriangle className="w-5 h-5 text-amber-400" />;
  return <XCircle className="w-5 h-5 text-rose-500" />;
};

const StatusBadge: React.FC<{ status: McpServerHealth['status'] }> = ({ status }) => {
  if (status === 'connected') {
    return (
      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
        Live Connected
      </span>
    );
  }
  if (status === 'simulated') {
    return (
      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
        Local Skills Fallback
      </span>
    );
  }
  return (
    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
      Offline / Unreachable
    </span>
  );
};
