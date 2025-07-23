# 🌴 Ceylon Trails
**Interactive Travel Planner for Sri Lanka**

A modern, responsive web application built with React.js for planning and visualizing travel itineraries across the beautiful island of Sri Lanka. Features real-time route planning, interactive maps, and a comprehensive database of tourist attractions.

![Ceylon Trails Preview](https://img.shields.io/badge/Status-Phase%203%20Complete-brightgreen)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![Vite](https://img.shields.io/badge/Vite-6.0.5-646CFF)
![Google Maps](https://img.shields.io/badge/Google%20Maps-API-red)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.17-38B2AC)

## ✨ Features

### 🗺️ **Interactive Map Experience**
- **Responsive Google Maps** centered on Sri Lanka
- **Custom category markers** for different attraction types
- **Real-time place details** powered by Google Places API
- **Mobile-optimized** responsive design

### 🎯 **Smart Filtering & Search**
- **Category-based filtering** (Heritage, Restaurants, Wellness, Eco, Train Stations, Beaches)
- **Dynamic text search** across place names and descriptions
- **Real-time results** with visual feedback
- **Fallback messaging** for no results

### 📱 **Rich Place Details Panel**
- **Enhanced place information** with photos, ratings, and reviews
- **Multiple data sources** with intelligent fallback (Google Places API → Text Search → Basic Info)
- **Contact information** with one-click actions (call, website, directions)
- **Copy-to-clipboard** functionality for addresses and coordinates
- **Accessibility features** and service amenities display

### 📋 **Advanced Itinerary Builder**
- **Drag-and-drop reordering** using dnd-kit
- **Visual itinerary cards** with place details and travel times
- **Travel mode selection** (Driving, Walking, Transit)
- **Route visualization** with Google Directions API
- **Real-time distance and duration** calculations
- **Export functionality** for planned itineraries

### 🚗 **Route Planning & Visualization**
- **Automatic route calculation** for 2+ destinations
- **Multiple travel modes** with accurate time estimates
- **Waypoint optimization** respecting user-defined order
- **Visual route overlay** on the map
- **Detailed leg-by-leg breakdown** of the journey

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Google Maps API Key with the following APIs enabled:
  - Maps JavaScript API
  - Places API
  - Directions API

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

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your Google Maps API key
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser** to `http://localhost:5173`

## 🏗️ Architecture

### **Component Structure**
```
src/
├── components/
│   ├── MapContainer.jsx          # Main map and state management
│   ├── SidebarFilters.jsx        # Category and search filtering
│   ├── PlaceDetailsPanel.jsx     # Rich place information display
│   ├── ItinerarySidebar.jsx      # Itinerary management UI
│   ├── ItineraryCard.jsx         # Individual itinerary item
│   ├── TravelModeSelector.jsx    # Travel mode selection
│   ├── RouteOverlay.jsx          # Route calculation and display
│   └── ErrorBoundary.jsx         # Error handling and recovery
├── data/
│   ├── places.js                 # Curated Sri Lanka destinations
│   └── demoItinerary.js          # Sample itinerary data
└── utils/
    └── mapsConfig.js             # Google Maps configuration
```

### **Key Technologies**
- **React 19.1.0** with Hooks for state management
- **Vite 6.0.5** for fast development and building
- **Google Maps JavaScript API** for mapping and geocoding
- **Google Places API** for rich place data
- **Google Directions API** for route planning
- **Tailwind CSS 3.4.17** for styling and responsive design
- **@dnd-kit** for drag-and-drop functionality
- **Lucide React** for consistent iconography

### **State Management**
- **Centralized state** in MapContainer for itinerary and route data
- **Local component state** for UI interactions and loading states
- **Memoized computations** for performance optimization
- **Error boundaries** for graceful error handling

## 🎮 Usage Guide

### **Planning an Itinerary**
1. **Explore the map** and use category filters to find places of interest
2. **Click on markers** to view detailed place information
3. **Add places to your itinerary** using the "Add to Itinerary" button
4. **Reorder stops** by dragging itinerary cards
5. **Select travel mode** and view automatically calculated routes
6. **Export your itinerary** when ready

### **Search and Filter**
- Use **category checkboxes** to filter by attraction type
- **Search by name** in the search box for specific places
- **Combine filters** for precise results

### **Route Planning**
- Routes are **automatically calculated** when you have 2+ destinations
- **Change travel modes** to see different route options
- **View detailed route information** including distance and time per segment

## 🗂️ Data Sources

### **Curated Destinations**
The application includes hand-selected destinations across Sri Lanka:
- **Heritage Sites**: Galle Fort, Temple of the Tooth, Sigiriya Rock Fortress
- **Restaurants**: Ministry of Crab, Curry Leaf Restaurant
- **Wellness Retreats**: Jetwing Vil Uyana, Santani Resort & Spa
- **Train Stations**: Kandy, Ella, Nuwara Eliya
- **Beaches**: Unawatuna, Mirissa, Bentota, Arugam Bay

### **Real-time Data Integration**
- **Google Places API** for current business information
- **Google Directions API** for accurate travel times
- **Fallback strategies** ensure data availability

## 🔧 Configuration

### **Environment Variables**
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### **Google Maps API Setup**
1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the following APIs:
   - Maps JavaScript API
   - Places API  
   - Directions API
3. Create an API key and add it to your `.env` file
4. Configure API key restrictions for security

## 📱 Mobile Experience

Ceylon Trails is fully responsive with dedicated mobile optimizations:
- **Touch-friendly** interface with appropriate sizing
- **Collapsible sidebars** that adapt to screen size
- **Swipeable itinerary panel** on mobile devices
- **Optimized map interactions** for touch devices

## 🚧 Development Phases

### ✅ **Phase 1: Foundation** 
- React.js setup with Vite
- Google Maps integration
- Basic marker system with categories
- Responsive layout foundation

### ✅ **Phase 2: Enhanced Experience**
- Advanced filtering and search
- Rich place details panel
- Google Places API integration
- Add to itinerary functionality

### ✅ **Phase 3: Itinerary Builder**
- Complete itinerary management
- Drag-and-drop reordering
- Route planning and visualization
- Export capabilities

### 🔮 **Future Enhancements**
- User accounts and saved itineraries
- Social sharing capabilities
- Offline functionality
- Advanced route optimization
- Integration with booking platforms

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues, feature requests, or pull requests.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Google Maps Platform** for comprehensive mapping APIs
- **React.js Community** for the excellent framework and ecosystem
- **Sri Lanka Tourism** for inspiration and destination information
- **dnd-kit** for the smooth drag-and-drop experience
- **Tailwind CSS** for the utility-first styling approach

---

**Built with ❤️ for Sri Lanka travelers by the Ceylon Trails team**

[🌐 View Live Demo](https://ceylon-trails.vercel.app) | [📚 Documentation](https://github.com/upeksha/ceylon-trails/wiki) | [🐛 Report Issues](https://github.com/upeksha/ceylon-trails/issues)