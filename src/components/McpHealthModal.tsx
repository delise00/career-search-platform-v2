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
  Terminal,
  ShieldCheck,
} from 'lucide-react';
import { McpToolSchema } from '../types.ts';

export const McpHealthModal: React.FC = () => {
  const { isMcpModalOpen, setIsMcpModalOpen, mcpHealth, isHealthChecking, refreshMcpHealth } = useCareer();
  const [selectedTool, setSelectedTool] = useState<McpToolSchema | null>(null);
  const [isTogglingFallback, setIsTogglingFallback] = useState(false);

  if (!isMcpModalOpen) return null;

  const server = mcpHealth?.server;

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
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-950 border border-blue-700/50 text-blue-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Google Jobs API Status</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  SerpApi
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Live Google Jobs connection via SerpApi endpoint
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
              <span>{isHealthChecking ? 'Pinging...' : 'Ping'}</span>
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
            <span>SerpApi Keys are stored securely server-side</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400 text-[11px]">Local Fallback:</span>
            <button
              onClick={handleToggleFallback}
              disabled={isTogglingFallback}
              className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                mcpHealth?.localFallbackActive
                  ? 'bg-amber-950/80 border-amber-700 text-amber-300 hover:bg-amber-900/60'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {mcpHealth?.localFallbackActive ? 'Enabled' : 'Disabled (Strict)'}
            </button>
          </div>
        </div>

        {/* Server Details */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {server && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {server.status === 'connected' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : server.status === 'simulated' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-white text-sm">{server.name}</h3>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          server.status === 'connected'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : server.status === 'simulated'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-rose-950 text-rose-300 border-rose-800'
                        }`}
                      >
                        {server.status === 'connected'
                          ? 'Connected'
                          : server.status === 'simulated'
                          ? 'Local Fallback'
                          : 'Disconnected'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-mono break-all">
                      Endpoint: <span className="text-slate-300">{server.endpoint}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs font-mono text-slate-400">
                  Latency: <span className="text-cyan-400 font-semibold">{server.latencyMs}ms</span>
                </div>
              </div>

              {server.errorMessage && (
                <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300 font-mono">
                  {server.errorMessage}
                </div>
              )}

              {/* Tools list */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Available Tools &amp; Methods ({server.discoveredTools.length}):</span>
                </div>

                <div className="space-y-2">
                  {server.discoveredTools.map((tool) => (
                    <div
                      key={tool.name}
                      className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-cyan-300 font-semibold">{tool.name}</span>
                        {tool.inputSchema && (
                          <button
                            onClick={() =>
                              setSelectedTool(selectedTool?.name === tool.name ? null : tool)
                            }
                            className="text-[11px] text-blue-400 hover:text-blue-300 underline"
                          >
                            {selectedTool?.name === tool.name ? 'Hide Schema' : 'View Schema'}
                          </button>
                        )}
                      </div>
                      <p className="text-slate-400 font-sans text-xs">{tool.description}</p>
                      {selectedTool?.name === tool.name && tool.inputSchema && (
                        <pre className="mt-2 p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 overflow-x-auto">
                          {JSON.stringify(tool.inputSchema, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Google Jobs SerpApi Proxy active</span>
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
