'use client';

import { useEffect, useState } from 'react';
import { getIncidentHistory } from '../lib/api';

interface HistoryEntry {
  id: number;
  incident_id: number;
  agent_id?: number;
  action: string;
  detail: string;
  timestamp: string;
}

export default function IncidentHistoryLog() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  useEffect(() => {
    const fetchHistory = async () => {
      const data = await getIncidentHistory();
      setHistory(data);
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2 className="font-bold text-lg mt-4 mb-2">📝 Incident/Decision History</h2>
      <div className="overflow-x-auto max-h-96">
        <table className="min-w-full text-sm border">
          <thead>
            <tr>
              <th className="px-2 border">Time</th>
              <th className="px-2 border">Incident</th>
              <th className="px-2 border">Agent</th>
              <th className="px-2 border">Action</th>
              <th className="px-2 border">Detail</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry) => (
              <tr key={entry.id}>
                <td className="px-2 border">{new Date(entry.timestamp).toLocaleString()}</td>
                <td className="px-2 border">{entry.incident_id}</td>
                <td className="px-2 border">{entry.agent_id ?? '--'}</td>
                <td className="px-2 border">{entry.action}</td>
                <td className="px-2 border">{entry.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
