// Place utility functions for hybrid place system
// Handles predefined, custom, and Google places

// Generate unique ID for custom places
let customPlaceIdCounter = 1000; // Start from 1000 to avoid conflicts with predefined places

export const generateCustomPlaceId = () => {
  return `custom_${Date.now()}_${customPlaceIdCounter++}`;
};

// Place type constants
export const PLACE_TYPES = {
  PREDEFINED: 'predefined',
  CUSTOM: 'custom',
  GOOGLE: 'google'
};

// Create a custom place object
export const createCustomPlace = (name, category, position, description = '') => {
  // Validate inputs
  if (!name || !name.trim()) {
    throw new Error('Place name is required');
  }
  
  if (!category) {
    throw new Error('Place category is required');
  }
  
  if (!position || typeof position.lat !== 'number' || typeof position.lng !== 'number') {
    throw new Error('Valid position with lat and lng is required');
  }

  // Validate coordinates
  if (isNaN(position.lat) || isNaN(position.lng)) {
    throw new Error('Invalid coordinates for custom place');
  }

  return {
    id: generateCustomPlaceId(),
    name: name.trim(),
    category: category,
    position: {
      lat: position.lat,
      lng: position.lng
    },
    description: description.trim(),
    placeId: null, // Custom places don't have Google Place ID
    type: PLACE_TYPES.CUSTOM,
    createdAt: new Date().toISOString()
  };
};

// Create a Google place object from Google Places API data
export const createGooglePlace = (googlePlace) => {
  // Ensure we have valid data
  if (!googlePlace || !googlePlace.geometry?.location) {
    console.error('❌ placeUtils: Invalid Google place data:', googlePlace);
    throw new Error('Invalid Google place data');
  }

  // Safely extract coordinates
  const lat = (googlePlace.geometry?.location?.lat && typeof googlePlace.geometry.location.lat === 'function') 
    ? googlePlace.geometry.location.lat() 
    : (googlePlace.geometry?.location?.lat ?? 0);
  
  const lng = (googlePlace.geometry?.location?.lng && typeof googlePlace.geometry.location.lng === 'function') 
    ? googlePlace.geometry.location.lng() 
    : (googlePlace.geometry?.location?.lng ?? 0);

  // Validate coordinates
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    console.error('❌ placeUtils: Invalid coordinates for Google place:', { lat, lng });
    throw new Error('Invalid coordinates for Google place');
  }

  return {
    id: generateCustomPlaceId(),
    name: googlePlace.name || 'Unknown Place',
    category: 'google', // Special category for Google places
    position: {
      lat: lat,
      lng: lng
    },
    description: googlePlace.formatted_address || '',
    placeId: googlePlace.place_id || null,
    type: PLACE_TYPES.GOOGLE,
    googleTypes: Array.isArray(googlePlace.types) ? googlePlace.types : [],
    googleFormattedAddress: googlePlace.formatted_address || '',
    createdAt: new Date().toISOString()
  };
};

// Check if a place is custom
export const isCustomPlace = (place) => {
  return place.type === PLACE_TYPES.CUSTOM;
};

// Check if a place is from Google
export const isGooglePlace = (place) => {
  return place.type === PLACE_TYPES.GOOGLE;
};

// Check if a place is predefined
export const isPredefinedPlace = (place) => {
  return !place.type || place.type === PLACE_TYPES.PREDEFINED;
};

// Get place display name with type indicator
export const getPlaceDisplayName = (place) => {
  if (isCustomPlace(place)) {
    return `${place.name} (Custom)`;
  } else if (isGooglePlace(place)) {
    return `${place.name} (Google)`;
  }
  return place.name;
};

// Validate place data
export const validatePlace = (place) => {
  if (!place.name || !place.name.trim()) {
    return { valid: false, error: 'Place name is required' };
  }
  
  if (!place.category) {
    return { valid: false, error: 'Place category is required' };
  }
  
  if (!place.position || typeof place.position.lat !== 'number' || typeof place.position.lng !== 'number') {
    return { valid: false, error: 'Valid position is required' };
  }
  
  return { valid: true };
};

