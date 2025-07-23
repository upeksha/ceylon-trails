import { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { mapOptions, createCustomMarker } from '../utils/mapsConfig';
import SidebarFilters from './SidebarFilters';
import PlaceDetailsPanel from './PlaceDetailsPanel';
import ItinerarySidebar from './ItinerarySidebar';
import RouteOverlay from './RouteOverlay';
import { places, categories } from '../data/places';

const MapContainer = () => {
  const mapRef = useRef(null);
  const initializationRef = useRef(false); // Track initialization state
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mapInitializing, setMapInitializing] = useState(true);
  const [mapError, setMapError] = useState(null);
  
  // Enhanced filtering state - start with ALL categories selected
  const [selectedCategories, setSelectedCategories] = useState(categories.map(cat => cat.id));
  const [searchQuery, setSearchQuery] = useState('');
  
  // Itinerary management - PHASE 3
  const [itinerary, setItinerary] = useState([]);
  const [travelMode, setTravelMode] = useState('DRIVING');
  const [routeInfo, setRouteInfo] = useState(null);
  
  // Mobile and UI state - PHASE 3  
  const [isMobile, setIsMobile] = useState(false);
  const [showItinerarySidebar, setShowItinerarySidebar] = useState(false);
  const [itinerarySidebarCollapsed, setItinerarySidebarCollapsed] = useState(true);

  // Filter places based on search and categories - MEMOIZED to prevent infinite loops
  const filteredPlaces = useMemo(() => {
    console.log('🔄 RECALCULATING FILTERED PLACES:', {
      selectedCategories,
      searchQuery,
      totalPlaces: places.length
    });
    
    return places.filter(place => {
      // Category filter - if NO categories selected, show NO places (not all places)
      const categoryMatch = selectedCategories.length > 0 && selectedCategories.includes(place.category);
      
      // Search filter (case-insensitive)
      const searchMatch = !searchQuery || 
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return categoryMatch && searchMatch;
    });
  }, [selectedCategories, searchQuery]); // Only recalculate when these change

  // Debug: Track when filteredPlaces changes
  useEffect(() => {
    console.log('🔍 FILTERED PLACES CHANGED:', {
      totalPlaces: places.length,
      filteredCount: filteredPlaces.length,
      selectedCategories: selectedCategories,
      searchQuery: searchQuery,
      filteredPlaceNames: filteredPlaces.map(p => p.name)
    });
  }, [filteredPlaces, selectedCategories, searchQuery]);

  // Debug: Track when dependencies change
  useEffect(() => {
    console.log('📊 FILTER DEPENDENCIES CHANGED:', {
      selectedCategoriesLength: selectedCategories.length,
      selectedCategories: selectedCategories,
      searchQuery: searchQuery
    });
  }, [selectedCategories, searchQuery]);

  // Mobile detection effect
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-show itinerary sidebar on desktop when itinerary has items
      if (!mobile && itinerary.length > 0) {
        setShowItinerarySidebar(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [itinerary.length]);

  // Auto-show itinerary sidebar when items are added
  useEffect(() => {
    if (itinerary.length > 0 && !isMobile) {
      setShowItinerarySidebar(true);
      setItinerarySidebarCollapsed(false);
    } else if (itinerary.length === 0) {
      setShowItinerarySidebar(false);
      setItinerarySidebarCollapsed(true);
    }
  }, [itinerary.length, isMobile]);

  // Map initialization - using useLayoutEffect with direct ref access
  useLayoutEffect(() => {
    console.log('useLayoutEffect triggered, initialization state:', initializationRef.current);
    
    // Prevent double initialization
    if (initializationRef.current || map) {
      console.log('Map already initializing or initialized, skipping');
      return;
    }
    
    const mapElement = mapRef.current;
    if (!mapElement) {
      console.log('No map element in ref, waiting...');
      return;
    }

    console.log('Map element found!', {
      element: mapElement,
      tagName: mapElement.tagName,
      id: mapElement.id,
      offsetWidth: mapElement.offsetWidth,
      offsetHeight: mapElement.offsetHeight
    });

    // Check if element has dimensions
    if (mapElement.offsetWidth === 0 || mapElement.offsetHeight === 0) {
      console.log('Map element has no dimensions yet, will retry once...');
      
      const timer = setTimeout(() => {
        console.log('Single retry - checking dimensions again...');
        if (mapElement.offsetWidth > 0 && mapElement.offsetHeight > 0 && !initializationRef.current) {
          console.log('Element now has dimensions, initializing...');
          initializeMap();
        } else {
          console.log('Element still has no dimensions or already initializing');
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }

    console.log('Map element is ready! Initializing map...');
    initializeMap();

    async function initializeMap() {
      // Set initialization flag immediately
      initializationRef.current = true;
      
      try {
        console.log('=== STARTING MAP INITIALIZATION ===');
        setMapInitializing(true);
        setMapError(null);
        
        console.log('Waiting for Google Maps API...');
        
        // Wait for Google Maps to be loaded via script tag
        let attempts = 0;
        while (!window.google?.maps && attempts < 50) {
          console.log(`Attempt ${attempts + 1}: Waiting for Google Maps API...`);
          await new Promise(resolve => setTimeout(resolve, 200));
          attempts++;
        }

        if (!window.google?.maps) {
          throw new Error('Google Maps API failed to load after 10 seconds');
        }

        console.log('Google Maps API loaded! Creating map instance...');
        
        // Ensure the element still exists and has dimensions
        if (!mapElement || mapElement.offsetWidth === 0) {
          throw new Error('Map element became invalid during initialization');
        }
        
        const mapInstance = new google.maps.Map(mapElement, mapOptions);
        console.log('Map instance created:', mapInstance);
        
        // Wait for map to be ready
        await new Promise((resolve) => {
          const listener = mapInstance.addListener('idle', () => {
            console.log('Map is ready (idle event fired)');
            google.maps.event.removeListener(listener);
            resolve();
          });
          
          // Also resolve after a timeout as backup
          setTimeout(resolve, 3000);
        });
        
        console.log('=== MAP INITIALIZATION COMPLETE ===');
        setMap(mapInstance);
        setMapInitializing(false);
        console.log('Map state updated, should trigger marker creation');
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError(error.message);
        setMapInitializing(false);
        initializationRef.current = false; // Reset on error
      }
    }
  }, []); // Empty dependency array - only run once on mount

  // Update markers when map or filtered places change
  useEffect(() => {
    console.log('=== MARKER UPDATE EFFECT TRIGGERED ===');
    console.log('Effect dependencies:', {
      mapExists: !!map,
      filteredPlacesCount: filteredPlaces?.length,
      currentMarkersCount: markers.length
    });

    if (!map) {
      console.log('No map yet, skipping marker update');
      return;
    }
    
    if (!filteredPlaces || filteredPlaces.length === 0) {
      console.log('No filtered places, clearing markers');
      // Clear existing markers
      markers.forEach(marker => {
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
      });
      setMarkers([]);
      return;
    }

    console.log('Updating markers for', filteredPlaces.length, 'places');
    console.log('Current markers to clear:', markers.length);

    // Clear existing markers
    markers.forEach((marker, index) => {
      if (marker && marker.setMap) {
        console.log(`Clearing marker ${index}`);
        marker.setMap(null);
      }
    });

    console.log('Creating new markers...');
    const newMarkers = [];
    
    filteredPlaces.forEach((place, index) => {
      try {
        console.log(`Creating marker ${index + 1}/${filteredPlaces.length} for:`, place.name);
        const marker = createCustomMarker(
          map,
          place.position,
          place.category,
          () => {
            console.log('Marker clicked:', place.name);
            setSelectedPlace(place);
          }
        );
        if (marker) {
          newMarkers.push(marker);
          console.log(`✓ Marker created for ${place.name}`);
        } else {
          console.log(`✗ Failed to create marker for ${place.name}`);
        }
      } catch (error) {
        console.error('Error creating marker for place:', place.name, error);
      }
    });

    console.log(`Successfully created ${newMarkers.length} markers`);
    setMarkers(newMarkers);
    console.log('=== MARKER UPDATE COMPLETE ===');
  }, [map, filteredPlaces]); // Keep dependencies but add debugging

  // === PHASE 3: ITINERARY MANAGEMENT FUNCTIONS ===

  const handleAddToItinerary = (place) => {
    console.log('🎯 Adding place to itinerary:', place.name);
    
    setItinerary(prevItinerary => {
      const isAlreadyInItinerary = prevItinerary.some(item => item.id === place.id);
      
      if (isAlreadyInItinerary) {
        console.log('📍 Place already in itinerary:', place.name);
        return prevItinerary;
      }
      
      const newItinerary = [...prevItinerary, place];
      console.log('✅ Added to itinerary. New length:', newItinerary.length);
      return newItinerary;
    });
  };

  const handleRemoveFromItinerary = (placeId) => {
    console.log('🗑️ Removing place from itinerary, ID:', placeId);
    
    setItinerary(prevItinerary => {
      const newItinerary = prevItinerary.filter(item => item.id !== placeId);
      console.log('✅ Removed from itinerary. New length:', newItinerary.length);
      return newItinerary;
    });
  };

  const handleReorderItinerary = (newOrderedItinerary) => {
    console.log('🔄 Reordering itinerary to new order:', newOrderedItinerary.map(p => p.name));
    setItinerary(newOrderedItinerary);
  };

  const handleClearItinerary = () => {
    console.log('🧹 Clearing entire itinerary');
    setItinerary([]);
    setRouteInfo(null);
  };

  const isPlaceInItinerary = (place) => {
    return itinerary.some(item => item.id === place.id);
  };

  // === FILTER HANDLERS ===

  const handleCategoryChange = (categoryId, isSelected) => {
    console.log('🏷️ Category filter changed:', categoryId, isSelected);
    
    setSelectedCategories(prev => {
      if (isSelected) {
        // Add category if not already present
        return prev.includes(categoryId) ? prev : [...prev, categoryId];
      } else {
        // Remove category
        return prev.filter(id => id !== categoryId);
      }
    });
  };

  const handleSearchChange = (query) => {
    console.log('🔍 Search query changed:', query);
    setSearchQuery(query);
  };

  // === ITINERARY UI HANDLERS ===

  const handleToggleItinerarySidebar = () => {
    if (isMobile) {
      setItinerarySidebarCollapsed(!itinerarySidebarCollapsed);
    } else {
      setShowItinerarySidebar(!showItinerarySidebar);
    }
  };

  const handleTravelModeChange = (newTravelMode) => {
    console.log('🚗 Travel mode changed to:', newTravelMode);
    setTravelMode(newTravelMode);
  };

  const handleRouteUpdate = (newRouteInfo) => {
    console.log('🗺️ Route info updated:', newRouteInfo);
    setRouteInfo(newRouteInfo);
  };

  // === LAYOUT CALCULATIONS ===

  const getMapContainerStyle = () => {
    let width = '100%';
    
    if (!isMobile) {
      // Desktop: subtract sidebars
      const filterSidebarWidth = 320;
      const itinerarySidebarWidth = showItinerarySidebar ? 380 : 0;
      width = `calc(100% - ${filterSidebarWidth + itinerarySidebarWidth}px)`;
    }

    return {
      width,
      height: '100vh',
      position: 'relative',
      transition: 'width 0.3s ease'
    };
  };

  // Determine if itinerary sidebar should show
  const shouldShowItinerarySidebar = () => {
    if (isMobile) {
      return itinerary.length > 0;
    } else {
      return showItinerarySidebar;
    }
  };

  // === RENDER ===

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Left Sidebar - Filters - Always render */}
      <SidebarFilters
        filteredPlaces={filteredPlaces}
        totalPlaces={places.length}
        selectedCategories={selectedCategories}
        searchQuery={searchQuery}
        onCategoryChange={handleCategoryChange}
        onSearchChange={handleSearchChange}
        isMobile={isMobile}
      />

      {/* Main Map Container */}
      <div style={getMapContainerStyle()}>
        {/* Map Element - Always render */}
        <div 
          ref={mapRef}
          id="map-container"
          style={{ 
            width: '100%', 
            height: '100%',
            backgroundColor: '#f3f4f6'
          }}
        >
          {/* Loading State */}
          {mapInitializing && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              zIndex: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #059669',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px auto'
              }} />
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                Loading Ceylon Trails Map
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Connecting to Google Maps...
              </div>
            </div>
          )}

          {/* Error State */}
          {mapError && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              zIndex: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              maxWidth: '400px'
            }}>
              <div style={{ fontSize: '20px', marginBottom: '12px' }}>❌</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#dc2626', marginBottom: '8px' }}>
                Map Loading Failed
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                {mapError}
              </div>
              <button
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Reload Page
              </button>
            </div>
          )}

          {/* No Results Overlay */}
          {!mapInitializing && !mapError && filteredPlaces.length === 0 && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              zIndex: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '32px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              maxWidth: '400px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                No places found
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                Try adjusting your filters or search terms to discover amazing places in Sri Lanka.
              </div>
            </div>
          )}
        </div>

        {/* Desktop Itinerary Toggle Button - PHASE 3 */}
        {!isMobile && itinerary.length > 0 && !showItinerarySidebar && (
          <button
            onClick={handleToggleItinerarySidebar}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              zIndex: 20,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#047857';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#059669';
              e.target.style.transform = 'scale(1)';
            }}
          >
            <Calendar style={{ width: '24px', height: '24px' }} />
          </button>
        )}

        {/* Desktop Itinerary Counter - PHASE 3 */}
        {!isMobile && itinerary.length > 0 && !showItinerarySidebar && (
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '12px',
            backgroundColor: '#dc2626',
            color: 'white',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '700',
            zIndex: 21,
            pointerEvents: 'none'
          }}>
            {itinerary.length}
          </div>
        )}
      </div>

      {/* Route Overlay Component - PHASE 3 - Only render when we actually have map and need route */}
      {map && itinerary && itinerary.length >= 2 && (
        <RouteOverlay
          key={`route-${itinerary.length}-${travelMode}`}
          map={map}
          itinerary={itinerary}
          travelMode={travelMode}
          onRouteUpdate={handleRouteUpdate}
        />
      )}

      {/* Right Sidebar - Itinerary Builder - PHASE 3 - Only render when should show */}
      {shouldShowItinerarySidebar() && (
        <ItinerarySidebar
          key={`itinerary-${itinerary.length}-${showItinerarySidebar}`}
          itinerary={itinerary}
          onReorderItinerary={handleReorderItinerary}
          onRemoveFromItinerary={handleRemoveFromItinerary}
          onClearItinerary={handleClearItinerary}
          travelMode={travelMode}
          onTravelModeChange={handleTravelModeChange}
          routeInfo={routeInfo}
          isCollapsed={itinerarySidebarCollapsed}
          onToggleCollapsed={handleToggleItinerarySidebar}
          isMobile={isMobile}
        />
      )}

      {/* Place Details Panel - Only render when we have a selectedPlace */}
      {selectedPlace && (
        <PlaceDetailsPanel
          key={`place-${selectedPlace.id}`}
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
          onAddToItinerary={() => handleAddToItinerary(selectedPlace)}
          isInItinerary={isPlaceInItinerary(selectedPlace)}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};

export default MapContainer; 