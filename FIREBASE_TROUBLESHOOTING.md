# Firebase Troubleshooting Guide

## Quick Diagnosis Steps

### 1. Check Environment Variables
First, verify your `.env` file exists and has the correct values:

```bash
# In your project root, check if .env exists
ls -la .env

# View the contents (should show all Firebase variables)
cat .env
```

Your `.env` file should contain:
```env
VITE_FIREBASE_API_KEY=AIzaSyB4Ze_Zwplprk-mzuOEkS05EYyuQkEiit0
VITE_FIREBASE_AUTH_DOMAIN=backpackers-90876.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=backpackers-90876
VITE_FIREBASE_STORAGE_BUCKET=backpackers-90876.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=962080138879
VITE_FIREBASE_APP_ID=1:962080138879:web:f43bece908b3cdcaa7814a
VITE_GOOGLE_MAPS_API_KEY=AIzaSyDhwSeXN84puwKvKrg6bbW-c4h6JWAFb9Q
```

### 2. Use the Debug Panel
1. Open your application in the browser
2. Click the "Debug" button in the top-right corner
3. Click "Test Firebase Connection" to run comprehensive tests
4. Check the browser console for detailed logs

### 3. Check Browser Console
Open Developer Tools (F12) and look for:
- ✅ Firebase initialized successfully
- ✅ AuthProvider: Firebase Auth is available
- Any error messages starting with ❌

## Common Issues and Solutions

### Issue 1: "Firebase not initialized"
**Symptoms:**
- Authentication modal shows "Firebase Not Configured"
- Console shows "Firebase not initialized"

**Solutions:**
1. **Restart the development server:**
   ```bash
   npm run dev
   ```

2. **Check .env file format:**
   - Ensure no extra spaces or characters
   - Each variable should be on its own line
   - No quotes around values

3. **Verify environment variables are loaded:**
   - Check Debug Panel → Environment section
   - All Firebase variables should show "Set"

### Issue 2: "auth/invalid-api-key"
**Symptoms:**
- Console error: "auth/invalid-api-key"
- Authentication fails

**Solutions:**
1. **Verify API key in Firebase Console:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project (backpackers-90876)
   - Go to Project Settings → General
   - Copy the correct API key

2. **Check .env file:**
   - Ensure the API key is exactly as shown in Firebase Console
   - No extra spaces or characters

### Issue 3: "Firestore permission denied"
**Symptoms:**
- Console error: "permission-denied"
- Cannot save/load itineraries

**Solutions:**
1. **Check Firestore Security Rules:**
   - Go to Firebase Console → Firestore Database → Rules
   - Ensure rules allow read/write for authenticated users

2. **Verify Firestore is in test mode:**
   - Go to Firebase Console → Firestore Database
   - If not created, create it in "test mode"

### Issue 4: "Google sign-in popup blocked"
**Symptoms:**
- Google sign-in button doesn't work
- Popup blocked by browser

**Solutions:**
1. **Allow popups for your domain:**
   - Check browser popup blocker settings
   - Add your localhost domain to allowed sites

2. **Check Firebase Console settings:**
   - Go to Authentication → Sign-in method
   - Ensure Google provider is enabled
   - Add your domain to authorized domains

### Issue 5: "User profile creation fails"
**Symptoms:**
- Email/password registration fails
- Console shows Firestore permission errors
- User account created but profile not saved

