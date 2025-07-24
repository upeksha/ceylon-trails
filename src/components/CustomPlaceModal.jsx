import React, { useState, useEffect } from 'react';
import { X, MapPin, Edit3, Save } from 'lucide-react';
import { createCustomPlace, validatePlace } from '../utils/placeUtils';
import { categories } from '../data/places';
import '../styles/Modal.css';

const CustomPlaceModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  position, 
  isLoading = false 
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setCategory('custom'); // Default to 'custom' category
      setDescription('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!name.trim()) {
      setError('Please enter a place name');
      return;
    }

    if (!category) {
      setError('Please select a category');
      return;
    }

    if (!position) {
      setError('Invalid position data');
      return;
    }

    // Create custom place
    const customPlace = createCustomPlace(name, category, position, description);
    
    // Validate the created place
    const validation = validatePlace(customPlace);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    // Save the place
    onSave(customPlace);
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <MapPin size={20} color="#3b82f6" />
            <h2>Add Custom Place</h2>
          </div>
          <button
            className="modal-close-btn"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form className="modal-form" onSubmit={handleSubmit}>
          {/* Position Info */}
          <div className="form-group">
            <label className="form-label">
              <MapPin size={16} />
              Location
            </label>
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#f9fafb',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              {position ? (
                `Latitude: ${position.lat.toFixed(6)}, Longitude: ${position.lng.toFixed(6)}`
              ) : (
                'Click on the map to select a location'
              )}
            </div>
          </div>

          {/* Place Name */}
          <div className="form-group">
            <label className="form-label">
              <Edit3 size={16} />
              Place Name *
            </label>
            <input
              type="text"
              className={`form-input ${error && !name.trim() ? 'error' : ''}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter place name..."
              maxLength={50}
              disabled={isLoading}
            />
            <div className="form-help">
              {name.length}/50 characters
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">
              Category *
            </label>
            <select
              className={`form-input ${error && !category ? 'error' : ''}`}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isLoading}
            >
              <option value="">Select a category...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              Description (Optional)
            </label>
            <textarea
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for this place..."
              rows={3}
              maxLength={200}
              disabled={isLoading}
              style={{ resize: 'vertical' }}
            />
            <div className="form-help">
              {description.length}/200 characters
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="form-error">
              <span>⚠️</span>
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || !name.trim() || !category}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Add Place
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomPlaceModal; 