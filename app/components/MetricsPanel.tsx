'use client'

import { useState, useEffect } from 'react';

export default function MetricsPanel() {
  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    resolved: 0,
    avgResponse: '2.3km',
    efficiency: 94
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/stats`);
        const data = await response.json();

        setMetrics({
          total: data.total_incidents,
          active: data.active_incidents,
          resolved: data.resolved_incidents,
          avgResponse: `${(data.average_response_time || 0).toFixed(2)}km`,
          efficiency: Math.round(data.average_efficiency || 95)
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  const MetricCard = ({ label, value, subtext, color }: any) => (
    <div className={`glass-card p-6 rounded-2xl border-l-4 ${color} hover:translate-y-[-2px]`}>
      <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">{label}</div>
      <div className="text-4xl font-black text-white mb-1 text-glow font-[Outfit]">{value}</div>
      <div className="text-xs text-gray-500 font-mono">{subtext}</div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <MetricCard
        label="Total Incidents"
        value={metrics.total}
        subtext="All time events"
        color="border-blue-500"
      />
      <MetricCard
        label="Active Now"
        value={metrics.active}
        subtext="Requires attention"
        color="border-red-500 animate-pulse-glow"
      />
      <MetricCard
        label="Resolved"
        value={metrics.resolved}
        subtext="Successfully closed"
        color="border-emerald-500"
      />
      <MetricCard
        label="Avg Response"
        value={metrics.avgResponse}
        subtext="Distance to target"
        color="border-purple-500"
      />
      <MetricCard
        label="System Health"
        value={`${metrics.efficiency}%`}
        subtext="Operational status"
        color="border-cyan-500"
      />
    </div>
  );
}
