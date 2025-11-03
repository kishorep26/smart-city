'use client';
import { useEffect, useState } from 'react';
import { getUpdatesSocket } from '../lib/api';

export default function LiveStats() {
  const [stats, setStats] = useState<{time: string, agents: number}>({time: '', agents: 0});
  useEffect(() => {
    const ws = getUpdatesSocket();
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      setStats(msg);
    };
    return () => { ws.close(); };
  }, []);

  return (
    <div className="bg-green-100 p-2 my-2 rounded text-sm">
      <span>Live {stats.time ? new Date(stats.time).toLocaleTimeString() : '...'}</span> — <b>{stats.agents}</b> agents tracked
    </div>
  );
}
