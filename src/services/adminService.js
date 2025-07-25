import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collection names
const COLLECTIONS = {
  PLACES: 'admin_places',
  USERS: 'users',
  ITINERARIES: 'itineraries'
};

// Place Management Functions
export const adminService = {
  // Get all places
  async getAllPlaces() {
    try {
      const q = query(
        collection(db, COLLECTIONS.PLACES),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const places = [];
      querySnapshot.forEach((doc) => {
        places.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return { success: true, data: places };
    } catch (error) {
      console.error('❌ AdminService: Error fetching places:', error);
      return { success: false, error: error.message };
    }
  },

  // Get place by ID
  async getPlaceById(placeId) {
    try {
      const docRef = doc(db, COLLECTIONS.PLACES, placeId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { 
          success: true, 
          data: { id: docSnap.id, ...docSnap.data() } 
        };
      } else {
        return { success: false, error: 'Place not found' };
      }
    } catch (error) {
      console.error('❌ AdminService: Error fetching place:', error);
      return { success: false, error: error.message };
    }
  },

  // Add new place
  async addPlace(placeData) {
    try {
      const placeToSave = {
        ...placeData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        active: placeData.active !== false // Default to true
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.PLACES), placeToSave);
      console.log('✅ AdminService: Place added successfully:', docRef.id);
      
      return { 
        success: true, 
        data: { id: docRef.id, ...placeToSave },
        message: 'Place added successfully' 
      };
    } catch (error) {
      console.error('❌ AdminService: Error adding place:', error);
      return { success: false, error: error.message };
    }
  },

  // Update place
  async updatePlace(placeId, updateData) {
    try {
      const docRef = doc(db, COLLECTIONS.PLACES, placeId);
      const updatePayload = {
        ...updateData,
        updatedAt: serverTimestamp()
      };

      await updateDoc(docRef, updatePayload);
      console.log('✅ AdminService: Place updated successfully:', placeId);
      
      return { 
        success: true, 
        message: 'Place updated successfully' 
      };
    } catch (error) {
      console.error('❌ AdminService: Error updating place:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete place
  async deletePlace(placeId) {
    try {
      const docRef = doc(db, COLLECTIONS.PLACES, placeId);
      await deleteDoc(docRef);
      console.log('✅ AdminService: Place deleted successfully:', placeId);
      
      return { 
        success: true, 
        message: 'Place deleted successfully' 
      };
    } catch (error) {
      console.error('❌ AdminService: Error deleting place:', error);
      return { success: false, error: error.message };
    }
  },

  // Toggle place visibility
  async togglePlaceVisibility(placeId, isActive) {
    try {
      const docRef = doc(db, COLLECTIONS.PLACES, placeId);
      await updateDoc(docRef, {
        active: isActive,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ AdminService: Place visibility toggled:', placeId, isActive);
      return { 
        success: true, 
        message: `Place ${isActive ? 'activated' : 'deactivated'} successfully` 
      };
    } catch (error) {
      console.error('❌ AdminService: Error toggling place visibility:', error);
      return { success: false, error: error.message };
    }
  },

  // Get places by category
  async getPlacesByCategory(category) {
    try {
      const q = query(
        collection(db, COLLECTIONS.PLACES),
        where('category', '==', category),
        where('active', '==', true),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      const places = [];
      querySnapshot.forEach((doc) => {
        places.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return { success: true, data: places };
    } catch (error) {
      console.error('❌ AdminService: Error fetching places by category:', error);
      return { success: false, error: error.message };
    }
  },

  // Search places
  async searchPlaces(searchTerm) {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a simple implementation - consider using Algolia or similar for production
      const q = query(
        collection(db, COLLECTIONS.PLACES),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      const places = [];
      querySnapshot.forEach((doc) => {
        const placeData = doc.data();
        const searchLower = searchTerm.toLowerCase();
        
        // Search in name, description, and tags
        if (
          placeData.name?.toLowerCase().includes(searchLower) ||
          placeData.description?.toLowerCase().includes(searchLower) ||
          placeData.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        ) {
          places.push({
            id: doc.id,
            ...placeData
          });
        }
      });
      return { success: true, data: places };
    } catch (error) {
      console.error('❌ AdminService: Error searching places:', error);
      return { success: false, error: error.message };
    }
  }
};

// User Management Functions
export const userService = {
  // Get all users
  async getAllUsers() {
    try {
      const q = query(
        collection(db, COLLECTIONS.USERS),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return { success: true, data: users };
    } catch (error) {
      console.error('❌ AdminService: Error fetching users:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user by ID
  async getUserById(userId) {
    try {
      const docRef = doc(db, COLLECTIONS.USERS, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { 
          success: true, 
          data: { id: docSnap.id, ...docSnap.data() } 
        };
      } else {
        return { success: false, error: 'User not found' };
      }
    } catch (error) {
      console.error('❌ AdminService: Error fetching user:', error);
      return { success: false, error: error.message };
    }
  },

  // Update user role
  async updateUserRole(userId, role) {
    try {
      const docRef = doc(db, COLLECTIONS.USERS, userId);
      await updateDoc(docRef, {
        role: role,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ AdminService: User role updated:', userId, role);
      return { 
        success: true, 
        message: 'User role updated successfully' 
      };
    } catch (error) {
      console.error('❌ AdminService: Error updating user role:', error);
      return { success: false, error: error.message };
    }
  }
};

// Itinerary Management Functions
export const itineraryService = {
  // Get all itineraries
  async getAllItineraries() {
    try {
      const q = query(
        collection(db, COLLECTIONS.ITINERARIES),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const itineraries = [];
      querySnapshot.forEach((doc) => {
        itineraries.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return { success: true, data: itineraries };
    } catch (error) {
      console.error('❌ AdminService: Error fetching itineraries:', error);
      return { success: false, error: error.message };
    }
  },

  // Get itinerary by ID
  async getItineraryById(itineraryId) {
    try {
      const docRef = doc(db, COLLECTIONS.ITINERARIES, itineraryId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { 
          success: true, 
          data: { id: docSnap.id, ...docSnap.data() } 
        };
      } else {
        return { success: false, error: 'Itinerary not found' };
      }
    } catch (error) {
      console.error('❌ AdminService: Error fetching itinerary:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete itinerary
  async deleteItinerary(itineraryId) {
    try {
      const docRef = doc(db, COLLECTIONS.ITINERARIES, itineraryId);
      await deleteDoc(docRef);
      console.log('✅ AdminService: Itinerary deleted successfully:', itineraryId);
      
      return { 
        success: true, 
        message: 'Itinerary deleted successfully' 
      };
    } catch (error) {
      console.error('❌ AdminService: Error deleting itinerary:', error);
      return { success: false, error: error.message };
    }
  }
};

export default adminService; 