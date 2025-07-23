// Since Google Maps is loaded directly via script tag, we don't need the Loader
// but we'll keep it for backwards compatibility

export const sriLankaCenter = {
  lat: 7.8731,
  lng: 80.7718
};

export const mapOptions = {
  center: sriLankaCenter,
  zoom: 8,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  zoomControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

export const createCustomMarker = (map, position, category, onClick) => {
  const categoryColors = {
    heritage: '#ea580c',
    restaurant: '#dc2626',
    eco: '#059669',
    wellness: '#7c3aed',
    transport: '#1e40af',
    beach: '#3b82f6'
  };

  const marker = new google.maps.Marker({
    position,
    map,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 12,
      fillColor: categoryColors[category] || '#6b7280',
      fillOpacity: 0.8,
      strokeColor: '#ffffff',
      strokeWeight: 2
    },
    title: 'Click for details'
  });

  if (onClick) {
    marker.addListener('click', onClick);
  }

  return marker;
};

export const initializePlacesUI = (map) => {
  // Initialize Places UI Kit components
  const placeSearch = new google.maps.places.PlaceSearch({
    map,
    types: ['establishment']
  });

  return {
    placeSearch
  };
}; 