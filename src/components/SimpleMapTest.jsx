import { useEffect, useRef, useState } from 'react';
import { loader, mapOptions } from '../utils/mapsConfig';

const SimpleMapTest = () => {
  const mapRef = useRef(null);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    const initMap = async () => {
      try {
        setStatus('Waiting for DOM...');
        
        // Simple check
        if (!mapRef.current) {
          setStatus('ERROR: Map ref is null');
          return;
        }

        setStatus('Loading Google Maps API...');
        await loader.load();

        setStatus('Creating map...');
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 7.8731, lng: 80.7718 },
          zoom: 8
        });

        setStatus('Map created successfully!');
      } catch (error) {
        setStatus(`ERROR: ${error.message}`);
      }
    };

    // Wait a moment for DOM
    setTimeout(initMap, 500);
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px', background: '#f0f0f0' }}>
        <h1>Ceylon Trails - Map Test</h1>
        <p>Status: {status}</p>
      </div>
      <div 
        ref={mapRef} 
        style={{ 
          flex: 1, 
          width: '100%', 
          minHeight: '400px',
          background: '#e0e0e0',
          border: '2px solid red' // Debug border
        }}
      />
    </div>
  );
};

export default SimpleMapTest; 