'use client';

import { useEffect, useState } from 'react';
import {
  getIncidents,
  getAgents,
  assignAgent,
  getIncidentHistory,
  getUpdatesSocket,
} from '../lib/api';

interface Incident {
  id: number;
  type: string;
  location: { lat: number; lon: number };
  description: string;
  status: string;
  timestamp: string;
}
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
  updated_at: string;
}
interface HistoryEntry {
  id: number;
  incident_id: number;
  agent_id?: number;
  action: string;
  detail: string;
  timestamp: string;
}

export default function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [liveStats, setLiveStats] = useState<{ time: string; agents: number }>({ time: '', agents: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setIncidents(await getIncidents());
      setAgents(await getAgents());
      setHistory(await getIncidentHistory());
    };
    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ws = getUpdatesSocket();
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      setLiveStats(msg);
    };
    return () => ws.close();
  }, []);

  async function handleAssign(incident_id: number) {
    setLoading(true);
    try {
      await assignAgent(incident_id);
      setIncidents(await getIncidents());
      setAgents(await getAgents());
      setHistory(await getIncidentHistory());
    } catch (e) {
      alert("Assignment failed");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-3">🌆 Smart City AI Dashboard</h1>
      <div className="mb-4">
        <div className="bg-green-100 p-2 my-2 rounded text-sm inline-block">
          <span>Live {liveStats.time ? new Date(liveStats.time).toLocaleTimeString() : '...'}</span>
          {' — '}
          <b>{liveStats.agents}</b> agents tracked
        </div>
      </div>

      {/* Active Incidents */}
      <section className="mb-6">
        <h2 className="font-bold text-xl mb-2">🚨 Active Incidents</h2>
        <table className="min-w-full text-sm border mb-3">
          <thead>
            <tr>
              <th className="border px-2">ID</th>
              <th className="border px-2">Type</th>
              <th className="border px-2">Description</th>
              <th className="border px-2">Status</th>
              <th className="border px-2">Created</th>
              <th className="border px-2"></th>
            </tr>
          </thead>
          <tbody>
            {incidents.filter(i => i.status === 'active').map(incident => (
              <tr key={incident.id}>
                <td className="border px-2">{incident.id}</td>
                <td className="border px-2">{incident.type}</td>
                <td className="border px-2">{incident.description}</td>
                <td className="border px-2">{incident.status}</td>
                <td className="border px-2">{new Date(incident.timestamp).toLocaleString()}</td>
                <td className="border px-2">
                  <button
                    className="rounded bg-blue-600 px-2 py-1 text-white disabled:bg-gray-300"
                    disabled={loading}
                    onClick={() => handleAssign(incident.id)}
                  >
                    Assign Best Agent
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Agents */}
      <section className="mb-6">
        <h2 className="font-bold text-xl mb-2">👮 Agents</h2>
        <table className="min-w-full text-sm border mb-3">
          <thead>
            <tr>
              <th className="border px-2">Icon</th>
              <th className="border px-2">Name</th>
              <th className="border px-2">Status</th>
              <th className="border px-2">Current Incident</th>
              <th className="border px-2">Decision</th>
              <th className="border px-2">Responses</th>
              <th className="border px-2">Success</th>
            </tr>
          </thead>
          <tbody>
            {agents.map(agent => (
              <tr key={agent.id}>
                <td className="border px-2 text-2xl">{agent.icon}</td>
                <td className="border px-2">{agent.name}</td>
                <td className="border px-2">{agent.status}</td>
                <td className="border px-2">{agent.current_incident ?? '--'}</td>
                <td className="border px-2">{agent.decision ?? '--'}</td>
                <td className="border px-2">{agent.total_responses}</td>
                <td className="border px-2">{agent.successful_responses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Incident/Decision History */}
      <section>
        <h2 className="font-bold text-xl mb-2">📝 Incident/Decision History</h2>
        <div className="overflow-x-auto max-h-96">
          <table className="min-w-full text-sm border">
            <thead>
              <tr>
                <th className="border px-2">Time</th>
                <th className="border px-2">Incident</th>
                <th className="border px-2">Agent</th>
                <th className="border px-2">Action</th>
                <th className="border px-2">Detail</th>
              </tr>
            </thead>
            <tbody>
              {history.map(entry => (
                <tr key={entry.id}>
                  <td className="border px-2">{new Date(entry.timestamp).toLocaleString()}</td>
                  <td className="border px-2">{entry.incident_id}</td>
                  <td className="border px-2">{entry.agent_id ?? '--'}</td>
                  <td className="border px-2">{entry.action}</td>
                  <td className="border px-2">{entry.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
