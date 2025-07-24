import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader } from 'lucide-react';
import { createGooglePlace } from '../utils/placeUtils';
import '../styles/GooglePlacesSearch.css';

const GooglePlacesSearch = ({ 
  isOpen, 
  onClose, 
  onPlaceSelect, 
  isLoading = false 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [autocompleteService, setAutocompleteService] = useState(null);
  const [placesService, setPlacesService] = useState(null);
  const searchTimeoutRef = useRef(null);

  // Initialize Google Places services
  useEffect(() => {
    if (isOpen && window.google?.maps) {
      try {
        const autocomplete = new window.google.maps.places.AutocompleteService();
        const places = new window.google.maps.places.PlacesService(document.createElement('div'));
        setAutocompleteService(autocomplete);
        setPlacesService(places);
      } catch (error) {
        console.error('Error initializing Google Places services:', error);
        setError('Failed to initialize Google Places search');
      }
    }
  }, [isOpen]);

  // Clear search when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setError('');
    }
  }, [isOpen]);

  // Handle search input changes
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setError('');

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't search if query is too short
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 500);
  };

  // Perform Google Places search
  const performSearch = async (query) => {
    if (!autocompleteService || !query.trim()) {
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      // Search in Sri Lanka
      const request = {
        input: query,
        componentRestrictions: { country: 'lk' }, // Restrict to Sri Lanka
        types: ['establishment', 'geocode'] // Search for places and addresses
      };

      autocompleteService.getPlacePredictions(request, (predictions, status) => {
        setIsSearching(false);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSearchResults(predictions);
        } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          setSearchResults([]);
          setError('No places found. Try a different search term.');
        } else {
          setSearchResults([]);
          setError('Search failed. Please try again.');
        }
      });
    } catch (error) {
      setIsSearching(false);
      console.error('Error performing search:', error);
      setError('Search failed. Please try again.');
    }
  };

  // Handle place selection
  const handlePlaceSelect = (prediction) => {
    if (!placesService) {
      setError('Places service not available');
      return;
    }

    setIsSearching(true);
    setError('');

    console.log('🔄 GooglePlacesSearch: Getting details for prediction:', {
      placeId: prediction.place_id,
      description: prediction.description
    });

    const request = {
      placeId: prediction.place_id,
      fields: ['name', 'formatted_address', 'geometry', 'place_id', 'types']
    };

    placesService.getDetails(request, (place, status) => {
      setIsSearching(false);
      
      console.log('🔄 GooglePlacesSearch: Place details received:', {
        status,
        place: place ? {
          name: place.name,
          address: place.formatted_address,
          geometry: place.geometry,
          placeId: place.place_id
        } : null
      });
      
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        try {
          const googlePlace = createGooglePlace(place);
          console.log('✅ GooglePlacesSearch: Created Google place object:', {
            name: googlePlace.name,
            category: googlePlace.category,
            type: googlePlace.type,
            position: googlePlace.position
          });
          onPlaceSelect(googlePlace);
          onClose();
        } catch (error) {
          console.error('Error creating Google place:', error);
          setError('Failed to get place details');
        }
      } else {
        console.error('❌ GooglePlacesSearch: Failed to get place details, status:', status);
        setError('Failed to get place details');
      }
    });
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setError('');
  };

  // Handle close
  const handleClose = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content google-places-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <Search size={20} color="#3b82f6" />
            <h2>Search Google Places</h2>
          </div>
          <button
            className="modal-close-btn"
            onClick={handleClose}
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Form */}
        <div className="modal-form">
          {/* Search Input */}
          <div className="form-group">
            <label className="form-label">
              <Search size={16} />
              Search Places in Sri Lanka
            </label>
            <div className="search-input-container">
              <input
                type="text"
                className="form-input search-input"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search for restaurants, hotels, attractions..."
                disabled={isLoading}
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={handleClearSearch}
                  disabled={isLoading}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="form-help">
              Search for any place in Sri Lanka
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="form-error">
              <span>⚠️</span>
              {error}
            </div>
          )}

          {/* Loading State */}
          {isSearching && (
            <div className="search-loading">
              <Loader size={20} className="spinner" />
              <span>Searching...</span>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="search-results">
              <h3 className="results-title">
                Found {searchResults.length} place{searchResults.length !== 1 ? 's' : ''}
              </h3>
              <div className="results-list">
                {searchResults.map((prediction, index) => (
                  <button
                    key={prediction.place_id}
                    className="result-item"
                    onClick={() => handlePlaceSelect(prediction)}
                    disabled={isLoading}
                  >
                    <div className="result-icon">
                      <MapPin size={16} />
                    </div>
                    <div className="result-content">
                      <div className="result-name">
                        {prediction.structured_formatting?.main_text || prediction.description}
                      </div>
                      <div className="result-address">
                        {prediction.structured_formatting?.secondary_text || ''}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {searchQuery.length >= 3 && !isSearching && searchResults.length === 0 && !error && (
            <div className="no-results">
              <MapPin size={48} />
              <h3>No places found</h3>
              <p>Try searching with different keywords</p>
            </div>
          )}

          {/* Instructions */}
          {!searchQuery && !isSearching && searchResults.length === 0 && (
            <div className="search-instructions">
              <Search size={48} />
              <h3>Search for Places</h3>
              <p>Enter at least 3 characters to search for places in Sri Lanka</p>
              <div className="instruction-examples">
                <span>Examples:</span>
                <ul>
                  <li>Restaurants in Colombo</li>
                  <li>Hotels in Kandy</li>
                  <li>Beaches in Galle</li>
                  <li>Tourist attractions</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GooglePlacesSearch; 