// Merge predefined places with custom places
export const mergePlaces = (predefinedPlaces, customPlaces = []) => {
  // Add type to predefined places
  const typedPredefinedPlaces = predefinedPlaces.map(place => ({
    ...place,
    type: PLACE_TYPES.PREDEFINED
  }));
  
  return [...typedPredefinedPlaces, ...customPlaces];
};

// Filter places by type
export const filterPlacesByType = (places, type) => {
  return places.filter(place => place.type === type);
};

// Get all custom places from an array
export const getCustomPlaces = (places) => {
  return filterPlacesByType(places, PLACE_TYPES.CUSTOM);
};

// Get all Google places from an array
export const getGooglePlaces = (places) => {
  return filterPlacesByType(places, PLACE_TYPES.GOOGLE);
};

// Get all predefined places from an array
export const getPredefinedPlaces = (places) => {
  return filterPlacesByType(places, PLACE_TYPES.PREDEFINED);
};

// Clean place data for Firestore serialization
export const cleanPlaceForFirestore = (place) => {
  console.log('🔄 placeUtils: Cleaning place for Firestore:', {
    name: place.name,
    type: place.type,
    hasGoogleData: !!place.googleData
  });

  // Create a clean copy with only serializable data, ensuring no undefined values
  const cleanPlace = {
    id: place.id || null,
    name: place.name || 'Unknown Place',
    category: place.category || 'unknown',
    position: {
      lat: typeof place.position?.lat === 'number' ? place.position.lat : 0,
      lng: typeof place.position?.lng === 'number' ? place.position.lng : 0
    },
    description: place.description || '',
    placeId: place.placeId || null,
    type: place.type || 'predefined',
    createdAt: place.createdAt || new Date().toISOString()
  };

  // Add Google-specific fields if it's a Google place
  if (isGooglePlace(place)) {
    cleanPlace.googleTypes = Array.isArray(place.googleTypes) ? place.googleTypes : [];
    cleanPlace.googleFormattedAddress = place.googleFormattedAddress || '';
    console.log('✅ placeUtils: Added Google-specific fields for:', place.name);
  }

  // Final cleanup: replace any remaining undefined values with null
  const finalCleanPlace = deepCleanUndefined(cleanPlace);
  
  console.log('✅ placeUtils: Cleaned place data:', finalCleanPlace);
  return finalCleanPlace;
};

// Clean itinerary data for Firestore serialization
export const cleanItineraryForFirestore = (itinerary) => {
  if (!itinerary || !Array.isArray(itinerary)) {
    console.log('⚠️ placeUtils: Invalid itinerary data for cleaning:', itinerary);
    return itinerary;
  }

  console.log('🔄 placeUtils: Cleaning itinerary with', itinerary.length, 'days');

  const cleanedItinerary = itinerary.map(day => ({
    day: day.day,
    places: day.places.map(place => cleanPlaceForFirestore(place))
  }));

  console.log('✅ placeUtils: Itinerary cleaned successfully');
  return cleanedItinerary;
}; 

// Deep clean: replace all undefined values with null recursively
export const deepCleanUndefined = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(deepCleanUndefined);
  } else if (obj && typeof obj === 'object') {
    const cleaned = {};
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        const value = obj[key];
        cleaned[key] = value === undefined ? null : deepCleanUndefined(value);
      }
    }
    return cleaned;
  }
  return obj;
}; 

// Normalize the type field for a place based on its category
export const normalizePlaceType = (place) => {
  if (!place) return place;
  if (place.category === 'google') {
    return { ...place, type: 'google' };
  }
  if (place.category === 'custom') {
    return { ...place, type: 'custom' };
  }
  // Optionally, handle predefined
  return { ...place, type: place.type || 'predefined' };
};

// Normalize all places in an itinerary (multi-day)
export const normalizeItineraryPlaceTypes = (itinerary) => {
  if (!Array.isArray(itinerary)) return itinerary;
  return itinerary.map(day => ({
    ...day,
    places: Array.isArray(day.places) ? day.places.map(normalizePlaceType) : []
  }));
}; 