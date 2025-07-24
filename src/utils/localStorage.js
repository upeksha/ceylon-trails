// localStorage utility functions for multi-day itinerary management

const STORAGE_KEYS = {
  ITINERARY: 'ceylon-trails-itinerary',
  TRAVEL_MODE: 'ceylon-trails-travel-mode',
  CURRENT_DAY: 'ceylon-trails-current-day',
  LAST_SAVED: 'ceylon-trails-last-saved'
};

// Migrate old flat array format to new multi-day format
const migrateOldItineraryFormat = (oldItinerary) => {
  console.log('🔄 Migrating old itinerary format to new multi-day format');
  console.log('📥 Input itinerary:', oldItinerary);
  
  // If it's already in new format, return as is
  if (Array.isArray(oldItinerary) && oldItinerary.length > 0 && oldItinerary[0].hasOwnProperty('day')) {
    console.log('✅ Itinerary already in new format');
    return oldItinerary;
  }
  
  // If it's a flat array of places, convert to multi-day format
  if (Array.isArray(oldItinerary) && oldItinerary.length > 0 && oldItinerary[0].hasOwnProperty('id')) {
    console.log('🔄 Converting flat array to multi-day format:', oldItinerary.length, 'places');
    const migrated = [{
      day: 1,
      places: oldItinerary
    }];
    console.log('✅ Migrated to multi-day format:', migrated);
    return migrated;
  }
  
  // If it's empty or invalid, return default structure
  console.log('🔄 Creating default multi-day structure');
  const defaultStructure = [{ day: 1, places: [] }];
  console.log('✅ Created default structure:', defaultStructure);
  return defaultStructure;
};

// Save multi-day itinerary to localStorage
export const saveItineraryToLocalStorage = (itinerary) => {
  try {
    // Ensure itinerary is in correct format before saving
    const formattedItinerary = migrateOldItineraryFormat(itinerary);
    localStorage.setItem(STORAGE_KEYS.ITINERARY, JSON.stringify(formattedItinerary));
    localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
    console.log('💾 Saved itinerary to localStorage:', formattedItinerary.length, 'days');
    return { success: true, message: 'Itinerary saved successfully' };
  } catch (error) {
    console.error('❌ Error saving itinerary to localStorage:', error);
    return { success: false, message: 'Failed to save itinerary' };
  }
};

// Load multi-day itinerary from localStorage
export const loadItineraryFromLocalStorage = () => {
  try {
    const savedItinerary = localStorage.getItem(STORAGE_KEYS.ITINERARY);
    if (savedItinerary) {
      const parsedItinerary = JSON.parse(savedItinerary);
      console.log('📥 Loaded raw itinerary from localStorage:', parsedItinerary);
      
      // Migrate to new format if needed
      const migratedItinerary = migrateOldItineraryFormat(parsedItinerary);
      console.log('📥 Migrated itinerary:', migratedItinerary);
      
      return { success: true, data: migratedItinerary };
    }
    console.log('📥 No saved itinerary found, returning default structure');
    return { success: false, message: 'No saved itinerary found' };
  } catch (error) {
    console.error('❌ Error loading itinerary from localStorage:', error);
    return { success: false, message: 'Failed to load itinerary' };
  }
};

// Save travel mode to localStorage
export const saveTravelModeToLocalStorage = (travelMode) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TRAVEL_MODE, travelMode);
    console.log('💾 Saved travel mode to localStorage:', travelMode);
    return { success: true };
  } catch (error) {
    console.error('❌ Error saving travel mode to localStorage:', error);
    return { success: false };
  }
};

// Load travel mode from localStorage
export const loadTravelModeFromLocalStorage = () => {
  try {
    const savedTravelMode = localStorage.getItem(STORAGE_KEYS.TRAVEL_MODE);
    if (savedTravelMode) {
      console.log('📥 Loaded travel mode from localStorage:', savedTravelMode);
      return { success: true, data: savedTravelMode };
    }
    return { success: false, message: 'No saved travel mode found' };
  } catch (error) {
    console.error('❌ Error loading travel mode from localStorage:', error);
    return { success: false, message: 'Failed to load travel mode' };
  }
};

