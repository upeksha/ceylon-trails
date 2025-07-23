import { useEffect, useRef } from 'react';

const PlaceMarker = ({ place, map, onClick }) => {
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map || !place) return;

    // This component is mainly for future customization
    // The actual marker creation is handled in MapContainer
  }, [map, place]);

  return null; // This component doesn't render anything visible
};

export default PlaceMarker; 