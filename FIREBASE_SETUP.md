# Firebase Setup Guide

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "ceylon-trails")
4. Follow the setup wizard (you can disable Google Analytics if you don't need it)

## Step 2: Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Optionally enable "Google" authentication for Google OAuth

## Step 3: Create Firestore Database

1. In your Firebase project, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose the closest to your users)

## Step 4: Get Your Web App Configuration

1. In your Firebase project, go to "Project Settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (</>) to add a web app
4. Register your app with a nickname (e.g., "ceylon-trails-web")
5. Copy the configuration object

## Step 5: Create Environment Variables

Create a `.env` file in the root of your project with the following content:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Maps API Key (optional)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Replace the values with your actual Firebase configuration.

## Step 6: Security Rules (Optional)

For production, you should set up proper Firestore security rules. Here's a basic example:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own itineraries
    match /itineraries/{itineraryId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow read: if resource.data.public == true;
    }
    
    // Users can only access their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 7: Test the Setup

1. Start your development server: `npm run dev`
2. Try to sign up/sign in
3. Check the browser console for any Firebase errors
4. Verify that data is being saved to Firestore

## Troubleshooting

### "auth/invalid-api-key" Error
- Make sure your `.env` file exists and has the correct Firebase API key
- Verify that the API key is not empty or contains extra spaces
- Check that the Firebase project is properly set up

### "Firestore permission denied" Error
- Make sure Firestore is created and in test mode
- Check that your security rules allow the operations you're trying to perform

### "Google Maps API" Warnings
- These are just warnings about deprecated APIs, not errors
- The application will still work with the current Google Maps setup 