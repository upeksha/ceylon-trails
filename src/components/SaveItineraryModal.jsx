import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import '../styles/Modal.css';

const SaveItineraryModal = ({ isOpen, onClose, onSave, currentTitle = '', isLoading = false }) => {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTitle(currentTitle || '');
      setError('');
    }
  }, [isOpen, currentTitle]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate title
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Please enter a title for your itinerary');
      return;
    }
    
    if (trimmedTitle.length > 50) {
      setError('Title must be 50 characters or less');
      return;
    }
    
    setError('');
    onSave(trimmedTitle);
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <Save size={20} />
            <h2>Save Itinerary</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="modal-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="itinerary-title" className="form-label">
              Itinerary Name
            </label>
            <input
              id="itinerary-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter itinerary name..."
              className={`form-input ${error ? 'error' : ''}`}
              disabled={isLoading}
              maxLength={50}
              autoFocus
            />
            {error && <div className="form-error">{error}</div>}
            <div className="form-help">
              {title.length}/50 characters
            </div>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="btn-primary"
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Itinerary
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveItineraryModal; 