'use client'

import { useState, useEffect } from 'react';

interface Stats {
  total_incidents: number;
  active_incidents: number;
  resolved_incidents: number;
  total_agents: number;
  active_agents: number;
  average_response_time: number;
  average_efficiency: number;
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<Stats>({
    total_incidents: 0,
    active_incidents: 0,
    resolved_incidents: 0,
    total_agents: 0,
    active_agents: 0,
    average_response_time: 0,
    average_efficiency: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/stats`);
        setStats(await response.json());
      } catch (error) { }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-2xl h-full">
      <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
        <span className="text-4xl text-purple-400">📊</span> System Analytics
      </h2>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card rounded-xl p-4 text-center border-l-2 border-blue-500 hover:bg-white/5 transition">
            <div className="text-[10px] text-blue-300 mb-1 uppercase tracking-widest font-bold">Total Events</div>
            <div className="text-3xl text-white font-black font-[Outfit]">{stats.total_incidents}</div>
          </div>
          <div className="glass-card rounded-xl p-4 text-center border-l-2 border-red-500 hover:bg-white/5 transition">
            <div className="text-[10px] text-red-300 mb-1 uppercase tracking-widest font-bold">Active</div>
            <div className="text-3xl text-white font-black font-[Outfit] animate-pulse">{stats.active_incidents}</div>
          </div>
          <div className="glass-card rounded-xl p-4 text-center border-l-2 border-emerald-500 hover:bg-white/5 transition">
            <div className="text-[10px] text-emerald-300 mb-1 uppercase tracking-widest font-bold">Resolved</div>
            <div className="text-3xl text-white font-black font-[Outfit]">{stats.resolved_incidents}</div>
          </div>
          <div className="glass-card rounded-xl p-4 text-center border-l-2 border-yellow-500 hover:bg-white/5 transition">
            <div className="text-[10px] text-yellow-300 mb-1 uppercase tracking-widest font-bold">Agents Active</div>
            <div className="text-3xl text-white font-black font-[Outfit]">{stats.active_agents || 6}</div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 mt-2">
          <div className="flex justify-between items-end mb-2">
            <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">Network Performance</div>
            <div className="text-xs text-emerald-400 font-mono">OPTIMAL</div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-blue-200 mb-1">
                <span>Avg Response Time</span>
                <span>{(stats.average_response_time || 0).toFixed(2)} km</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[75%] rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-green-200 mb-1">
                <span>System Efficiency</span>
                <span>{(stats.average_efficiency || 0).toFixed(2)} %</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 w-[92%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
