'use client'

import { useEffect, useState } from 'react';

interface IncidentHistoryEntry {
  id: number;
  incident_id: number;
  agent_id?: number;
  event_type: string; // Renamed from action to match backend
  description: string; // Renamed from detail to match backend
  timestamp: string;
}

export default function AgentDecisionLog() {
  const [history, setHistory] = useState<IncidentHistoryEntry[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/incident-history`);
        const data = await response.json();
        // Ensure array
        setHistory(Array.isArray(data) ? data : []);
      } catch (error) {
        setHistory([]);
      }
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-2xl h-full flex flex-col">
      <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
        <span className="text-4xl text-emerald-400">🧠</span> Neural Log
        <span className="text-xs font-mono text-gray-500 bg-black/30 px-2 py-1 rounded ml-auto border border-white/5">
          LIVE FEED
        </span>
      </h2>

      <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2 font-mono text-sm">
        {history.length === 0 ? (
          <div className="text-center text-gray-500 py-12 flex flex-col items-center">
            <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full mb-3"></div>
            <div>Awaiting Network Traffic...</div>
          </div>
        ) : (
          history.map((entry) => (
            <div key={entry.id} className="glass-card p-3 rounded-lg border-l-2 border-emerald-500/50 hover:bg-white/5 transition flex gap-3 text-xs">
              <div className="text-gray-500 min-w-[60px]">
                {new Date(entry.timestamp).toLocaleTimeString([], { hour12: false })}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {entry.agent_id ? (
                    <span className="text-emerald-300 font-bold">UNIT-{entry.agent_id}</span>
                  ) : (
                    <span className="text-blue-300 font-bold">SYSTEM</span>
                  )}
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide px-1.5 py-0.5 border border-white/10 rounded">
                    {entry.event_type}
                  </span>
                </div>
                <div className="text-gray-300 leading-relaxed">
                  {entry.description}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
