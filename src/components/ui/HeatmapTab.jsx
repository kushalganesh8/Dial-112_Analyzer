import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

const AP_CENTER = [15.9129, 79.74];
const AP_BOUNDS = [
  [12.5, 76.5], // SW
  [19.5, 85.5], // NE
];

const HeatmapTab = ({ filters }) => {
  const [heatData, setHeatData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apGeoJson, setApGeoJson] = useState(null);

  useEffect(() => {
    // Fetch heatmap data with filters if provided
    let url = 'http://127.0.0.1:8007/heatmap-data';
    
    // Add query parameters if filters are provided
    if (filters) {
      const params = new URLSearchParams();
      
      if (filters.searchQuery) {
        params.append('search', filters.searchQuery);
      }
      
      if (filters.severityFilter) {
        params.append('severity', filters.severityFilter);
      }
      
      if (filters.crimeTypeFilter) {
        params.append('crimeType', filters.crimeTypeFilter);
      }
      
      if (filters.crimeSubTypeFilter) {
        params.append('crimeSubType', filters.crimeSubTypeFilter);
      }
      
      if (filters.timeFilter) {
        const now = new Date();
        let cutoffDate;
        
        switch (filters.timeFilter) {
          case 'last5min':
            cutoffDate = new Date(now.getTime() - 5 * 60 * 1000);
            break;
          case 'last10min':
            cutoffDate = new Date(now.getTime() - 10 * 60 * 1000);
            break;
          case 'last30min':
            cutoffDate = new Date(now.getTime() - 30 * 60 * 1000);
            break;
          case 'lastHour':
            cutoffDate = new Date(now.getTime() - 60 * 60 * 1000);
            break;
          case 'last7days':
            cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          default:
            cutoffDate = null;
        }
        
        if (cutoffDate) {
          params.append('fromDate', cutoffDate.toISOString());
        }
      } else {
        if (filters.fromDate) {
          params.append('fromDate', new Date(filters.fromDate).toISOString());
        }
        
        if (filters.toDate) {
          params.append('toDate', new Date(filters.toDate).toISOString());
        }
      }
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
    }
    
    setLoading(true);
    axios.get(url)
      .then(res => {
        setHeatData(
          (res.data.data || []).map(d => [d.lat, d.lng, Number(d.severity) || 1])
        );
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load heatmap data');
        setLoading(false);
      });
      
    // Fetch Andhra Pradesh GeoJSON
    axios.get('http://127.0.0.1:8007/static/ANDHRA%20PRADESH_STATE.geojson')
      .then(res => setApGeoJson(res.data))
      .catch(() => setApGeoJson(null));
  }, [filters]);

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <MapContainer
        center={AP_CENTER}
        zoom={7}
        minZoom={6}
        maxZoom={10}
        style={{ height: '100%', width: '100%', borderRadius: 12 }}
        maxBounds={AP_BOUNDS}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {apGeoJson && (
          <GeoJSON
            data={apGeoJson}
            style={{
              color: '#2563eb', // blue outline
              weight: 3,
              fillColor: '#2563eb',
              fillOpacity: 0.08
            }}
          />
        )}
        <HeatmapLayer
          fitBoundsOnLoad
          fitBoundsOnUpdate
          points={heatData}
          longitudeExtractor={m => m[1]}
          latitudeExtractor={m => m[0]}
          intensityExtractor={m => m[2]}
          radius={25}
          max={10}
        />
      </MapContainer>
    </Box>
  );
};

export default HeatmapTab;
