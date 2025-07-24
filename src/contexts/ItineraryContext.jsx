import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import { 
  saveItinerary, 
  loadUserItineraries, 
  updateItinerary, 
  deleteItinerary,
  getItinerary,
  toggleItineraryPublic
} from '../services/firebaseService';
import { 
  saveItineraryToLocalStorage, 
  loadItineraryFromLocalStorage 
} from '../utils/localStorage';
import { mergePlaces, isCustomPlace, isGooglePlace, cleanItineraryForFirestore, normalizeItineraryPlaceTypes } from '../utils/placeUtils';
import { places as predefinedPlaces } from '../data/places';

// Create the itinerary context
const ItineraryContext = createContext();

// Custom hook to use the itinerary context
export const useItinerary = () => {
  const context = useContext(ItineraryContext);
  if (!context) {
    throw new Error('useItinerary must be used within an ItineraryProvider');
  }
  return context;
};

// Itinerary Provider component
export const ItineraryProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Current itinerary state
  const [currentItinerary, setCurrentItinerary] = useState([{ day: 1, places: [] }]);
  const [currentItineraryId, setCurrentItineraryId] = useState(null);
  const [currentItineraryTitle, setCurrentItineraryTitle] = useState('Untitled Itinerary');
  const [currentTravelMode, setCurrentTravelMode] = useState('DRIVING');
  const [currentDay, setCurrentDay] = useState(1);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Custom places state
  const [customPlaces, setCustomPlaces] = useState([]);
  const [allPlaces, setAllPlaces] = useState([]);
  
  // User's saved itineraries
  const [savedItineraries, setSavedItineraries] = useState([]);
  const [loadingItineraries, setLoadingItineraries] = useState(false);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user's saved itineraries when user changes
  useEffect(() => {
    if (user) {
      loadUserItinerariesFromFirebase();
    } else {
      // Clear saved itineraries when user logs out
      setSavedItineraries([]);
      setCurrentItineraryId(null);
    }
  }, [user]);

  // Merge predefined and custom places
  useEffect(() => {
    const merged = mergePlaces(predefinedPlaces, customPlaces);
    setAllPlaces(merged);
    console.log('🔄 ItineraryContext: Merged places:', {
      predefined: predefinedPlaces.length,
      custom: customPlaces.length,
      total: merged.length,
      customPlaceNames: customPlaces.map(p => p.name),
      allPlaceNames: merged.map(p => `${p.name} (${p.category})`)
    });
  }, [customPlaces]);

  // Load itineraries from Firebase
  const loadUserItinerariesFromFirebase = useCallback(async () => {
    if (!user) return;

    setLoadingItineraries(true);
    setError(null);

    try {
      console.log('🔄 ItineraryContext: Loading user itineraries for:', user.uid);
      
      const result = await loadUserItineraries(user.uid);
      
      if (result.success) {
        setSavedItineraries(
          result.data.map(itin => ({
            ...itin,
            days: normalizeItineraryPlaceTypes(itin.days)
          }))
        );
        console.log('✅ ItineraryContext: Loaded', result.data.length, 'itineraries');
      } else {
        console.error('❌ ItineraryContext: Failed to load itineraries:', result.error);
        setError(result.error);
      }
    } catch (err) {
      console.error('❌ ItineraryContext: Error loading itineraries:', err);
      setError('Failed to load itineraries');
    } finally {
      setLoadingItineraries(false);
    }
  }, [user]);

  // Save current itinerary to Firebase
  const saveCurrentItinerary = useCallback(async (title = null) => {
    if (!user) {
      console.log('⚠️ ItineraryContext: Cannot save - no user logged in');
      return { success: false, error: 'Please log in to save itineraries' };
    }

    if (!user.uid) {
      console.log('⚠️ ItineraryContext: Cannot save - user has no UID');
      return { success: false, error: 'User authentication error' };
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 ItineraryContext: Starting save process...');
      console.log('🔄 ItineraryContext: User info:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      });
      console.log('🔄 ItineraryContext: Current itinerary data:', {
        title: title || currentItineraryTitle,
        travelMode: currentTravelMode,
        daysCount: currentItinerary?.length || 0,
        hasDays: !!currentItinerary,
        currentItineraryId: currentItineraryId,
        isUpdate: !!currentItineraryId
      });
      
      // Validate itinerary data
      if (!currentItinerary || currentItinerary.length === 0) {
        console.warn('⚠️ ItineraryContext: Empty itinerary - cannot save');
        return { success: false, error: 'Cannot save empty itinerary. Please add places to your itinerary first.' };
      }

      // Check if itinerary has any places
      const hasPlaces = currentItinerary.some(day => day.places && day.places.length > 0);
      if (!hasPlaces) {
        console.warn('⚠️ ItineraryContext: Itinerary has no places - cannot save');
        return { success: false, error: 'Cannot save empty itinerary. Please add places to your itinerary first.' };
      }
      
      const itineraryData = {
        title: title || currentItineraryTitle || 'Untitled Itinerary',
        travelMode: currentTravelMode || 'DRIVING',
        days: cleanItineraryForFirestore(currentItinerary) || [],
        public: false
      };

      console.log('🔄 ItineraryContext: Prepared itinerary data:', itineraryData);

      let result;
      
      if (currentItineraryId) {
        // Update existing itinerary
        console.log('🔄 ItineraryContext: Updating existing itinerary:', currentItineraryId);
        result = await updateItinerary(currentItineraryId, itineraryData);
        console.log('🔄 ItineraryContext: Update result:', result);
        
        if (result.success) {
          console.log('✅ ItineraryContext: Itinerary updated successfully');
          // Update local state
          setCurrentItineraryTitle(itineraryData.title);
          setLastSaved(new Date());
          setHasUnsavedChanges(false); // Reset dirty state
        } else {
          console.error('❌ ItineraryContext: Failed to update itinerary:', result.error);
        }
      } else {
        // Create new itinerary
        console.log('🔄 ItineraryContext: Creating new itinerary');
        result = await saveItinerary(itineraryData, user.uid);
        console.log('🔄 ItineraryContext: Save result:', result);
        
        if (result.success) {
          console.log('✅ ItineraryContext: New itinerary saved successfully');
          // Update local state with new ID and title
          setCurrentItineraryId(result.data.id);
          setCurrentItineraryTitle(result.data.title);
          setLastSaved(new Date());
          setHasUnsavedChanges(false); // Reset dirty state
        } else {
          console.error('❌ ItineraryContext: Failed to save new itinerary:', result.error);
        }
      }

      if (result.success) {
        // Refresh the saved itineraries list
        await loadUserItinerariesFromFirebase();
      }

      return result;
    } catch (err) {
      console.error('❌ ItineraryContext: Error saving itinerary:', err);
      console.error('❌ ItineraryContext: Error details:', {
        message: err.message,
        code: err.code,
        stack: err.stack
      });
      const errorMessage = err.message || 'Failed to save itinerary';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [user, currentItinerary, currentItineraryId, currentItineraryTitle, currentTravelMode, loadUserItinerariesFromFirebase]);

  // Load a specific itinerary
  const loadItinerary = useCallback(async (itineraryId) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 ItineraryContext: Loading itinerary:', itineraryId);
      
      const result = await getItinerary(itineraryId);
      
      if (result.success) {
        const itinerary = result.data;
        console.log('🔄 ItineraryContext: Setting new itinerary data:', {
          id: itinerary.id,
          title: itinerary.title,
          travelMode: itinerary.travelMode,
          daysCount: itinerary.days?.length || 0,
          totalPlaces: itinerary.days?.reduce((total, day) => total + day.places.length, 0) || 0
        });
        
        // Normalize place types after loading
        const normalizedDays = normalizeItineraryPlaceTypes(itinerary.days);
        setCurrentItinerary(normalizedDays);
        setCurrentItineraryId(itinerary.id);
        setCurrentItineraryTitle(itinerary.title);
        setCurrentTravelMode(itinerary.travelMode);
        setCurrentDay(1);
        setHasUnsavedChanges(false); // Reset dirty state when loading
        
        console.log('✅ ItineraryContext: Itinerary loaded successfully');
        return { success: true, data: itinerary };
      } else {
        console.error('❌ ItineraryContext: Failed to load itinerary:', result.error);
        setError(result.error);
        return result;
      }
    } catch (err) {
      console.error('❌ ItineraryContext: Error loading itinerary:', err);
      setError('Failed to load itinerary');
      return { success: false, error: 'Failed to load itinerary' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete an itinerary
  const deleteItineraryById = useCallback(async (itineraryId) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 ItineraryContext: Deleting itinerary:', itineraryId);
      
      const result = await deleteItinerary(itineraryId);
      
      if (result.success) {
        console.log('✅ ItineraryContext: Itinerary deleted successfully');
        
        // If we deleted the current itinerary, clear it
        if (currentItineraryId === itineraryId) {
          setCurrentItinerary([{ day: 1, places: [] }]);
          setCurrentItineraryId(null);
          setCurrentItineraryTitle('Untitled Itinerary');
          setCurrentTravelMode('DRIVING');
          setCurrentDay(1);
        }
        
        // Refresh the saved itineraries list
        await loadUserItinerariesFromFirebase();
        
        return result;
      } else {
        console.error('❌ ItineraryContext: Failed to delete itinerary:', result.error);
        setError(result.error);
        return result;
      }
    } catch (err) {
      console.error('❌ ItineraryContext: Error deleting itinerary:', err);
      setError('Failed to delete itinerary');
      return { success: false, error: 'Failed to delete itinerary' };
    } finally {
      setLoading(false);
    }
  }, [currentItineraryId, loadUserItinerariesFromFirebase]);

  // Toggle public status of an itinerary
  const togglePublicStatus = useCallback(async (itineraryId, isPublic) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 ItineraryContext: Toggling public status for itinerary:', itineraryId);
      
      const result = await toggleItineraryPublic(itineraryId, isPublic);
      
      if (result.success) {
        console.log('✅ ItineraryContext: Public status updated successfully');
        // Refresh the saved itineraries list
        await loadUserItinerariesFromFirebase();
      }
      
      return result;
    } catch (err) {
      console.error('❌ ItineraryContext: Error toggling public status:', err);
      setError('Failed to update public status');
      return { success: false, error: 'Failed to update public status' };
    } finally {
      setLoading(false);
    }
  }, [loadUserItinerariesFromFirebase]);

  // Update itinerary title (for renaming)
  const updateItineraryTitle = useCallback(async (itineraryId, newTitle) => {
    if (!user) {
      return { success: false, error: 'Please log in to update itineraries' };
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 ItineraryContext: Updating itinerary title:', itineraryId, 'to:', newTitle);
      
      const result = await updateItinerary(itineraryId, { title: newTitle });
      
      if (result.success) {
        console.log('✅ ItineraryContext: Itinerary title updated successfully');
        
        // Update local state if this is the current itinerary
        if (currentItineraryId === itineraryId) {
          setCurrentItineraryTitle(newTitle);
        }
        
        // Refresh the saved itineraries list
        await loadUserItinerariesFromFirebase();
        
        return result;
      } else {
        console.error('❌ ItineraryContext: Failed to update itinerary title:', result.error);
        setError(result.error);
        return result;
      }
    } catch (err) {
      console.error('❌ ItineraryContext: Error updating itinerary title:', err);
      setError('Failed to update itinerary title');
      return { success: false, error: 'Failed to update itinerary title' };
    } finally {
      setLoading(false);
    }
  }, [user, currentItineraryId, loadUserItinerariesFromFirebase]);

  // Create a new itinerary
  const createNewItinerary = useCallback(() => {
    console.log('🔄 ItineraryContext: Creating new itinerary');
    
    setCurrentItinerary([{ day: 1, places: [] }]);
    setCurrentItineraryId(null);
    setCurrentItineraryTitle('Untitled Itinerary');
    setCurrentTravelMode('DRIVING');
    setCurrentDay(1);
    setError(null);
    setHasUnsavedChanges(false); // Reset dirty state for new itinerary
    
    console.log('✅ ItineraryContext: New itinerary created');
  }, []);

  // Update current itinerary (for drag & drop, adding/removing places)
  const updateCurrentItinerary = useCallback((newItinerary) => {
    console.log('🔄 ItineraryContext: Updating current itinerary');
    setCurrentItinerary(newItinerary);
    setHasUnsavedChanges(true); // Mark as dirty when itinerary changes
  }, []);

  // Update current travel mode
  const updateCurrentTravelMode = useCallback((newTravelMode) => {
    console.log('🔄 ItineraryContext: Updating travel mode to:', newTravelMode);
    setCurrentTravelMode(newTravelMode);
    setHasUnsavedChanges(true); // Mark as dirty when travel mode changes
  }, []);

  // Update current day
  const updateCurrentDay = useCallback((newDay) => {
    console.log('🔄 ItineraryContext: Updating current day to:', newDay);
    setCurrentDay(newDay);
  }, []);

  // Update current itinerary title
  const updateCurrentItineraryTitle = useCallback((newTitle) => {
    console.log('🔄 ItineraryContext: Updating itinerary title to:', newTitle);
    setCurrentItineraryTitle(newTitle);
    setHasUnsavedChanges(true); // Mark as dirty when title changes
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Mark itinerary as having unsaved changes
  const markAsDirty = useCallback(() => {
    console.log('🔄 ItineraryContext: Marking itinerary as dirty (has unsaved changes)');
    setHasUnsavedChanges(true);
  }, []);

  // Add custom place
  const addCustomPlace = useCallback((customPlace) => {
    console.log('🔄 ItineraryContext: Adding custom place:', customPlace.name);
    setCustomPlaces(prev => {
      const updated = [...prev, customPlace];
      console.log('✅ ItineraryContext: Custom places updated, total:', updated.length);
      return updated;
    });
  }, []);

  // Add Google place
  const addGooglePlace = useCallback((googlePlace) => {
    console.log('🔄 ItineraryContext: Adding Google place:', {
      name: googlePlace.name,
      category: googlePlace.category,
      type: googlePlace.type,
      position: googlePlace.position,
      id: googlePlace.id
    });
    setCustomPlaces(prev => {
      const updated = [...prev, googlePlace];
      console.log('✅ ItineraryContext: Custom places updated (Google), total:', updated.length);
      console.log('✅ ItineraryContext: All custom places:', updated.map(p => ({ name: p.name, category: p.category, type: p.type })));
      return updated;
    });
  }, []);

  // Remove custom place
  const removeCustomPlace = useCallback((placeId) => {
    console.log('🔄 ItineraryContext: Removing custom place:', placeId);
    setCustomPlaces(prev => {
      const updated = prev.filter(place => place.id !== placeId);
      console.log('✅ ItineraryContext: Custom place removed, remaining:', updated.length);
      return updated;
    });
  }, []);

  // Load from localStorage (fallback for non-authenticated users)
  const loadFromLocalStorage = useCallback(() => {
    console.log('🔄 ItineraryContext: Loading from localStorage');
    
    const result = loadItineraryFromLocalStorage();
    if (result.success) {
      setCurrentItinerary(normalizeItineraryPlaceTypes(result.data));
      console.log('✅ ItineraryContext: Loaded from localStorage');
    }
  }, []);

  // Save to localStorage (fallback for non-authenticated users)
  const saveToLocalStorage = useCallback(() => {
    console.log('🔄 ItineraryContext: Saving to localStorage');
    
    const result = saveItineraryToLocalStorage(currentItinerary);
    if (result.success) {
      console.log('✅ ItineraryContext: Saved to localStorage');
    }
  }, [currentItinerary]);

  // Context value
  const value = {
    // Current itinerary state
    currentItinerary,
    currentItineraryId,
    currentItineraryTitle,
    currentTravelMode,
    currentDay,
    lastSaved,
    hasUnsavedChanges,
    
    // Custom places
    customPlaces,
    allPlaces,
    
    // Saved itineraries
    savedItineraries,
    loadingItineraries,
    
    // Loading and error states
    loading,
    error,
    
    // Actions
    saveCurrentItinerary,
    loadItinerary,
    deleteItineraryById,
    togglePublicStatus,
    createNewItinerary,
    updateCurrentItinerary,
    updateCurrentTravelMode,
    updateCurrentDay,
    updateCurrentItineraryTitle,
    updateItineraryTitle,
    clearError,
    markAsDirty,
    addCustomPlace,
    addGooglePlace,
    removeCustomPlace,
    loadFromLocalStorage,
    saveToLocalStorage,
    loadUserItinerariesFromFirebase
  };

  return (
    <ItineraryContext.Provider value={value}>
      {children}
    </ItineraryContext.Provider>
  );
}; 