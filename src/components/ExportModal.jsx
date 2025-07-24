import { useState, useEffect } from 'react';
import { X, Download, Printer, Share2, Calendar, MapPin, Route, Clock } from 'lucide-react';
import { exportItineraryData } from '../utils/localStorage';
import { getCategoryInfo } from '../data/places';

const ExportModal = ({ 
  itinerary, 
  travelMode, 
  routeStats, 
  isOpen, 
  onClose, 
  isMobile = false 
}) => {
  const [exportData, setExportData] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (isOpen && itinerary) {
      const data = exportItineraryData(itinerary, travelMode);
      setExportData(data);
    }
  }, [isOpen, itinerary, travelMode]);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  const handleDownload = () => {
    if (!exportData) return;
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ceylon-trails-itinerary-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    console.log('📤 Downloaded itinerary data');
  };

  const handleShare = () => {
    if (!exportData) return;
    
    const shareText = `My Ceylon Trails Itinerary (${exportData.totalDays} days, ${exportData.totalPlaces} places)`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: 'Ceylon Trails Itinerary',
        text: shareText,
        url: shareUrl
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
        alert('Itinerary link copied to clipboard!');
      });
    }
    
    console.log('📤 Shared itinerary');
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

  const getTravelModeIcon = (mode) => {
    const icons = {
      'DRIVING': '🚗',
      'WALKING': '🚶',
      'TRANSIT': '🚌'
    };
    return icons[mode] || '🚗';
  };

  const getTravelModeName = (mode) => {
    const names = {
      'DRIVING': 'Driving',
      'WALKING': 'Walking',
      'TRANSIT': 'Public Transit'
    };
    return names[mode] || 'Driving';
  };

  if (!isOpen || !exportData) return null;

  const modalStyle = isMobile ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '16px'
  } : {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '32px'
  };

  const contentStyle = isMobile ? {
    backgroundColor: 'white',
    borderRadius: '16px',
    maxWidth: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
    width: '100%'
  } : {
    backgroundColor: 'white',
    borderRadius: '16px',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
    width: '100%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: isMobile ? '20px' : '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          borderRadius: '16px 16px 0 0',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Download style={{ width: '24px', height: '24px', color: '#1e40af' }} />
            <h2 style={{
              fontSize: isMobile ? '20px' : '22px',
              fontWeight: '700',
              color: '#1f2937',
              margin: 0
            }}>
              Export Itinerary
            </h2>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleShare}
              style={{
                padding: '8px 12px',
                backgroundColor: '#7c3aed',
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
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#6d28d9'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#7c3aed'}
              title="Share itinerary"
            >
              <Share2 style={{ width: '14px', height: '14px' }} />
              Share
            </button>
            
            <button
              onClick={handleDownload}
              style={{
                padding: '8px 12px',
                backgroundColor: '#059669',
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
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#047857'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#059669'}
              title="Download JSON"
            >
              <Download style={{ width: '14px', height: '14px' }} />
              JSON
            </button>
            
            <button
              onClick={handlePrint}
              style={{
                padding: '8px 12px',
                backgroundColor: '#1e40af',
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
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1e3a8a'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#1e40af'}
              title="Print itinerary"
            >
              <Printer style={{ width: '14px', height: '14px' }} />
              Print
            </button>
            
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                backgroundColor: '#f3f4f6',
                color: '#6b7280',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e5e7eb';
                e.target.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
                e.target.style.color = '#6b7280';
              }}
              title="Close"
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: isMobile ? '20px' : '24px' }}>
          {/* Itinerary Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '32px',
            padding: '24px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <h1 style={{
              fontSize: isMobile ? '24px' : '28px',
              fontWeight: '800',
              color: '#1e293b',
              marginBottom: '8px'
            }}>
              Ceylon Trails Itinerary
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#64748b',
              marginBottom: '16px'
            }}>
              {exportData.totalDays} {exportData.totalDays === 1 ? 'Day' : 'Days'} • {exportData.totalPlaces} Places
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              fontSize: '14px',
              color: '#64748b'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {getTravelModeIcon(travelMode)}
                {getTravelModeName(travelMode)}
              </span>
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
            <p style={{
              fontSize: '12px',
              color: '#94a3b8',
              marginTop: '12px'
            }}>
              Generated on {new Date(exportData.exportDate).toLocaleDateString()}
            </p>
          </div>

          {/* Daily Itineraries */}
          {itinerary.map((day, dayIndex) => (
            <div key={day.day} style={{
              marginBottom: '32px',
              pageBreakInside: 'avoid'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
                padding: '12px 16px',
                backgroundColor: '#1e40af',
                color: 'white',
                borderRadius: '8px'
              }}>
                <Calendar style={{ width: '20px', height: '20px' }} />
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  margin: 0
                }}>
                  Day {day.day}
                </h3>
                <span style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {day.places.length} {day.places.length === 1 ? 'place' : 'places'}
                </span>
              </div>

              {day.places.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '24px',
                  color: '#94a3b8',
                  fontStyle: 'italic'
                }}>
                  No places planned for this day
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {day.places.map((place, placeIndex) => {
                    const categoryInfo = getCategoryInfo(place.category);
                    return (
                      <div key={place.id} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '16px',
                        padding: '16px',
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}>
                        {/* Index */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          backgroundColor: '#1e40af',
                          color: 'white',
                          borderRadius: '50%',
                          fontSize: '14px',
                          fontWeight: '700',
                          flexShrink: 0
                        }}>
                          {placeIndex + 1}
                        </div>

                        {/* Place Info */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 8px',
                              backgroundColor: `${getCategoryColor(categoryInfo?.color)}15`,
                              borderRadius: '8px',
                              border: `1px solid ${getCategoryColor(categoryInfo?.color)}30`
                            }}>
                              <span style={{ fontSize: '12px' }}>{categoryInfo?.icon}</span>
                              <span style={{
                                fontSize: '10px',
                                fontWeight: '600',
                                color: getCategoryColor(categoryInfo?.color)
                              }}>
                                {categoryInfo?.name}
                              </span>
                            </div>
                          </div>

                          <h4 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#1e293b',
                            marginBottom: '4px'
                          }}>
                            {place.name}
                          </h4>

                          <p style={{
                            fontSize: '14px',
                            color: '#64748b',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <MapPin style={{ width: '14px', height: '14px' }} />
                            {place.description || `${place.position.lat.toFixed(4)}, ${place.position.lng.toFixed(4)}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Footer */}
          <div style={{
            marginTop: '32px',
            padding: '24px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              margin: 0
            }}>
              Generated by Ceylon Trails • Plan your perfect Sri Lanka adventure
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      {isPrinting && (
        <style>
          {`
            @media print {
              body * {
                visibility: hidden;
              }
              .export-modal-content, .export-modal-content * {
                visibility: visible;
              }
              .export-modal-content {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 20px;
                box-shadow: none;
                border: none;
              }
            }
          `}
        </style>
      )}
    </div>
  );
};

export default ExportModal; 