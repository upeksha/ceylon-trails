import { places } from './places';

// Sample dummy itinerary for testing Phase 3 features
export const sampleItinerary = [
  {
    id: 1,
    placeId: 'ChIJQzCfhkdX4joRzpKIH8T-Dms',
    name: 'Galle Fort',
    category: 'heritage',
    position: { lat: 6.0353, lng: 80.2169 },
    description: 'Historic fort built by Portuguese and Dutch colonizers'
  },
  {
    id: 2,
    placeId: 'ChIJS5yDNz6Z4joRj7_y_KvflNo',
    name: 'Unawatuna Beach',
    category: 'beach',
    position: { lat: 6.0125, lng: 80.2436 },
    description: 'Beautiful golden sandy beach perfect for swimming and snorkeling'
  },
  {
    id: 4,
    placeId: 'ChIJhzYtnhTX4zoRk7E1Nt_Uy8A',
    name: 'Mirissa Beach',
    category: 'beach',
    position: { lat: 5.9485, lng: 80.4585 },
    description: 'Stunning beach known for whale watching and beautiful sunsets'
  }
];

// Function to get sample itinerary from existing places data
export const getSampleItinerary = () => {
  // Get specific places by ID for a good demo route
  const samplePlaceIds = [1, 2, 4]; // Galle Fort, Unawatuna Beach, Mirissa Beach
  
  return places.filter(place => samplePlaceIds.includes(place.id));
};

// Helper function to load sample itinerary into state
export const loadSampleItinerary = (setItinerary) => {
  const demo = getSampleItinerary();
  console.log('🎭 Loading sample itinerary:', demo.map(p => p.name));
  setItinerary(demo);
};

export default sampleItinerary; 