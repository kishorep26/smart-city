'use client'

import { useState, useEffect } from 'react';

interface Incident {
  id: number;
  type: string;
  location: { lat: number; lon: number };
  description: string;
  status: string;
  timestamp: string;
}

export default function IncidentPanel() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [resolving, setResolving] = useState<number | null>(null);

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchIncidents = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/incidents`);
      const data = await response.json();
      setIncidents(data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    }
  };

  const resolveIncident = async (incidentId: number) => {
    setResolving(incidentId);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/incidents/${incidentId}/resolve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        await fetchIncidents();
      }
    } catch (error) {
      console.error('Error resolving incident:', error);
    } finally {
      setResolving(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'responding': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'dispatched': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'resolved': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'fire': return '🔥';
      case 'accident': return '🚗';
      case 'medical': return '🚑';
      case 'crime': return '🚨';
      default: return '⚠️';
    }
  };

  const activeIncidents = incidents.filter(i => i.status !== 'resolved');

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-2xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <span className="animate-pulse">🚨</span> Active Incidents ({activeIncidents.length})
        </h2>
      </div>

      <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
        {activeIncidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500">
            <div className="text-4xl mb-2 grayscale opacity-50">🌆</div>
            <div>No active emergencies reported</div>
            <div className="text-xs mt-1">City is secure</div>
          </div>
        ) : (
          activeIncidents.map((incident) => (
            <div
              key={incident.id}
              className="group glass-card hover:bg-white/5 rounded-xl p-4 transition-all hover:shadow-lg hover:border-red-500/30 relative overflow-hidden"
            >
              {/* Warning tape effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-5 pointer-events-none bg-[repeating-linear-gradient(45deg,#000,#000_10px,#ecc94b_10px,#ecc94b_20px)]"></div>

              <div className="flex items-start gap-4 relative z-10">
                <div className="text-3xl filter drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]">{getIncidentIcon(incident.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="pr-2">
                      <h3 className="text-white font-bold text-lg capitalize truncate leading-tight">
                        {incident.type}
                      </h3>
                      <p className="text-gray-300 text-sm mt-0.5 line-clamp-1">{incident.description}</p>
                    </div>
                    <span className={`px-2 py-0.5 ${getStatusColor(incident.status)} rounded text-[10px] uppercase font-bold border shrink-0`}>
                      {incident.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
                    <span>ID: #{incident.id}</span>
                    <span>📍 {incident.location.lat.toFixed(4)}, {incident.location.lon.toFixed(4)}</span>
                    <span>🕒 {new Date(incident.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => resolveIncident(incident.id)}
                disabled={resolving === incident.id}
                className="mt-3 w-full bg-gradient-to-r from-red-900/40 to-red-800/40 hover:from-emerald-600 hover:to-emerald-700 border border-red-500/20 hover:border-emerald-400 text-gray-300 hover:text-white font-bold py-2 rounded-lg transition-all text-sm uppercase tracking-wide"
              >
                {resolving === incident.id ? '⏳ Processing...' : 'Resolve Situation'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
