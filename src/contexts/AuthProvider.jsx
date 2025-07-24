import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { createUserProfile } from '../services/firebaseService';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firebaseAvailable, setFirebaseAvailable] = useState(false);

  // Check if Firebase is available
  useEffect(() => {
    if (auth) {
      setFirebaseAvailable(true);
      console.log('✅ AuthProvider: Firebase Auth is available');
    } else {
      setFirebaseAvailable(false);
      setLoading(false);
      console.warn('⚠️ AuthProvider: Firebase Auth is not available - authentication disabled');
    }
  }, []);

  // Register user with email and password
  const register = async (email, password, displayName = null) => {
    if (!firebaseAvailable) {
      const errorMsg = 'Firebase is not configured. Please check FIREBASE_SETUP.md';
      console.error('❌ AuthProvider:', errorMsg);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      setError(null);
      setLoading(true);
      
      console.log('🔄 AuthProvider: Registering user with email:', email);
      console.log('🔄 AuthProvider: Display name:', displayName);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      
      console.log('✅ AuthProvider: Firebase user created:', newUser.uid);
      
      // Update display name if provided
      if (displayName) {
        try {
          await updateProfile(newUser, { displayName });
          console.log('✅ AuthProvider: Display name updated successfully');
        } catch (profileError) {
          console.warn('⚠️ AuthProvider: Failed to update display name:', profileError);
          // Don't fail registration if display name update fails
        }
      }
      
      // Create user profile in Firestore
      try {
        const profileResult = await createUserProfile(newUser.uid, {
          email: newUser.email,
          displayName: displayName || newUser.email
        });
        
        if (profileResult.success) {
          console.log('✅ AuthProvider: User profile created in Firestore');
        } else {
          console.warn('⚠️ AuthProvider: Failed to create user profile:', profileResult.error);
          // Don't fail registration if profile creation fails
        }
      } catch (profileError) {
        console.warn('⚠️ AuthProvider: Error creating user profile:', profileError);
        // Don't fail registration if profile creation fails
      }
      
      console.log('✅ AuthProvider: User registered successfully:', newUser.uid);
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('❌ AuthProvider: Registration error:', error);
      
      // Provide more user-friendly error messages
      let errorMessage = error.message;
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Please try signing in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password (at least 6 characters).';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password sign-up is not enabled. Please contact support.';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Login user with email and password
  const login = async (email, password) => {
    if (!firebaseAvailable) {
      const errorMsg = 'Firebase is not configured. Please check FIREBASE_SETUP.md';
      console.error('❌ AuthProvider:', errorMsg);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      setError(null);
      setLoading(true);
      
      console.log('🔄 AuthProvider: Logging in user with email:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedInUser = userCredential.user;
      
      console.log('✅ AuthProvider: User logged in successfully:', loggedInUser.uid);
      
      return { success: true, user: loggedInUser };
    } catch (error) {
      console.error('❌ AuthProvider: Login error:', error);
      
      // Provide more user-friendly error messages
      let errorMessage = error.message;
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address. Please check your email or create a new account.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact support.';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    if (!firebaseAvailable) {
      const errorMsg = 'Firebase is not configured. Please check FIREBASE_SETUP.md';
      console.error('❌ AuthProvider:', errorMsg);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      setError(null);
      setLoading(true);
      
      console.log('🔄 AuthProvider: Logging in with Google');
      
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const googleUser = userCredential.user;
      
      // Create user profile in Firestore if it doesn't exist
      await createUserProfile(googleUser.uid, {
        email: googleUser.email,
        displayName: googleUser.displayName
      });
      
      console.log('✅ AuthProvider: Google login successful:', googleUser.uid);
      
      return { success: true, user: googleUser };
    } catch (error) {
      console.error('❌ AuthProvider: Google login error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    if (!firebaseAvailable) {
      console.warn('⚠️ AuthProvider: Firebase not available, clearing local user state');
      setUser(null);
      return { success: true };
    }

    try {
      setError(null);
      setLoading(true);
      
      console.log('🔄 AuthProvider: Logging out user');
      
      await signOut(auth);
      
      console.log('✅ AuthProvider: User logged out successfully');
      
      return { success: true };
    } catch (error) {
      console.error('❌ AuthProvider: Logout error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Listen for auth state changes
  useEffect(() => {
    if (!firebaseAvailable) {
      console.log('ℹ️ AuthProvider: Skipping auth state listener - Firebase not available');
      return;
    }

    console.log('🔄 AuthProvider: Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('🔄 AuthProvider: Auth state changed:', currentUser ? currentUser.uid : 'No user');
      
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        console.log('✅ AuthProvider: User authenticated:', {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName
        });
      } else {
        console.log('ℹ️ AuthProvider: No user authenticated');
      }
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('🧹 AuthProvider: Cleaning up auth state listener');
      unsubscribe();
    };
  }, [firebaseAvailable]);

  // Context value
  const value = {
    user,
    loading,
    error,
    firebaseAvailable,
    register,
    login,
    loginWithGoogle,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 