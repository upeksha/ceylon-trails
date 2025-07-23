import { Car, User, Bus } from 'lucide-react';
import { useState } from 'react';

const TravelModeSelector = ({ travelMode, onTravelModeChange, showLabel = true }) => {
  const [isOpen, setIsOpen] = useState(false);

  const travelModes = [
    {
      id: 'DRIVING',
      name: 'Driving',
      icon: Car,
      color: '#1e40af',
      description: 'By car or vehicle'
    },
    {
      id: 'WALKING',
      name: 'Walking',
      icon: User,
      color: '#059669',
      description: 'On foot'
    },
    {
      id: 'TRANSIT',
      name: 'Transit',
      icon: Bus,
      color: '#7c3aed',
      description: 'Public transport'
    }
  ];

  const currentMode = travelModes.find(mode => mode.id === travelMode) || travelModes[0];

  const handleModeSelect = (mode) => {
    onTravelModeChange(mode.id);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {showLabel && (
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '8px'
        }}>
          🚗 Travel Mode
        </label>
      )}
      
      {/* Selected Mode Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          backgroundColor: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: isOpen ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
          borderColor: isOpen ? '#3b82f6' : '#e5e7eb'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.target.style.borderColor = '#d1d5db';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.target.style.borderColor = '#e5e7eb';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <currentMode.icon 
            style={{ 
              width: '20px', 
              height: '20px', 
              color: currentMode.color 
            }} 
          />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
              {currentMode.name}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {currentMode.description}
            </div>
          </div>
        </div>
        <div style={{
          fontSize: '12px',
          color: '#9ca3af',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s'
        }}>
          ▼
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          marginTop: '4px'
        }}>
          {travelModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleModeSelect(mode)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: mode.id === travelMode ? '#f3f4f6' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                borderBottom: mode.id !== travelModes[travelModes.length - 1].id ? '1px solid #f3f4f6' : 'none'
              }}
              onMouseEnter={(e) => {
                if (mode.id !== travelMode) {
                  e.target.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (mode.id !== travelMode) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <mode.icon 
                style={{ 
                  width: '18px', 
                  height: '18px', 
                  color: mode.color 
                }} 
              />
              <div style={{ textAlign: 'left' }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#1f2937' 
                }}>
                  {mode.name}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#6b7280' 
                }}>
                  {mode.description}
                </div>
              </div>
              {mode.id === travelMode && (
                <div style={{ 
                  marginLeft: 'auto',
                  color: '#059669',
                  fontSize: '16px'
                }}>
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TravelModeSelector; 