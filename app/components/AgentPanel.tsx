'use client'

import { useState, useEffect } from 'react';

interface Agent {
  id: number;
  name: string;
  icon: string;
  status: string;
  current_incident: string | null;
  decision: string | null;
  response_time: number;
  efficiency: number;
  total_responses: number;
  successful_responses: number;
  updated_at?: string;
  fuel: number;
  stress: number;
  role: string;
  status_message: string;
}

export default function AgentPanel() {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/agents`);
        const data = await response.json();
        setAgents(data);
      } catch (error) {
        setAgents([]);
      }
    };

    fetchAgents();
    const interval = setInterval(fetchAgents, 3500);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    if (!status) return '';
    const s = status.toLowerCase();
    if (s === 'refueling') return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    if (s === 'responding') return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    if (s === 'available') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (s === 'busy') return 'bg-red-500/20 text-red-300 border-red-500/30';
    return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
  };

  const getBarColor = (val: number, type: 'fuel' | 'stress') => {
    if (type === 'fuel') {
      if (val < 20) return 'bg-red-500';
      if (val < 50) return 'bg-yellow-500';
      return 'bg-emerald-500';
    } else {
      if (val > 80) return 'bg-red-500';
      if (val > 50) return 'bg-yellow-500';
      return 'bg-blue-500';
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-2xl h-full flex flex-col">
      <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
        <span className="text-4xl text-blue-400">🤖</span> Active Agents ({agents.length})
      </h2>

      <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
        {agents.length === 0 ? (
          <div className="text-center text-gray-400 py-8 animate-pulse">Scanning Agent Network...</div>
        ) : (
          agents.map(agent => (
            <div
              key={agent.id}
              className={`group glass-card rounded-xl p-5 relative overflow-hidden ${agent.status.toLowerCase() === 'responding' ? 'border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : ''
                }`}
            >
              {/* Background tech lines */}
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <div className="text-[10px] font-mono text-white">ID-{agent.id.toString().padStart(4, '0')}</div>
              </div>

              <div className="flex items-start gap-4 mb-3">
                <div className="relative">
                  <div className="text-4xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{agent.icon}</div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${agent.status === 'available' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'
                    }`}></div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-bold text-lg truncate pr-2">{agent.name}</h3>
                    <span className={`px-2 py-0.5 ${getStatusColor(agent.status)} rounded text-[10px] uppercase tracking-wider font-bold border`}>
                      {agent.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono mb-2">{(agent.role || 'unit').toUpperCase()} UNIT</div>

                  {/* Status Message */}
                  <div className="text-xs text-cyan-200 mb-3 flex items-center gap-2">
                    <span className="w-1 h-1 bg-cyan-400 rounded-full animate-ping"></span>
                    {agent.status_message || "Awaiting orders..."}
                  </div>
                </div>
              </div>

              {/* Bars */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex justify-between text-[10px] text-gray-400 mb-1 uppercase font-bold">
                    <span>Fuel</span>
                    <span>{Math.round(agent.fuel)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getBarColor(agent.fuel, 'fuel')} transition-all duration-1000`}
                      style={{ width: `${agent.fuel}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-gray-400 mb-1 uppercase font-bold">
                    <span>Stress</span>
                    <span>{Math.round(agent.stress)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getBarColor(agent.stress, 'stress')} transition-all duration-1000`}
                      style={{ width: `${agent.stress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Footer Stats */}
              <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono border-t border-white/5 pt-3">
                <div>EFF: <span className="text-white">{agent.efficiency}%</span></div>
                <div>RESP: <span className="text-white">{agent.successful_responses}</span></div>
                <div>UPD: <span className="text-gray-400">{new Date(agent.updated_at || Date.now()).toLocaleTimeString()}</span></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