**Solutions:**
1. **Check Firestore Security Rules:**
   - Go to Firebase Console → Firestore Database → Rules
   - Ensure rules allow authenticated users to write to users collection
   - Example rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can only access their own profile
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Users can only access their own itineraries
       match /itineraries/{itineraryId} {
         allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
         allow read: if resource.data.public == true;
       }
     }
   }
   ```

2. **Verify Firestore is in test mode:**
   - Go to Firebase Console → Firestore Database
   - If not in test mode, temporarily enable it for testing

3. **Use the Debug Panel:**
   - Click "Test Firebase Connection" 
   - Check if "User Profile Test" passes
   - Look for specific error messages in console

### Issue 6: "Email/password registration fails"
**Symptoms:**
- Registration form submission fails
- No specific error message shown
- Console shows generic errors

**Solutions:**
1. **Check Firebase Authentication settings:**
   - Go to Authentication → Sign-in method
   - Ensure "Email/Password" is enabled
   - Check if "Email link (passwordless sign-in)" is interfering

2. **Verify password requirements:**
   - Firebase requires minimum 6 characters
   - Check for special characters that might cause issues

3. **Check browser console for specific errors:**
   - Look for error codes like `auth/email-already-in-use`
   - Check for Firestore permission errors
   - Verify network connectivity

### Issue 7: "Failed to save itinerary"
**Symptoms:**
- Save button shows "Failed to save itinerary"
- Console shows Firestore permission errors
- User is logged in but cannot save

**Solutions:**
1. **Check Firestore Security Rules:**
   - Go to Firebase Console → Firestore Database → Rules
   - Ensure rules allow authenticated users to write to itineraries collection
   - **Use these CORRECTED rules:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can only access their own itineraries
       match /itineraries/{itineraryId} {
         // Allow create for authenticated users where userId matches
         allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
         
         // Allow read/write for existing documents where userId matches OR if public
         allow read, write: if request.auth != null && 
           (resource.data.userId == request.auth.uid || resource.data.public == true);
       }
       
       // Users can only access their own profile
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

2. **Verify user authentication:**
   - Check if user is properly logged in
   - Verify user.uid exists in the context
   - Check browser console for auth state changes

3. **Use the Debug Panel:**
   - Click "Test Firebase Connection" 
   - Check if "Itinerary Save Test" passes
   - Look for specific error messages in console

4. **Check itinerary data:**
   - Ensure itinerary has valid data structure
   - Verify days array is properly formatted
   - Check for any invalid place data

### Issue 8: "Itinerary data structure issues"
**Symptoms:**
- Save fails with data validation errors
- Console shows malformed data errors
- Places not saving correctly

**Solutions:**
1. **Verify itinerary structure:**
   ```javascript
   // Expected structure for multi-day itinerary
   const itineraryData = {
     title: "My Trip",
     travelMode: "DRIVING",
     days: [
       {
         day: 1,
         places: [
           {
             id: "place-1",
             name: "Place Name",
             lat: 6.9271,
             lng: 79.8612,
             category: "attraction"
           }
         ]
       }
     ],
     public: false
   };
   ```

2. **Check for empty itineraries:**
   - Ensure itinerary has at least one place
   - Verify days array is not empty
   - Check for null/undefined values

3. **Validate place data:**
   - Ensure each place has required fields (id, name, lat, lng)
   - Check for valid coordinates
   - Verify category values are valid

## Step-by-Step Verification

### Step 1: Verify Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `backpackers-90876`
3. Verify project exists and is active

### Step 2: Check Authentication Setup
1. Go to Authentication → Sign-in method
2. Verify "Email/Password" is enabled
3. Verify "Google" is enabled (if using Google sign-in)
4. Check "Authorized domains" includes your domain

### Step 3: Check Firestore Database
1. Go to Firestore Database
2. Verify database exists and is in test mode
3. Check Security Rules allow authenticated access

### Step 4: Verify Web App Configuration
1. Go to Project Settings → General
2. Scroll to "Your apps" section
3. Verify web app exists with correct configuration
4. Copy configuration if needed

### Step 5: Test Locally
1. Restart development server: `npm run dev`
2. Open browser console (F12)
3. Look for Firebase initialization messages
4. Try to sign up/sign in
5. Check for any error messages

## Debug Commands

### Check Environment Variables
```bash
# View .env file
cat .env

# Check if variables are loaded (in browser console)
console.log(import.meta.env.VITE_FIREBASE_API_KEY)
```

### Test Firebase Connection
```javascript
// In browser console
import { runAllTests } from './src/utils/firebaseTest.js'
runAllTests()
```

### Check Firebase Status
```javascript
// In browser console
import { auth, db } from './src/config/firebase.js'
console.log('Auth:', auth)
console.log('Firestore:', db)
```

## Emergency Fixes

### If .env file is corrupted:
1. Delete the .env file: `rm .env`
2. Create new .env file with correct values
3. Restart development server

### If Firebase is not working:
1. Check Firebase Console for project status
2. Verify billing is not suspended
3. Check if project is in the correct region

### If authentication still fails:
1. Clear browser cache and cookies
2. Try incognito/private browsing mode
3. Check if any browser extensions are interfering

## Support

If you're still having issues:
1. Check the browser console for specific error messages
2. Use the Debug Panel to run tests
3. Verify all steps in this guide
4. Check Firebase Console for any service issues

## Expected Console Output

When everything is working correctly, you should see:
```
✅ Firebase initialized successfully
✅ AuthProvider: Firebase Auth is available
🔄 AuthProvider: Setting up auth state listener
✅ FirebaseService: User profile created successfully
``` 