# Ceylon Trails - Sri Lanka Travel Planner

A modern, interactive travel planning application for exploring Sri Lanka's cultural heritage sites, restaurants, eco lodges, wellness retreats, train stations, and beautiful beaches. Built with React, Firebase, and Google Maps API.

![Ceylon Trails](https://img.shields.io/badge/Status-Phase%205%20Complete-green)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![Firebase](https://img.shields.io/badge/Firebase-10.0.0-orange)
![Google Maps](https://img.shields.io/badge/Google%20Maps-JavaScript%20API-red)
![Vite](https://img.shields.io/badge/Vite-7.0.4-purple)

## 🌟 Features

### ✅ Phase 1: Map Integration & Place Discovery
- **Interactive Google Map** centered over Sri Lanka
- **Custom Place Markers** with category-based colors and icons
- **Rich Place Details Panel** with comprehensive Google Places data
- **Category Filtering** (Heritage, Restaurants, Eco Lodges, Wellness, Transport, Beaches)
- **Smart Fallback System** for robust data loading with outdated place IDs
- **Responsive Design** with sidebar and map layout

### ✅ Phase 2: Enhanced Filtering & Itinerary Selection
- **Advanced Search Functionality** - Filter places by name or description
- **Combined Search + Category Filtering** - Search within selected categories
- **Enhanced Place Details Panel** with improved layout and mobile support
- **Itinerary Management** - Add places to your travel itinerary
- **Visual Feedback** - Toast notifications and button state changes
- **Mobile-First Design** - Optimized for both desktop and mobile experiences

### ✅ Phase 3: Multi-Day Itinerary Planning
- **Multi-Day Planner** - Organize places by travel days
- **Drag & Drop Reordering** - Reorder places within and between days
- **Day Management** - Add, remove, and switch between days
- **Visual Day Tabs** - Easy navigation between itinerary days
- **Place Statistics** - Track places per day and total count

### ✅ Phase 4: Save/Load & Export Functionality
- **Local Storage Persistence** - Save itineraries between sessions
- **Export Options** - Share itineraries via email or download
- **Itinerary Management** - Load, save, and manage multiple itineraries
- **Unsaved Changes Tracking** - Prevent accidental data loss

### ✅ Phase 5: Full Firebase Integration & Authentication
- **Firebase Authentication** - Email/password and Google OAuth login
- **User Accounts** - Secure user registration and login
- **Cloud Storage** - Save itineraries to Firestore database
- **Public Sharing** - Share itineraries with public links
- **Real-time Sync** - Access itineraries across devices

### ✅ Hybrid Place System
- **Predefined Places** - Curated list of Sri Lankan destinations
- **Google Places Search** - Search for additional places via Google API
- **Custom Places** - Add custom locations with double-click on map
- **Unified Management** - All place types work seamlessly together
- **Persistent Markers** - Place markers saved and displayed consistently

## 🏗️ Technical Architecture

### Frontend Stack
- **React 19.1.0** - Modern React with hooks and context
- **Vite 7.0.4** - Fast build tool and dev server
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **React Router DOM** - Client-side routing

### Backend & Database
- **Firebase 10.0.0** - Backend-as-a-Service
- **Firebase Authentication** - User management
- **Firestore** - NoSQL document database
- **Firebase Security Rules** - Data access control

### Google Maps Integration
- **Google Maps JavaScript API** - Interactive map rendering
- **Google Places API** - Rich place data and search
- **Directions Service** - Route calculation and display
- **Places Autocomplete** - Search suggestions

### Key Libraries
```json
{
  "@googlemaps/js-api-loader": "^1.16.10",
  "firebase": "^10.0.0",
  "react-router-dom": "^6.8.0",
  "@dnd-kit/core": "^6.0.0",
  "@dnd-kit/sortable": "^7.0.0",
  "tailwindcss": "^3.4.17",
  "lucide-react": "^0.525.0"
}
```

## 🗂️ Project Structure

```
ceylon-trails/
├── public/
│   └── index.html                 # HTML entry point
├── src/
│   ├── components/
│   │   ├── MapContainer.jsx       # Main map with place management
│   │   ├── PlaceDetailsPanel.jsx  # Place information display
│   │   ├── SidebarFilters.jsx     # Search and filtering
│   │   ├── ItinerarySidebar.jsx   # Itinerary display and controls
│   │   ├── MultiDayPlanner.jsx    # Multi-day itinerary management
│   │   ├── ItineraryCard.jsx      # Individual place cards
│   │   ├── RoutePreview.jsx       # Route visualization
│   │   ├── CustomPlaceModal.jsx   # Custom place creation
│   │   ├── GooglePlacesSearch.jsx # Google Places search
│   │   ├── LoginModal.jsx         # Authentication UI
│   │   ├── ItineraryManager.jsx   # Saved itineraries management
│   │   ├── SaveItineraryModal.jsx # Save itinerary dialog
│   │   └── DebugPanel.jsx         # Development debugging
│   ├── contexts/
│   │   ├── AuthProvider.jsx       # Firebase authentication context
│   │   └── ItineraryContext.jsx   # Itinerary state management
│   ├── pages/
│   │   └── PublicItineraryPage.jsx # Public itinerary sharing
│   ├── services/
│   │   └── firebaseService.js     # Firebase operations
│   ├── utils/
│   │   ├── placeUtils.js          # Place management utilities
│   │   ├── mapsConfig.js          # Google Maps configuration
│   │   ├── localStorage.js        # Local storage utilities
│   │   └── firebaseTest.js        # Firebase testing utilities
│   ├── styles/
│   │   ├── App.css                # Main application styles
│   │   ├── Modal.css              # Modal component styles
│   │   └── SidebarFilters.css     # Filter component styles
│   ├── data/
│   │   └── places.js              # Predefined places data
│   ├── config/
│   │   └── firebase.js            # Firebase configuration
│   ├── App.jsx                    # Root component with routing
│   ├── main.jsx                   # App entry point
│   └── index.css                  # Global styles
├── firestore-rules.txt            # Firestore security rules
├── FIREBASE_SETUP.md              # Firebase setup guide
├── FIREBASE_TROUBLESHOOTING.md    # Firebase troubleshooting
├── .env                           # Environment variables
├── tailwind.config.js             # Tailwind configuration
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

## 🔐 Authentication System

### Firebase Authentication Setup
The app uses Firebase Authentication with multiple sign-in methods:

```javascript
// Email/Password Authentication
const signUp = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Google OAuth
const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};
```

### AuthProvider Context
Manages authentication state across the application:

```javascript
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Provides login, logout, register functions
  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## 📊 Data Management

### Firestore Database Schema

#### Itineraries Collection
```javascript
{
  id: "auto-generated",
  userId: "user_uid",
  title: "My Sri Lanka Trip",
  travelMode: "DRIVING",
  days: [
    {
      day: 1,
      places: [
        {
          id: "place_1",
          name: "Galle Fort",
          category: "heritage",
          position: { lat: 6.0353, lng: 80.2169 },
          type: "predefined", // predefined, google, custom
          // ... other place properties
        }
      ]
    }
  ],
  public: false,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Place Types System
The app supports three types of places:

1. **Predefined Places** - Curated Sri Lankan destinations
2. **Google Places** - Searched via Google Places API
3. **Custom Places** - User-created locations

```javascript
// Place type constants
export const PLACE_TYPES = {
  PREDEFINED: 'predefined',
  GOOGLE: 'google',
  CUSTOM: 'custom'
};

// Place creation utilities
export const createCustomPlace = (name, category, position) => ({
  id: generateCustomPlaceId(),
  name,
  category,
  position,
  type: PLACE_TYPES.CUSTOM,
  createdAt: new Date().toISOString()
});

export const createGooglePlace = (googlePlace) => ({
  id: generateCustomPlaceId(),
  name: googlePlace.name,
  category: 'google',
  position: { lat: googlePlace.geometry.location.lat(), lng: googlePlace.geometry.location.lng() },
  type: PLACE_TYPES.GOOGLE,
  placeId: googlePlace.place_id,
  googleTypes: googlePlace.types,
  googleFormattedAddress: googlePlace.formatted_address
});
```

## 🗺️ Map & Place Management

### MapContainer Component
The main map component handles:
- Google Maps initialization
- Place marker management
- Place selection and details
- Route visualization
- Custom place creation

```javascript
const MapContainer = () => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  
  // Marker management with persistent display
  const markerPlaces = useMemo(() => {
    const byId = new Map();
    filteredPlaces.forEach(place => byId.set(place.id, place));
    itineraryPlaces.forEach(place => byId.set(place.id, place));
    return Array.from(byId.values());
  }, [filteredPlaces, itineraryPlaces]);

  // Handle custom place creation
  const handleCustomPlaceSave = (customPlace) => {
    addCustomPlace(customPlace);
    if (map) {
      map.panTo(customPlace.position);
      map.setZoom(15);
      setSelectedPlace(customPlace);
    }
  };
};
```

### Place Details Panel
Displays comprehensive place information:
- Basic details (name, address, phone)
- Photos and ratings
- Opening hours and current status
- "Add to Itinerary" functionality
- Mobile-optimized design

## 📅 Multi-Day Itinerary System

### MultiDayPlanner Component
Manages multi-day itineraries with drag & drop:

```javascript
const MultiDayPlanner = ({ itinerary, onItineraryChange, currentDay }) => {
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    // Parse day-placeId format
    const [activeDay, activePlaceId] = active.id.split('-');
    const [overDay, overPlaceId] = over.id.split('-');
    
    if (activeDay === overDay) {
      // Reorder within same day
      const newPlaces = arrayMove(day.places, oldIndex, newIndex);
    } else {
      // Move between days
      const place = sourceDay.places[placeIndex];
      const newTargetPlaces = [...targetDay.places, place];
    }
  };
};
```

### Itinerary Management Features
- **Day Tabs** - Visual navigation between days
- **Drag & Drop** - Reorder places within and between days
- **Add/Remove Days** - Dynamic day management
- **Place Statistics** - Track places per day
- **Visual Feedback** - Clear drag states and animations

## 🔄 State Management

### ItineraryContext
Centralized state management for itinerary operations:

```javascript
const ItineraryProvider = ({ children }) => {
  const [itinerary, setItinerary] = useState([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Place management
  const [customPlaces, setCustomPlaces] = useState([]);
  const [allPlaces, setAllPlaces] = useState([]);
  
  // Firebase operations
  const saveCurrentItinerary = async (title) => {
    const cleanedItinerary = cleanItineraryForFirestore(itinerary);
    await saveItinerary(cleanedItinerary, title);
    setHasUnsavedChanges(false);
  };
  
  const loadUserItinerariesFromFirebase = async () => {
    const itineraries = await loadUserItineraries();
    return itineraries;
  };
};
```

### Context Integration
Components consume context for state and operations:

```javascript
const MapContainer = () => {
  const { 
    itinerary, 
    addCustomPlace, 
    addGooglePlace,
    currentDay 
  } = useItinerary();
  
  const { user } = useAuth();
};
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Google Maps API Key
- Firebase project

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/upeksha/ceylon-trails.git
cd ceylon-trails
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password, Google)
   - Create Firestore database
   - Copy Firebase config to `src/config/firebase.js`

4. **Set up environment variables**
```bash
# Create .env file
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

5. **Configure Firestore Security Rules**
```javascript
// Copy firestore-rules.txt content to Firebase Console
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /itineraries/{itineraryId} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
      allow read: if resource.data.public == true;
    }
  }
}
```

6. **Start development server**
```bash
npm run dev
```

7. **Open application**
```
http://localhost:5173
```

## 🔧 Configuration

### Google Maps API Setup
Enable these APIs in Google Cloud Console:
- Maps JavaScript API
- Places API
- Directions API

### Firebase Setup
1. **Authentication Methods**:
   - Email/Password
   - Google (OAuth)

2. **Firestore Database**:
   - Start in test mode
   - Apply security rules
   - Create indexes if needed

3. **Security Rules**:
```javascript
// Allow users to read/write their own itineraries
// Allow public read access to shared itineraries
match /itineraries/{itineraryId} {
  allow read, write: if request.auth != null && 
    (resource == null || resource.data.userId == request.auth.uid);
  allow read: if resource.data.public == true;
}
```

## 🛠️ Development Features

### Debug Panel
Development debugging tool with:
- Current state inspection
- Local storage monitoring
- Firebase connection testing
- Performance metrics

### Error Handling
Comprehensive error handling for:
- Firebase operations
- Google Maps API calls
- Network connectivity
- User authentication

### Data Validation
Robust data validation for:
- Place data integrity
- Firestore compatibility
- User input validation
- API response validation

## 📱 User Experience Features

### Responsive Design
- **Desktop**: Full sidebar with advanced features
- **Mobile**: Slide-up panels and touch-optimized controls
- **Tablet**: Adaptive layouts for medium screens

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management

### Performance Optimizations
- Memoized components and calculations
- Lazy loading of map features
- Efficient re-rendering strategies
- Optimized bundle size

## 🔒 Security Features

### Firebase Security Rules
- User-based data access control
- Public/private itinerary sharing
- Input validation and sanitization
- Rate limiting protection

### Authentication Security
- Secure password requirements
- OAuth token management
- Session persistence
- Logout functionality

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Place search and filtering
- [ ] Itinerary creation and editing
- [ ] Multi-day planning
- [ ] Drag & drop functionality
- [ ] Save/load operations
- [ ] Public sharing
- [ ] Mobile responsiveness

### Firebase Testing
```javascript
// Test Firebase connection
import { testFirebaseConnection } from './utils/firebaseTest.js';

