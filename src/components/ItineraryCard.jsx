import { GripVertical, X, MapPin } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getCategoryInfo } from '../data/places';

const ItineraryCard = ({ place, index, onRemove, isDragging = false, dragId }) => {
  console.log('🔍 ItineraryCard: Rendering place:', place);
  console.log('🔍 ItineraryCard: Place structure:', {
    id: place?.id,
    name: place?.name,
    hasPosition: !!place?.position,
    position: place?.position,
    hasDescription: !!place?.description,
    description: place?.description
  });

  // Get category info
  const categoryInfo = getCategoryInfo(place.category);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: dragId || place.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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

  const isCurrentlyDragging = isDragging || isSortableDragging;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: isCurrentlyDragging ? '#f3f4f6' : 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
        cursor: isCurrentlyDragging ? 'grabbing' : 'default',
        opacity: isCurrentlyDragging ? 0.8 : 1,
        transform: isCurrentlyDragging ? `${CSS.Transform.toString(transform)} rotate(2deg)` : CSS.Transform.toString(transform),
        transition: 'all 0.2s ease',
        boxShadow: isCurrentlyDragging ? '0 10px 25px -5px rgba(0, 0, 0, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          style={{
            cursor: 'grab',
            padding: '4px',
            borderRadius: '4px',
            color: '#9ca3af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '24px',
            height: '24px'
          }}
          onMouseEnter={(e) => e.target.style.color = '#6b7280'}
          onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
        >
          <GripVertical style={{ width: '16px', height: '16px' }} />
        </div>

        {/* Index Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          backgroundColor: '#1e40af',
          color: 'white',
          borderRadius: '50%',
          fontSize: '12px',
          fontWeight: '600',
          flexShrink: 0
        }}>
          {index + 1}
        </div>

        {/* Place Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Category Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              backgroundColor: `${getCategoryColor(categoryInfo?.color)}15`,
              borderRadius: '12px',
              border: `1px solid ${getCategoryColor(categoryInfo?.color)}30`
            }}>
              <span style={{ fontSize: '14px' }}>{categoryInfo?.icon}</span>
              <span style={{
                fontSize: '11px',
                fontWeight: '600',
                color: getCategoryColor(categoryInfo?.color)
              }}>
                {categoryInfo?.name}
              </span>
            </div>
          </div>

          {/* Place Name */}
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '6px',
            lineHeight: '1.3'
          }}>
            {place.name}
          </h4>

          {/* Address/Description */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
            <MapPin style={{ width: '14px', height: '14px', color: '#6b7280', marginTop: '2px', flexShrink: 0 }} />
            <p style={{
              fontSize: '13px',
              color: '#6b7280',
              lineHeight: '1.4',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {place.description || (place.position ? `${place.position.lat.toFixed(4)}, ${place.position.lng.toFixed(4)}` : 'Location not available')}
            </p>
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(place.id)}
          style={{
            padding: '6px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            cursor: 'pointer',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#fee2e2';
            e.target.style.borderColor = '#fca5a5';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#fef2f2';
            e.target.style.borderColor = '#fecaca';
          }}
          title="Remove from itinerary"
        >
          <X style={{ width: '14px', height: '14px' }} />
        </button>
      </div>
    </div>
  );
};

export default ItineraryCard; 