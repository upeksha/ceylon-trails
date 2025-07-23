import { Trash2, GripVertical, MapPin, Clock } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getCategoryInfo } from '../data/places';

const ItineraryCard = ({ place, index, onRemove, travelTime, isFirst, isLast }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: place.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const categoryInfo = getCategoryInfo(place.category);
  
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

  const formatTravelTime = (time) => {
    if (!time) return null;
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* Travel Time Indicator (between cards) */}
      {!isFirst && travelTime && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '8px 0',
          gap: '8px'
        }}>
          <div style={{
            flex: 1,
            height: '2px',
            background: 'linear-gradient(to right, #e5e7eb, #059669, #e5e7eb)'
          }} />
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #059669',
            borderRadius: '12px',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Clock style={{ width: '12px', height: '12px', color: '#059669' }} />
            <span style={{ fontSize: '11px', fontWeight: '500', color: '#059669' }}>
              {formatTravelTime(travelTime)}
            </span>
          </div>
          <div style={{
            flex: 1,
            height: '2px',
            background: 'linear-gradient(to right, #e5e7eb, #059669, #e5e7eb)'
          }} />
        </div>
      )}

      {/* Itinerary Card */}
      <div style={{
        backgroundColor: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.2s',
        cursor: isDragging ? 'grabbing' : 'default',
        borderColor: isDragging ? '#059669' : '#e5e7eb'
      }}>
        {/* Card Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          marginBottom: '12px'
        }}>
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            style={{
              cursor: 'grab',
              padding: '4px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#9ca3af',
              borderRadius: '4px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
              e.target.style.color = '#6b7280';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#9ca3af';
            }}
          >
            <GripVertical style={{ width: '16px', height: '16px' }} />
          </button>

          {/* Stop Number */}
          <div style={{
            minWidth: '28px',
            height: '28px',
            backgroundColor: getCategoryColor(categoryInfo?.color),
            color: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '700',
            marginTop: '2px'
          }}>
            {index + 1}
          </div>

          {/* Place Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Category Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: `${getCategoryColor(categoryInfo?.color)}15`,
              border: `1px solid ${getCategoryColor(categoryInfo?.color)}30`,
              borderRadius: '12px',
              padding: '2px 8px',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '12px' }}>{categoryInfo?.icon}</span>
              <span style={{
                fontSize: '11px',
                fontWeight: '600',
                color: getCategoryColor(categoryInfo?.color)
              }}>
                {categoryInfo?.name}
              </span>
            </div>

            {/* Place Name */}
            <h4 style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '6px',
              lineHeight: '1.3',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {place.name}
            </h4>

            {/* Location Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '8px'
            }}>
              <MapPin style={{ 
                width: '12px', 
                height: '12px', 
                color: '#6b7280',
                flexShrink: 0
              }} />
              <span style={{
                fontSize: '12px',
                color: '#6b7280',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {place.position.lat.toFixed(4)}, {place.position.lng.toFixed(4)}
              </span>
            </div>

            {/* Description */}
            {place.description && (
              <p style={{
                fontSize: '12px',
                color: '#4b5563',
                lineHeight: '1.4',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {place.description}
              </p>
            )}
          </div>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(place.id)}
            style={{
              padding: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#9ca3af',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginTop: '2px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#fef2f2';
              e.target.style.color = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#9ca3af';
            }}
          >
            <Trash2 style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItineraryCard; 