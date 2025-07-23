import { useState } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  arrayMove 
} from '@dnd-kit/sortable';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Trash2, 
  Download, 
  ChevronRight, 
  ChevronDown,
  Route
} from 'lucide-react';

import ItineraryCard from './ItineraryCard';
import TravelModeSelector from './TravelModeSelector';

const ItinerarySidebar = ({ 
  itinerary, 
  onReorderItinerary, 
  onRemoveFromItinerary, 
  onClearItinerary,
  travelMode,
  onTravelModeChange,
  routeInfo,
  isCollapsed,
  onToggleCollapsed,
  isMobile = false
}) => {
  const [showRouteDetails, setShowRouteDetails] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = itinerary.findIndex(item => item.id === active.id);
      const newIndex = itinerary.findIndex(item => item.id === over.id);
      
      console.log(`🔄 Reordering itinerary: ${oldIndex} → ${newIndex}`);
      const newOrder = arrayMove(itinerary, oldIndex, newIndex);
      onReorderItinerary(newOrder);
    }
  };

  const formatDistance = (meters) => {
    if (!meters) return '0 km';
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleExportItinerary = () => {
    const itineraryData = {
      places: itinerary,
      travelMode,
      routeInfo,
      exportDate: new Date().toISOString(),
      totalStops: itinerary.length
    };
    
    console.log('📋 Exporting itinerary:', itineraryData);
    
    // For now, just log and show alert
    alert(`Itinerary exported!\n\n${itinerary.length} places\nTravel mode: ${travelMode}\nCheck console for details.`);
  };

  // Mobile collapsed view
  if (isMobile && isCollapsed) {
    return (
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
        boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '16px',
        zIndex: 50
      }}>
        <div style={{
          width: '36px',
          height: '4px',
          backgroundColor: '#d1d5db',
          borderRadius: '2px',
          margin: '0 auto 12px auto'
        }} />
        <button
          onClick={onToggleCollapsed}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Calendar style={{ width: '20px', height: '20px', color: '#059669' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                My Itinerary
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {itinerary.length} {itinerary.length === 1 ? 'place' : 'places'}
                {routeInfo && ` • ${formatDistance(routeInfo.totalDistance)}`}
              </div>
            </div>
          </div>
          <ChevronRight style={{ width: '20px', height: '20px', color: '#6b7280' }} />
        </button>
      </div>
    );
  }

  const sidebarStyle = isMobile ? {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    zIndex: 100,
    overflowY: 'auto'
  } : {
    width: '380px',
    height: '100vh',
    backgroundColor: 'white',
    borderLeft: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto'
  };

  return (
    <div style={sidebarStyle}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        {/* Mobile close button */}
        {isMobile && (
          <button
            onClick={onToggleCollapsed}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              padding: '8px',
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer'
            }}
          >
            <ChevronRight style={{ width: '20px', height: '20px', color: '#6b7280' }} />
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Calendar style={{ width: '24px', height: '24px', color: '#059669' }} />
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1f2937',
            margin: 0
          }}>
            My Itinerary
          </h2>
        </div>

        {/* Travel Mode Selector */}
        <TravelModeSelector
          travelMode={travelMode}
          onTravelModeChange={onTravelModeChange}
          showLabel={true}
        />
      </div>

      {/* Empty State */}
      {itinerary.length === 0 && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#f3f4f6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <MapPin style={{ width: '32px', height: '32px', color: '#9ca3af' }} />
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            No places in your itinerary
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: '1.5',
            marginBottom: '20px'
          }}>
            Click "Add to Itinerary" on any place details to start planning your Sri Lanka adventure!
          </p>
        </div>
      )}

      {/* Itinerary List */}
      {itinerary.length > 0 && (
        <>
          <div style={{ flex: 1, padding: '20px' }}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={itinerary.map(item => item.id)} strategy={verticalListSortingStrategy}>
                {itinerary.map((place, index) => (
                  <ItineraryCard
                    key={place.id}
                    place={place}
                    index={index}
                    onRemove={onRemoveFromItinerary}
                    travelTime={routeInfo?.legs?.[index - 1]?.duration?.value}
                    isFirst={index === 0}
                    isLast={index === itinerary.length - 1}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>

          {/* Summary Footer */}
          <div style={{
            padding: '20px',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb'
          }}>
            {/* Route Summary */}
            {routeInfo && (
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <button
                  onClick={() => setShowRouteDetails(!showRouteDetails)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    marginBottom: showRouteDetails ? '12px' : '0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Route style={{ width: '20px', height: '20px', color: '#059669' }} />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                        Route Summary
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {formatDistance(routeInfo.totalDistance)} • {formatDuration(routeInfo.totalDuration)}
                      </div>
                    </div>
                  </div>
                  {showRouteDetails ? (
                    <ChevronDown style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                  ) : (
                    <ChevronRight style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                  )}
                </button>

                {showRouteDetails && routeInfo.legs && (
                  <div style={{ paddingLeft: '32px' }}>
                    {routeInfo.legs.map((leg, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderTop: index > 0 ? '1px solid #f3f4f6' : 'none'
                      }}>
                        <div style={{ fontSize: '12px', color: '#4b5563' }}>
                          {leg.from} → {leg.to}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>
                          {leg.distance.text} • {leg.duration.text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={onClearItinerary}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#6b7280',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#dc2626';
                  e.target.style.color = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.color = '#6b7280';
                }}
              >
                <Trash2 style={{ width: '16px', height: '16px' }} />
                Clear All
              </button>

              <button
                onClick={handleExportItinerary}
                style={{
                  flex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: '#059669',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'white',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#047857';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#059669';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <Download style={{ width: '16px', height: '16px' }} />
                Export Itinerary
              </button>
            </div>

            {/* Quick Stats */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '16px',
              padding: '12px',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
                  {itinerary.length}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {itinerary.length === 1 ? 'Stop' : 'Stops'}
                </div>
              </div>
              
              {routeInfo && (
                <>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
                      {formatDistance(routeInfo.totalDistance)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      Distance
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
                      {formatDuration(routeInfo.totalDuration)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      Travel Time
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ItinerarySidebar; 