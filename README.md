# Ceylon Trails - Sri Lanka Travel Planner

A modern, interactive travel planning application for exploring Sri Lanka's cultural heritage sites, restaurants, eco lodges, wellness retreats, train stations, and beautiful beaches.

![Ceylon Trails](https://img.shields.io/badge/Status-Phase%202%20Complete-green)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![Vite](https://img.shields.io/badge/Vite-7.0.4-purple)
![Google Maps](https://img.shields.io/badge/Google%20Maps-JavaScript%20API-red)

## 🌟 Features

### Phase 1: Map Integration & Place Discovery ✅
- **Interactive Google Map** centered over Sri Lanka
- **Custom Place Markers** with category-based colors and icons
- **Rich Place Details Panel** with comprehensive Google Places data
- **Category Filtering** (Heritage, Restaurants, Eco Lodges, Wellness, Transport, Beaches)
- **Smart Fallback System** for robust data loading with outdated place IDs
- **Responsive Design** with sidebar and map layout

### Phase 2: Enhanced Filtering & Itinerary Selection ✅
- **Advanced Search Functionality** - Filter places by name or description
- **Combined Search + Category Filtering** - Search within selected categories
- **Enhanced Place Details Panel** with improved layout and mobile support
- **Itinerary Management** - Add places to your travel itinerary
- **Visual Feedback** - Toast notifications and button state changes
- **Mobile-First Design** - Optimized for both desktop and mobile experiences
- **No Results Handling** - Graceful messaging when no places match filters
- **Direct Google Places API Integration** - Reliable place data without external dependencies

## 🏗️ Technical Architecture

### Frontend Stack
- **React 19.1.0** - Modern React with latest features
- **Vite 7.0.4** - Fast build tool and dev server
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

### Google Maps Integration
- **Google Maps JavaScript API** - Interactive map rendering
- **Google Places API** - Rich place data and details (direct integration)
- **Smart Fallback System** - Handles outdated place IDs automatically

### Key Libraries
```json
{
  "@googlemaps/js-api-loader": "^1.16.10",
  "tailwindcss": "^3.4.17",
  "lucide-react": "^0.525.0"
}
```

## 🗂️ Project Structure

```
ceylon-trails/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── MapContainer.jsx          # Main map component with filtering
│   │   ├── PlaceDetailsPanel.jsx     # Enhanced place information panel
│   │   ├── SidebarFilters.jsx        # Advanced filtering with search
│   │   └── PlaceMarker.jsx           # Marker component (placeholder)
│   ├── data/
│   │   └── places.js                 # Sri Lankan places data
│   ├── utils/
│   │   └── mapsConfig.js             # Google Maps configuration
│   ├── App.jsx                       # Root component
│   ├── main.jsx                      # App entry point
│   └── index.css                     # Global styles with animations
├── index.html                        # HTML entry point with Google Maps API
├── tailwind.config.js                # Tailwind configuration
├── postcss.config.js                 # PostCSS configuration
├── .env                              # Environment variables
└── package.json                      # Dependencies and scripts
```

## 🎨 Component Architecture

### MapContainer.jsx
- **Responsibility**: Main map rendering, marker management, and state coordination
- **Features**: 
  - Combined search and category filtering
  - Mobile responsive layout detection
  - Itinerary state management
  - Enhanced loading and error states
  - No results overlay with clear action
- **State Management**: Map, markers, filters, search, itinerary, mobile detection

### PlaceDetailsPanel.jsx
- **Responsibility**: Display rich place information with enhanced UX
- **Features**:
  - Mobile-optimized slide-up panel design
  - Enhanced header with category badges
  - "Add to Itinerary" functionality with visual feedback
  - Toast notifications for user actions
  - **Direct Google Places API Integration** - No external dependencies
  - **Smart Fallback System** - Handles outdated place IDs automatically
  - Responsive layout for desktop and mobile
- **Data Strategy**: Place ID → Text Search → Basic Info (with automatic fallback)

### SidebarFilters.jsx
- **Responsibility**: Advanced filtering and search functionality
- **Features**:
  - Real-time search with clear functionality
  - Combined search + category filtering
  - Results counter with filter summary
  - Category-specific place counts
  - Enhanced visual design with active states
  - "Clear all filters" functionality

## 📍 Places Data Structure

```javascript
export const places = [
  {
    id: 1,
    name: 'Galle Fort',
    placeId: 'ChIJQzCfhkdX4joRzpKIH8T-Dms',
    category: 'heritage',
    position: { lat: 6.0353, lng: 80.2169 },
    description: 'Historic fort built by Portuguese and Dutch colonizers'
  }
  // ... 17 total places across 6 categories
];

export const categories = [
  { id: 'heritage', name: 'Heritage Sites', color: 'ceylon-orange', icon: '🏛️' },
  { id: 'restaurant', name: 'Restaurants', color: 'ceylon-red', icon: '🍽️' },
  { id: 'eco', name: 'Eco Lodges', color: 'ceylon-green', icon: '🌿' },
  { id: 'wellness', name: 'Wellness', color: 'ceylon-purple', icon: '🧘' },
  { id: 'transport', name: 'Train Stations', color: 'ceylon-blue', icon: '🚂' },
  { id: 'beach', name: 'Beaches', color: 'blue-500', icon: '🏖️' }
];
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Google Maps API Key with following APIs enabled:
  - Maps JavaScript API
  - Places API

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ceylon-trails
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Create .env file in root directory
echo "VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here" > .env
```

4. **Update Google Maps API key in index.html**
```html
<!-- Replace YOUR_API_KEY with your actual key -->
<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places,marker&loading=async&callback=initMap"></script>
```

5. **Start development server**
```bash
npm run dev
```

6. **Open application**
```
http://localhost:5173
```

## 🔧 Configuration

### Google Maps Setup
The application loads Google Maps API via script tag in `index.html` with:
- **Libraries**: `places,marker`
- **Callback**: `initMap` function for API initialization
- **Loading**: Async with proper fallback handling

### Tailwind CSS
Custom Ceylon-themed color palette:
```javascript
colors: {
  'ceylon-blue': '#1e40af',
  'ceylon-green': '#059669', 
  'ceylon-orange': '#ea580c',
  'ceylon-purple': '#7c3aed',
  'ceylon-red': '#dc2626'
}
```

## 🛠️ Development Features

### Enhanced Filtering System
- **Real-time Search**: Filter places by name or description
- **Category Combinations**: Search within specific categories
- **Smart Results**: Show category-specific counts and "no matches" states
- **Clear Actions**: Easy filter reset functionality

### Improved User Experience
- **Mobile-First Design**: Optimized layouts for all screen sizes
- **Visual Feedback**: Toast notifications for user actions
- **Loading States**: Skeleton screens and progress indicators
- **Error Handling**: Graceful degradation with clear error messages

### Itinerary Management
- **Add to Itinerary**: One-click place addition
- **Duplicate Prevention**: Smart detection of already-added places
- **Visual States**: Button changes to show added status
- **Local Storage**: In-memory itinerary management (Phase 2)

### Responsive Design
- **Desktop**: Full sidebar with advanced filtering
- **Mobile**: Slide-up panels and floating action buttons
- **Tablet**: Adaptive layouts for medium screens
- **Touch-Friendly**: Large tap targets and gesture support

### Smart Data Loading System
- **Primary Method**: Direct place ID lookup for fastest results
- **Fallback Method**: Text search by name and location when place IDs are outdated
- **Automatic Recovery**: Seamless fallback without user intervention
- **Rich Data Display**: Photos, reviews, ratings, opening hours, contact info

## 🎯 Current Status

### ✅ Completed Features (Phase 2)
- [x] **Enhanced Search** - Real-time filtering by place name/description
- [x] **Combined Filtering** - Search + category selection
- [x] **Improved Place Panel** - Mobile-optimized with better UX
- [x] **Itinerary System** - Add places with visual feedback
- [x] **Mobile Responsive** - Optimized for all screen sizes
- [x] **Toast Notifications** - User action feedback
- [x] **No Results Handling** - Graceful empty states
- [x] **Direct Google Places API** - Removed Places UI Kit dependency
- [x] **Smart Fallback System** - Handles outdated place IDs automatically
- [x] **Rich Place Data** - Photos, reviews, ratings, opening hours, contact info

### 🚧 Phase 3 Features (Planned)
- [ ] **Itinerary Builder** - Drag & drop itinerary ordering
- [ ] **Multi-day Planning** - Organize places by days
- [ ] **Route Optimization** - Efficient travel routes between places
- [ ] **Export Options** - PDF, email, or print itineraries
- [ ] **Local Storage** - Persist itineraries between sessions
- [ ] **Share Functionality** - Share itineraries with others
- [ ] **Advanced Filters** - Price range, ratings, distance
- [ ] **Place Recommendations** - AI-powered suggestions

## 🐛 Known Issues

1. **Deprecated APIs**: Google Maps shows deprecation warnings for:
   - `google.maps.Marker` (migrating to `AdvancedMarkerElement`)
   - `google.maps.places.PlacesService` (migrating to `google.maps.places.Place`)

2. **Place ID Validity**: Some Place IDs may become invalid over time
   - **✅ Solution**: Smart text search fallback implemented

3. **~~Extended Component Library~~**: ~~Occasional loading issues~~
   - **✅ Solution**: Removed dependency, using direct Google Places API

4. **Mobile Filter Modal**: Currently shows placeholder alert
   - **Solution**: Full mobile filter modal in Phase 3

## 📚 API Documentation

### Google Maps APIs Used
- **Maps JavaScript API**: Map rendering and interactions
- **Places API**: Place details, photos, ratings, hours (direct integration)

### Key API Endpoints
- `PlacesService.getDetails()` - Fetch place details by Place ID
- `PlacesService.textSearch()` - Search places by name/query (fallback)

### Smart Fallback System
```javascript
// Primary: Try place ID first
service.getDetails(placeIdRequest, (result, status) => {
  if (status === 'OK') {
    // ✅ Success - use the data
  } else {
    // ❌ Fallback: Search by name and location
    service.textSearch(textSearchRequest, (results, textStatus) => {
      if (textStatus === 'OK' && results.length > 0) {
        // ✅ Found via text search - get detailed info
        service.getDetails(detailRequest, (detailResult, detailStatus) => {
          // Use detailed result
        });
      }
    });
  }
});
```

### Rich Data Fields Retrieved
- **Basic Info**: Name, address, phone, website
- **Ratings**: Star rating, review count
- **Hours**: Opening hours, current status
- **Media**: High-quality photos
- **Reviews**: Recent user reviews with ratings
- **Details**: Price level, place types

### New Component Props (Phase 2)

#### SidebarFilters
```javascript
<SidebarFilters
  selectedCategories={Array}      // Currently selected category IDs
  onCategoryChange={Function}     // Category selection handler
  searchQuery={String}            // Current search query
  onSearchChange={Function}       // Search input handler
  filteredPlaces={Array}          // Places matching current filters
  totalPlaces={Number}            // Total available places
/>
```

#### PlaceDetailsPanel
```javascript
<PlaceDetailsPanel
  place={Object}                  // Selected place object
  onClose={Function}              // Panel close handler
  onAddToItinerary={Function}     // Add to itinerary handler
  isInItinerary={Boolean}         // Whether place is in itinerary
  isMobile={Boolean}              // Mobile layout flag
/>
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Maps Platform** for mapping and places data
- **Sri Lanka Tourism** for inspiration and place information
- **React Team** for the excellent framework
- **Vite Team** for the fast build tool
- **Tailwind CSS** for the utility-first CSS framework

---

**Ceylon Trails** - Discover the Pearl of the Indian Ocean 🌺
