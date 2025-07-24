import { useState, useEffect, useMemo } from 'react';
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
import { Plus, X, Calendar, GripVertical, MapPin } from 'lucide-react';
import ItineraryCard from './ItineraryCard';

const MultiDayPlanner = ({ 
  itinerary, 
  onItineraryChange, 
  currentDay, 
  onCurrentDayChange,
  onRemovePlace,
  isMobile = false 
}) => {
  const [activeTab, setActiveTab] = useState(currentDay);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update active tab when current day changes
  useEffect(() => {
    setActiveTab(currentDay);
  }, [currentDay]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    console.log('🔄 MultiDayPlanner: Drag end event:', { active, over });

    if (!active || !over || active.id === over.id) {
      console.log('🔄 MultiDayPlanner: No valid drag operation');
      return;
    }

    // Parse the IDs - format should be "day-placeId"
    const activeParts = active.id.split('-');
    const overParts = over.id.split('-');
    
    if (activeParts.length !== 2 || overParts.length !== 2) {
      console.error('❌ MultiDayPlanner: Invalid ID format:', { activeId: active.id, overId: over.id });
      return;
    }

    const activeDay = parseInt(activeParts[0]);
    const activePlaceId = activeParts[1]; // Keep as string - don't parse as integer
    const overDay = parseInt(overParts[0]);
    const overPlaceId = overParts[1]; // Keep as string - don't parse as integer
    
    console.log('🔄 MultiDayPlanner: Parsed IDs:', { activeDay, activePlaceId, overDay, overPlaceId });
    
    if (activeDay === overDay) {
      // Reorder within the same day
      console.log('🔄 MultiDayPlanner: Reordering within Day', activeDay);
      const dayIndex = itinerary.findIndex(day => day.day === activeDay);
      if (dayIndex !== -1) {
        const day = itinerary[dayIndex];
        const oldIndex = day.places.findIndex(place => place.id === activePlaceId);
        const newIndex = day.places.findIndex(place => place.id === overPlaceId);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const newPlaces = arrayMove(day.places, oldIndex, newIndex);
          const newItinerary = [...itinerary];
          newItinerary[dayIndex] = { ...day, places: newPlaces };
          
          console.log('✅ MultiDayPlanner: Reordered places in Day', activeDay, 'from index', oldIndex, 'to', newIndex);
          onItineraryChange(newItinerary);
        } else {
          console.error('❌ MultiDayPlanner: Could not find place indices:', { oldIndex, newIndex, activePlaceId, overPlaceId });
        }
      } else {
        console.error('❌ MultiDayPlanner: Could not find day:', activeDay);
      }
    } else {
      // Move place between days
      console.log('🔄 MultiDayPlanner: Moving place from Day', activeDay, 'to Day', overDay);
      const sourceDayIndex = itinerary.findIndex(day => day.day === activeDay);
      const targetDayIndex = itinerary.findIndex(day => day.day === overDay);
      
      if (sourceDayIndex !== -1 && targetDayIndex !== -1) {
        const sourceDay = itinerary[sourceDayIndex];
        const targetDay = itinerary[targetDayIndex];
        const placeIndex = sourceDay.places.findIndex(place => place.id === activePlaceId);
        
        if (placeIndex !== -1) {
          const place = sourceDay.places[placeIndex];
          const newSourcePlaces = sourceDay.places.filter((_, index) => index !== placeIndex);
          const newTargetPlaces = [...targetDay.places, place];
          
          const newItinerary = [...itinerary];
          newItinerary[sourceDayIndex] = { ...sourceDay, places: newSourcePlaces };
          newItinerary[targetDayIndex] = { ...targetDay, places: newTargetPlaces };
          
          console.log('✅ MultiDayPlanner: Moved', place.name, 'from Day', activeDay, 'to Day', overDay);
          onItineraryChange(newItinerary);
        } else {
          console.error('❌ MultiDayPlanner: Could not find place in source day:', activePlaceId);
        }
      } else {
        console.error('❌ MultiDayPlanner: Could not find source or target day:', { sourceDayIndex, targetDayIndex });
      }
    }
  };

  const handleAddDay = () => {
    const newDayNumber = itinerary.length > 0 ? Math.max(...itinerary.map(day => day.day)) + 1 : 1;
    const newDay = {
      day: newDayNumber,
      places: []
    };
    
    const newItinerary = [...itinerary, newDay];
    onItineraryChange(newItinerary);
    setActiveTab(newDayNumber);
    onCurrentDayChange(newDayNumber);
    console.log(`📅 Added new Day ${newDayNumber}`);
  };

  const handleRemoveDay = (dayNumber) => {
    if (itinerary.length <= 1) {
      console.log('⚠️ Cannot remove the last day');
      return;
    }
    
    const newItinerary = itinerary.filter(day => day.day !== dayNumber);
    const newCurrentDay = newItinerary[0].day;
    
    onItineraryChange(newItinerary);
    setActiveTab(newCurrentDay);
    onCurrentDayChange(newCurrentDay);
    console.log(`🗑️ Removed Day ${dayNumber}`);
  };

  const handleTabClick = (dayNumber) => {
    setActiveTab(dayNumber);
    onCurrentDayChange(dayNumber);
  };

  const getCurrentDayPlaces = () => {
    const currentDayData = itinerary.find(day => day.day === activeTab);
    const places = currentDayData ? currentDayData.places : [];
    console.log('🔍 MultiDayPlanner: getCurrentDayPlaces for day', activeTab, ':', places);
    return places;
  };

  // Memoize the sortable items to prevent unnecessary re-renders
  const sortableItems = useMemo(() => {
    const places = getCurrentDayPlaces();
    return places.map(place => `${activeTab}-${place.id}`);
  }, [activeTab, getCurrentDayPlaces()]);

  const getTotalPlaces = () => {
    return itinerary.reduce((total, day) => total + day.places.length, 0);
  };

  const getDayStats = (dayNumber) => {
    const day = itinerary.find(d => d.day === dayNumber);
    return day ? day.places.length : 0;
  };

  const containerStyle = isMobile ? {
    backgroundColor: 'white',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    boxShadow: '0 -10px 25px -5px rgba(0, 0, 0, 0.1)',
    maxHeight: '85vh',
    overflowY: 'auto',
    border: '1px solid #e5e7eb'
  } : {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    maxHeight: 'calc(100vh - 32px)',
    overflowY: 'auto',
    border: '1px solid #e5e7eb'
  };

  return (
    <div style={containerStyle}>
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
            <Calendar style={{ width: '24px', height: '24px', color: '#1e40af' }} />
            <h2 style={{
              fontSize: isMobile ? '20px' : '22px',
              fontWeight: '700',
              color: '#1f2937',
              margin: 0
            }}>
              Multi-Day Planner
            </h2>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '14px',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <MapPin style={{ width: '16px', height: '16px' }} />
              {getTotalPlaces()} total places
            </span>
          </div>
        </div>

        {/* Day Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px'
        }}>
          {itinerary.map((day) => (
            <button
              key={day.day}
              onClick={() => handleTabClick(day.day)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: activeTab === day.day ? '#1e40af' : '#f9fafb',
                color: activeTab === day.day ? 'white' : '#6b7280',
                border: `2px solid ${activeTab === day.day ? '#1e40af' : '#e5e7eb'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                minWidth: 'fit-content'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== day.day) {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.borderColor = '#d1d5db';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== day.day) {
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.borderColor = '#e5e7eb';
                }
              }}
            >
              <span>Day {day.day}</span>
              <span style={{
                backgroundColor: activeTab === day.day ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
                color: activeTab === day.day ? 'white' : '#6b7280',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {getDayStats(day.day)}
              </span>
              {itinerary.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveDay(day.day);
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    padding: '2px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                  title={`Remove Day ${day.day}`}
                >
                  <X style={{ width: '14px', height: '14px' }} />
                </button>
              )}
            </button>
          ))}
          
          {/* Add Day Button */}
          <button
            onClick={handleAddDay}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: '#059669',
              color: 'white',
              border: '2px solid #059669',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              minWidth: 'fit-content'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#047857';
              e.target.style.borderColor = '#047857';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#059669';
              e.target.style.borderColor = '#059669';
            }}
            title="Add new day"
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            Add Day
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: isMobile ? '20px' : '24px' }}>
        {getCurrentDayPlaces().length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#6b7280'
          }}>
            <Calendar style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              Day {activeTab} is empty
            </h3>
            <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
              Click on place markers to add them to Day {activeTab}, or drag places from other days.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortableItems}
              strategy={verticalListSortingStrategy}
            >
              {getCurrentDayPlaces().map((place, index) => {
                console.log('🔍 MultiDayPlanner: Rendering ItineraryCard for place:', place);
                return (
                  <ItineraryCard
                    key={`${activeTab}-${place.id}`}
                    place={place}
                    index={index}
                    onRemove={() => onRemovePlace(place.id, activeTab)}
                    dragId={`${activeTab}-${place.id}`}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default MultiDayPlanner; 