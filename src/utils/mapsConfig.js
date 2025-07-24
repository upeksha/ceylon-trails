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
    beach: '#3b82f6',
    google: '#ea580c', // Same as heritage for Google Places
    custom: '#059669' // Green for custom places
  };

  let icon;
  if (category === 'google') {
    // Use a pin SVG path for Google Places
    icon = {
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      fillColor: '#ea580c',
      fillOpacity: 1,
      strokeColor: '#fff',
      strokeWeight: 2,
      scale: 2,
      anchor: new google.maps.Point(12, 22)
    };
  } else if (category === 'custom') {
    // Use a green pin SVG path for Custom Places
    icon = {
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      fillColor: '#059669',
      fillOpacity: 1,
      strokeColor: '#fff',
      strokeWeight: 2,
      scale: 2,
      anchor: new google.maps.Point(12, 22)
    };
  } else {
    icon = {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 12,
      fillColor: categoryColors[category] || '#6b7280',
      fillOpacity: 0.8,
      strokeColor: '#ffffff',
      strokeWeight: 2
    };
  }

  const marker = new google.maps.Marker({
    position,
    map,
    icon,
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