import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Clock, 
  Route, 
  Share2, 
  Copy, 
  Check,
  AlertCircle,
  Loader
} from 'lucide-react';
import { getPublicItinerary } from '../services/firebaseService';
import { mapOptions, createCustomMarker } from '../utils/mapsConfig';
import TravelModeSelector from '../components/TravelModeSelector';
import MultiDayPlanner from '../components/MultiDayPlanner';
import RoutePreview from '../components/RoutePreview';

const PublicItineraryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [routeStats, setRouteStats] = useState(null);
  
  // Map state
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [mapInitializing, setMapInitializing] = useState(true);
  
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  // Load public itinerary
  useEffect(() => {
    const loadPublicItinerary = async () => {
      if (!id) {
        setError('No itinerary ID provided');
        setLoading(false);
        return;
      }

      try {
        console.log('🔄 PublicItineraryPage: Loading public itinerary:', id);
        
        const result = await getPublicItinerary(id);
        console.log('🔄 PublicItineraryPage: Firebase result:', result);
        
        if (result.success) {
          console.log('✅ PublicItineraryPage: Itinerary loaded successfully');
          console.log('📊 PublicItineraryPage: Itinerary data:', {
            id: result.data.id,
            title: result.data.title,
            travelMode: result.data.travelMode,
            daysCount: result.data.days?.length || 0,
            totalPlaces: result.data.days?.reduce((total, day) => total + day.places.length, 0) || 0,
            public: result.data.public
          });
          setItinerary(result.data);
        } else {
          console.error('❌ PublicItineraryPage: Failed to load itinerary:', result.error);
          setError(result.error || 'Failed to load itinerary');
        }
      } catch (err) {
        console.error('❌ PublicItineraryPage: Error loading itinerary:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadPublicItinerary();
  }, [id]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Map initialization
  useLayoutEffect(() => {
    if (!itinerary) return;

    const mapElement = mapRef.current;
    if (!mapElement) return;

    const initializeMap = async () => {
      try {
        setMapInitializing(true);
        console.log('🔄 PublicItineraryPage: Starting map initialization');
        
        // Wait for Google Maps API
        let attempts = 0;
        while (!window.google?.maps && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 200));
          attempts++;
        }

        if (!window.google?.maps) {
          throw new Error('Google Maps API failed to load');
        }

        console.log('✅ PublicItineraryPage: Google Maps API loaded');

        // Create map instance
        const mapInstance = new google.maps.Map(mapElement, {
          ...mapOptions,
          center: { lat: 7.8731, lng: 80.7718 }, // Sri Lanka center
          zoom: 8
        });
        
        console.log('✅ PublicItineraryPage: Map instance created');

        // Wait for map to be ready
        await new Promise((resolve) => {
          const listener = mapInstance.addListener('idle', () => {
            google.maps.event.removeListener(listener);
            resolve();
          });
          setTimeout(resolve, 3000); // Fallback timeout
        });

        console.log('✅ PublicItineraryPage: Map is ready');
        setMap(mapInstance);
        setMapInitializing(false);
      } catch (error) {
        console.error('❌ PublicItineraryPage: Error initializing map:', error);
        setMapInitializing(false);
        setError('Failed to load map: ' + error.message);
      }
    };

    initializeMap();
  }, [itinerary]);

  // Create markers when map and itinerary are ready
  useEffect(() => {
    if (!map || !itinerary) return;

    // Clear existing markers
    markers.forEach(marker => {
      if (marker && marker.setMap) {
        marker.setMap(null);
      }
    });

    // Create markers for all places
    const allPlaces = itinerary.days.reduce((places, day) => [...places, ...day.places], []);
    const newMarkers = [];

    allPlaces.forEach((place) => {
      try {
        const marker = createCustomMarker(
          map,
          place.position,
          place.category,
          () => {
            // Read-only mode - no action on click
          }
        );
        if (marker) {
          newMarkers.push(marker);
        }
      } catch (error) {
        console.error('Error creating marker for place:', place.name, error);
      }
    });

    setMarkers(newMarkers);
  }, [map, itinerary]);

  // Handle copy share link
  const handleCopyLink = async () => {
    const shareUrl = window.location.href;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Get total places
  const getTotalPlaces = () => {
    if (!itinerary) return 0;
    return itinerary.days.reduce((total, day) => total + day.places.length, 0);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Unknown';
    const d = new Date(date);
    return d.toLocaleDateString();
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader size={48} style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            Loading Itinerary
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '14px'
          }}>
            Please wait while we load the shared itinerary...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
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
          <AlertCircle size={48} color="#dc2626" style={{ margin: '0 auto 16px' }} />
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#dc2626',
            marginBottom: '12px'
          }}>
            Itinerary Not Found
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            {error}
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Go Home
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
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: isMobile ? '16px' : '20px',
        zIndex: 1000,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Back Button and Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f9fafb';
                e.target.style.borderColor = '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.borderColor = '#e5e7eb';
              }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            
            <div>
              <h1 style={{
                fontSize: isMobile ? '18px' : '24px',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0,
                marginBottom: '4px'
              }}>
                {itinerary.title}
              </h1>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0
              }}>
                Shared by {itinerary.userId}
              </p>
            </div>
          </div>

          {/* Share Button */}
          <button
            onClick={handleCopyLink}
            style={{
              backgroundColor: copied ? '#059669' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!copied) {
                e.target.style.backgroundColor = '#2563eb';
              }
            }}
            onMouseLeave={(e) => {
              if (!copied) {
                e.target.style.backgroundColor = '#3b82f6';
              }
            }}
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>

        {/* Itinerary Stats */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          marginTop: '12px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={16} />
            {itinerary.days.length} {itinerary.days.length === 1 ? 'day' : 'days'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} />
            {getTotalPlaces()} {getTotalPlaces() === 1 ? 'place' : 'places'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} />
            Created {formatDate(itinerary.createdAt)}
          </span>
          {routeStats && (
            <>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Route size={16} />
                {routeStats.totalDistanceText}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} />
                {routeStats.totalDurationText}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{
        display: 'flex',
        marginTop: isMobile ? '120px' : '140px',
        height: `calc(100vh - ${isMobile ? '120px' : '140px'})`
      }}>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div style={{
            width: '400px',
            backgroundColor: 'white',
            borderRight: '1px solid #e5e7eb',
            overflowY: 'auto'
          }}>
            <div style={{ padding: '24px' }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '16px'
              }}>
                Itinerary Details
              </h2>
              
              <div style={{ marginBottom: '24px' }}>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: '16px'
                }}>
                  This is a read-only view of the shared itinerary.
                </p>
              </div>

              <MultiDayPlanner
                itinerary={itinerary.days}
                onItineraryChange={() => {}} // Read-only
                currentDay={1}
                onCurrentDayChange={() => {}} // Read-only
                onRemovePlace={() => {}} // Read-only
                isMobile={false}
                readOnly={true}
              />
            </div>
          </div>
        )}

        {/* Map Container */}
        <div style={mapContainerStyle}>
          {/* Map */}
          <div
            ref={mapRef}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#e5e7eb'
            }}
          />

          {/* Loading Overlay */}
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
                <Loader size={48} style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '8px'
                }}>
                  Loading Map
                </h2>
                <p style={{
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  Preparing your route preview...
                </p>
              </div>
            </div>
          )}

          {/* Route Preview */}
          {!mapInitializing && map && (
            <RoutePreview
              itinerary={itinerary.days}
              travelMode={itinerary.travelMode}
              mapInstance={map}
              onRouteStatsUpdate={setRouteStats}
            />
          )}

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              zIndex: 1001
            }}>
              <div>Map: {map ? '✅' : '❌'}</div>
              <div>Places: {getTotalPlaces()}</div>
              <div>Route: {routeStats ? '✅' : '❌'}</div>
            </div>
          )}

          {/* Mobile Itinerary Panel */}
          {isMobile && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'white',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              boxShadow: '0 -10px 25px -5px rgba(0, 0, 0, 0.1)',
              maxHeight: '60vh',
              overflowY: 'auto',
              zIndex: 100
            }}>
              <div style={{
                width: '36px',
                height: '4px',
                backgroundColor: '#d1d5db',
                borderRadius: '2px',
                margin: '16px auto'
              }} />
              
              <div style={{ padding: '20px' }}>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '16px'
                }}>
                  Itinerary Details
                </h2>
                
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: '16px'
                }}>
                  This is a read-only view of the shared itinerary.
                </p>

                <MultiDayPlanner
                  itinerary={itinerary.days}
                  onItineraryChange={() => {}} // Read-only
                  currentDay={1}
                  onCurrentDayChange={() => {}} // Read-only
                  onRemovePlace={() => {}} // Read-only
                  isMobile={true}
                  readOnly={true}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicItineraryPage; 