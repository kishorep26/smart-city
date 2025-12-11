'use client'

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface Incident {
    id: number;
    type: string;
    location: { lat: number; lon: number };
    description: string;
    status: string;
}

const MapController = ({ incidents }: { incidents: Incident[] }) => {
    const map = useMap();

    useEffect(() => {
        if (incidents.length === 0) return;

        if (incidents.length === 1) {
            // Focus on single incident
            const i = incidents[0];
            map.setView([i.location.lat, i.location.lon], 14, { animate: true });
        } else {
            // Fit bounds for multiple incidents
            const bounds = L.latLngBounds(incidents.map(i => [i.location.lat, i.location.lon]));
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50], animate: true });
            }
        }
    }, [incidents, map]);

    return null;
};

export default MapController;
