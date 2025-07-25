import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  MapPin, 
  Search,
  Save,
  X,
  Globe,
  Image as ImageIcon,
  Loader
} from 'lucide-react';
import { places } from '../data/places';
import { categories } from '../data/places';
import { adminService } from '../services/adminService';

const AdminPlaces = () => {
  const { userData } = useAuth();
  const [allPlaces, setAllPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [searchBox, setSearchBox] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state for place editing
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: '',
    lat: '',
    lng: '',
    description: '',
    images: [],
    tags: [],
    active: true,
    placeId: '' // Google Places ID
  });

  // Load places from Firestore on component mount
  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await adminService.getAllPlaces();
      if (result.success) {
        setAllPlaces(result.data);
        setFilteredPlaces(result.data);
      } else {
        setError(result.error);
        // Fallback to local places if Firestore fails
        setAllPlaces(places);
        setFilteredPlaces(places);
      }
    } catch (error) {
      console.error('Error loading places:', error);
      setError('Failed to load places');
      // Fallback to local places
      setAllPlaces(places);
      setFilteredPlaces(places);
    } finally {
      setLoading(false);
    }
  };

  // Filter places based on search and category
  useEffect(() => {
    let filtered = allPlaces;

    if (searchTerm) {
      filtered = filtered.filter(place =>
        place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(place => place.category === selectedCategory);
    }

    setFilteredPlaces(filtered);
  }, [allPlaces, searchTerm, selectedCategory]);

  // Initialize map when map modal opens
  useEffect(() => {
    if (isMapModalOpen && window.google) {
      const mapElement = document.getElementById('admin-map');
      if (mapElement) {
        const newMap = new window.google.maps.Map(mapElement, {
          center: { lat: 6.9271, lng: 79.8612 }, // Colombo
          zoom: 8,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true
        });

        // Add search box
        const input = document.getElementById('map-search-input');
        if (input) {
          const searchBoxInstance = new window.google.maps.places.SearchBox(input);
          setSearchBox(searchBoxInstance);

          // Listen for search results
          searchBoxInstance.addListener('places_changed', () => {
            const places = searchBoxInstance.getPlaces();
            if (places.length === 0) return;

            const place = places[0];
            if (!place.geometry || !place.geometry.location) return;

            // Update form with place details
            setFormData(prev => ({
              ...prev,
              name: place.name || prev.name,
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              placeId: place.place_id || '',
              description: place.formatted_address || prev.description
            }));

            // Update map
            newMap.setCenter(place.geometry.location);
            newMap.setZoom(15);

            // Update marker
            if (marker) marker.setMap(null);
            const newMarker = new window.google.maps.Marker({
              position: place.geometry.location,
              map: newMap,
              title: place.name
            });
            setMarker(newMarker);
          });
        }

        setMap(newMap);
      }
    }
  }, [isMapModalOpen]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle map click to set coordinates
  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    setFormData(prev => ({
      ...prev,
      lat: lat.toString(),
      lng: lng.toString()
    }));

    // Update marker
    if (marker) marker.setMap(null);
    const newMarker = new window.google.maps.Marker({
      position: { lat, lng },
      map: map,
      title: 'Selected Location'
    });
    setMarker(newMarker);
  };

  // Add click listener to map
  useEffect(() => {
    if (map) {
      map.addListener('click', handleMapClick);
    }
  }, [map]);

  // Open modal for adding new place
  const handleAddPlace = () => {
    setFormData({
      id: '',
      name: '',
      category: '',
      lat: '',
      lng: '',
      description: '',
      images: [],
      tags: [],
      active: true,
      placeId: ''
    });
    setSelectedPlace(null);
    setIsModalOpen(true);
  };

  // Open modal for editing place
  const handleEditPlace = (place) => {
    setFormData({
      id: place.id,
      name: place.name,
      category: place.category,
      lat: place.lat.toString(),
      lng: place.lng.toString(),
      description: place.description || '',
      images: place.images || [],
      tags: place.tags || [],
      active: place.active !== false,
      placeId: place.placeId || ''
    });
    setSelectedPlace(place);
    setIsModalOpen(true);
  };

  // Delete place
  const handleDeletePlace = async (place) => {
    if (window.confirm(`Are you sure you want to delete "${place.name}"?`)) {
      try {
        const result = await adminService.deletePlace(place.id);
        if (result.success) {
          // Remove from local state
          const updatedPlaces = allPlaces.filter(p => p.id !== place.id);
          setAllPlaces(updatedPlaces);
          alert('Place deleted successfully');
        } else {
          alert(`Error deleting place: ${result.error}`);
        }
      } catch (error) {
        console.error('Error deleting place:', error);
        alert('Failed to delete place');
      }
    }
  };

  // Toggle place visibility
  const handleToggleVisibility = async (place) => {
    try {
      const newActiveState = !place.active;
      const result = await adminService.togglePlaceVisibility(place.id, newActiveState);
      if (result.success) {
        // Update local state
        const updatedPlaces = allPlaces.map(p => 
          p.id === place.id ? { ...p, active: newActiveState } : p
        );
        setAllPlaces(updatedPlaces);
      } else {
        alert(`Error updating place: ${result.error}`);
      }
    } catch (error) {
      console.error('Error toggling place visibility:', error);
      alert('Failed to update place visibility');
    }
  };

  // Save place
  const handleSavePlace = async () => {
    if (!formData.name || !formData.category || !formData.lat || !formData.lng) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const placeData = {
        ...formData,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        tags: formData.tags.filter(tag => tag.trim() !== '')
      };

      let result;
      if (selectedPlace) {
        // Update existing place
        result = await adminService.updatePlace(selectedPlace.id, placeData);
      } else {
        // Add new place
        result = await adminService.addPlace(placeData);
      }

      if (result.success) {
        // Reload places to get updated data
        await loadPlaces();
        setIsModalOpen(false);
        alert(selectedPlace ? 'Place updated successfully' : 'Place added successfully');
      } else {
        setError(result.error);
        alert(`Error saving place: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving place:', error);
      setError('Failed to save place');
      alert('Failed to save place');
    } finally {
      setSaving(false);
    }
  };

  // Add tag
  const handleAddTag = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, e.target.value.trim()]
      }));
      e.target.value = '';
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading places...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Place Management</h1>
          <p className="text-gray-600">Manage predefined places for your application</p>
        </div>
        <button
          onClick={handleAddPlace}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add New Place
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Places</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by name, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Showing {filteredPlaces.length} of {allPlaces.length} places
            </div>
          </div>
        </div>
      </div>

      {/* Places List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Place
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPlaces.map((place) => (
                <tr key={place.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{place.name}</div>
                      {place.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {place.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {categories.find(c => c.id === place.category)?.name || place.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleVisibility(place)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        place.active !== false
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {place.active !== false ? (
                        <>
                          <Eye size={12} className="mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <EyeOff size={12} className="mr-1" />
                          Inactive
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditPlace(place)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePlace(place)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Place Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedPlace ? 'Edit Place' : 'Add New Place'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter place name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <input
                      type="number"
                      name="lat"
                      value={formData.lat}
                      onChange={handleInputChange}
                      step="any"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Latitude"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="lng"
                      value={formData.lng}
                      onChange={handleInputChange}
                      step="any"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Longitude"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsMapModalOpen(true)}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <MapPin size={16} />
                      Map Preview
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter place description"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  onKeyPress={handleAddTag}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Press Enter to add tags"
                />
                {formData.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Google Places ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Places ID
                </label>
                <input
                  type="text"
                  name="placeId"
                  value={formData.placeId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter Google Places ID (optional)"
                />
              </div>

              {/* Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Active (visible to users)
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePlace}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader className="animate-spin h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Place
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {isMapModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Map Preview</h3>
              <button
                onClick={() => setIsMapModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 p-4">
              <div className="mb-4">
                <input
                  id="map-search-input"
                  type="text"
                  placeholder="Search for a place..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div
                id="admin-map"
                className="w-full h-full rounded-lg border border-gray-300"
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlaces; 