'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
const CityMap = dynamic(() => import('../components/CityMap'), { ssr: false });

import IncidentPanel from '../components/IncidentPanel';
import AgentPanel from '../components/AgentPanel';
import AgentDecisionLog from '../components/AgentDecisionLog';
import ScenarioEditor from '../components/ScenarioEditor';
import CommandHeader from '../components/CommandHeader';
import BatmanResponse from '../components/BatmanResponse';

export default function Dashboard() {
  const [activeIncidentCount, setActiveIncidentCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const checkIncidents = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/incidents`);
        const incidents = await response.json();
        const active = incidents.filter((i: any) => i.status !== 'resolved').length;
        setActiveIncidentCount(active);
      } catch (error) {
        console.error('Error fetching incidents:', error);
      }
    };

    checkIncidents();
    const interval = setInterval(checkIncidents, 3000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  const handleBatmanComplete = () => {
    // Force refresh all components
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="h-screen w-screen bg-[#02040a] overflow-hidden relative">

      {/* Batman Emergency Response */}
      <BatmanResponse
        activeIncidentCount={activeIncidentCount}
        onComplete={handleBatmanComplete}
      />

      {/* 1. Header (HUD Top) */}
      <CommandHeader />

      {/* 2. Map (Background Layer) */}
      <div className="absolute inset-0 z-0 top-[80px]"> {/* Offset for header */}
        <CityMap key={refreshKey} />
        {/* Noir Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none z-[1]"></div>
      </div>

      {/* 3. Floating Panels (HUD Layer) - Z-10 to sit above map but below Modals */}
      <div className="absolute inset-0 z-10 pointer-events-none top-[90px] p-6 flex justify-between items-start">

        {/* Left: Incident Feed */}
        <div className="w-[400px] h-[calc(100vh-250px)] pointer-events-auto">
          <IncidentPanel key={`incidents-${refreshKey}`} />
        </div>

        {/* Right: Agent Fleet */}
        <div className="w-[350px] h-[calc(100vh-250px)] pointer-events-auto">
          <AgentPanel key={`agents-${refreshKey}`} />
        </div>
      </div>

      {/* 4. Bottom Console (Neural Log) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[600px] h-[200px] z-20 pointer-events-auto">
        <AgentDecisionLog key={`log-${refreshKey}`} />
      </div>

      {/* 5. Controls */}
      <div className="pointer-events-auto relative z-50">
        <ScenarioEditor />
      </div>

    </div>
  );
}
