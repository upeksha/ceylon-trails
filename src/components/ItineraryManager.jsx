import React, { useState } from 'react';
import { 
  FolderOpen, 
  Trash2, 
  Edit3, 
  Share2, 
  Plus, 
  Calendar, 
  MapPin, 
  Clock,
  Check,
  X,
  AlertCircle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { useItinerary } from '../contexts/ItineraryContext';
import { useAuth } from '../contexts/AuthProvider';
import SaveItineraryModal from './SaveItineraryModal';

const ItineraryManager = ({ isOpen, onClose }) => {
  const { 
    savedItineraries, 
    loadingItineraries, 
    currentItineraryId,
    currentItineraryTitle,
    currentItinerary,
    hasUnsavedChanges,
    saveCurrentItinerary,
    loadItinerary,
    deleteItineraryById,
    togglePublicStatus,
    createNewItinerary,
    updateItineraryTitle,
    loadUserItinerariesFromFirebase,
    loading,
    error
  } = useItinerary();
  
  const { user } = useAuth();
  
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  const [showConfirmOverwrite, setShowConfirmOverwrite] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [pendingLoadItineraryId, setPendingLoadItineraryId] = useState(null);

  // Handle save current itinerary
  const handleSaveCurrent = async () => {
    if (!user) {
      alert('Please log in to save itineraries');
      return;
    }

    if (!currentItinerary || currentItinerary.days.length === 0) {
      alert('Your current itinerary is empty. Please add places to save it.');
      return;
    }

    const result = await saveCurrentItinerary();
    if (result.success) {
      console.log('✅ Itinerary saved successfully');
    } else {
      console.error('❌ Failed to save itinerary:', result.error);
    }
  };

  // Handle save and load with title input
  const handleSaveAndLoad = async (title) => {
    console.log('🔄 ItineraryManager: Save and load with title:', title);
    console.log('🔄 ItineraryManager: Pending load itinerary ID:', pendingLoadItineraryId);
    
    try {
      // First save the current itinerary with the provided title
      const saveResult = await saveCurrentItinerary(title);
      
      if (saveResult.success) {
        console.log('✅ ItineraryManager: Save successful, now loading target itinerary');
        
        // Add a small delay to ensure state updates are processed
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Then load the target itinerary
        if (pendingLoadItineraryId) {
          await performLoadItinerary(pendingLoadItineraryId);
          setPendingLoadItineraryId(null);
        }
      } else {
        console.error('❌ ItineraryManager: Save failed:', saveResult.error);
        alert('Failed to save itinerary: ' + saveResult.error);
      }
    } catch (error) {
      console.error('❌ ItineraryManager: Error in save and load:', error);
      alert('Error during save and load: ' + error.message);
    } finally {
      setShowSaveModal(false);
      setShowConfirmOverwrite(null);
    }
  };

  // Handle load itinerary
  const handleLoadItinerary = async (itineraryId) => {
    // Check if there are unsaved changes
    if (hasUnsavedChanges && currentItineraryId && currentItineraryId !== itineraryId) {
      setShowConfirmOverwrite(itineraryId);
      return;
    }

    await performLoadItinerary(itineraryId);
  };

  // Perform the actual load
  const performLoadItinerary = async (itineraryId) => {
    const result = await loadItinerary(itineraryId);
    if (result.success) {
      console.log('✅ Itinerary loaded successfully');
      onClose();
    } else {
      console.error('❌ Failed to load itinerary:', result.error);
    }
  };

  // Handle delete itinerary
  const handleDeleteItinerary = async (itineraryId) => {
    const result = await deleteItineraryById(itineraryId);
    if (result.success) {
      console.log('✅ Itinerary deleted successfully');
      setShowConfirmDelete(null);
    } else {
      console.error('❌ Failed to delete itinerary:', result.error);
    }
  };

  // Handle rename itinerary
  const handleRenameItinerary = async (itineraryId, newTitle) => {
    console.log('🔄 ItineraryManager: Starting rename process');
    console.log('🔄 ItineraryManager: itineraryId:', itineraryId);
    console.log('🔄 ItineraryManager: newTitle:', newTitle);
    console.log('🔄 ItineraryManager: updateItineraryTitle function:', updateItineraryTitle);
    
    if (!newTitle.trim()) {
      alert('Please enter a valid title');
      return;
    }

    try {
      const result = await updateItineraryTitle(itineraryId, newTitle);
      console.log('🔄 ItineraryManager: Rename result:', result);
      
      if (result && result.success) {
        console.log('✅ Itinerary renamed successfully');
        setEditingId(null);
        setEditingTitle('');
      } else {
        console.error('❌ Failed to rename itinerary:', result?.error || 'Unknown error');
        alert('Failed to rename itinerary: ' + (result?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ ItineraryManager: Error in rename process:', error);
      alert('Error renaming itinerary: ' + error.message);
    }
  };

  // Handle toggle public status
  const handleTogglePublic = async (itineraryId, currentPublic) => {
    console.log('🔄 ItineraryManager: Toggling public status');
    console.log('🔄 ItineraryManager: itineraryId:', itineraryId);
    console.log('🔄 ItineraryManager: currentPublic:', currentPublic);
    console.log('🔄 ItineraryManager: newPublic will be:', !currentPublic);
    
    const result = await togglePublicStatus(itineraryId, !currentPublic);
    if (result.success) {
      console.log('✅ Public status updated successfully');
      // Refresh the saved itineraries list to get updated data
      await loadUserItinerariesFromFirebase();
    } else {
      console.error('❌ Failed to update public status:', result.error);
    }
  };

  // Handle copy share link
  const handleCopyLink = async (itineraryId) => {
    const shareUrl = `${window.location.origin}/itinerary/${itineraryId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(itineraryId);
      setTimeout(() => setCopiedId(null), 2000);
      console.log('✅ Share link copied to clipboard');
    } catch (err) {
      console.error('❌ Failed to copy link:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(itineraryId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Start editing title
  const startEditing = (itinerary) => {
    setEditingId(itinerary.id);
    setEditingTitle(itinerary.title);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  // Get total places for an itinerary
  const getTotalPlaces = (itinerary) => {
    return itinerary.days.reduce((total, day) => total + day.places.length, 0);
  };

  // Check if current itinerary has places
  const hasCurrentItineraryPlaces = () => {
    if (!currentItinerary || !currentItinerary.days || currentItinerary.days.length === 0) {
      return false;
    }
    return currentItinerary.days.some(day => day.places && day.places.length > 0);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Unknown';
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            My Itineraries
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            Manage and organize your saved travel plans
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} color="#dc2626" />
            <span style={{ fontSize: '14px', color: '#dc2626' }}>
              {error}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleSaveCurrent}
            disabled={loading || !user || !hasCurrentItineraryPlaces() || !hasUnsavedChanges}
            style={{
              padding: '10px 16px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading || !user || !hasCurrentItineraryPlaces() || !hasUnsavedChanges ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: loading || !user || !hasCurrentItineraryPlaces() || !hasUnsavedChanges ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!loading && user && hasCurrentItineraryPlaces() && hasUnsavedChanges) {
                e.target.style.backgroundColor = '#047857';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && user && hasCurrentItineraryPlaces() && hasUnsavedChanges) {
                e.target.style.backgroundColor = '#059669';
              }
            }}
            title={
              !user ? 'Please log in to save itineraries' :
              !hasCurrentItineraryPlaces() ? 'Add places to your itinerary to save it' :
              !hasUnsavedChanges ? 'No changes to save' :
              'Save your current itinerary to cloud'
            }
          >
            <Plus size={16} />
            {!user ? 'Sign In to Save' :
             !hasCurrentItineraryPlaces() ? 'Add Places to Save' :
             !hasUnsavedChanges ? 'No Changes to Save' :
             loading ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            onClick={createNewItinerary}
            style={{
              padding: '10px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            <Plus size={16} />
            New Itinerary
          </button>
        </div>

        {/* Loading State */}
        {loadingItineraries && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#6b7280'
          }}>
            <div style={{
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p>Loading your itineraries...</p>
          </div>
        )}

        {/* Itineraries List */}
        {!loadingItineraries && (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {savedItineraries.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#6b7280'
              }}>
                <FolderOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  No saved itineraries
                </h3>
                <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  {user ? 'Create your first itinerary and save it to see it here.' : 'Please log in to save and manage itineraries.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {savedItineraries.map((itinerary) => (
                  <div
                    key={itinerary.id}
                    style={{
                      border: '2px solid',
                      borderColor: currentItineraryId === itinerary.id ? '#3b82f6' : '#e5e7eb',
                      borderRadius: '12px',
                      padding: '16px',
                      backgroundColor: currentItineraryId === itinerary.id ? '#eff6ff' : 'white',
                      transition: 'all 0.2s'
                    }}
                  >
                    {/* Itinerary Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px'
                    }}>
                      <div style={{ flex: 1 }}>
                        {editingId === itinerary.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              style={{
                                flex: 1,
                                padding: '6px 8px',
                                border: '2px solid #3b82f6',
                                borderRadius: '6px',
                                fontSize: '14px',
                                outline: 'none'
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleRenameItinerary(itinerary.id, editingTitle);
                                }
                              }}
                            />
                            <button
                              onClick={() => handleRenameItinerary(itinerary.id, editingTitle)}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#059669',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              <Check size={12} />
                            </button>
                            <button
                              onClick={cancelEditing}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#6b7280',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <h3 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: 0
                          }}>
                            {itinerary.title}
                            {currentItineraryId === itinerary.id && (
                              <span style={{
                                fontSize: '12px',
                                color: '#3b82f6',
                                marginLeft: '8px',
                                fontWeight: '500'
                              }}>
                                (Current)
                              </span>
                            )}
                          </h3>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleLoadItinerary(itinerary.id)}
                          disabled={loading}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            opacity: loading ? 0.6 : 1
                          }}
                          title="Load itinerary"
                        >
                          <FolderOpen size={12} />
                          Load
                        </button>

                        <button
                          onClick={() => startEditing(itinerary)}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Rename itinerary"
                        >
                          <Edit3 size={12} />
                          Rename
                        </button>

                        <button
                          onClick={() => handleTogglePublic(itinerary.id, itinerary.public)}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: itinerary.public ? '#059669' : '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title={itinerary.public ? 'Make private' : 'Make public'}
                        >
                          {itinerary.public ? <Eye size={12} /> : <EyeOff size={12} />}
                          {itinerary.public ? 'Public' : 'Private'}
                        </button>

                        {/* Debug: Log the public status */}
                        {console.log('🔄 ItineraryManager: Rendering itinerary:', itinerary.id, 'public:', itinerary.public)}

                        {itinerary.public && (
                          <button
                            onClick={() => handleCopyLink(itinerary.id)}
                            style={{
                              padding: '6px 10px',
                              backgroundColor: '#7c3aed',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Copy share link"
                          >
                            {copiedId === itinerary.id ? <Check size={12} /> : <Copy size={12} />}
                            {copiedId === itinerary.id ? 'Copied!' : 'Share'}
                          </button>
                        )}

                        <button
                          onClick={() => setShowConfirmDelete(itinerary.id)}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Delete itinerary"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Itinerary Details */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} />
                        {itinerary.days.length} {itinerary.days.length === 1 ? 'day' : 'days'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} />
                        {getTotalPlaces(itinerary)} {getTotalPlaces(itinerary) === 1 ? 'place' : 'places'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        {formatDate(itinerary.updatedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Confirmation Dialogs */}
        {showConfirmDelete && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '12px'
              }}>
                Delete Itinerary
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '20px'
              }}>
                Are you sure you want to delete this itinerary? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowConfirmDelete(null)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteItinerary(showConfirmDelete)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {showConfirmOverwrite && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '12px'
              }}>
                Unsaved Changes
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '20px'
              }}>
                You have unsaved changes in your current itinerary. Do you want to save them before loading a different itinerary?
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowConfirmOverwrite(null)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setPendingLoadItineraryId(showConfirmOverwrite);
                    setShowSaveModal(true);
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Save & Load
                </button>
                <button
                  onClick={async () => {
                    await performLoadItinerary(showConfirmOverwrite);
                    setShowConfirmOverwrite(null);
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Load Without Saving
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Itinerary Modal for Save & Load */}
      <SaveItineraryModal
        isOpen={showSaveModal}
        onClose={() => {
          setShowSaveModal(false);
          setPendingLoadItineraryId(null);
          setShowConfirmOverwrite(null);
        }}
        onSave={handleSaveAndLoad}
        currentTitle={currentItineraryTitle !== 'Untitled Itinerary' ? currentItineraryTitle : ''}
        isLoading={loading}
      />
    </div>
  );
};

export default ItineraryManager; 