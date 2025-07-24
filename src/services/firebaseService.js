import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { cleanItineraryForFirestore, deepCleanUndefined } from '../utils/placeUtils';

// Collection names
const COLLECTIONS = {
  ITINERARIES: 'itineraries',
  USERS: 'users'
};

/**
 * Save a new itinerary to Firestore
 * @param {Object} itineraryData - The itinerary data to save
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - Result with success status and data
 */
export const saveItinerary = async (itineraryData, userId) => {
  try {
    console.log('🔄 FirebaseService: Saving itinerary for user:', userId);
    console.log('🔄 FirebaseService: Itinerary data:', {
      title: itineraryData.title,
      travelMode: itineraryData.travelMode,
      daysCount: itineraryData.days?.length || 0,
      public: itineraryData.public,
      userId: userId
    });
    
    // Validate required fields
    if (!userId) {
      console.error('❌ FirebaseService: Missing userId');
      return { success: false, error: 'Missing user ID' };
    }
    
    if (!itineraryData.title) {
      console.error('❌ FirebaseService: Missing itinerary title');
      return { success: false, error: 'Missing itinerary title' };
    }
    
    const itineraryDoc = {
      userId: userId,
      title: itineraryData.title || 'Untitled Itinerary',
      travelMode: itineraryData.travelMode || 'DRIVING',
      days: cleanItineraryForFirestore(itineraryData.days) || [],
      public: itineraryData.public || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const cleanedItineraryDoc = deepCleanUndefined(itineraryDoc);
    console.log('🧹 FirebaseService: Final cleaned itineraryDoc before addDoc:', cleanedItineraryDoc);
    
    const docRef = await addDoc(collection(db, COLLECTIONS.ITINERARIES), cleanedItineraryDoc);
    
    console.log('✅ FirebaseService: Itinerary saved successfully with ID:', docRef.id);
    
    return {
      success: true,
      data: {
        id: docRef.id,
        ...itineraryDoc
      }
    };
  } catch (error) {
    console.error('❌ FirebaseService: Error saving itinerary:', error);
    console.error('❌ FirebaseService: Error code:', error.code);
    console.error('❌ FirebaseService: Error message:', error.message);
    
    // Provide more specific error messages
    let errorMessage = error.message;
    if (error.code === 'permission-denied') {
      errorMessage = 'Permission denied. Please check Firestore security rules.';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Firestore is temporarily unavailable. Please try again.';
    } else if (error.code === 'unauthenticated') {
      errorMessage = 'User not authenticated. Please log in again.';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Update an existing itinerary
 * @param {string} itineraryId - The itinerary document ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object>} - Result with success status
 */
export const updateItinerary = async (itineraryId, updateData) => {
  try {
    console.log('🔄 FirebaseService: Updating itinerary:', itineraryId);
    
    // Clean the data if days are being updated
    const cleanedUpdateData = { ...updateData };
    if (cleanedUpdateData.days) {
      cleanedUpdateData.days = cleanItineraryForFirestore(cleanedUpdateData.days);
    }
    
    const docRef = doc(db, COLLECTIONS.ITINERARIES, itineraryId);
    const updatePayload = {
      ...deepCleanUndefined(cleanedUpdateData), // Ensure all fields are cleaned
      updatedAt: serverTimestamp()
    };

    console.log('🧹 FirebaseService: Final cleaned updatePayload before updateDoc:', updatePayload);
    await updateDoc(docRef, updatePayload);
    
    console.log('✅ FirebaseService: Itinerary updated successfully');
    
    return {
      success: true
    };
  } catch (error) {
    console.error('❌ FirebaseService: Error updating itinerary:', error);
    console.error('❌ FirebaseService: Error code:', error.code);
    console.error('❌ FirebaseService: Error message:', error.message);
    
    // Provide more specific error messages
    let errorMessage = error.message;
    if (error.code === 'permission-denied') {
      errorMessage = 'Permission denied. Please check Firestore security rules.';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Firestore is temporarily unavailable. Please try again.';
    } else if (error.code === 'unauthenticated') {
      errorMessage = 'User not authenticated. Please log in again.';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Delete an itinerary
 * @param {string} itineraryId - The itinerary document ID
 * @returns {Promise<Object>} - Result with success status
 */
export const deleteItinerary = async (itineraryId) => {
  try {
    console.log('🔄 FirebaseService: Deleting itinerary:', itineraryId);
    
    const docRef = doc(db, COLLECTIONS.ITINERARIES, itineraryId);
    await deleteDoc(docRef);
    
    console.log('✅ FirebaseService: Itinerary deleted successfully');
    
    return {
      success: true
    };
  } catch (error) {
    console.error('❌ FirebaseService: Error deleting itinerary:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Load all itineraries for a specific user
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - Result with success status and itineraries array
 */
export const loadUserItineraries = async (userId) => {
  try {
    console.log('🔄 FirebaseService: Loading itineraries for user:', userId);
    
    // Option 1: With ordering (requires index) - uncomment when index is created
    // const q = query(
    //   collection(db, COLLECTIONS.ITINERARIES),
    //   where('userId', '==', userId),
    //   orderBy('updatedAt', 'desc')
    // );
    
    // Option 2: Without ordering (no index required) - temporary solution
    const q = query(
      collection(db, COLLECTIONS.ITINERARIES),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const itineraries = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      itineraries.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
      });
    });
    
    // Sort in JavaScript instead of Firestore (no index required)
    itineraries.sort((a, b) => {
      const aTime = a.updatedAt?.getTime?.() || a.updatedAt || 0;
      const bTime = b.updatedAt?.getTime?.() || b.updatedAt || 0;
      return bTime - aTime; // Descending order (newest first)
    });
    
    console.log('✅ FirebaseService: Loaded', itineraries.length, 'itineraries for user:', userId);
    
    return {
      success: true,
      data: itineraries
    };
  } catch (error) {
    console.error('❌ FirebaseService: Error loading user itineraries:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get a specific itinerary by ID
 * @param {string} itineraryId - The itinerary document ID
 * @returns {Promise<Object>} - Result with success status and itinerary data
 */
export const getItinerary = async (itineraryId) => {
  try {
    console.log('🔄 FirebaseService: Loading itinerary:', itineraryId);
    
    const docRef = doc(db, COLLECTIONS.ITINERARIES, itineraryId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const itinerary = {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
      };
      
      console.log('✅ FirebaseService: Itinerary loaded successfully');
      
      return {
        success: true,
        data: itinerary
      };
    } else {
      console.log('⚠️ FirebaseService: Itinerary not found');
      return {
        success: false,
        error: 'Itinerary not found'
      };
    }
  } catch (error) {
    console.error('❌ FirebaseService: Error loading itinerary:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get a public itinerary by ID
 * @param {string} itineraryId - The itinerary document ID
 * @returns {Promise<Object>} - Result with success status and itinerary data
 */
export const getPublicItinerary = async (itineraryId) => {
  try {
    console.log('🔄 FirebaseService: Loading public itinerary:', itineraryId);
    
    const docRef = doc(db, COLLECTIONS.ITINERARIES, itineraryId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Check if itinerary is public
      if (!data.public) {
        console.log('⚠️ FirebaseService: Itinerary is not public');
        return {
          success: false,
          error: 'Itinerary is not public'
        };
      }
      
      const itinerary = {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
      };
      
      console.log('✅ FirebaseService: Public itinerary loaded successfully');
      
      return {
        success: true,
        data: itinerary
      };
    } else {
      console.log('⚠️ FirebaseService: Public itinerary not found');
      return {
        success: false,
        error: 'Itinerary not found'
      };
    }
  } catch (error) {
    console.error('❌ FirebaseService: Error loading public itinerary:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Toggle the public status of an itinerary
 * @param {string} itineraryId - The itinerary document ID
 * @param {boolean} isPublic - The new public status
 * @returns {Promise<Object>} - Result with success status
 */
export const toggleItineraryPublic = async (itineraryId, isPublic) => {
  try {
    console.log('🔄 FirebaseService: Toggling public status for itinerary:', itineraryId, 'to:', isPublic);
    
    const result = await updateItinerary(itineraryId, { public: isPublic });
    
    if (result.success) {
      console.log('✅ FirebaseService: Public status updated successfully');
    }
    
    return result;
  } catch (error) {
    console.error('❌ FirebaseService: Error toggling public status:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Create a user profile in Firestore
 * @param {string} userId - The user ID from Firebase Auth
 * @param {Object} userData - The user data
 * @returns {Promise<Object>} - Result with success status
 */
export const createUserProfile = async (userId, userData) => {
  try {
    console.log('🔄 FirebaseService: Creating user profile for:', userId);
    
    const userDoc = {
      uid: userId,
      email: userData.email,
      displayName: userData.displayName || userData.email,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    };

    // Use setDoc with the user's UID as document ID to prevent duplicates
    await setDoc(doc(db, COLLECTIONS.USERS, userId), userDoc);
    
    console.log('✅ FirebaseService: User profile created successfully');
    
    return {
      success: true
    };
  } catch (error) {
    console.error('❌ FirebaseService: Error creating user profile:', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 