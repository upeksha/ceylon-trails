import { auth, db } from '../config/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { signInAnonymously, signOut } from 'firebase/auth';

/**
 * Test Firebase connectivity and basic operations
 */
export const testFirebaseConnection = async () => {
  console.log('🧪 Starting Firebase connectivity test...');
  
  const results = {
    firebaseInitialized: false,
    authAvailable: false,
    firestoreAvailable: false,
    authTest: false,
    firestoreTest: false,
    errors: []
  };

  try {
    // Test 1: Check if Firebase is initialized
    if (auth && db) {
      results.firebaseInitialized = true;
      console.log('✅ Firebase is initialized');
    } else {
      results.errors.push('Firebase not initialized - check environment variables');
      console.error('❌ Firebase not initialized');
      return results;
    }

    // Test 2: Check Auth availability
    if (auth) {
      results.authAvailable = true;
      console.log('✅ Firebase Auth is available');
    } else {
      results.errors.push('Firebase Auth not available');
      console.error('❌ Firebase Auth not available');
    }

    // Test 3: Check Firestore availability
    if (db) {
      results.firestoreAvailable = true;
      console.log('✅ Firestore is available');
    } else {
      results.errors.push('Firestore not available');
      console.error('❌ Firestore not available');
    }

    // Test 4: Test Auth - check if user is authenticated
    try {
      console.log('🔄 Testing Auth with current user...');
      if (auth.currentUser) {
        console.log('✅ User is authenticated:', auth.currentUser.uid);
        results.authTest = true;
      } else {
        console.log('ℹ️ No user currently authenticated (this is normal)');
        results.authTest = false;
        results.errors.push('No authenticated user - sign in to test full functionality');
      }
    } catch (error) {
      results.errors.push(`Auth test failed: ${error.message}`);
      console.error('❌ Auth test failed:', error);
    }

    // Test 5: Test Firestore - only if user is authenticated
    try {
      if (auth.currentUser) {
        console.log('🔄 Testing Firestore with authenticated user...');
        
        // Create a test document with authenticated user
        const testDoc = {
          test: true,
          timestamp: new Date(),
          message: 'Firebase connectivity test',
          userId: auth.currentUser.uid
        };
        
        const testCollection = collection(db, '_test_connectivity');
        const docRef = await addDoc(testCollection, testDoc);
        console.log('✅ Test document created:', docRef.id);
        
        // Delete the test document
        await deleteDoc(doc(db, '_test_connectivity', docRef.id));
        console.log('✅ Test document deleted');
        
        results.firestoreTest = true;
      } else {
        console.log('ℹ️ Skipping Firestore test - no authenticated user');
        results.firestoreTest = false;
        results.errors.push('Firestore test skipped - sign in to test');
      }
    } catch (error) {
      results.errors.push(`Firestore test failed: ${error.message}`);
      console.error('❌ Firestore test failed:', error);
    }

  } catch (error) {
    results.errors.push(`General test error: ${error.message}`);
    console.error('❌ General test error:', error);
  }

  // Summary
  console.log('\n📊 Firebase Test Results:');
  console.log('Firebase Initialized:', results.firebaseInitialized);
  console.log('Auth Available:', results.authAvailable);
  console.log('Firestore Available:', results.firestoreAvailable);
  console.log('Auth Test:', results.authTest);
  console.log('Firestore Test:', results.firestoreTest);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors found:');
    results.errors.forEach(error => console.log('-', error));
  } else {
    console.log('\n✅ All tests passed! Firebase is working correctly.');
  }

  return results;
};

/**
 * Test environment variables
 */
export const testEnvironmentVariables = () => {
  console.log('🔍 Checking environment variables...');
  
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  const results = {
    allPresent: true,
    missing: [],
    present: []
  };

  requiredVars.forEach(varName => {
    const value = import.meta.env[varName];
    if (value) {
      results.present.push(varName);
      console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
    } else {
      results.missing.push(varName);
      results.allPresent = false;
      console.log(`❌ ${varName}: Missing`);
    }
  });

  console.log(`\n📊 Environment Variables: ${results.present.length}/${requiredVars.length} present`);
  
  if (results.missing.length > 0) {
    console.log('❌ Missing variables:', results.missing);
  } else {
    console.log('✅ All environment variables are present');
  }

  return results;
};

/**
 * Test user profile creation specifically
 */
