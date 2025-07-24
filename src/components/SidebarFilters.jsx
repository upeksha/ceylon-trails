import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { categories } from '../data/places';
import '../styles/SidebarFilters.css';

const SidebarFilters = ({ 
  selectedCategories, 
  onCategoryChange, 
  searchQuery, 
  onSearchChange, 
  filteredPlaces, 
  totalPlaces,
  onGooglePlacesSearch 
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCategoryToggle = (categoryId) => {
    const newSelection = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    onCategoryChange(newSelection);
  };

  const clearSearch = () => {
    onSearchChange('');
  };

  const clearAllFilters = () => {
    onSearchChange('');
    onCategoryChange([]);
  };

  const hasActiveFilters = searchQuery || selectedCategories.length > 0;
  const showingAllCategories = selectedCategories.length === 0;

  // Toggle button component
  const ToggleButton = () => (
    <button
      onClick={() => setIsCollapsed(!isCollapsed)}
      className={`toggle-button ${isCollapsed ? 'collapsed' : ''}`}
      title={isCollapsed ? 'Show filters' : 'Hide filters'}
    >
      {isCollapsed ? (
        <ChevronRight size={18} style={{ marginLeft: '1px' }} />
      ) : (
        <ChevronLeft size={18} style={{ marginRight: '1px' }} />
      )}
    </button>
  );

  return (
    <div className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Toggle Button - Always visible */}
      <ToggleButton />

      {/* Sidebar Content - hidden when collapsed */}
      <div className={`sidebar-content ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <h1 className="sidebar-title">
            Ceylon Trails
          </h1>
          <p className="sidebar-subtitle">
            Discover Sri Lanka's treasures
          </p>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-container">
            <div className="search-input-container">
              <Search className={`search-icon ${isSearchFocused ? 'focused' : ''}`} />
              <input
                type="text"
                placeholder="Search places..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="clear-search-btn"
                >
                  <X className="clear-search-icon" />
                </button>
              )}
            </div>
            <button
              className="google-places-search-btn"
              onClick={onGooglePlacesSearch}
              title="Search Google Places"
            >
              <Search size={16} />
            </button>
          </div>
          <div className="search-results-info">
            Showing {filteredPlaces.length} of {totalPlaces} places
          </div>
        </div>

        {/* Results Summary */}
        <div className="results-summary">
          <div className="results-container">
            <span className="results-text">
              {filteredPlaces.length} of {totalPlaces} places
              {searchQuery && (
                <span className="results-query">
                  {' '}for "{searchQuery}"
                </span>
              )}
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="clear-all-btn"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="categories-section">
          <h3 className="categories-title">
            Categories
          </h3>
          
          <div className="categories-list">
            {categories.map((category) => {
              const isSelected = selectedCategories.includes(category.id);
              const categoryPlaces = filteredPlaces.filter(place => place.category === category.id);
              const categoryCount = categoryPlaces.length;
              
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

              return (
                <label
                  key={category.id}
                  className={`category-item ${isSelected ? `selected ${category.color}` : ''} ${searchQuery && categoryCount === 0 ? 'disabled' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="category-checkbox"
                    style={{ accentColor: getCategoryColor(category.color) }}
                  />
                  <div className="category-content">
                    <span className="category-icon">
                      {category.icon}
                    </span>
                    <div className="category-details">
                      <div className={`category-name ${isSelected ? `selected ${category.color}` : ''}`}>
                        {category.name}
                      </div>
                      <div className="category-count">
                        {categoryCount} place{categoryCount !== 1 ? 's' : ''}
                        {searchQuery && categoryCount === 0 && ' (no matches)'}
                      </div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* No Results Message */}
        {filteredPlaces.length === 0 && hasActiveFilters && (
          <div className="no-results">
            <div className="no-results-title">
              No places found
            </div>
            <div className="no-results-text">
              Try adjusting your search or category filters
            </div>
            <button
              onClick={clearAllFilters}
              className="clear-filters-btn"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Mobile bottom padding */}
        <div className="mobile-padding" />
      </div>
    </div>
  );
};

export default SidebarFilters; 