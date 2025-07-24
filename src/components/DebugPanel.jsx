import React from 'react';
import { 
  saveItineraryToLocalStorage, 
  loadItineraryFromLocalStorage,
  getLastSavedTimestamp,
  getStorageUsage,
  isLocalStorageAvailable
} from '../utils/localStorage';
import { runAllTests } from '../utils/firebaseTest';

const DebugPanel = ({ itinerary, mapInitializing, map, showItinerarySidebar, isMobile, getTotalPlaces }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [localStorageInfo, setLocalStorageInfo] = React.useState(null);
  const [firebaseTestResults, setFirebaseTestResults] = React.useState(null);
  const [isRunningTests, setIsRunningTests] = React.useState(false);

  const checkLocalStorage = () => {
    try {
      console.log('🔍 DebugPanel: Checking localStorage...');
      
      const info = {
        available: isLocalStorageAvailable(),
        usage: getStorageUsage(),
        lastSaved: getLastSavedTimestamp(),
        currentData: loadItineraryFromLocalStorage()
      };
      
      setLocalStorageInfo(info);
      console.log('🔍 DebugPanel: localStorage info:', info);
    } catch (error) {
      console.error('❌ DebugPanel: Error checking localStorage:', error);
      setLocalStorageInfo({
        available: false,
        usage: { available: false, error: error.message },
        lastSaved: null,
        currentData: { success: false, error: error.message }
      });
    }
  };

  const runFirebaseTests = async () => {
    setIsRunningTests(true);
    try {
      const results = await runAllTests();
      setFirebaseTestResults(results);
      console.log('🧪 DebugPanel: Firebase test results:', results);
    } catch (error) {
      console.error('❌ DebugPanel: Firebase test error:', error);
      setFirebaseTestResults({ error: error.message });
    } finally {
      setIsRunningTests(false);
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          backgroundColor: '#dc2626',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '12px',
          zIndex: 9999
        }}
      >
        Debug
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      maxWidth: '400px',
      maxHeight: '80vh',
      overflowY: 'auto',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>Debug Panel</h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#6b7280'
          }}
        >
          ×
        </button>
      </div>

      {/* Firebase Test Section */}
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
        <strong style={{ display: 'block', marginBottom: '8px' }}>Firebase Tests:</strong>
        <button
          onClick={runFirebaseTests}
          disabled={isRunningTests}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 12px',
            cursor: isRunningTests ? 'not-allowed' : 'pointer',
            fontSize: '11px',
            marginBottom: '8px',
            opacity: isRunningTests ? 0.6 : 1
          }}
        >
          {isRunningTests ? 'Running Tests...' : 'Test Firebase Connection'}
        </button>
        
        <button
          onClick={() => {
            console.log('🧪 Manual save test triggered');
            // This will trigger the save process and show detailed logs
            const testItinerary = [{ day: 1, places: [{ id: 'test', name: 'Test Place', lat: 6.9271, lng: 79.8612 }] }];
            console.log('🧪 Test itinerary data:', testItinerary);
          }}
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: '11px',
            marginBottom: '8px'
          }}
        >
          Test Save Process
        </button>
        
        {firebaseTestResults && (
          <div style={{ fontSize: '11px' }}>
            {firebaseTestResults.error ? (
              <div style={{ color: '#dc2626' }}>
                ❌ Test Error: {firebaseTestResults.error}
              </div>
            ) : (
              <div>
                <div style={{ color: firebaseTestResults.envTest?.allPresent ? '#059669' : '#dc2626' }}>
                  {firebaseTestResults.envTest?.allPresent ? '✅' : '❌'} Environment Variables: {firebaseTestResults.envTest?.present?.length || 0}/6
                </div>
                {firebaseTestResults.firebaseTest && (
                  <div>
                    <div style={{ color: firebaseTestResults.firebaseTest.firebaseInitialized ? '#059669' : '#dc2626' }}>
                      {firebaseTestResults.firebaseTest.firebaseInitialized ? '✅' : '❌'} Firebase Initialized
                    </div>
                    <div style={{ color: firebaseTestResults.firebaseTest.authTest ? '#059669' : '#dc2626' }}>
                      {firebaseTestResults.firebaseTest.authTest ? '✅' : '❌'} Auth Test {!firebaseTestResults.firebaseTest.authTest && '(Sign in to test)'}
                    </div>
                    <div style={{ color: firebaseTestResults.firebaseTest.firestoreTest ? '#059669' : '#dc2626' }}>
                      {firebaseTestResults.firebaseTest.firestoreTest ? '✅' : '❌'} Firestore Test {!firebaseTestResults.firebaseTest.firestoreTest && '(Sign in to test)'}
                    </div>
                    {firebaseTestResults.profileTest && (
                      <div style={{ color: firebaseTestResults.profileTest.success ? '#059669' : '#dc2626' }}>
                        {firebaseTestResults.profileTest.success ? '✅' : '❌'} User Profile Test {!firebaseTestResults.profileTest.success && '(Sign in to test)'}
                      </div>
                    )}
                    {firebaseTestResults.itineraryTest && (
                      <div style={{ color: firebaseTestResults.itineraryTest.success ? '#059669' : '#dc2626' }}>
                        {firebaseTestResults.itineraryTest.success ? '✅' : '❌'} Itinerary Save Test {!firebaseTestResults.itineraryTest.success && '(Sign in to test)'}
                      </div>
                    )}
                    {firebaseTestResults.authItineraryTest && (
                      <div style={{ color: firebaseTestResults.authItineraryTest.success ? '#059669' : '#dc2626' }}>
                        {firebaseTestResults.authItineraryTest.success ? '✅' : '❌'} Auth Itinerary Test
                      </div>
                    )}
                  </div>
                )}
                <div style={{ marginTop: '8px', fontSize: '10px', color: '#6b7280' }}>
                  <strong>Status:</strong> {firebaseTestResults.authItineraryTest?.success ? '✅ Itinerary saving works!' : '⚠️ Sign in to test full functionality'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '12px' }}>
        <strong>Map State:</strong>
        <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
          <li>Initializing: {mapInitializing ? 'Yes' : 'No'}</li>
          <li>Map loaded: {map ? 'Yes' : 'No'}</li>
          <li>Mobile: {isMobile ? 'Yes' : 'No'}</li>
          <li>Sidebar open: {showItinerarySidebar ? 'Yes' : 'No'}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <strong>Itinerary State:</strong>
        <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
          <li>Total places: {getTotalPlaces()}</li>
          <li>Days: {itinerary?.length || 0}</li>
          <li>Type: {itinerary?.[0]?.hasOwnProperty('day') ? 'Multi-day' : 'Flat'}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <strong>localStorage:</strong>
        <button
          onClick={checkLocalStorage}
          style={{
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: '10px',
            marginLeft: '8px'
          }}
        >
          Check
        </button>
        {localStorageInfo && (
          <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
            <li>Available: {localStorageInfo.available ? 'Yes' : 'No'}</li>
            <li>Usage: {localStorageInfo.usage?.available ? `${localStorageInfo.usage.totalKB} KB (${localStorageInfo.usage.itemCount} items)` : 'Error'}</li>
            <li>Last saved: {localStorageInfo.lastSaved ? new Date(localStorageInfo.lastSaved).toLocaleString() : 'Never'}</li>
            <li>Has data: {localStorageInfo.currentData?.success ? 'Yes' : 'No'}</li>
            {localStorageInfo.usage?.error && (
              <li style={{ color: '#dc2626' }}>Usage Error: {localStorageInfo.usage.error}</li>
            )}
            {localStorageInfo.currentData?.error && (
              <li style={{ color: '#dc2626' }}>Data Error: {localStorageInfo.currentData.error}</li>
            )}
          </ul>
        )}
      </div>

      <div style={{ marginBottom: '12px' }}>
        <strong>Environment:</strong>
        <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
          <li>Firebase API Key: {import.meta.env.VITE_FIREBASE_API_KEY ? 'Set' : 'Missing'}</li>
          <li>Firebase Project: {import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Missing'}</li>
          <li>Google Maps Key: {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'Set' : 'Missing'}</li>
        </ul>
      </div>

      <div style={{ fontSize: '10px', color: '#6b7280' }}>
        <strong>Actions:</strong>
        <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
          <li>Click "Test Firebase Connection" to diagnose auth issues</li>
          <li>Check browser console for detailed logs</li>
          <li>Verify .env file exists and has correct values</li>
        </ul>
      </div>
    </div>
  );
};

export default DebugPanel; 