// Save current day to localStorage
export const saveCurrentDayToLocalStorage = (currentDay) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_DAY, currentDay.toString());
    console.log('💾 Saved current day to localStorage:', currentDay);
    return { success: true };
  } catch (error) {
    console.error('❌ Error saving current day to localStorage:', error);
    return { success: false };
  }
};

// Load current day from localStorage
export const loadCurrentDayFromLocalStorage = () => {
  try {
    const savedCurrentDay = localStorage.getItem(STORAGE_KEYS.CURRENT_DAY);
    if (savedCurrentDay) {
      const currentDay = parseInt(savedCurrentDay, 10);
      console.log('📥 Loaded current day from localStorage:', currentDay);
      return { success: true, data: currentDay };
    }
    return { success: false, message: 'No saved current day found' };
  } catch (error) {
    console.error('❌ Error loading current day from localStorage:', error);
    return { success: false, message: 'Failed to load current day' };
  }
};

// Get last saved timestamp
export const getLastSavedTimestamp = () => {
  try {
    const lastSaved = localStorage.getItem(STORAGE_KEYS.LAST_SAVED);
    return lastSaved ? new Date(lastSaved) : null;
  } catch (error) {
    console.error('❌ Error getting last saved timestamp:', error);
    return null;
  }
};

// Clear all itinerary data from localStorage
export const clearItineraryFromLocalStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('🗑️ Cleared all itinerary data from localStorage');
    return { success: true, message: 'Itinerary data cleared successfully' };
  } catch (error) {
    console.error('❌ Error clearing itinerary data from localStorage:', error);
    return { success: false, message: 'Failed to clear itinerary data' };
  }
};

// Export itinerary data for sharing/downloading
export const exportItineraryData = (itinerary, travelMode) => {
  // Ensure itinerary is in correct format
  const formattedItinerary = migrateOldItineraryFormat(itinerary);
  
  const exportData = {
    itinerary: formattedItinerary,
    travelMode: travelMode,
    exportDate: new Date().toISOString(),
    totalDays: formattedItinerary.length,
    totalPlaces: formattedItinerary.reduce((total, day) => total + day.places.length, 0),
    version: '1.0.0'
  };
  
  console.log('📤 Exporting itinerary data:', exportData);
  return exportData;
};

// Import itinerary data (for future use)
export const importItineraryData = (data) => {
  try {
    // Validate the imported data structure
    if (!data.itinerary || !Array.isArray(data.itinerary)) {
      throw new Error('Invalid itinerary data structure');
    }
    
    // Migrate to new format if needed
    const migratedItinerary = migrateOldItineraryFormat(data.itinerary);
    
    // Validate each day has required properties
    migratedItinerary.forEach((day, index) => {
      if (!day.day || !Array.isArray(day.places)) {
        throw new Error(`Invalid day structure at index ${index}`);
      }
    });
    
    console.log('📥 Imported itinerary data:', migratedItinerary);
    return { success: true, data: { ...data, itinerary: migratedItinerary } };
  } catch (error) {
    console.error('❌ Error importing itinerary data:', error);
    return { success: false, message: error.message };
  }
};

// Check if localStorage is available
export const isLocalStorageAvailable = () => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    console.error('❌ localStorage is not available:', error);
    return false;
  }
};

// Get storage usage information
export const getStorageUsage = () => {
  try {
    // First check if localStorage is available
    if (!isLocalStorageAvailable()) {
      return { 
        available: false, 
        totalBytes: 0, 
        totalKB: '0.00',
        error: 'localStorage not available' 
      };
    }
    
    let total = 0;
    let itemCount = 0;
    
    // Safely calculate total size
    Object.values(STORAGE_KEYS).forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          total += item.length;
          itemCount++;
        }
      } catch (itemError) {
        console.warn('⚠️ Error accessing localStorage item:', key, itemError);
      }
    });
    
    return {
      totalBytes: total,
      totalKB: (total / 1024).toFixed(2),
      itemCount: itemCount,
      available: true
    };
  } catch (error) {
    console.error('❌ Error getting storage usage:', error);
    return { 
      available: false, 
      totalBytes: 0, 
      totalKB: '0.00',
      error: error.message 
    };
  }
}; 