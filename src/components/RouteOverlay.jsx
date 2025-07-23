import { useEffect, useState, useRef } from 'react';

const RouteOverlay = ({ map, itinerary, travelMode, onRouteUpdate }) => {
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);
  const initializedRef = useRef(false);
  const cleanupRef = useRef(false);

  // Initialize Google Directions Service and Renderer - only once per map
  useEffect(() => {
    if (!map || !window.google?.maps || initializedRef.current || cleanupRef.current) return;

    console.log('🗺️ Initializing Directions service and renderer');
    initializedRef.current = true;

    try {
      const service = new google.maps.DirectionsService();
      const renderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#059669',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });

      renderer.setMap(map);
      setDirectionsService(service);
      setDirectionsRenderer(renderer);

      console.log('🗺️ Directions service and renderer initialized');
    } catch (error) {
      console.error('❌ Error initializing directions:', error);
      initializedRef.current = false;
    }

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up RouteOverlay');
      cleanupRef.current = true;
      
      if (directionsRenderer) {
        try {
          directionsRenderer.setMap(null);
          directionsRenderer.setDirections({ routes: [] });
        } catch (error) {
          console.warn('Error cleaning up directions renderer:', error);
        }
      }
      
      setDirectionsService(null);
      setDirectionsRenderer(null);
      setRouteInfo(null);
      onRouteUpdate?.(null);
      
      initializedRef.current = false;
      
      // Small delay before allowing re-initialization
      setTimeout(() => {
        cleanupRef.current = false;
      }, 100);
    };
  }, [map]); // Only depend on map

  // Calculate route when itinerary or travel mode changes
  useEffect(() => {
    if (cleanupRef.current) return;
    
    if (!directionsService || !directionsRenderer || !itinerary || itinerary.length < 2) {
      // Clear route if less than 2 places
      if (directionsRenderer && !cleanupRef.current) {
        try {
          directionsRenderer.setDirections({ routes: [] });
        } catch (error) {
          console.warn('Error clearing directions:', error);
        }
      }
      setRouteInfo(null);
      onRouteUpdate?.(null);
      return;
    }

    calculateRoute();
  }, [directionsService, directionsRenderer, itinerary, travelMode]);

  const calculateRoute = async () => {
    if (!directionsService || !itinerary || itinerary.length < 2 || cleanupRef.current) return;

    setIsCalculating(true);
    setError(null);
    
    console.log(`🚗 Calculating ${travelMode} route for ${itinerary.length} places`);

    try {
      // Prepare waypoints (excluding first and last)
      const waypoints = itinerary.slice(1, -1).map(place => ({
        location: new google.maps.LatLng(place.position.lat, place.position.lng),
        stopover: true
      }));

      const request = {
        origin: new google.maps.LatLng(itinerary[0].position.lat, itinerary[0].position.lng),
        destination: new google.maps.LatLng(
          itinerary[itinerary.length - 1].position.lat, 
          itinerary[itinerary.length - 1].position.lng
        ),
        waypoints: waypoints,
        travelMode: google.maps.TravelMode[travelMode],
        optimizeWaypoints: false,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      };

      console.log('📍 Route request:', {
        origin: `${itinerary[0].name}`,
        destination: `${itinerary[itinerary.length - 1].name}`,
        waypoints: waypoints.length,
        travelMode
      });

      const result = await new Promise((resolve, reject) => {
        directionsService.route(request, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            resolve(result);
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        });
      });

      // Check if component is still mounted
      if (cleanupRef.current) return;

      // Display the route
      try {
        if (directionsRenderer && !cleanupRef.current) {
          directionsRenderer.setDirections(result);
        }
      } catch (error) {
        console.warn('Error setting directions:', error);
        return;
      }

      // Extract route information
      const route = result.routes[0];
      const totalDistance = route.legs.reduce((sum, leg) => sum + leg.distance.value, 0);
      const totalDuration = route.legs.reduce((sum, leg) => sum + leg.duration.value, 0);

      const routeData = {
        totalDistance: totalDistance,
        totalDuration: totalDuration,
        legs: route.legs.map((leg, index) => ({
          from: itinerary[index].name,
          to: itinerary[index + 1].name,
          distance: leg.distance,
          duration: leg.duration,
          steps: leg.steps.length
        })),
        polyline: route.overview_polyline
      };

      setRouteInfo(routeData);
      if (!cleanupRef.current) {
        onRouteUpdate?.(routeData);
      }

      console.log('✅ Route calculated successfully:', {
        totalDistance: `${(totalDistance / 1000).toFixed(1)} km`,
        totalDuration: `${Math.round(totalDuration / 60)} minutes`,
        legs: route.legs.length
      });

    } catch (error) {
      console.error('❌ Route calculation failed:', error);
      setError(error.message);
      
      // Clear any existing route
      if (directionsRenderer && !cleanupRef.current) {
        try {
          directionsRenderer.setDirections({ routes: [] });
        } catch (clearError) {
          console.warn('Error clearing failed route:', clearError);
        }
      }
      setRouteInfo(null);
      if (!cleanupRef.current) {
        onRouteUpdate?.(null);
      }
    } finally {
      setIsCalculating(false);
    }
  };

  // Format distance for display
  const formatDistance = (meters) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters} m`;
  };

  // Format duration for display
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // This component doesn't render anything visible - it just manages the route overlay
  return null;
};

export default RouteOverlay; 