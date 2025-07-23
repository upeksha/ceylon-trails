import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { categories } from '../data/places';

const SidebarFilters = ({ selectedCategories, onCategoryChange, searchQuery, onSearchChange, filteredPlaces, totalPlaces, isMobile = false }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleCategoryToggle = (categoryId) => {
    const isCurrentlySelected = selectedCategories.includes(categoryId);
    onCategoryChange(categoryId, !isCurrentlySelected);
  };

  const clearSearch = () => {
    onSearchChange('');
  };

  const clearAllFilters = () => {
    onSearchChange('');
    // Clear all categories by deselecting each one
    selectedCategories.forEach(categoryId => {
      onCategoryChange(categoryId, false);
    });
  };

  const hasActiveFilters = searchQuery || selectedCategories.length > 0;
  const showingAllCategories = selectedCategories.length === 0;

  // Mobile sidebar is hidden by default
  if (isMobile) {
    return null; // For now, we'll implement mobile filters later
  }

  return (
    <div style={{
      width: '320px',
      backgroundColor: 'white',
      height: '100vh',
      borderRight: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '4px'
        }}>
          Ceylon Trails
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '20px'
        }}>
          Discover Sri Lanka's hidden gems
        </p>

        {/* Search Box */}
        <div style={{
          position: 'relative',
          marginBottom: '20px'
        }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            border: `2px solid ${isSearchFocused ? '#059669' : '#e5e7eb'}`,
            borderRadius: '8px',
            transition: 'border-color 0.2s'
          }}>
            <Search style={{
              position: 'absolute',
              left: '12px',
              width: '16px',
              height: '16px',
              color: '#9ca3af'
            }} />
            <input
              type="text"
              placeholder="Search places..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              style={{
                width: '100%',
                padding: '12px 40px 12px 40px',
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                backgroundColor: 'transparent',
                color: '#1f2937'
              }}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                style={{
                  position: 'absolute',
                  right: '12px',
                  padding: '2px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: '#9ca3af'
                }}
              >
                <X style={{ width: '14px', height: '14px' }} />
              </button>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <span style={{
            fontSize: '14px',
            color: '#4b5563',
            fontWeight: '500'
          }}>
            {filteredPlaces?.length || 0} of {totalPlaces} places
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              style={{
                fontSize: '12px',
                color: '#059669',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                textDecoration: 'underline'
              }}
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0 24px 24px 24px'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '16px'
        }}>
          Categories
        </h3>

        {/* Show notice when no categories selected */}
        {showingAllCategories && (
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px'
          }}>
            <p style={{
              fontSize: '12px',
              color: '#92400e',
              margin: 0
            }}>
              No categories selected. Select categories to see places.
            </p>
          </div>
        )}

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {categories.map(category => {
            const isSelected = selectedCategories.includes(category.id);
            const categoryPlaces = filteredPlaces?.filter(place => place.category === category.id) || [];
            
            return (
              <label
                key={category.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '6px',
                  backgroundColor: isSelected ? '#f0fdf4' : 'transparent',
                  border: isSelected ? '1px solid #059669' : '1px solid transparent',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.target.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleCategoryToggle(category.id)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#059669'
                  }}
                />
                <span style={{ fontSize: '18px' }}>{category.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: isSelected ? '#059669' : '#1f2937'
                  }}>
                    {category.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    {categoryPlaces.length} {categoryPlaces.length === 1 ? 'place' : 'places'}
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        {/* No results message */}
        {hasActiveFilters && (!filteredPlaces || filteredPlaces.length === 0) && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            marginTop: '20px'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>🔍</div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              No places found
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              lineHeight: '1.5',
              marginBottom: '16px'
            }}>
              Try adjusting your search terms or selecting different categories.
            </p>
            <button
              onClick={clearAllFilters}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarFilters; 