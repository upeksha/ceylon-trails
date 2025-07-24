import { Car, User, Train } from 'lucide-react';

const TravelModeSelector = ({ travelMode, onTravelModeChange }) => {
  const modes = [
    {
      value: 'DRIVING',
      label: 'Driving',
      icon: Car,
      color: '#059669'
    },
    {
      value: 'WALKING',
      label: 'Walking',
      icon: User,
      color: '#1e40af'
    },
    {
      value: 'TRANSIT',
      label: 'Transit',
      icon: Train,
      color: '#7c3aed'
    }
  ];

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px'
    }}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '12px'
      }}>
        Travel Mode
      </h3>
      
      <div style={{
        display: 'flex',
        gap: '8px'
      }}>
        {modes.map((mode) => {
          const IconComponent = mode.icon;
          const isActive = travelMode === mode.value;
          
          return (
            <button
              key={mode.value}
              onClick={() => onTravelModeChange(mode.value)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 8px',
                backgroundColor: isActive ? `${mode.color}15` : '#f9fafb',
                border: `2px solid ${isActive ? mode.color : '#e5e7eb'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: isActive ? mode.color : '#6b7280'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.borderColor = '#d1d5db';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.borderColor = '#e5e7eb';
                }
              }}
            >
              <IconComponent style={{ width: '20px', height: '20px' }} />
              <span style={{
                fontSize: '12px',
                fontWeight: isActive ? '600' : '500'
              }}>
                {mode.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TravelModeSelector; 