export const testUserProfileCreation = async () => {
  console.log('🧪 Testing user profile creation...');
  
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      console.log('⚠️ No authenticated user found');
      return { success: false, error: 'No authenticated user' };
    }
    
    const userId = auth.currentUser.uid;
    console.log('✅ User authenticated:', userId);
    
    // Test creating a user profile document
    const testUserData = {
      email: auth.currentUser.email || 'test@example.com',
      displayName: auth.currentUser.displayName || 'Test User'
    };
    
    const testDoc = {
      uid: userId,
      email: testUserData.email,
      displayName: testUserData.displayName,
      createdAt: new Date(),
      lastLogin: new Date()
    };
    
    // Try to create a test user profile
    const testCollection = collection(db, 'users');
    await setDoc(doc(testCollection, userId), testDoc);
    console.log('✅ Test user profile created successfully');
    
    // Clean up - delete the test document
    await deleteDoc(doc(db, 'users', userId));
    console.log('✅ Test user profile cleaned up');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Test user profile creation failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test itinerary saving specifically
 */
export const testItinerarySaving = async () => {
  console.log('🧪 Testing itinerary saving...');
  
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      console.log('⚠️ No authenticated user found');
      return { success: false, error: 'No authenticated user' };
    }
    
    const userId = auth.currentUser.uid;
    console.log('✅ User authenticated:', userId);
    
    // Test creating a sample itinerary document
    const testItineraryData = {
      userId: userId,
      title: 'Test Itinerary - ' + new Date().toISOString(),
      travelMode: 'DRIVING',
      days: [
        {
          day: 1,
          places: [
            { id: 'test-place-1', name: 'Test Place 1', lat: 6.9271, lng: 79.8612 }
          ]
        }
      ],
      public: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Try to create a test itinerary
    const testCollection = collection(db, 'itineraries');
    const docRef = await addDoc(testCollection, testItineraryData);
    console.log('✅ Test itinerary created successfully:', docRef.id);
    
    // Clean up - delete the test document
    await deleteDoc(doc(db, 'itineraries', docRef.id));
    console.log('✅ Test itinerary cleaned up');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Test itinerary saving failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test itinerary saving with authenticated user
 */
export const testAuthenticatedItinerarySaving = async () => {
  console.log('🧪 Testing authenticated itinerary saving...');
  
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      console.log('⚠️ No authenticated user found');
      return { success: false, error: 'No authenticated user' };
    }
    
    const userId = auth.currentUser.uid;
    console.log('✅ User authenticated:', userId);
    
    // Test creating a sample itinerary document
    const testItineraryData = {
      userId: userId,
      title: 'Test Itinerary - ' + new Date().toISOString(),
      travelMode: 'DRIVING',
      days: [
        {
          day: 1,
          places: [
            { id: 'test-place-1', name: 'Test Place 1', lat: 6.9271, lng: 79.8612 }
          ]
        }
      ],
      public: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('🔄 Creating test itinerary with data:', testItineraryData);
    
    // Try to create a test itinerary
    const testCollection = collection(db, 'itineraries');
    const docRef = await addDoc(testCollection, testItineraryData);
    console.log('✅ Test itinerary created successfully:', docRef.id);
    
    // Clean up - delete the test document
    await deleteDoc(doc(db, 'itineraries', docRef.id));
    console.log('✅ Test itinerary cleaned up');
    
    return { success: true, userId: userId };
  } catch (error) {
    console.error('❌ Test authenticated itinerary saving failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Run all tests
 */
export const runAllTests = async () => {
  console.log('🚀 Running comprehensive Firebase tests...\n');
  
  const envTest = testEnvironmentVariables();
  console.log('\n' + '='.repeat(50) + '\n');
  
  if (envTest.allPresent) {
    const firebaseTest = await testFirebaseConnection();
    console.log('\n' + '='.repeat(50) + '\n');
    const profileTest = await testUserProfileCreation();
    console.log('\n' + '='.repeat(50) + '\n');
    const itineraryTest = await testItinerarySaving();
    console.log('\n' + '='.repeat(50) + '\n');
    const authItineraryTest = await testAuthenticatedItinerarySaving();
    
    return { envTest, firebaseTest, profileTest, itineraryTest, authItineraryTest };
  } else {
    console.log('⚠️ Skipping Firebase tests due to missing environment variables');
    return { envTest, firebaseTest: null, profileTest: null, itineraryTest: null, authItineraryTest: null };
  }
}; 