import { useEffect, useRef, useCallback, useMemo } from 'react';

const RoutePreview = ({ itinerary, travelMode, mapInstance, onRouteStatsUpdate }) => {
  const directionsRendererRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const lastRequestRef = useRef(null);

  // Debug: Log component props
  console.log('🔄 RoutePreview: Component rendered with props:', {
    itineraryLength: itinerary?.length,
    itineraryType: itinerary?.[0]?.hasOwnProperty('day') ? 'multi-day' : 'flat',
    travelMode,
    hasMapInstance: !!mapInstance,
    hasGoogleMaps: !!window.google?.maps
  });

  // Memoize the itinerary to prevent unnecessary re-renders
  const memoizedItinerary = useMemo(() => {
    console.log('🔄 RoutePreview: Memoizing itinerary:', itinerary);
    return itinerary;
  }, [JSON.stringify(itinerary)]); // Use JSON.stringify to detect deep changes

  // Flatten multi-day itinerary into single array of places for route calculation
  const flattenedPlaces = useMemo(() => {
    console.log('🔄 RoutePreview: Processing itinerary for route calculation:', memoizedItinerary);
    
    if (!memoizedItinerary || memoizedItinerary.length === 0) {
      console.log('⚠️ RoutePreview: Empty itinerary, no places to route');
      return [];
    }
    
    // Check if it's multi-day format
    if (memoizedItinerary[0] && memoizedItinerary[0].hasOwnProperty('day')) {
      // Multi-day format: flatten all places from all days
      const allPlaces = memoizedItinerary.reduce((allPlaces, day) => {
        console.log(`📅 RoutePreview: Processing Day ${day.day} with ${day.places.length} places`);
        return [...allPlaces, ...day.places];
      }, []);
      console.log('✅ RoutePreview: Flattened multi-day itinerary:', allPlaces.length, 'total places');
      return allPlaces;
    } else {
      // Single-day format: use as is
      console.log('✅ RoutePreview: Using single-day itinerary format:', memoizedItinerary.length, 'places');
      return memoizedItinerary;
    }
  }, [memoizedItinerary]);

  // Memoize the route request to prevent duplicate calculations
  const routeRequest = useMemo(() => {
    console.log('🔄 RoutePreview: Creating route request for', flattenedPlaces.length, 'places');
    
    if (!flattenedPlaces || flattenedPlaces.length < 2) {
      console.log('⚠️ RoutePreview: Not enough places for route calculation (need at least 2)');
      return null;
    }

    try {
      const waypoints = flattenedPlaces.slice(1, -1).map(place => ({
        location: new window.google.maps.LatLng(place.position.lat, place.position.lng),
        stopover: true
      }));

      const origin = new window.google.maps.LatLng(flattenedPlaces[0].position.lat, flattenedPlaces[0].position.lng);
      const destination = new window.google.maps.LatLng(
        flattenedPlaces[flattenedPlaces.length - 1].position.lat, 
        flattenedPlaces[flattenedPlaces.length - 1].position.lng
      );

      const request = {
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        travelMode: window.google.maps.TravelMode[travelMode],
        optimizeWaypoints: false
      };

      console.log('✅ RoutePreview: Route request created successfully:', {
        origin: `${flattenedPlaces[0].name} (${flattenedPlaces[0].position.lat}, ${flattenedPlaces[0].position.lng})`,
        destination: `${flattenedPlaces[flattenedPlaces.length - 1].name} (${flattenedPlaces[flattenedPlaces.length - 1].position.lat}, ${flattenedPlaces[flattenedPlaces.length - 1].position.lng})`,
        waypoints: waypoints.length,
        travelMode: travelMode
      });

      return request;
    } catch (error) {
      console.error('❌ RoutePreview: Error creating route request:', error);
      return null;
    }
  }, [flattenedPlaces, travelMode]);

  // Memoize the callback to prevent unnecessary re-renders
  const memoizedOnRouteStatsUpdate = useCallback(onRouteStatsUpdate, [onRouteStatsUpdate]);

  // Initialize directions service and renderer
  useEffect(() => {
    if (!mapInstance || !window.google?.maps) {
      console.log('⚠️ RoutePreview: Map or Google Maps not ready');
      return;
    }

    console.log('🗺️ RoutePreview: Initializing directions service and renderer');

    // Initialize directions service and renderer
    if (!directionsServiceRef.current) {
      directionsServiceRef.current = new window.google.maps.DirectionsService();
      console.log('✅ RoutePreview: Directions service created');
    }

    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true, // We'll handle markers separately
        polylineOptions: {
          strokeColor: '#1e40af',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });
      directionsRendererRef.current.setMap(mapInstance);
      console.log('✅ RoutePreview: Directions renderer created and attached to map');
    }

    // Clear previous route
    directionsRendererRef.current.setDirections({ routes: [] });
    console.log('🧹 RoutePreview: Cleared previous route');
  }, [mapInstance]);

  // Calculate route when itinerary or travel mode changes
  useEffect(() => {
    console.log('🔄 RoutePreview: Route calculation effect triggered', {
      hasDirectionsService: !!directionsServiceRef.current,
      hasDirectionsRenderer: !!directionsRendererRef.current,
      hasRouteRequest: !!routeRequest,
      placesCount: flattenedPlaces.length
    });

    if (!directionsServiceRef.current || !directionsRendererRef.current || !routeRequest) {
      console.log('⚠️ RoutePreview: Missing required components for route calculation');
      
      // Clear route if not enough places
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setDirections({ routes: [] });
        console.log('🧹 RoutePreview: Cleared route due to insufficient data');
      }
      if (memoizedOnRouteStatsUpdate) {
        memoizedOnRouteStatsUpdate(null);
        console.log('📊 RoutePreview: Cleared route stats');
      }
      return;
    }

    // Check if this is the same request as the last one to prevent infinite loops
    const requestKey = JSON.stringify({
      origin: routeRequest.origin.toString(),
      destination: routeRequest.destination.toString(),
      waypoints: routeRequest.waypoints.map(wp => wp.location.toString()),
      travelMode: routeRequest.travelMode
    });

    if (lastRequestRef.current === requestKey) {
      console.log('🔄 RoutePreview: Skipping duplicate route request');
      return;
    }

    lastRequestRef.current = requestKey;

    console.log('🗺️ RoutePreview: Calculating route for', flattenedPlaces.length, 'places with', travelMode, 'mode');

    directionsServiceRef.current.route(routeRequest, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        console.log('✅ RoutePreview: Route calculated successfully');
        
        // Set the route on the map
        directionsRendererRef.current.setDirections(result);

        // Calculate route statistics
        const route = result.routes[0];
        const legs = route.legs;
        
        let totalDistance = 0;
        let totalDuration = 0;

        legs.forEach(leg => {
          totalDistance += leg.distance.value; // meters
          totalDuration += leg.duration.value; // seconds
        });

        const routeStats = {
          totalDistance: totalDistance,
          totalDistanceText: legs.map(leg => leg.distance.text).join(' + '),
          totalDuration: totalDuration,
          totalDurationText: legs.map(leg => leg.duration.text).join(' + '),
          legs: legs.length,
          waypoints: routeRequest.waypoints.length,
          totalPlaces: flattenedPlaces.length
        };

        console.log('📊 RoutePreview: Route stats calculated:', routeStats);
        
        if (memoizedOnRouteStatsUpdate) {
          memoizedOnRouteStatsUpdate(routeStats);
        }
      } else {
        console.error('❌ RoutePreview: Route calculation failed:', status);
        
        // Clear the route
        directionsRendererRef.current.setDirections({ routes: [] });
        
        if (memoizedOnRouteStatsUpdate) {
          memoizedOnRouteStatsUpdate(null);
        }
      }
    });
  }, [routeRequest, memoizedOnRouteStatsUpdate, flattenedPlaces.length, travelMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 RoutePreview: Cleaning up component');
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
      lastRequestRef.current = null;
    };
  }, []);

  return null; // This component doesn't render anything visible
};

export default RoutePreview; 