import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Trash2, Route, Download, Clock, MapPin, Save, Calendar, User, Lock } from 'lucide-react';
import ItineraryCard from './ItineraryCard';
import TravelModeSelector from './TravelModeSelector';
import MultiDayPlanner from './MultiDayPlanner';
import ExportModal from './ExportModal';
import SaveItineraryModal from './SaveItineraryModal';
import { useAuth } from '../contexts/AuthProvider';
import { useItinerary } from '../contexts/ItineraryContext';

const ItinerarySidebar = ({ 
  itinerary, 
  onItineraryChange, 
  onClearItinerary, 
  travelMode, 
  onTravelModeChange,
  routeStats,
  isMobile = false,
  currentDay = 1,
  onCurrentDayChange
}) => {
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isMultiDayMode, setIsMultiDayMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ type: '', message: '', timestamp: null });

  // Context hooks
  const { user } = useAuth();
  const { 
    saveCurrentItinerary, 
    loadFromLocalStorage, 
    lastSaved,
    hasUnsavedChanges,
    loading: saveLoading,
    error: saveError,
    currentItineraryTitle
  } = useItinerary();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Check if itinerary is multi-day format
  useEffect(() => {
    const isMultiDay = Array.isArray(itinerary) && itinerary.length > 0 && itinerary[0].hasOwnProperty('day');
    setIsMultiDayMode(isMultiDay);
  }, [itinerary]);

  // Handle save status updates
  useEffect(() => {
    if (saveError) {
      setSaveStatus({
        type: 'error',
        message: saveError,
        timestamp: new Date()
      });
    }
  }, [saveError]);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      if (isMultiDayMode) {
        // Multi-day mode - handled by MultiDayPlanner
        return;
      } else {
        // Single-day mode
        const oldIndex = itinerary.findIndex(item => item.id === active.id);
        const newIndex = itinerary.findIndex(item => item.id === over.id);

        const newItinerary = arrayMove(itinerary, oldIndex, newIndex);
        onItineraryChange(newItinerary);
      }
    }
  };

  const handleRemovePlace = (placeId, dayNumber = null) => {
    if (isMultiDayMode) {
      // Multi-day mode
      const newItinerary = itinerary.map(day => {
        if (day.day === dayNumber) {
          return {
            ...day,
            places: day.places.filter(place => place.id !== placeId)
          };
        }
        return day;
      });
      onItineraryChange(newItinerary);
    } else {
      // Single-day mode
      const newItinerary = itinerary.filter(place => place.id !== placeId);
      onItineraryChange(newItinerary);
    }
  };

  const handleClearItinerary = () => {
    if (showConfirmClear) {
      onClearItinerary();
      setShowConfirmClear(false);
    } else {
      setShowConfirmClear(true);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowConfirmClear(false), 3000);
    }
  };

  const handleSaveClick = () => {
    if (!user) {
      setSaveStatus({
        type: 'error',
        message: 'Please sign in to save your itinerary',
        timestamp: new Date()
      });
      return;
    }

    // Check if itinerary has places
    const totalPlaces = getTotalPlaces();
    if (totalPlaces === 0) {
      setSaveStatus({
        type: 'error',
        message: 'Cannot save empty itinerary. Please add places to your itinerary first.',
        timestamp: new Date()
      });
      return;
    }

    // Check if there are unsaved changes
    if (!hasUnsavedChanges) {
      setSaveStatus({
        type: 'error',
        message: 'No changes to save. Your itinerary is already up to date.',
        timestamp: new Date()
      });
      return;
    }
    
    // Show save modal to get itinerary name
    setShowSaveModal(true);
  };

  const handleSaveItinerary = async (title) => {
    console.log('🔄 ItinerarySidebar: Save button clicked with title:', title);
    console.log('🔄 ItinerarySidebar: Current user:', user);
    console.log('🔄 ItinerarySidebar: Current itinerary:', itinerary);
    
    try {
      console.log('🔄 ItinerarySidebar: Calling saveCurrentItinerary...');
      const result = await saveCurrentItinerary(title);
      console.log('💾 ItinerarySidebar: Save result:', result);
      
      if (result.success) {
        setSaveStatus({
          type: 'success',
          message: 'Itinerary saved successfully!',
          timestamp: new Date()
        });
        setShowSaveModal(false);
        console.log('✅ ItinerarySidebar: Itinerary saved successfully');
      } else {
        console.error('❌ ItinerarySidebar: Save failed with error:', result.error);
        setSaveStatus({
          type: 'error',
          message: result.error || 'Failed to save itinerary',
          timestamp: new Date()
        });
        console.error('❌ ItinerarySidebar: Failed to save itinerary:', result.error);
      }
    } catch (error) {
      console.error('❌ ItinerarySidebar: Save error caught:', error);
      setSaveStatus({
        type: 'error',
        message: 'An error occurred while saving',
        timestamp: new Date()
      });
      console.error('❌ ItinerarySidebar: Save error:', error);
    }
  };

  const handleExportItinerary = () => {
    setShowExportModal(true);
  };

  const getTotalPlaces = () => {
    if (isMultiDayMode) {
      return itinerary.reduce((total, day) => total + day.places.length, 0);
    } else {
      return itinerary.length;
    }
  };

  const getCurrentDayPlaces = () => {
    if (isMultiDayMode) {
      const currentDayData = itinerary.find(day => day.day === currentDay);
      return currentDayData ? currentDayData.places : [];
    } else {
      return itinerary;
    }
  };

  const getSaveButtonStyle = () => {
    const baseStyle = {
      padding: '8px 12px',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s'
    };

    if (!user) {
      return {
        ...baseStyle,
        backgroundColor: '#9ca3af',
        cursor: 'not-allowed',
        opacity: 0.6
      };
    }

    if (getTotalPlaces() === 0) {
      return {
        ...baseStyle,
        backgroundColor: '#9ca3af',
        cursor: 'not-allowed',
        opacity: 0.6
      };
    }

    if (!hasUnsavedChanges) {
      return {
        ...baseStyle,
        backgroundColor: '#9ca3af',
        cursor: 'not-allowed',
        opacity: 0.6
      };
    }

    if (saveLoading) {
      return {
        ...baseStyle,
        backgroundColor: '#f59e0b',
        cursor: 'not-allowed'
      };
    }

    if (saveStatus.type === 'success') {
      return {
        ...baseStyle,
        backgroundColor: '#10b981'
      };
    }

    if (saveStatus.type === 'error') {
      return {
        ...baseStyle,
        backgroundColor: '#ef4444'
      };
    }

    return {
      ...baseStyle,
      backgroundColor: '#059669'
    };
  };

  const getSaveButtonText = () => {
    if (!user) return 'Sign In to Save';
    if (getTotalPlaces() === 0) return 'Add Places to Save';
    if (!hasUnsavedChanges) return 'No Changes to Save';
    if (saveLoading) return 'Saving...';
    if (saveStatus.type === 'success') return 'Saved!';
    if (saveStatus.type === 'error') return 'Error';
    return 'Save Changes';
  };

  const sidebarStyle = isMobile ? {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    boxShadow: '0 -10px 25px -5px rgba(0, 0, 0, 0.1)',
    maxHeight: '85vh',
    overflowY: 'auto',
    zIndex: 1000,
    border: '1px solid #e5e7eb'
  } : {
    position: 'absolute',
    top: '16px',
    left: '16px',
    width: '380px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    maxHeight: 'calc(100vh - 32px)',
    overflowY: 'auto',
    border: '1px solid #e5e7eb'
  };

  return (
    <>
      <div style={sidebarStyle}>
        {/* Header */}
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

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isMultiDayMode ? (
                <Calendar style={{ width: '24px', height: '24px', color: '#1e40af' }} />
              ) : (
                <Route style={{ width: '24px', height: '24px', color: '#1e40af' }} />
              )}
              <h2 style={{
                fontSize: isMobile ? '20px' : '22px',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0
              }}>
                {isMultiDayMode ? 'Multi-Day Planner' : 'My Itinerary'}
              </h2>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              {/* Save Button */}
              <button
                onClick={handleSaveClick}
                disabled={!user || saveLoading || getTotalPlaces() === 0 || !hasUnsavedChanges}
                style={getSaveButtonStyle()}
                title={
                  !user ? "Sign in to save your itinerary" :
                  getTotalPlaces() === 0 ? "Add places to your itinerary to save it" :
                  !hasUnsavedChanges ? "No changes to save" :
                  "Save itinerary to cloud"
                }
              >
                {saveLoading ? (
                  <div style={{ width: '14px', height: '14px', border: '2px solid transparent', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                ) : !user ? (
                  <Lock style={{ width: '14px', height: '14px' }} />
                ) : (
                  <Save style={{ width: '14px', height: '14px' }} />
                )}
                {getSaveButtonText()}
              </button>

              {/* Export Button */}
              <button
                onClick={handleExportItinerary}
                disabled={getTotalPlaces() === 0}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#7c3aed',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: getTotalPlaces() === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: getTotalPlaces() === 0 ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (getTotalPlaces() > 0) {
                    e.target.style.backgroundColor = '#6d28d9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (getTotalPlaces() > 0) {
                    e.target.style.backgroundColor = '#7c3aed';
                  }
                }}
                title="Export itinerary"
              >
                <Download style={{ width: '14px', height: '14px' }} />
                Export
              </button>

              {/* Clear Button */}
              <button
                onClick={handleClearItinerary}
                disabled={getTotalPlaces() === 0}
                style={{
                  padding: '8px 12px',
                  backgroundColor: showConfirmClear ? '#dc2626' : '#fef2f2',
                  color: showConfirmClear ? 'white' : '#dc2626',
                  border: `1px solid ${showConfirmClear ? '#dc2626' : '#fecaca'}`,
                  borderRadius: '8px',
                  cursor: getTotalPlaces() === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: getTotalPlaces() === 0 ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (getTotalPlaces() > 0 && !showConfirmClear) {
                    e.target.style.backgroundColor = '#fee2e2';
                    e.target.style.borderColor = '#fca5a5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (getTotalPlaces() > 0 && !showConfirmClear) {
                    e.target.style.backgroundColor = '#fef2f2';
                    e.target.style.borderColor = '#fecaca';
                  }
                }}
                title={showConfirmClear ? "Click again to confirm" : "Clear all places"}
              >
                <Trash2 style={{ width: '14px', height: '14px' }} />
                {showConfirmClear ? 'Confirm' : 'Clear'}
              </button>
            </div>
          </div>

          {/* Itinerary Summary */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin style={{ width: '16px', height: '16px' }} />
              {getTotalPlaces()} {getTotalPlaces() === 1 ? 'place' : 'places'}
            </span>
            
            {isMultiDayMode && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar style={{ width: '16px', height: '16px' }} />
                {itinerary.length} {itinerary.length === 1 ? 'day' : 'days'}
              </span>
            )}
            
            {routeStats && (
              <>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Route style={{ width: '16px', height: '16px' }} />
                  {routeStats.totalDistanceText}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock style={{ width: '16px', height: '16px' }} />
                  {routeStats.totalDurationText}
                </span>
              </>
            )}
          </div>

          {/* Save Status */}
          {saveStatus.message && (
            <div style={{
              marginTop: '8px',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: saveStatus.type === 'success' ? '#f0fdf4' : 
                           saveStatus.type === 'error' ? '#fef2f2' : '#eff6ff',
              color: saveStatus.type === 'success' ? '#166534' : 
                     saveStatus.type === 'error' ? '#dc2626' : '#1e40af',
              border: `1px solid ${saveStatus.type === 'success' ? '#bbf7d0' : 
                                  saveStatus.type === 'error' ? '#fecaca' : '#dbeafe'}`
            }}>
              {saveStatus.message}
            </div>
          )}

          {/* Last Saved Info */}
          {lastSaved && user && (
            <div style={{
              marginTop: '8px',
              fontSize: '12px',
              color: '#9ca3af',
              fontStyle: 'italic'
            }}>
              Last saved: {lastSaved.toLocaleString()}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: isMobile ? '20px' : '24px' }}>
          {/* Travel Mode Selector */}
          <TravelModeSelector 
            travelMode={travelMode} 
            onTravelModeChange={onTravelModeChange} 
          />

          {/* Multi-Day Planner or Single Day List */}
          {isMultiDayMode ? (
            <MultiDayPlanner
              itinerary={itinerary}
              onItineraryChange={onItineraryChange}
              currentDay={currentDay}
              onCurrentDayChange={onCurrentDayChange}
              onRemovePlace={handleRemovePlace}
              isMobile={isMobile}
            />
          ) : (
            // Single Day List (legacy mode)
            getCurrentDayPlaces().length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#6b7280'
              }}>
                <Route style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  No places in itinerary
                </h3>
                <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  Click on place markers to add them to your itinerary and start planning your journey.
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={getCurrentDayPlaces().map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {getCurrentDayPlaces().map((place, index) => (
                    <ItineraryCard
                      key={place.id}
                      place={place}
                      index={index}
                      onRemove={handleRemovePlace}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )
          )}
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        itinerary={itinerary}
        travelMode={travelMode}
        routeStats={routeStats}
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        isMobile={isMobile}
      />

      {/* Save Itinerary Modal */}
      <SaveItineraryModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveItinerary}
        currentTitle={currentItineraryTitle !== 'Untitled Itinerary' ? currentItineraryTitle : ''}
        isLoading={saveLoading}
      />

      {/* CSS for loading spinner */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default ItinerarySidebar; 