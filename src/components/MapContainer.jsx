import { useState, useEffect, useRef, useLayoutEffect, useMemo, useCallback } from 'react';
import { mapOptions, createCustomMarker } from '../utils/mapsConfig';
import SidebarFilters from './SidebarFilters';
import PlaceDetailsPanel from './PlaceDetailsPanel';
import ItinerarySidebar from './ItinerarySidebar';
import RoutePreview from './RoutePreview';
import DebugPanel from './DebugPanel';
import CustomPlaceModal from './CustomPlaceModal';
import GooglePlacesSearch from './GooglePlacesSearch';
import { places, categories } from '../data/places';
import { useItinerary } from '../contexts/ItineraryContext';
import { useAuth } from '../contexts/AuthProvider';
import { getPlaceDisplayName, isCustomPlace, isGooglePlace } from '../utils/placeUtils';

const MapContainer = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mapInitializing, setMapInitializing] = useState(true);
  const [mapError, setMapError] = useState(null);
  
  // Enhanced filtering state - start with ALL categories selected
  const [selectedCategories, setSelectedCategories] = useState(categories.map(cat => cat.id));
  const [searchQuery, setSearchQuery] = useState('');
  
  // Itinerary state from context
  const {
    currentItinerary: itinerary,
    currentTravelMode: travelMode,
    currentDay,
    allPlaces,
    addCustomPlace,
    addGooglePlace,
    updateCurrentItinerary: setItinerary,
    updateCurrentTravelMode: setTravelMode,
    updateCurrentDay: setCurrentDay
  } = useItinerary();
  
  const { user } = useAuth();
  
  // Phase 3: Itinerary Builder state
  const [routeStats, setRouteStats] = useState(null);
  const [showItinerarySidebar, setShowItinerarySidebar] = useState(false);
  const [routeKey, setRouteKey] = useState(0);
  
  // Custom place and Google Places search state
  const [showCustomPlaceModal, setShowCustomPlaceModal] = useState(false);
  const [showGooglePlacesSearch, setShowGooglePlacesSearch] = useState(false);
  const [clickedPosition, setClickedPosition] = useState(null);
  
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection effect
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Force route re-render when itinerary changes
  useEffect(() => {
    console.log('🔄 MapContainer: Itinerary changed, updating route key');
    setRouteKey(prev => prev + 1);
  }, [itinerary]);

  // Map initialization - using useLayoutEffect with direct ref access
  useLayoutEffect(() => {
    console.log('🔄 MapContainer: useLayoutEffect triggered');
    console.log('MapContainer: mapRef.current:', mapRef.current);
    console.log('MapContainer: Current map state:', !!map);
    
    // Don't initialize if map already exists
    if (map) {
      console.log('MapContainer: Map already exists, skipping initialization');
      return;
    }
    
    const mapElement = mapRef.current;
    if (!mapElement) {
      console.log('MapContainer: No map element in ref, waiting...');
      return;
    }

    console.log('MapContainer: Map element found!', {
      element: mapElement,
      tagName: mapElement.tagName,
      id: mapElement.id,
      offsetWidth: mapElement.offsetWidth,
      offsetHeight: mapElement.offsetHeight,
      clientWidth: mapElement.clientWidth,
      clientHeight: mapElement.clientHeight
    });

    // Check if element has dimensions
    if (mapElement.offsetWidth === 0 || mapElement.offsetHeight === 0) {
      console.log('MapContainer: Map element has no dimensions yet, will retry once...', {
        offsetWidth: mapElement.offsetWidth,
        offsetHeight: mapElement.offsetHeight
      });
      
      // Single retry after a short delay - no infinite loops
      const timer = setTimeout(() => {
        console.log('MapContainer: Single retry - checking dimensions again...');
        if (mapElement.offsetWidth > 0 && mapElement.offsetHeight > 0) {
          console.log('MapContainer: Element now has dimensions, initializing...');
          initializeMap();
        } else {
          console.log('MapContainer: Element still has no dimensions after retry');
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }

    console.log('MapContainer: Map element is ready! Initializing map...');
    initializeMap();

    async function initializeMap() {
      try {
        console.log('=== MapContainer: STARTING MAP INITIALIZATION ===');
        setMapInitializing(true);
        setMapError(null);
        
        console.log('MapContainer: Waiting for Google Maps API...');
        
        // Wait for Google Maps to be loaded via script tag
        let attempts = 0;
        while (!window.google?.maps && attempts < 50) {
          console.log(`MapContainer: Attempt ${attempts + 1}: Waiting for Google Maps API...`);
          await new Promise(resolve => setTimeout(resolve, 200));
          attempts++;
        }

        if (!window.google?.maps) {
          throw new Error('Google Maps API failed to load after 10 seconds');
        }

        console.log('MapContainer: Google Maps API loaded! Creating map instance...');
        
        // Ensure the element still exists and has dimensions
        if (!mapElement || mapElement.offsetWidth === 0) {
          throw new Error('Map element became invalid during initialization');
        }
        
        const mapInstance = new google.maps.Map(mapElement, mapOptions);
        console.log('MapContainer: Map instance created:', mapInstance);
        
        // Add double-click listener for custom place addition
        mapInstance.addListener('dblclick', (event) => {
          const position = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          };
          console.log('🗺️ MapContainer: Map double-clicked at:', position);
          setClickedPosition(position);
          setShowCustomPlaceModal(true);
        });
        
        // Wait for map to be ready
        await new Promise((resolve) => {
          const listener = mapInstance.addListener('idle', () => {
            console.log('MapContainer: Map is ready (idle event fired)');
            google.maps.event.removeListener(listener);
            resolve();
          });
          
          // Also resolve after a timeout as backup
          setTimeout(resolve, 3000);
        });
        
        console.log('=== MapContainer: MAP INITIALIZATION COMPLETE ===');
        setMap(mapInstance);
        setMapInitializing(false);
        console.log('MapContainer: Map state updated, should trigger marker creation');
      } catch (error) {
        console.error('MapContainer: Error initializing map:', error);
        setMapError(error.message);
        setMapInitializing(false);
      }
    }
  }, []); // Empty dependency array - only run once on mount

  // Filter places based on search and categories - MEMOIZED to prevent infinite loops
  const filteredPlaces = useMemo(() => {
    console.log('🔄 MapContainer: RECALCULATING FILTERED PLACES:', {
      selectedCategories,
      searchQuery,
      totalPlaces: allPlaces.length,
      allPlaceNames: allPlaces.map(p => `${p.name} (${p.category})`)
    });
    
    const filtered = allPlaces.filter(place => {
      // Category filter - if NO categories selected, show NO places (not all places)
      const categoryMatch = selectedCategories.length > 0 && selectedCategories.includes(place.category);
      
      // Search filter (case-insensitive)
      const searchMatch = !searchQuery || 
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const shouldInclude = categoryMatch && searchMatch;
      
      if (!shouldInclude) {
        console.log(`❌ MapContainer: Filtered out place "${place.name}" (${place.category}) - categoryMatch: ${categoryMatch}, searchMatch: ${searchMatch}`);
      }
      
      return shouldInclude;
    });
    
    console.log('✅ MapContainer: Filtered places result:', {
      total: filtered.length,
      filteredNames: filtered.map(p => `${p.name} (${p.category})`)
    });
    
    return filtered;
  }, [allPlaces, selectedCategories, searchQuery]); // Updated to use allPlaces

  // Debug: Track when filteredPlaces changes
  useEffect(() => {
    console.log('🔍 MapContainer: FILTERED PLACES CHANGED:', {
      totalPlaces: allPlaces.length,
      filteredCount: filteredPlaces.length,
      selectedCategories: selectedCategories,
      searchQuery: searchQuery,
      filteredPlaceNames: filteredPlaces.map(p => p.name)
    });
  }, [filteredPlaces, selectedCategories, searchQuery, allPlaces]);

  // Debug: Track when dependencies change
  useEffect(() => {
    console.log('📊 MapContainer: FILTER DEPENDENCIES CHANGED:', {
      selectedCategoriesLength: selectedCategories.length,
      selectedCategories: selectedCategories,
      searchQuery: searchQuery
    });
  }, [selectedCategories, searchQuery]);

  // Compute all itinerary places (flattened)
  const itineraryPlaces = useMemo(() => {
    if (!itinerary || !Array.isArray(itinerary)) return [];
    if (itinerary.length > 0 && itinerary[0].hasOwnProperty('day')) {
      // Multi-day format
      return itinerary.reduce((all, day) => [...all, ...day.places], []);
    }
    // Flat array format
    return itinerary;
  }, [itinerary]);

  // Combine filtered places and itinerary places, removing duplicates by id
  const markerPlaces = useMemo(() => {
    const byId = new Map();
    filteredPlaces.forEach(place => byId.set(place.id, place));
    itineraryPlaces.forEach(place => byId.set(place.id, place));
    return Array.from(byId.values());
  }, [filteredPlaces, itineraryPlaces]);

  // Update markers when map or markerPlaces change
  useEffect(() => {
    console.log('=== MapContainer: MARKER UPDATE EFFECT TRIGGERED ===');
    console.log('MapContainer: Effect dependencies:', {
      mapExists: !!map,
      markerPlacesCount: markerPlaces?.length,
      currentMarkersCount: markers.length
    });

    if (!map) {
      console.log('MapContainer: No map yet, skipping marker update');
      return;
    }
    
    if (!markerPlaces || markerPlaces.length === 0) {
      console.log('MapContainer: No marker places, clearing markers');
      // Clear existing markers
      markers.forEach(marker => {
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
      });
      setMarkers([]);
      return;
    }

    console.log('MapContainer: Updating markers for', markerPlaces.length, 'places');
    console.log('MapContainer: Current markers to clear:', markers.length);

    // Clear existing markers
    markers.forEach((marker, index) => {
      if (marker && marker.setMap) {
        console.log(`MapContainer: Clearing marker ${index}`);
        marker.setMap(null);
      }
    });

    console.log('MapContainer: Creating new markers...');
    const newMarkers = [];
    
    markerPlaces.forEach((place, index) => {
      try {
        console.log(`MapContainer: Creating marker ${index + 1}/${markerPlaces.length} for:`, place.name);
        const marker = createCustomMarker(
          map,
          place.position,
          place.category,
          () => {
            console.log('MapContainer: Marker clicked:', place.name);
            setSelectedPlace(place);
          }
        );
        if (marker) {
          newMarkers.push(marker);
          console.log(`MapContainer: ✓ Marker created for ${place.name}`);
        } else {
          console.log(`MapContainer: ✗ Failed to create marker for ${place.name}`);
        }
      } catch (error) {
        console.error('MapContainer: Error creating marker for place:', place.name, error);
      }
    });

    console.log(`MapContainer: Successfully created ${newMarkers.length} markers`);
    setMarkers(newMarkers);
    console.log('=== MapContainer: MARKER UPDATE COMPLETE ===');
  }, [map, markerPlaces]); // Use markerPlaces instead of filteredPlaces

  // Itinerary management functions - Updated for multi-day support
  const handleAddToItinerary = (place) => {
    console.log('🔄 MapContainer: Adding place to itinerary:', place.name, 'to day:', currentDay);
    
    // Check if place is already in any day
    const isAlreadyInItinerary = itinerary.some(day => 
      day.places.some(item => item.id === place.id)
    );
    
    if (!isAlreadyInItinerary) {
      const newItinerary = itinerary.map(day => {
        if (day.day === currentDay) {
          return {
            ...day,
            places: [...day.places, place]
          };
        }
        return day;
      });
      
      setItinerary(newItinerary);
      console.log(`✅ MapContainer: Added ${place.name} to Day ${currentDay}`);
      
      // Show itinerary sidebar on mobile when adding first place
      if (isMobile && getTotalPlaces() === 1) {
        setShowItinerarySidebar(true);
      }
    } else {
      console.log('MapContainer: Place already in itinerary:', place.name);
    }
  };

  const isPlaceInItinerary = (place) => {
    console.log('🔍 MapContainer: isPlaceInItinerary checking place:', place.id);
    
    if (!itinerary || !Array.isArray(itinerary)) {
      console.log('⚠️ MapContainer: isPlaceInItinerary - itinerary is not a valid array');
      return false;
    }
    
    // Check if it's multi-day format (new format)
    if (itinerary.length > 0 && itinerary[0].hasOwnProperty('day')) {
      const isInItinerary = itinerary.some(day => 
        day.places.some(item => item.id === place.id)
      );
      console.log('✅ MapContainer: isPlaceInItinerary - multi-day format, result:', isInItinerary);
      return isInItinerary;
    }
    
    // Check if it's flat array format (old format)
    if (itinerary.length > 0 && itinerary[0].hasOwnProperty('id')) {
      const isInItinerary = itinerary.some(item => item.id === place.id);
      console.log('✅ MapContainer: isPlaceInItinerary - flat array format, result:', isInItinerary);
      return isInItinerary;
    }
    
    console.log('⚠️ MapContainer: isPlaceInItinerary - empty or invalid format');
    return false;
  };

  const getTotalPlaces = () => {
    console.log('🔍 MapContainer: getTotalPlaces called with itinerary:', itinerary);
    
    if (!itinerary || !Array.isArray(itinerary)) {
      console.log('⚠️ MapContainer: getTotalPlaces - itinerary is not a valid array');
      return 0;
    }
    
    // Check if it's multi-day format (new format)
    if (itinerary.length > 0 && itinerary[0].hasOwnProperty('day')) {
      const total = itinerary.reduce((total, day) => total + day.places.length, 0);
      console.log('✅ MapContainer: getTotalPlaces - multi-day format, total places:', total);
      return total;
    }
    
    // Check if it's flat array format (old format)
    if (itinerary.length > 0 && itinerary[0].hasOwnProperty('id')) {
      console.log('✅ MapContainer: getTotalPlaces - flat array format, total places:', itinerary.length);
      return itinerary.length;
    }
    
    // Empty or invalid format
    console.log('⚠️ MapContainer: getTotalPlaces - empty or invalid format');
    return 0;
  };

  // Phase 3: Enhanced itinerary management
  const handleItineraryChange = (newItinerary) => {
    console.log('🔄 MapContainer: Itinerary changed from:', itinerary);
    console.log('🔄 MapContainer: Itinerary changed to:', newItinerary);
    console.log('🔄 MapContainer: Total places changed from', getTotalPlaces(), 'to', newItinerary.reduce((total, day) => total + day.places.length, 0));
    setItinerary(newItinerary);
    console.log('✅ MapContainer: Itinerary state updated, should trigger route recalculation');
  };

  const handleClearItinerary = () => {
    console.log('🗑️ MapContainer: Clearing itinerary');
    setItinerary([{ day: 1, places: [] }]);
    setRouteStats(null);
    setShowItinerarySidebar(false);
    setCurrentDay(1);
  };

  const handleTravelModeChange = (newTravelMode) => {
    console.log('🔄 MapContainer: Travel mode changed from', travelMode, 'to:', newTravelMode);
    console.log('🔄 MapContainer: Current itinerary state:', itinerary);
    console.log('🔄 MapContainer: Total places in itinerary:', getTotalPlaces());
    setTravelMode(newTravelMode);
    console.log('✅ MapContainer: Travel mode state updated, should trigger route recalculation');
  };

  const handleRouteStatsUpdate = useCallback((stats) => {
    console.log('📊 MapContainer: Route stats updated:', stats);
    setRouteStats(stats);
  }, []);

  const toggleItinerarySidebar = () => {
    console.log('🔄 MapContainer: Toggling itinerary sidebar');
    setShowItinerarySidebar(!showItinerarySidebar);
  };

  const handleCurrentDayChange = (newCurrentDay) => {
    console.log('🔄 MapContainer: Current day changed to:', newCurrentDay);
    setCurrentDay(newCurrentDay);
  };

  // Filter handlers
  const handleCategoryChange = (newCategories) => {
    console.log('🔄 MapContainer: Categories updated:', newCategories);
    setSelectedCategories(newCategories);
  };

  const handleSearchChange = (query) => {
    console.log('🔄 MapContainer: Search query updated:', query);
    setSearchQuery(query);
  };

  // Close place details panel
  const handleClosePanel = () => {
    setSelectedPlace(null);
  };

  // Handle custom place addition
  const handleCustomPlaceSave = (customPlace) => {
    console.log('🔄 MapContainer: Saving custom place:', customPlace.name);
    addCustomPlace(customPlace);
    setShowCustomPlaceModal(false);
    setClickedPosition(null);
    
    // Move map to the new place and open details panel
    if (map) {
      // Pan to the new place
      map.panTo(customPlace.position);
      map.setZoom(15); // Zoom in to show the place clearly
      
      // Open the place details panel
      setSelectedPlace(customPlace);
      
      console.log('✅ MapContainer: Map moved to custom place and panel opened');
    }
  };

  // Handle Google place selection
  const handleGooglePlaceSelect = (googlePlace) => {
    console.log('🔄 MapContainer: Google place selected:', {
      name: googlePlace.name,
      category: googlePlace.category,
      type: googlePlace.type,
      position: googlePlace.position,
      id: googlePlace.id
    });
    addGooglePlace(googlePlace);
    setShowGooglePlacesSearch(false);
    
    // Move map to the new place and open details panel
    if (map) {
      // Pan to the new place
      map.panTo(googlePlace.position);
      map.setZoom(15); // Zoom in to show the place clearly
      
      // Open the place details panel
      setSelectedPlace(googlePlace);
      
      console.log('✅ MapContainer: Map moved to Google place and panel opened');
    }
    
    console.log('✅ MapContainer: Google place added to context');
  };

  // Handle custom place modal close
  const handleCustomPlaceModalClose = () => {
    setShowCustomPlaceModal(false);
    setClickedPosition(null);
  };

  // Handle Google places search close
  const handleGooglePlacesSearchClose = () => {
    setShowGooglePlacesSearch(false);
  };

  // Error state
  if (mapError) {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fef2f2',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#dc2626',
            marginBottom: '12px'
          }}>
            Map Loading Error
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            {mapError}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Main layout
  const layoutStyle = isMobile ? {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100%',
    fontFamily: 'Arial, sans-serif'
  } : {
    display: 'flex',
    height: '100vh',
    width: '100%',
    fontFamily: 'Arial, sans-serif'
  };

  const mapContainerStyle = isMobile ? {
    flex: 1,
    position: 'relative',
    width: '100%',
    height: '100%'
  } : {
    flex: 1,
    position: 'relative',
    width: '100%',
    height: '100%'
  };

  return (
    <div style={layoutStyle}>
      {/* Desktop Sidebar or Mobile Hidden Sidebar */}
      {!isMobile && (
        <SidebarFilters
          selectedCategories={selectedCategories}
          onCategoryChange={handleCategoryChange}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          filteredPlaces={filteredPlaces}
          totalPlaces={allPlaces.length}
          onGooglePlacesSearch={() => setShowGooglePlacesSearch(true)}
        />
      )}

      {/* Map Container */}
      <div style={mapContainerStyle}>
        {/* Map div - always rendered so ref can attach */}
        <div
          ref={mapRef}
          id="map-container"
          style={{
            width: '100%',
            height: '100%',
            minHeight: '400px',
            backgroundColor: '#e5e7eb',
            border: isMobile ? 'none' : '2px solid #10b981',
            position: 'relative',
            overflow: 'hidden'
          }}
        />

        {/* Loading Overlay - shown over the map div when initializing */}
        {mapInitializing && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(249, 250, 251, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                border: '4px solid #f3f4f6',
                borderTop: '4px solid #1e40af',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                Loading Ceylon Trails
              </h2>
              <p style={{
                color: '#6b7280',
                fontSize: '14px'
              }}>
                Preparing your Sri Lanka travel experience...
              </p>
              <p style={{
                color: '#9ca3af',
                fontSize: '12px',
                marginTop: '8px'
              }}>
                Debug: Map element = {mapRef.current ? 'Found' : 'Not found'}
              </p>
            </div>
          </div>
        )}

        {/* Mobile Floating Filter Button */}
        {isMobile && !mapInitializing && (
          <button
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              zIndex: 100
            }}
            onClick={() => {
              // TODO: Implement mobile filter modal
              alert('Mobile filter modal - coming soon!');
            }}
          >
            <span style={{ fontSize: '16px' }}>🔍</span>
          </button>
        )}

        {/* No Results Overlay */}
        {!mapInitializing && filteredPlaces.length === 0 && (selectedCategories.length > 0 || searchQuery) && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            maxWidth: '300px',
            zIndex: 10
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              No places found
            </h3>
            <p style={{
              color: '#6b7280',
              fontSize: '14px',
              marginBottom: '16px'
            }}>
              Try adjusting your search or category filters
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategories([]);
              }}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Place Details Panel */}
        {!mapInitializing && selectedPlace && (
          <PlaceDetailsPanel
            place={selectedPlace}
            onClose={handleClosePanel}
            onAddToItinerary={handleAddToItinerary}
            isInItinerary={isPlaceInItinerary(selectedPlace)}
            isMobile={isMobile}
            placeDisplayName={getPlaceDisplayName(selectedPlace)}
          />
        )}

        {/* Custom Place Modal */}
        <CustomPlaceModal
          isOpen={showCustomPlaceModal}
          onClose={handleCustomPlaceModalClose}
          onSave={handleCustomPlaceSave}
          position={clickedPosition}
          isLoading={false}
        />

        {/* Google Places Search Modal */}
        <GooglePlacesSearch
          isOpen={showGooglePlacesSearch}
          onClose={handleGooglePlacesSearchClose}
          onPlaceSelect={handleGooglePlaceSelect}
          isLoading={false}
        />

        {/* Route Preview Component - Updated for multi-day */}
        {(() => {
          const shouldShowRoute = !mapInitializing && map && getTotalPlaces() >= 2;
          console.log('🔍 MapContainer: RoutePreview rendering condition:', {
            mapInitializing,
            hasMap: !!map,
            totalPlaces: getTotalPlaces(),
            shouldShowRoute
          });
          return shouldShowRoute ? (
            <RoutePreview
              key={`route-${routeKey}-${JSON.stringify(itinerary)}-${travelMode}`}
              itinerary={itinerary}
              travelMode={travelMode}
              mapInstance={map}
              onRouteStatsUpdate={handleRouteStatsUpdate}
            />
          ) : null;
        })()}

        {/* Itinerary Sidebar (Desktop) */}
        {(() => {
          const shouldShowSidebar = !mapInitializing && !isMobile && showItinerarySidebar && getTotalPlaces() > 0;
          console.log('🔍 MapContainer: Desktop ItinerarySidebar rendering condition:', {
            mapInitializing,
            isMobile,
            showItinerarySidebar,
            totalPlaces: getTotalPlaces(),
            shouldShowSidebar
          });
          return shouldShowSidebar ? (
            <ItinerarySidebar
              key={`sidebar-desktop-${JSON.stringify(itinerary)}`}
              itinerary={itinerary}
              onItineraryChange={handleItineraryChange}
              onClearItinerary={handleClearItinerary}
              travelMode={travelMode}
              onTravelModeChange={handleTravelModeChange}
              routeStats={routeStats}
              isMobile={false}
              currentDay={currentDay}
              onCurrentDayChange={handleCurrentDayChange}
            />
          ) : null;
        })()}

        {/* Itinerary Sidebar (Mobile) */}
        {(() => {
          const shouldShowSidebar = !mapInitializing && isMobile && showItinerarySidebar;
          console.log('🔍 MapContainer: Mobile ItinerarySidebar rendering condition:', {
            mapInitializing,
            isMobile,
            showItinerarySidebar,
            shouldShowSidebar
          });
          return shouldShowSidebar ? (
            <ItinerarySidebar
              key={`sidebar-mobile-${JSON.stringify(itinerary)}`}
              itinerary={itinerary}
              onItineraryChange={handleItineraryChange}
              onClearItinerary={handleClearItinerary}
              travelMode={travelMode}
              onTravelModeChange={handleTravelModeChange}
              routeStats={routeStats}
              isMobile={true}
              currentDay={currentDay}
              onCurrentDayChange={handleCurrentDayChange}
            />
          ) : null;
        })()}

        {/* Itinerary Toggle Button (Desktop) */}
        {(() => {
          const shouldShowButton = !mapInitializing && !isMobile && getTotalPlaces() > 0;
          console.log('🔍 MapContainer: Desktop toggle button rendering condition:', {
            mapInitializing,
            isMobile,
            totalPlaces: getTotalPlaces(),
            shouldShowButton
          });
          return shouldShowButton ? (
            <button
              onClick={toggleItinerarySidebar}
              style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                backgroundColor: showItinerarySidebar ? '#dc2626' : '#059669',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                zIndex: 10,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 6px 8px -1px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
            >
              <span>📋</span>
              {showItinerarySidebar ? 'Hide' : 'Show'} Itinerary ({getTotalPlaces()})
            </button>
          ) : null;
        })()}

        {/* Itinerary Toggle Button (Mobile) */}
        {(() => {
          const shouldShowButton = !mapInitializing && isMobile && getTotalPlaces() > 0;
          console.log('🔍 MapContainer: Mobile toggle button rendering condition:', {
            mapInitializing,
            isMobile,
            totalPlaces: getTotalPlaces(),
            shouldShowButton
          });
          return shouldShowButton ? (
            <button
              onClick={toggleItinerarySidebar}
              style={{
                position: 'absolute',
                top: '20px',
                left: '16px',
                backgroundColor: showItinerarySidebar ? '#dc2626' : '#059669',
                color: 'white',
                padding: '12px',
                borderRadius: '50%',
                fontSize: '18px',
                fontWeight: '500',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                zIndex: 10,
                border: 'none',
                cursor: 'pointer',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
            >
              📋
            </button>
          ) : null;
        })()}
      </div>
      
      {/* Debug Panel */}
      <DebugPanel
        itinerary={itinerary}
        mapInitializing={mapInitializing}
        map={map}
        showItinerarySidebar={showItinerarySidebar}
        isMobile={isMobile}
        getTotalPlaces={getTotalPlaces}
      />
    </div>
  );
};

export default MapContainer; 