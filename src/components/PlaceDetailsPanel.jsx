import { useEffect, useRef, useState } from 'react';
import { X, MapPin, Star, Clock, Phone, Globe, Navigation, AlertCircle, Plus, Check } from 'lucide-react';
import { getCategoryInfo } from '../data/places';

const PlaceDetailsPanel = ({ place, onClose, onAddToItinerary, isInItinerary, isMobile = false }) => {
  const placeOverviewRef = useRef(null);
  const directionsButtonRef = useRef(null);
  const [isUIKitLoaded, setIsUIKitLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const [componentStatus, setComponentStatus] = useState({
    overview: 'Not loaded',
    directions: 'Not loaded'
  });
  const [placeDetails, setPlaceDetails] = useState(null);
  const [useFallback, setUseFallback] = useState(false);
  const [useBasicInfo, setUseBasicInfo] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const categoryInfo = getCategoryInfo(place?.category);

  // Don't render if not shown or no place
  if (!place) {
    return null;
  }

  // Reset all states when place changes
  useEffect(() => {
    console.log('🔄 Place changed to:', place.name, 'ID:', place.placeId);
    
    // Force immediate reset of all states
    setIsUIKitLoaded(false);
    setLoadingError(null);
    setDebugInfo('Initializing...');
    setComponentStatus({
      overview: 'Not loaded',
      directions: 'Not loaded'
    });
    setPlaceDetails(null);
    setUseFallback(false);
    setUseBasicInfo(false);

    // Clear any existing content immediately
    if (placeOverviewRef.current) {
      placeOverviewRef.current.innerHTML = '';
      console.log('🧹 Cleared place overview content');
    }
    if (directionsButtonRef.current) {
      directionsButtonRef.current.innerHTML = '';
      console.log('🧹 Cleared directions button content');
    }

    const loadPlacesUIKit = async () => {
      try {
        setDebugInfo('Starting Places UI Kit loading...');
        console.log('🚀 Loading Places UI Kit for place:', place.name, 'Place ID:', place.placeId);
        
        // Wait for Google Maps API to be ready
        let attempts = 0;
        while (!window.google?.maps && attempts < 50) {
          console.log(`Attempt ${attempts + 1}: Waiting for Google Maps API...`);
          setDebugInfo(`Waiting for Google Maps API... (${attempts + 1}/50)`);
          await new Promise(resolve => setTimeout(resolve, 200));
          attempts++;
        }

        if (!window.google?.maps) {
          throw new Error('Google Maps API failed to load after 10 seconds');
        }

        setDebugInfo('Google Maps API loaded, trying Extended Components...');
        console.log('Google Maps API loaded, trying Extended Components...');

        // Skip Extended Components for now and go directly to Google Places API
        // which is working reliably
        console.log('🚀 Skipping Extended Components, using reliable Google Places API directly');
        setDebugInfo('Using Google Places API for reliable data loading...');
        
        try {
          await usePlacesAPIFallback();
          console.log('✅ Data loading completed successfully');
        } catch (error) {
          console.log('❌ All data loading methods failed, showing basic info');
          setDebugInfo('All APIs failed, showing basic place information...');
          setUseBasicInfo(true);
          setUseFallback(true);
          setComponentStatus({
            overview: 'Showing basic info',
            directions: 'Basic directions available'
          });
        }

        /* 
        // Extended Components code - disabled for now as it's not loading data reliably
        // Try Extended Component Library first
        if (window.extendedComponentsReady) {
          console.log('Debug: Extended Components are ready, trying to use them...');
          // Set a shorter timeout for Extended Components
          setTimeout(() => {
            if (!useFallback && !useBasicInfo) {
              console.log('Debug: Extended Components taking too long, forcing fallback after 1 second');
              setDebugInfo('Extended Components slow, switching to Google Places API...');
              usePlacesAPIFallback();
            }
          }, 1000); // Force fallback after just 1 second
          
          await tryExtendedComponents();
        } else {
          // Wait a bit for Extended Components or use fallback
          console.log('Debug: Extended Components not ready, waiting...');
          attempts = 0;
          while (!window.extendedComponentsReady && !window.extendedComponentsError && attempts < 5) { // Reduced from 15 to 5
            console.log(`Debug: Attempt ${attempts + 1}: Waiting for Extended Component Library...`);
            setDebugInfo(`Waiting for Extended Component Library... (${attempts + 1}/5)`);
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
          }
          
          if (window.extendedComponentsReady) {
            console.log('Debug: Extended Components loaded after waiting, trying to use them...');
            // Still set timeout for fallback
            setTimeout(() => {
              if (!useFallback && !useBasicInfo) {
                console.log('Debug: Extended Components timeout after waiting, forcing fallback');
                usePlacesAPIFallback();
              }
            }, 1000);
            await tryExtendedComponents();
          } else {
            console.log('Debug: Extended Components not available after waiting, using fallback immediately');
            setDebugInfo('Extended Components not available, using Google Places API fallback...');
            await usePlacesAPIFallback();
          }
        }

        // If Extended Components failed or didn't load, use fallback
        if (!window.extendedComponentsReady || window.extendedComponentsError) {
          if (!useFallback && !useBasicInfo) { // Only if we haven't already tried fallback
            console.log('Debug: Extended Components failed, trying Places API fallback...');
            setDebugInfo('Extended Components not available, using Google Places API fallback...');
            await usePlacesAPIFallback();
          }
        }
        */

        setIsUIKitLoaded(true);
        
      } catch (error) {
        console.error('❌ Error loading Places UI Kit:', error);
        setDebugInfo(`Error: ${error.message}`);
        
        // Try fallback on error
        try {
          setDebugInfo('Error occurred, trying Google Places API fallback...');
          await usePlacesAPIFallback();
          setIsUIKitLoaded(true);
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError);
          setDebugInfo('All APIs failed, showing basic place information...');
          setUseBasicInfo(true);
          setUseFallback(true);
          setIsUIKitLoaded(true);
          setComponentStatus({
            overview: 'Showing basic info',
            directions: 'Basic directions available'
          });
        }
      }
    };

    const tryExtendedComponents = async () => {
      setDebugInfo('Debug: Trying Extended Component Library...');
      console.log('Debug: Trying Extended Component Library for place:', place.name, 'ID:', place.placeId);
      
      // Create Place Overview component
      if (placeOverviewRef.current) {
        console.log('Debug: Creating gmp-place-overview element for:', place.name);
        setComponentStatus(prev => ({ ...prev, overview: 'Creating...' }));
        
        // Clear and create new element
        placeOverviewRef.current.innerHTML = '';
        const placeOverview = document.createElement('gmp-place-overview');
        placeOverview.setAttribute('place', place.placeId);
        placeOverview.setAttribute('size', 'large');
        placeOverview.style.width = '100%';
        placeOverview.style.minHeight = '200px';
        
        // Add event listeners
        placeOverview.addEventListener('gmp-placeresult', (event) => {
          console.log('✅ Place overview loaded successfully for', place.name, ':', event.detail);
          setDebugInfo(`✅ Extended Components working! Place overview loaded for ${place.name}!`);
          setComponentStatus(prev => ({ ...prev, overview: 'Loaded with data' }));
        });
        
        placeOverview.addEventListener('gmp-error', (event) => {
          console.error('❌ Place overview error for', place.name, ':', event.detail);
          setDebugInfo(`❌ Extended Components error: ${event.detail?.message || 'Unknown error'}`);
          setComponentStatus(prev => ({ ...prev, overview: 'Error: ' + (event.detail?.message || 'Unknown') }));
          console.log('Falling back to Google Places API...');
          usePlacesAPIFallback().catch(() => {
            console.log('Places API also failed, using basic info');
            setUseBasicInfo(true);
            setUseFallback(true);
          });
        });

        placeOverviewRef.current.appendChild(placeOverview);
        console.log('Debug: gmp-place-overview element added to DOM');
        
        // Immediate check if the element has the place attribute set
        console.log('Debug: Immediate check - place attribute set:', placeOverview.getAttribute('place'));
        
        // Show some immediate feedback
        setDebugInfo(`Loading ${place.name} via Extended Components...`);
        
        // Check if component rendered after a reasonable delay
        setTimeout(() => {
          console.log('Debug: Checking if Extended Component rendered content...');
          const hasContent = placeOverview.shadowRoot || placeOverview.children.length > 0;
          const hasAttribute = placeOverview.hasAttribute('place');
          
          console.log('Debug: Content check:', {
            hasContent,
            hasAttribute,
            shadowRoot: !!placeOverview.shadowRoot,
            childrenCount: placeOverview.children.length,
            placeId: placeOverview.getAttribute('place')
          });
          
          if (hasContent || hasAttribute) {
            console.log('✅ Component appears to be working');
            setComponentStatus(prev => ({ ...prev, overview: 'Component rendered' }));
            setDebugInfo(`Extended Component appears to be working for ${place.name}`);
          } else {
            console.log('❌ No content rendered for', place.name, 'after 2 seconds, trying fallback');
            setComponentStatus(prev => ({ ...prev, overview: 'No content rendered - using fallback' }));
            setDebugInfo(`No content after 2s for ${place.name}, trying fallback...`);
            // Use fallback if no content after 2 seconds (faster!)
            usePlacesAPIFallback().catch(() => {
              console.log('All methods failed, showing basic info');
              setUseBasicInfo(true);
              setUseFallback(true);
            });
          }
        }, 2000); // Reduced from 5 seconds to 2 seconds
        
        // Additional check - if no success event after 3 seconds, force fallback
        setTimeout(() => {
          if (!useFallback && !useBasicInfo && componentStatus.overview !== 'Loaded with data') {
            console.log('❌ Extended Component did not load data after 3s, forcing fallback');
            setDebugInfo(`Extended Component timeout for ${place.name}, using fallback...`);
            usePlacesAPIFallback().catch(() => {
              console.log('Fallback also failed, showing basic info');
              setUseBasicInfo(true);
              setUseFallback(true);
            });
          }
        }, 3000);
      }

      // Create Directions Button
      if (directionsButtonRef.current) {
        console.log('Debug: Creating gmp-place-directions-button element for:', place.name);
        setComponentStatus(prev => ({ ...prev, directions: 'Creating...' }));
        
        directionsButtonRef.current.innerHTML = '';
        const directionsButton = document.createElement('gmp-place-directions-button');
        directionsButton.setAttribute('place', place.placeId);
        directionsButton.style.width = '100%';
        
        setTimeout(() => {
          const hasContent = directionsButton.shadowRoot || directionsButton.children.length > 0;
          console.log('Debug: Directions button content check:', {
            hasContent,
            shadowRoot: !!directionsButton.shadowRoot,
            childrenCount: directionsButton.children.length
          });
          
          if (hasContent) {
            setComponentStatus(prev => ({ ...prev, directions: 'Button rendered' }));
            console.log('✅ Directions button rendered successfully');
          } else {
            setComponentStatus(prev => ({ ...prev, directions: 'No button rendered - creating fallback' }));
            console.log('❌ No directions button rendered, creating fallback');
            // Create fallback directions button
            createFallbackDirectionsButton();
          }
        }, 3000);
        
        directionsButtonRef.current.appendChild(directionsButton);
        console.log('Debug: gmp-place-directions-button element added to DOM');
      }
    };

    const usePlacesAPIFallback = async () => {
      console.log('🔄 Starting Google Places API fallback for:', place.name);
      setDebugInfo(`Loading place details for ${place.name} using Google Places API...`);
      setUseFallback(true);
      
      return new Promise((resolve, reject) => {
        const service = new google.maps.places.PlacesService(document.createElement('div'));
        
        const request = {
          placeId: place.placeId,
          fields: [
            // Basic information
            'name', 'formatted_address', 'formatted_phone_number', 'international_phone_number',
            'website', 'rating', 'user_ratings_total', 'opening_hours', 'price_level',
            
            // Enhanced location details
            'plus_code', 'geometry', 'vicinity', 'adr_address',
            
            // Rich content
            'photos', 'reviews', 'types',
            
            // Additional details
            'business_status', 'permanently_closed', 'wheelchair_accessible_entrance',
            'serves_breakfast', 'serves_lunch', 'serves_dinner', 'serves_beer', 'serves_wine',
            'takeout', 'delivery', 'dine_in', 'reservations', 'serves_vegetarian_food',
            
            // Timing and popularity
            'current_opening_hours', 'secondary_opening_hours',
            
            // Additional contact
            'editorial_summary', 'url'
          ]
        };

        console.log('🔍 Trying Google Places API with Place ID:', place.placeId);
        service.getDetails(request, (result, status) => {
          console.log('📊 Google Places API response:', { status, result: !!result });
          
          if (status === google.maps.places.PlacesServiceStatus.OK && result) {
            console.log('✅ Place details loaded successfully for', place.name, ':', result);
            setPlaceDetails(result);
            setDebugInfo(`✅ Google Places API successful for ${place.name}!`);
            setComponentStatus(prev => ({ 
              ...prev, 
              overview: 'Loaded via Places API',
              directions: 'Fallback button created'
            }));
            createFallbackDirectionsButton();
            resolve(result);
          } else {
            console.log('❌ Places API failed for', place.name, 'Status:', status);
            
            // Always try text search if Places API fails (any failure, not just NOT_FOUND)
            setDebugInfo(`Places API failed (${status}), trying text search for ${place.name}...`);
            console.log('🔄 Attempting text search fallback...');
            tryTextSearch(resolve, reject);
          }
        });
      });
    };

    const tryTextSearch = (resolve, reject) => {
      console.log('🔍 Starting text search for:', place.name);
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      
      // Try multiple search queries for better results
      const searchQueries = [
        `${place.name} Sri Lanka`,
        `${place.name} ${place.category} Sri Lanka`,
        place.name,
        `${place.name} tourism Sri Lanka`
      ];
      
      let queryIndex = 0;
      
      const tryNextQuery = () => {
        if (queryIndex >= searchQueries.length) {
          console.log('❌ All text search queries failed for', place.name);
          // If all searches fail, ALWAYS use basic info instead of rejecting
          console.log('🔄 Falling back to basic info for', place.name);
          setDebugInfo(`Using basic information for ${place.name}`);
          setUseBasicInfo(true);
          setComponentStatus(prev => ({ 
            ...prev, 
            overview: 'Using basic information',
            directions: 'Basic directions available'
          }));
          createFallbackDirectionsButton();
          resolve({ name: place.name, basic: true });
          return;
        }
        
        const query = searchQueries[queryIndex];
        console.log(`🔍 Text search attempt ${queryIndex + 1}/${searchQueries.length}: "${query}"`);
        setDebugInfo(`Text search attempt ${queryIndex + 1}: "${query}"`);
        
        const request = {
          query: query,
          fields: [
            // Basic information
            'name', 'formatted_address', 'formatted_phone_number', 'international_phone_number',
            'website', 'rating', 'user_ratings_total', 'opening_hours', 'price_level',
            
            // Enhanced location details
            'plus_code', 'geometry', 'vicinity', 'adr_address', 'place_id',
            
            // Rich content
            'photos', 'reviews', 'types',
            
            // Additional details
            'business_status', 'permanently_closed', 'wheelchair_accessible_entrance',
            'serves_breakfast', 'serves_lunch', 'serves_dinner', 'serves_beer', 'serves_wine',
            'takeout', 'delivery', 'dine_in', 'reservations', 'serves_vegetarian_food',
            
            // Timing and popularity
            'current_opening_hours', 'secondary_opening_hours',
            
            // Additional contact
            'editorial_summary', 'url'
          ]
        };

        service.textSearch(request, (results, status) => {
          console.log(`📊 Text search ${queryIndex + 1} response:`, { 
            status, 
            resultsCount: results?.length || 0,
            query 
          });
          
          if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
            const result = results[0];
            console.log('✅ Text search found place for', place.name, ':', result);
            setPlaceDetails(result);
            setDebugInfo(`✅ Found ${place.name} via text search!`);
            setComponentStatus(prev => ({ 
              ...prev, 
              overview: 'Found via text search',
              directions: 'Text search directions'
            }));
            createFallbackDirectionsButton(result.place_id);
            resolve(result);
          } else {
            console.log(`❌ Text search ${queryIndex + 1} failed:`, status);
            queryIndex++;
            // Try next query after a short delay
            setTimeout(tryNextQuery, 300);
          }
        });
      };
      
      tryNextQuery();
    };

    const createFallbackDirectionsButton = (alternativePlaceId = null) => {
      if (directionsButtonRef.current) {
        const placeIdToUse = alternativePlaceId || place.placeId;
        directionsButtonRef.current.innerHTML = `
          <button 
            onclick="window.open('https://www.google.com/maps/search/${encodeURIComponent(place.name + ' Sri Lanka')}', '_blank')"
            style="
              width: 100%;
              background-color: #1a73e8;
              color: white;
              border: none;
              padding: 12px 16px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 500;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            "
          >
            <span>🧭</span>
            Get Directions to ${place.name}
          </button>
        `;
        setComponentStatus(prev => ({ ...prev, directions: 'Fallback button created' }));
      }
    };

    // Start loading with a slight delay to ensure DOM is ready and previous content is cleared
    const timer = setTimeout(loadPlacesUIKit, 100); // Reduced from 500ms to 100ms for faster loading
    
    // Cleanup function
    return () => {
      clearTimeout(timer);
      console.log('🧹 Cleaning up for place:', place.name);
    };
  }, [place.placeId]); // Use place.placeId as dependency instead of entire place object

  // Handle Add to Itinerary
  const handleAddToItinerary = () => {
    if (isInItinerary) {
      setToastMessage(`${place.name} is already in your itinerary`);
    } else {
      onAddToItinerary(place);
      setToastMessage(`${place.name} added to itinerary!`);
    }
    
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getCategoryColor = (colorName) => {
    const colorMap = {
      'ceylon-orange': '#ea580c',
      'ceylon-red': '#dc2626',
      'ceylon-green': '#059669',
      'ceylon-purple': '#7c3aed',
      'ceylon-blue': '#1e40af',
      'blue-500': '#3b82f6'
    };
    return colorMap[colorName] || '#6b7280';
  };

  const renderBasicPlaceInfo = () => {
    return (
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        backgroundColor: '#fffbeb',
        borderColor: '#f59e0b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <AlertCircle style={{ width: '18px', height: '18px', color: '#d97706' }} />
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#92400e' }}>
            Basic Information Available
          </span>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
            {place.name}
          </h4>
          <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.6' }}>
            {place.description}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
          <MapPin style={{ width: '18px', height: '18px', color: '#6b7280', marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
              Coordinates: {place.position.lat.toFixed(4)}, {place.position.lng.toFixed(4)}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
              Category: {categoryInfo?.name}
            </div>
          </div>
        </div>

        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#92400e',
          fontStyle: 'italic'
        }}>
          Google Places data unavailable. Showing curated information about this location.
        </div>
      </div>
    );
  };

  const renderEnhancedPlaceDetails = () => {
    if (!placeDetails) return null;

    // Helper function to copy text to clipboard
    const copyToClipboard = (text, label) => {
      navigator.clipboard.writeText(text).then(() => {
        setToastMessage(`${label} copied to clipboard!`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      });
    };

    // Helper function to format price level
    const formatPriceLevel = (level) => {
      if (!level) return null;
      const symbols = ['Free', '$', '$$', '$$$', '$$$$'];
      return symbols[level] || 'Unknown';
    };

    // Helper function to format place types
    const formatPlaceTypes = (types) => {
      if (!types || !types.length) return null;
      return types
        .filter(type => !['establishment', 'point_of_interest'].includes(type))
        .map(type => type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
        .slice(0, 3)
        .join(', ');
    };

    return (
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        backgroundColor: '#ffffff'
      }}>
        {/* Photo Gallery with multiple images */}
        {placeDetails.photos && placeDetails.photos.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
              📸 Photos ({placeDetails.photos.length})
            </h5>
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              overflowX: 'auto', 
              paddingBottom: '8px'
            }}>
              {placeDetails.photos.slice(0, 5).map((photo, index) => (
                <img 
                  key={index}
                  src={photo.getUrl({ maxWidth: 200, maxHeight: 150 })}
                  alt={`${placeDetails.name} photo ${index + 1}`}
                  onError={(e) => {
                    console.log(`❌ Photo ${index + 1} failed to load`);
                    e.target.style.display = 'none';
                  }}
                  style={{
                    width: index === 0 ? '240px' : '160px',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    backgroundColor: '#f3f4f6',
                    flexShrink: 0,
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Editorial Summary */}
        {placeDetails.editorial_summary && (
          <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              ℹ️ About This Place
            </h5>
            <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.5', margin: 0 }}>
              {placeDetails.editorial_summary.overview}
            </p>
          </div>
        )}

        {/* Rating and Reviews Summary */}
        {placeDetails.rating && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Star style={{ width: '20px', height: '20px', color: '#fbbf24', fill: '#fbbf24' }} />
                <span style={{ fontWeight: '700', fontSize: '18px', color: '#1f2937' }}>{placeDetails.rating}</span>
              </div>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>
                ({placeDetails.user_ratings_total || 0} reviews)
              </span>
              {placeDetails.price_level && (
                <span style={{ 
                  backgroundColor: '#f3f4f6', 
                  color: '#374151', 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '12px', 
                  fontWeight: '600' 
                }}>
                  {formatPriceLevel(placeDetails.price_level)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Place Types and Categories */}
        {placeDetails.types && (
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              🎯 Categories
            </h5>
            <div style={{ fontSize: '14px', color: '#4b5563' }}>
              {formatPlaceTypes(placeDetails.types)}
            </div>
          </div>
        )}

        {/* Enhanced Contact Information */}
        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
            📍 Contact & Location
          </h5>
          
          {/* Address */}
          {placeDetails.formatted_address && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
              <MapPin style={{ width: '16px', height: '16px', color: '#6b7280', marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>
                  {placeDetails.formatted_address}
                </span>
                <button
                  onClick={() => copyToClipboard(placeDetails.formatted_address, 'Address')}
                  style={{
                    marginLeft: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#059669',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  📋 Copy
                </button>
              </div>
            </div>
          )}

          {/* Plus Code */}
          {placeDetails.plus_code && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>📍 Plus Code:</span>
              <code style={{ 
                fontSize: '13px', 
                backgroundColor: '#f3f4f6', 
                padding: '2px 6px', 
                borderRadius: '4px',
                fontFamily: 'monospace'
              }}>
                {placeDetails.plus_code.global_code}
              </code>
              <button
                onClick={() => copyToClipboard(placeDetails.plus_code.global_code, 'Plus Code')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#059669',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                📋
              </button>
            </div>
          )}

          {/* Coordinates */}
          {placeDetails.geometry && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>🗺️ Coordinates:</span>
              <code style={{ 
                fontSize: '13px', 
                backgroundColor: '#f3f4f6', 
                padding: '2px 6px', 
                borderRadius: '4px',
                fontFamily: 'monospace'
              }}>
                {placeDetails.geometry.location.lat().toFixed(6)}, {placeDetails.geometry.location.lng().toFixed(6)}
              </code>
              <button
                onClick={() => copyToClipboard(
                  `${placeDetails.geometry.location.lat()}, ${placeDetails.geometry.location.lng()}`,
                  'Coordinates'
                )}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#059669',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                📋
              </button>
            </div>
          )}

          {/* Phone Numbers */}
          {(placeDetails.formatted_phone_number || placeDetails.international_phone_number) && (
            <div style={{ marginBottom: '12px' }}>
              {placeDetails.formatted_phone_number && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <Phone style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>
                    {placeDetails.formatted_phone_number}
                  </span>
                  <a 
                    href={`tel:${placeDetails.formatted_phone_number}`}
                    style={{ color: '#059669', fontSize: '12px', textDecoration: 'none' }}
                  >
                    📞 Call
                  </a>
                </div>
              )}
              
              {placeDetails.international_phone_number && placeDetails.international_phone_number !== placeDetails.formatted_phone_number && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <Globe style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>
                    {placeDetails.international_phone_number}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>(International)</span>
                </div>
              )}
            </div>
          )}

          {/* Website */}
          {placeDetails.website && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Globe style={{ width: '16px', height: '16px', color: '#6b7280' }} />
              <a 
                href={placeDetails.website} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ fontSize: '14px', color: '#1e40af', textDecoration: 'none', fontWeight: '500' }}
              >
                🌐 Visit Website
              </a>
            </div>
          )}
        </div>

        {/* Services and Amenities */}
        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
            🏪 Services & Amenities
          </h5>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {placeDetails.dine_in && (
              <span style={{ fontSize: '12px', backgroundColor: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '12px' }}>
                🍽️ Dine In
              </span>
            )}
            {placeDetails.takeout && (
              <span style={{ fontSize: '12px', backgroundColor: '#ddd6fe', color: '#5b21b6', padding: '4px 8px', borderRadius: '12px' }}>
                🥡 Takeout
              </span>
            )}
            {placeDetails.delivery && (
              <span style={{ fontSize: '12px', backgroundColor: '#fed7d7', color: '#c53030', padding: '4px 8px', borderRadius: '12px' }}>
                🚚 Delivery
              </span>
            )}
            {placeDetails.reservations && (
              <span style={{ fontSize: '12px', backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '12px' }}>
                📅 Reservations
              </span>
            )}
            {placeDetails.serves_vegetarian_food && (
              <span style={{ fontSize: '12px', backgroundColor: '#d1fae5', color: '#065f46', padding: '4px 8px', borderRadius: '12px' }}>
                🌱 Vegetarian
              </span>
            )}
            {placeDetails.wheelchair_accessible_entrance && (
              <span style={{ fontSize: '12px', backgroundColor: '#e0e7ff', color: '#3730a3', padding: '4px 8px', borderRadius: '12px' }}>
                ♿ Accessible
              </span>
            )}
            {(placeDetails.serves_beer || placeDetails.serves_wine) && (
              <span style={{ fontSize: '12px', backgroundColor: '#fde68a', color: '#92400e', padding: '4px 8px', borderRadius: '12px' }}>
                🍷 Alcohol
              </span>
            )}
          </div>
        </div>

        {/* Enhanced Opening Hours */}
        {placeDetails.opening_hours && (
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
              🕒 Opening Hours
            </h5>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: '600',
                color: placeDetails.opening_hours.open_now ? '#059669' : '#dc2626'
              }}>
                {placeDetails.opening_hours.open_now ? '🟢 Open now' : '🔴 Closed'}
              </span>
            </div>
            
            {placeDetails.opening_hours.weekday_text && (
              <details style={{ fontSize: '13px', color: '#6b7280' }}>
                <summary style={{ cursor: 'pointer', fontWeight: '500', marginBottom: '8px' }}>
                  📅 Full Schedule
                </summary>
                <div style={{ paddingLeft: '16px', lineHeight: '1.6' }}>
                  {placeDetails.opening_hours.weekday_text.map((hours, index) => (
                    <div key={index} style={{ marginBottom: '4px' }}>
                      {hours}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        {/* Recent Reviews */}
        {placeDetails.reviews && placeDetails.reviews.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
              ⭐ Recent Reviews ({placeDetails.reviews.length})
            </h5>
            {placeDetails.reviews.slice(0, 3).map((review, index) => (
              <div key={index} style={{ 
                marginBottom: '16px', 
                padding: '12px', 
                backgroundColor: '#f9fafb', 
                borderRadius: '8px',
                borderLeft: '3px solid #059669'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        style={{
                          width: '12px',
                          height: '12px',
                          color: i < review.rating ? '#fbbf24' : '#e5e7eb',
                          fill: i < review.rating ? '#fbbf24' : '#e5e7eb'
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                    {review.author_name}
                  </span>
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>
                    {review.relative_time_description}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.4', margin: 0 }}>
                  {review.text.length > 150 ? `${review.text.substring(0, 150)}...` : review.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Success indicator */}
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#059669',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>✅</span>
          <span>Enhanced data from {placeDetails.place_id ? 'Google Places API' : 'Text Search'}</span>
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#6b7280' }}>
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    );
  };

  const renderFallbackPlaceDetails = () => {
    if (!placeDetails) return null;

    return (
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        backgroundColor: '#ffffff'
      }}>
        {/* Photos with error handling */}
        {placeDetails.photos && placeDetails.photos.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <img 
              src={placeDetails.photos[0].getUrl({ maxWidth: 400, maxHeight: 200 })}
              alt={placeDetails.name || place.name}
              onError={(e) => {
                console.log('❌ Image failed to load, hiding image container');
                e.target.style.display = 'none';
                // Try with different size parameters
                try {
                  const fallbackUrl = placeDetails.photos[0].getUrl({ maxWidth: 300, maxHeight: 150 });
                  if (fallbackUrl !== e.target.src) {
                    e.target.src = fallbackUrl;
                    e.target.style.display = 'block';
                    console.log('🔄 Trying fallback image URL');
                  }
                } catch (error) {
                  console.log('❌ Fallback image also failed');
                  e.target.parentElement.style.display = 'none';
                }
              }}
              onLoad={() => {
                console.log('✅ Image loaded successfully for', placeDetails.name || place.name);
              }}
              style={{
                width: '100%',
                height: '180px',
                objectFit: 'cover',
                borderRadius: '10px',
                backgroundColor: '#f3f4f6' // Background color while loading
              }}
            />
          </div>
        )}

        {/* Rating */}
        {placeDetails.rating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Star style={{ width: '18px', height: '18px', color: '#fbbf24', fill: '#fbbf24' }} />
            <span style={{ fontWeight: '600', fontSize: '16px' }}>{placeDetails.rating}</span>
            <span style={{ color: '#6b7280', fontSize: '14px' }}>
              ({placeDetails.user_ratings_total} reviews)
            </span>
          </div>
        )}

        {/* Address */}
        {placeDetails.formatted_address && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
            <MapPin style={{ width: '18px', height: '18px', color: '#6b7280', marginTop: '2px' }} />
            <span style={{ fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>
              {placeDetails.formatted_address}
            </span>
          </div>
        )}

        {/* Phone */}
        {placeDetails.formatted_phone_number && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Phone style={{ width: '18px', height: '18px', color: '#6b7280' }} />
            <span style={{ fontSize: '14px', color: '#374151' }}>{placeDetails.formatted_phone_number}</span>
          </div>
        )}

        {/* Website */}
        {placeDetails.website && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Globe style={{ width: '18px', height: '18px', color: '#6b7280' }} />
            <a 
              href={placeDetails.website} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ fontSize: '14px', color: '#1e40af', textDecoration: 'none', fontWeight: '500' }}
            >
              Visit Website
            </a>
          </div>
        )}

        {/* Opening Hours */}
        {placeDetails.opening_hours && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
            <Clock style={{ width: '18px', height: '18px', color: '#6b7280', marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                {placeDetails.opening_hours.open_now ? (
                  <span style={{ color: '#059669' }}>Open now</span>
                ) : (
                  <span style={{ color: '#dc2626' }}>Closed</span>
                )}
              </div>
              {placeDetails.opening_hours.weekday_text && (
                <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.4' }}>
                  {placeDetails.opening_hours.weekday_text.slice(0, 3).map((hours, index) => (
                    <div key={index}>{hours}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success indicator */}
        <div style={{
          padding: '8px 12px',
          backgroundColor: '#f0fdf4',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#059669',
          fontWeight: '500',
          marginTop: '16px'
        }}>
          ✅ Data loaded via {placeDetails.place_id ? 'Google Places API' : 'Text Search'}
        </div>
      </div>
    );
  };

  const panelStyle = isMobile ? {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    boxShadow: '0 -10px 25px -5px rgba(0, 0, 0, 0.1), 0 -4px 6px -2px rgba(0, 0, 0, 0.05)',
    maxHeight: '85vh',
    overflowY: 'auto',
    fontFamily: 'Arial, sans-serif',
    zIndex: 1000
  } : {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '420px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: '1px solid #e5e7eb',
    maxHeight: 'calc(100vh - 32px)',
    overflowY: 'auto',
    fontFamily: 'Arial, sans-serif'
  };

  return (
    <>
      <div style={panelStyle}>
        {/* Enhanced Header */}
        <div style={{
          padding: isMobile ? '20px 20px 16px 20px' : '24px',
          borderBottom: '1px solid #e5e7eb',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          borderRadius: isMobile ? '20px 20px 0 0' : '16px 16px 0 0',
          zIndex: 10
        }}>
          {/* Mobile handle */}
          {isMobile && (
            <div style={{
              width: '36px',
              height: '4px',
              backgroundColor: '#d1d5db',
              borderRadius: '2px',
              margin: '0 auto 16px auto'
            }} />
          )}
          
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              {/* Category Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  backgroundColor: `${getCategoryColor(categoryInfo?.color)}20`,
                  borderRadius: '20px',
                  border: `1px solid ${getCategoryColor(categoryInfo?.color)}40`
                }}>
                  <span style={{ fontSize: '18px' }}>{categoryInfo?.icon}</span>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: getCategoryColor(categoryInfo?.color)
                  }}>
                    {categoryInfo?.name}
                  </span>
                </div>
              </div>
              
              {/* Place Name */}
              <h2 style={{
                fontSize: isMobile ? '22px' : '24px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '8px',
                lineHeight: '1.2'
              }}>
                {place.name}
              </h2>
              
              {/* Description */}
              <p style={{
                color: '#6b7280',
                fontSize: '15px',
                marginBottom: '8px',
                lineHeight: '1.5'
              }}>
                {place.description}
              </p>
              
              {/* Place ID (for debugging) */}
              <p style={{
                color: '#9ca3af',
                fontSize: '11px',
                fontFamily: 'monospace',
                opacity: 0.7
              }}>
                ID: {place.placeId}
              </p>
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                marginLeft: '16px',
                padding: '8px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            >
              <X style={{ height: '20px', width: '20px', color: '#6b7280' }} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: isMobile ? '20px' : '24px' }}>
          {/* Coordinates Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
            padding: '12px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px'
          }}>
            <MapPin style={{ height: '18px', width: '18px', color: '#6b7280' }} />
            <span style={{ fontSize: '14px', color: '#374151' }}>
              {place.position.lat.toFixed(4)}, {place.position.lng.toFixed(4)}
            </span>
          </div>

          {/* Debug Info (only show in development) */}
          {debugInfo && process.env.NODE_ENV === 'development' && (
            <div style={{
              padding: '12px',
              backgroundColor: '#f0f9ff',
              border: '1px solid #0ea5e9',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <p style={{ color: '#0c4a6e', fontSize: '12px', margin: 0 }}>
                Status: {debugInfo}
              </p>
            </div>
          )}

          {/* Manual Fallback Button - Only show if actually stuck loading */}
          {!isUIKitLoaded && !debugInfo.includes('Google Places API') && debugInfo.includes('Extended Components') && (
            <div style={{
              padding: '16px',
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#92400e', fontSize: '14px', marginBottom: '12px' }}>
                Taking longer than expected to load place data...
              </p>
              <button
                onClick={() => {
                  console.log('Manual fallback triggered by user');
                  setDebugInfo('Loading via Google Places API (manual trigger)...');
                  usePlacesAPIFallback();
                }}
                style={{
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Load Place Data Now
              </button>
            </div>
          )}

          {/* Loading State */}
          {!isUIKitLoaded && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#6b7280'
            }}>
              <div style={{
                border: '3px solid #f3f4f6',
                borderTop: '3px solid #1e40af',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ fontSize: '14px' }}>Loading place details for {place.name}...</p>
              <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                Using Google Places API for reliable data
              </p>
            </div>
          )}
          
          {/* Place Content */}
          {isUIKitLoaded && (
            <>
              {/* Place Details Section */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                  {useBasicInfo ? 'Basic Place Information' : 'Google Places Details'}
                </h4>
                
                {useBasicInfo ? (
                  renderBasicPlaceInfo()
                ) : useFallback && placeDetails ? (
                  renderEnhancedPlaceDetails()
                ) : (
                  <div 
                    ref={placeOverviewRef}
                    style={{
                      minHeight: '200px',
                      border: '2px dashed #e5e7eb',
                      borderRadius: '12px',
                      padding: '20px',
                      backgroundColor: '#fafafa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#9ca3af',
                      fontSize: '14px'
                    }}
                  >
                    Loading Google Places data...
                  </div>
                )}
              </div>
              
              {/* Directions Section */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                  Directions
                </h4>
                <div 
                  ref={directionsButtonRef}
                  style={{
                    border: (useFallback || useBasicInfo) ? 'none' : '2px dashed #e5e7eb',
                    borderRadius: '8px',
                    padding: (useFallback || useBasicInfo) ? '0' : '12px',
                    backgroundColor: (useFallback || useBasicInfo) ? 'transparent' : '#fafafa'
                  }}
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div style={{
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: '12px',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            {/* Add to Itinerary Button */}
            <button 
              onClick={handleAddToItinerary}
              disabled={isInItinerary}
              style={{
                flex: 1,
                backgroundColor: isInItinerary ? '#10b981' : '#059669',
                color: 'white',
                padding: '14px 20px',
                borderRadius: '10px',
                border: 'none',
                cursor: isInItinerary ? 'default' : 'pointer',
                fontWeight: '600',
                fontSize: '15px',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isInItinerary ? 0.9 : 1
              }}
              onMouseEnter={(e) => {
                if (!isInItinerary) {
                  e.target.style.backgroundColor = '#047857';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isInItinerary) {
                  e.target.style.backgroundColor = '#059669';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {isInItinerary ? (
                <>
                  <Check style={{ width: '18px', height: '18px' }} />
                  Added to Itinerary
                </>
              ) : (
                <>
                  <Plus style={{ width: '18px', height: '18px' }} />
                  Add to Itinerary
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: isMobile ? '120px' : '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#1f2937',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          zIndex: 10000,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          animation: 'fadeInOut 3s ease-in-out'
        }}>
          {toastMessage}
        </div>
      )}
    </>
  );
};

export default PlaceDetailsPanel; 