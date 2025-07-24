import { useEffect, useRef, useState } from 'react';
import { X, MapPin, Star, Clock, Phone, Globe, Navigation, AlertCircle, Plus, Check } from 'lucide-react';
import { getCategoryInfo } from '../data/places';
import { isCustomPlace, isGooglePlace } from '../utils/placeUtils';

const PlaceDetailsPanel = ({ 
  place, 
  onClose, 
  onAddToItinerary, 
  isInItinerary, 
  isMobile,
  placeDisplayName 
}) => {
  const [placeDetails, setPlaceDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const categoryInfo = getCategoryInfo(place.category);

  // Reset all states when place changes
  useEffect(() => {
    console.log('🔄 Place changed to:', place.name, 'ID:', place.placeId, 'Type:', place.type);
    
    // Reset states
    setPlaceDetails(null);
    setLoading(true);
    setError(null);

    // For custom places, don't try to load Google Places API data
    if (isCustomPlace(place)) {
      console.log('✅ Custom place detected, skipping Google Places API call');
      setLoading(false);
      return;
    }

    const loadPlaceDetails = async () => {
      try {
        setLoading(true);
        console.log('🚀 Loading place details via Google Places API for:', place.name);
        
        // Wait for Google Maps API to be ready
        let attempts = 0;
        while (!window.google?.maps && attempts < 50) {
          console.log(`Attempt ${attempts + 1}: Waiting for Google Maps API...`);
          await new Promise(resolve => setTimeout(resolve, 200));
          attempts++;
        }

        if (!window.google?.maps) {
          throw new Error('Google Maps API failed to load after 10 seconds');
        }

        console.log('✅ Google Maps API loaded, fetching place details...');

        // Create Places Service
        const service = new window.google.maps.places.PlacesService(document.createElement('div'));
        
        // First try with place ID
        const placeIdRequest = {
          placeId: place.placeId,
          fields: [
            'name',
            'formatted_address',
            'formatted_phone_number',
            'website',
            'rating',
            'user_ratings_total',
            'opening_hours',
            'photos',
            'reviews',
            'price_level',
            'types',
            'geometry'
          ]
        };

        // Try to get place details by ID first
        service.getDetails(placeIdRequest, (result, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            console.log('✅ Place details loaded successfully by ID:', result);
            setPlaceDetails(result);
            setLoading(false);
          } else {
            console.log(`❌ Place ID not found (${status}), trying text search...`);
            
            // Fallback: Search by name and location
            const textSearchRequest = {
              query: `${place.name} Sri Lanka`,
              location: new window.google.maps.LatLng(place.position.lat, place.position.lng),
              radius: 50000, // 50km radius
              fields: [
                'name',
                'formatted_address',
                'formatted_phone_number',
                'website',
                'rating',
                'user_ratings_total',
                'opening_hours',
                'photos',
                'reviews',
                'price_level',
                'types',
                'geometry'
              ]
            };

            service.textSearch(textSearchRequest, (results, textStatus) => {
              if (textStatus === window.google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
                console.log('✅ Place found via text search:', results[0]);
                
                // Get detailed info for the first result
                const detailRequest = {
                  placeId: results[0].place_id,
                  fields: [
                    'name',
                    'formatted_address',
                    'formatted_phone_number',
                    'website',
                    'rating',
                    'user_ratings_total',
                    'opening_hours',
                    'photos',
                    'reviews',
                    'price_level',
                    'types',
                    'geometry'
                  ]
                };

                service.getDetails(detailRequest, (detailResult, detailStatus) => {
                  if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK) {
                    console.log('✅ Detailed place info loaded via text search:', detailResult);
                    setPlaceDetails(detailResult);
                    setLoading(false);
                  } else {
                    console.error('❌ Failed to get detailed info:', detailStatus);
                    setError(`Place found but details unavailable: ${detailStatus}`);
                    setLoading(false);
                  }
                });
              } else {
                console.error('❌ Text search also failed:', textStatus);
                setError(`Place not found: ${textStatus}`);
                setLoading(false);
              }
            });
          }
        });

      } catch (error) {
        console.error('❌ Error loading place details:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    // Start loading with a slight delay
    const timer = setTimeout(loadPlaceDetails, 100);
    
    // Cleanup function
    return () => {
      clearTimeout(timer);
      console.log('🧹 Cleaning up for place:', place.name);
    };
  }, [place.placeId]); // Use place.placeId as dependency

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

  const renderPlaceDetails = () => {
    // For custom places, show a special message
    if (isCustomPlace(place)) {
      return (
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px',
          backgroundColor: '#f0fdf4',
          borderColor: '#059669'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <MapPin style={{ width: '18px', height: '18px', color: '#059669' }} />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#065f46' }}>
              Custom Location
            </span>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
              {place.name}
            </h4>
            {place.description && (
              <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.6' }}>
                {place.description}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
            <MapPin style={{ width: '18px', height: '18px', color: '#6b7280', marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                Coordinates: {place.position.lat.toFixed(4)}, {place.position.lng.toFixed(4)}
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                Category: {categoryInfo?.name || 'Custom Location'}
              </div>
            </div>
          </div>

          <div style={{
            padding: '12px 16px',
            backgroundColor: '#ecfdf5',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#065f46',
            fontStyle: 'italic',
            border: '1px solid #a7f3d0'
          }}>
            ✨ This is a custom location you added to the map. Additional information like opening hours, ratings, and contact details are not available for custom places.
          </div>
        </div>
      );
    }

    // For places without Google Places API data
    if (!placeDetails) {
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
    }

    return (
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        backgroundColor: '#ffffff'
      }}>
        {/* Place Name */}
        <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>
          {placeDetails.name || place.name}
        </h4>

        {/* Address */}
        {placeDetails.formatted_address && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
            <MapPin style={{ width: '18px', height: '18px', color: '#6b7280', marginTop: '2px' }} />
            <div style={{ fontSize: '14px', color: '#374151' }}>
              {placeDetails.formatted_address}
            </div>
          </div>
        )}

        {/* Rating */}
        {placeDetails.rating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Star style={{ width: '16px', height: '16px', color: '#f59e0b', fill: '#f59e0b' }} />
            <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
              {placeDetails.rating} ({placeDetails.user_ratings_total} reviews)
            </span>
          </div>
        )}

        {/* Opening Hours */}
        {placeDetails.opening_hours && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
            <Clock style={{ width: '18px', height: '18px', color: '#6b7280', marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '14px', color: '#374151', fontWeight: '500', marginBottom: '4px' }}>
                {placeDetails.opening_hours.open_now ? 'Open Now' : 'Closed'}
              </div>
              {placeDetails.opening_hours.weekday_text && (
                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  {placeDetails.opening_hours.weekday_text.slice(0, 3).map((day, index) => (
                    <div key={index}>{day}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Phone */}
        {placeDetails.formatted_phone_number && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Phone style={{ width: '18px', height: '18px', color: '#6b7280' }} />
            <a 
              href={`tel:${placeDetails.formatted_phone_number}`}
              style={{ fontSize: '14px', color: '#1a73e8', textDecoration: 'none' }}
            >
              {placeDetails.formatted_phone_number}
            </a>
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
              style={{ fontSize: '14px', color: '#1a73e8', textDecoration: 'none' }}
            >
              Visit Website
            </a>
          </div>
        )}

        {/* Price Level */}
        {placeDetails.price_level !== undefined && (
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', color: '#374151' }}>
              Price Level: {'$'.repeat(placeDetails.price_level + 1)}
            </span>
          </div>
        )}

        {/* Photos */}
        {placeDetails.photos && placeDetails.photos.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <img 
              src={placeDetails.photos[0].getUrl({ maxWidth: 400, maxHeight: 300 })} 
              alt={placeDetails.name}
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '8px'
              }}
            />
          </div>
        )}

        {/* Reviews */}
        {placeDetails.reviews && placeDetails.reviews.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Recent Reviews
            </h5>
            {placeDetails.reviews.slice(0, 2).map((review, index) => (
              <div key={index} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '8px',
                backgroundColor: '#f9fafb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Star style={{ width: '14px', height: '14px', color: '#f59e0b', fill: '#f59e0b' }} />
                  <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                    {review.rating} stars
                  </span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    by {review.author_name}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.4' }}>
                  {review.text.length > 150 ? review.text.substring(0, 150) + '...' : review.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDirectionsButton = () => {
    const directionsUrl = placeDetails?.formatted_address 
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(placeDetails.formatted_address)}`
      : `https://www.google.com/maps/search/${encodeURIComponent(place.name + ' Sri Lanka')}`;

    return (
      <button 
        onClick={() => window.open(directionsUrl, '_blank')}
        style={{
          width: '100%',
          backgroundColor: '#1a73e8',
          color: 'white',
          border: 'none',
          padding: '12px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '14px'
        }}
      >
        <Navigation style={{ width: '18px', height: '18px' }} />
        Get Directions
      </button>
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
                {placeDisplayName || place.name}
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
          {/* Loading State */}
          {loading && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#6b7280'
            }}>
              <div style={{
                border: '3px solid #f3f4f6',
                borderTop: '3px solid #059669',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ fontSize: '14px' }}>Loading place details for {place.name}...</p>
              <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                Using Google Places API for rich data
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div style={{
              padding: '16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#dc2626', fontSize: '14px', marginBottom: '12px' }}>
                Error loading place data: {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Retry
              </button>
            </div>
          )}
          
          {/* Place Content */}
          {!loading && (
            <>
              {/* Place Details Section */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                  Place Details
                </h4>
                {renderPlaceDetails()}
              </div>
              
              {/* Directions Section */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                  Directions
                </h4>
                {renderDirectionsButton()}
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