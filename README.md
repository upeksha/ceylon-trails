# 🇱🇰 Ceylon Trails - Sri Lanka Travel Planner

A comprehensive interactive travel planner for exploring Sri Lanka's cultural heritage, restaurants, eco lodges, wellness retreats, train stations, and pristine beaches.

## ✨ Features

### 🗺️ **Interactive Map Experience**
- **Google Maps Integration** with custom markers for different place categories
- **Color-coded markers** with category icons (🏛️ Heritage, 🍽️ Restaurants, 🌿 Eco Lodges, etc.)
- **Responsive design** optimized for both desktop and mobile devices
- **Real-time marker updates** based on active filters

### 🔍 **Advanced Filtering & Search**
- **Category-based filtering** with visual checkboxes for all place types
- **Smart search functionality** - search by place name or description
- **Combined filtering** - search and category filters work together
- **Real-time results** with live place count updates
- **All categories selected by default** for complete overview
- **Clear filters** functionality to reset selections

### 📱 **Comprehensive Place Details**
- **Rich place information** powered by Google Places API with intelligent fallbacks
- **Multi-source data loading**: Google Places API → Text Search → Basic Info
- **Enhanced contact details** with copy-to-clipboard functionality:
  - Plus Codes (Google's location system)
  - Precise coordinates (6 decimal places)
  - International phone numbers with click-to-call
  - Direct website links
- **Visual content**: Photo galleries with horizontal scrolling
- **Service & amenity badges**: Dine In, Takeout, Delivery, Vegetarian, Accessibility
- **Pricing information**: $ to $$$$ price levels
- **Real-time status**: Open/Closed with full weekly schedules
- **Recent reviews** with star ratings and user comments
- **Editorial summaries** and detailed place categories

### 📋 **Smart Itinerary Management**
- **Add places to itinerary** with duplicate prevention
- **Visual feedback** with "Added ✓" confirmation
- **Toast notifications** for user actions
- **Itinerary counter** showing selected places count
- **Persistent state** throughout the session

### 🎯 **User Experience**
- **Fast loading** with optimized fallback chains
- **Error handling** with graceful degradation
- **Loading states** with clear feedback
- **Copy functionality** for addresses, coordinates, and location codes
- **Mobile-responsive** layout with touch-friendly interactions
- **Professional UI** with Ceylon-themed color scheme

## 🏗️ **Technical Architecture**

### **Frontend Stack**
- **React 19.1.0** with Vite for fast development
- **Google Maps JavaScript API** for interactive mapping
- **Google Places API** for rich place data
- **Tailwind CSS 3.4.17** for responsive styling
- **Lucide React** for consistent iconography

### **Component Structure**
```
src/
├── components/
│   ├── MapContainer.jsx          # Main map and state management
│   ├── SidebarFilters.jsx        # Category filtering and search
│   ├── PlaceDetailsPanel.jsx     # Rich place information display
│   └── PlaceMarker.jsx          # Custom marker components
├── data/
│   └── places.js                # Curated place data with real Google Place IDs
├── utils/
│   └── mapsConfig.js            # Google Maps configuration and custom markers
└── index.css                    # Global styles and animations
```

### **Key Features Implementation**

#### **Robust Data Loading**
- **Multi-level fallback system** ensures data is always available
- **Google Places API** for comprehensive place information
- **Text search fallback** with multiple query variations
- **Basic information fallback** for edge cases
- **Aggressive error handling** prevents loading failures

#### **Smart Filtering Logic**
- **Memoized filtering** prevents infinite re-renders
- **Combined search and category filtering**
- **Dynamic place counting** with real-time updates
- **No selection = no results** (logical filtering behavior)

#### **Enhanced Place Data Fields**
```javascript
// Google Places API Fields Requested
[
  // Basic Information
  'name', 'formatted_address', 'international_phone_number',
  'website', 'rating', 'user_ratings_total', 'price_level',
  
  // Location Details
  'plus_code', 'geometry', 'vicinity', 'adr_address',
  
  // Rich Content
  'photos', 'reviews', 'types', 'opening_hours',
  
  // Services & Amenities
  'wheelchair_accessible_entrance', 'takeout', 'delivery',
  'dine_in', 'reservations', 'serves_vegetarian_food',
  'serves_breakfast', 'serves_lunch', 'serves_dinner',
  
  // Additional Details
  'business_status', 'editorial_summary', 'url'
]
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ and npm
- Google Cloud Platform account with APIs enabled:
  - Maps JavaScript API
  - Places API
  - (Optional) Extended Component Library

### **Installation**

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
   # Create .env file in the root directory
   echo "VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here" > .env
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### **Google Cloud Setup**

1. **Create a Google Cloud Project**
2. **Enable required APIs**:
   - Maps JavaScript API
   - Places API
3. **Create API credentials** (API Key)
4. **Configure API restrictions** (optional but recommended):
   - HTTP referrer restrictions for production
   - API restrictions to limit usage

## 📊 **Current Data**

### **Place Categories & Count**
- 🏛️ **Heritage Sites** (5): Galle Fort, Temple of the Tooth, Sigiriya, Polonnaruwa, Anuradhapura
- 🍽️ **Restaurants** (2): Ministry of Crab, Curry Leaf Restaurant
- 🌿 **Eco Lodges** (2): Jetwing Vil Uyana, Heritance Kandalama
- 🧘 **Wellness** (1): Santani Resort & Spa
- 🚂 **Train Stations** (3): Kandy, Ella, Nuwara Eliya Railway Stations
- 🏖️ **Beaches** (4): Unawatuna, Mirissa, Bentota, Arugam Bay

**Total: 17 curated places** across Sri Lanka with real Google Place IDs

### **Data Sources**
- **Primary**: Google Places API with comprehensive field requests
- **Fallback**: Google Places Text Search with multiple query variations
- **Final Fallback**: Curated place descriptions and coordinates

## 🎯 **Development Phases**

### ✅ **Phase 1: Foundation** (Completed)
- React + Vite setup with Google Maps integration
- Custom category markers with color coding
- Basic place details panel with Google Places UI Kit
- Category-based filtering system
- Responsive layout design

### ✅ **Phase 2: Enhanced Experience** (Completed)
- Advanced search functionality with real-time filtering
- Improved place details with rich Google Places data
- Itinerary management with add/remove functionality
- Mobile-responsive design improvements
- Toast notifications and user feedback

### ✅ **Phase 3: Rich Data & UX** (Completed)
- Comprehensive place information display
- Photo galleries and visual content
- Enhanced contact details with copy-to-clipboard
- Service badges and amenity indicators
- Real-time business hours and status
- Recent reviews and ratings display
- Multiple data source fallbacks for reliability

### 🚧 **Future Enhancements** (Planned)
- **Itinerary Planning**: Day-by-day scheduling and route optimization
- **Offline Support**: Cached place data for poor connectivity
- **User Accounts**: Save and share itineraries
- **Enhanced Mobile**: Native-like mobile experience
- **Social Features**: Reviews, photos, and recommendations
- **Transportation**: Public transport integration and route planning

## 🛠️ **Development Commands**

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🐛 **Known Issues & Solutions**

### **Map Loading Issues**
- **Issue**: Map not initializing on some devices
- **Solution**: Implemented robust DOM element detection with multiple fallbacks

### **Place ID Validity**
- **Issue**: Some Google Place IDs become invalid over time
- **Solution**: Multi-level fallback system with text search and basic info

### **Image Loading**
- **Issue**: Google Photos API sometimes fails
- **Solution**: Error handling with retry logic and graceful degradation

### **Performance**
- **Issue**: Marker updates causing re-renders
- **Solution**: Memoized filtering and optimized state management

## 🎨 **Design System**

### **Ceylon-Themed Colors**
- `ceylon-orange`: #ea580c (Heritage sites)
- `ceylon-red`: #dc2626 (Restaurants)
- `ceylon-green`: #059669 (Eco lodges, success states)
- `ceylon-purple`: #7c3aed (Wellness)
- `ceylon-blue`: #1e40af (Transport)
- `blue-500`: #3b82f6 (Beaches)

### **Typography & Spacing**
- **Font**: System font stack optimized for readability
- **Spacing**: Consistent 4px grid system
- **Shadows**: Subtle elevation for depth
- **Animations**: Smooth transitions and loading states

## 📝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Google Maps Platform** for comprehensive mapping and places data
- **Sri Lanka Tourism** for destination inspiration
- **React Community** for excellent tooling and documentation
- **Tailwind CSS** for efficient styling system

---

**Built with ❤️ for exploring the pearl of the Indian Ocean** 🇱🇰