// Run tests
testFirebaseConnection();
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Environment Variables for Production
Set production environment variables in your hosting platform:
- Firebase configuration
- Google Maps API key
- Security settings

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Errors**
   - Check Firebase configuration
   - Verify API keys
   - Check security rules

2. **Google Maps Loading Issues**
   - Verify API key validity
   - Check API quotas
   - Enable required APIs

3. **Authentication Problems**
   - Check Firebase Auth setup
   - Verify OAuth configuration
   - Check domain whitelist

4. **Data Persistence Issues**
   - Check Firestore rules
   - Verify user authentication
   - Check data validation

### Debug Tools
- Browser developer tools
- Firebase console
- Google Cloud console
- In-app debug panel

## 📚 API Documentation

### Firebase APIs Used
- **Authentication**: User management
- **Firestore**: Document database
- **Security Rules**: Access control

### Google Maps APIs Used
- **Maps JavaScript API**: Map rendering
- **Places API**: Place data and search
- **Directions API**: Route calculation

### Key Functions

#### Place Management
```javascript
// Add custom place
const addCustomPlace = (place) => {
  setCustomPlaces(prev => [...prev, place]);
  markAsDirty();
};

// Add Google place
const addGooglePlace = (place) => {
  setCustomPlaces(prev => [...prev, place]);
  markAsDirty();
};
```

#### Itinerary Operations
```javascript
// Save itinerary
const saveCurrentItinerary = async (title) => {
  const cleanedItinerary = cleanItineraryForFirestore(itinerary);
  await saveItinerary(cleanedItinerary, title);
};

// Load user itineraries
const loadUserItinerariesFromFirebase = async () => {
  return await loadUserItineraries();
};
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow React best practices
- Use TypeScript for new components
- Write comprehensive tests
- Update documentation
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Maps Platform** for mapping and places data
- **Firebase** for backend services
- **Sri Lanka Tourism** for inspiration and place information
- **React Team** for the excellent framework
- **Vite Team** for the fast build tool
- **Tailwind CSS** for the utility-first CSS framework

---

**Ceylon Trails** - Discover the Pearl of the Indian Ocean 🌺

*Built with ❤️ for travelers exploring Sri Lanka*
