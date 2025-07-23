export const places = [
  // Heritage Sites
  {
    id: 1,
    name: 'Galle Fort',
    placeId: 'ChIJQzCfhkdX4joRzpKIH8T-Dms', // Updated ID
    category: 'heritage',
    position: { lat: 6.0353, lng: 80.2169 },
    description: 'Historic fort built by Portuguese and Dutch colonizers'
  },
  {
    id: 2,
    name: 'Temple of the Tooth',
    placeId: 'ChIJ8ZxZhTdz6ToRBMOCNtdGMF4', // Updated ID
    category: 'heritage',
    position: { lat: 7.2926, lng: 80.6410 },
    description: 'Sacred Buddhist temple housing tooth relic of Buddha'
  },
  {
    id: 3,
    name: 'Sigiriya Rock Fortress',
    placeId: 'ChIJrZKm2YsZKzoRKr7ZJjpFqtw', // This one might be valid
    category: 'heritage',
    position: { lat: 7.9570, lng: 80.7603 },
    description: 'Ancient palace and fortress complex on a massive rock'
  },
  {
    id: 4,
    name: 'Polonnaruwa Ancient City',
    placeId: 'ChIJIaflqxqJLToRSY1Rp3JDfHs', // Updated ID
    category: 'heritage',
    position: { lat: 7.9403, lng: 81.0188 },
    description: 'Ancient capital with well-preserved ruins and temples'
  },
  {
    id: 5,
    name: 'Anuradhapura Sacred City',
    placeId: 'ChIJv7W_xMzKPToRA2ZNc_wgRZA', // Updated ID
    category: 'heritage',
    position: { lat: 8.3114, lng: 80.4037 },
    description: 'Ancient sacred city with Buddhist monasteries'
  },

  // Restaurants
  {
    id: 6,
    name: 'Ministry of Crab',
    placeId: 'ChIJlSQ2zZVT4joR_vBLyPjHoGI', // Updated ID for Colombo location
    category: 'restaurant',
    position: { lat: 6.9355, lng: 79.8487 },
    description: 'World-famous restaurant specializing in Sri Lankan crab'
  },
  {
    id: 7,
    name: 'Curry Leaf Restaurant',
    placeId: 'ChIJX4_pY4pT4joRzPEhXB0g_xY', // This might need updating
    category: 'restaurant',
    position: { lat: 6.9271, lng: 79.8612 },
    description: 'Traditional Sri Lankan cuisine in elegant setting'
  },

  // Eco Lodges
  {
    id: 8,
    name: 'Jetwing Vil Uyana',
    placeId: 'ChIJuQl6bZgZKzoRY1-pOCAJTZM', // This one might be valid
    category: 'eco',
    position: { lat: 7.9500, lng: 80.7400 },
    description: 'Luxury eco-lodge with wetland and forest dwellings'
  },
  {
    id: 9,
    name: 'Heritance Kandalama',
    placeId: 'ChIJy8LnOJsAKzoR8gZo6J5DgPY', // Updated ID
    category: 'eco',
    position: { lat: 7.8558, lng: 80.6691 },
    description: 'Iconic hotel built into rock face overlooking reservoir'
  },

  // Wellness Retreats
  {
    id: 10,
    name: 'Santani Resort & Spa',
    placeId: 'ChIJ__9_vbNz6ToRzYnF-aGTcqY', // Updated ID
    category: 'wellness',
    position: { lat: 7.2500, lng: 80.7200 },
    description: 'Mountain wellness retreat with Ayurvedic treatments'
  },

  // Train Stations
  {
    id: 11,
    name: 'Kandy Railway Station',
    placeId: 'ChIJlc_Q9v1z6ToRgVAJmBIZ0hg', // This might need updating
    category: 'transport',
    position: { lat: 7.2931, lng: 80.6350 },
    description: 'Historic railway station in the heart of Kandy'
  },
  {
    id: 12,
    name: 'Ella Railway Station',
    placeId: 'ChIJYf6oPgKFBDoR5MEYj8RMcR8', // Updated ID
    category: 'transport',
    position: { lat: 6.8769, lng: 81.0461 },
    description: 'Scenic mountain railway station on famous hill country line'
  },
  {
    id: 13,
    name: 'Nuwara Eliya Railway Station',
    placeId: 'ChIJFRxJGMKDBDoRJY9zQTEJE6Y', // Updated ID
    category: 'transport',
    position: { lat: 6.9497, lng: 80.7891 },
    description: 'High-altitude station in Sri Lanka\'s tea country'
  },

  // Beaches
  {
    id: 14,
    name: 'Unawatuna Beach',
    placeId: 'ChIJzTGz8kdX4joRl0OMJ8v3dZ4', // Updated ID
    category: 'beach',
    position: { lat: 6.0108, lng: 80.2506 },
    description: 'Crescent-shaped golden beach popular for swimming'
  },
  {
    id: 15,
    name: 'Mirissa Beach',
    placeId: 'ChIJGYQb2mhF4joRPY4jFVPJkJI', // Updated ID
    category: 'beach',
    position: { lat: 5.9485, lng: 80.4585 },
    description: 'Beautiful beach famous for whale watching tours'
  },
  {
    id: 16,
    name: 'Bentota Beach',
    placeId: 'ChIJF4Q6rZJM4joRBmW_aJ1YnR0', // Updated ID
    category: 'beach',
    position: { lat: 6.4267, lng: 79.9951 },
    description: 'Golden sand beach with water sports and luxury resorts'
  },
  {
    id: 17,
    name: 'Arugam Bay',
    placeId: 'ChIJ32tN8gkOADoR0QbCMYQJkBI', // Updated ID
    category: 'beach',
    position: { lat: 6.8407, lng: 81.8360 },
    description: 'World-class surfing destination on the east coast'
  }
];

export const categories = [
  { id: 'heritage', name: 'Heritage Sites', color: 'ceylon-orange', icon: '🏛️' },
  { id: 'restaurant', name: 'Restaurants', color: 'ceylon-red', icon: '🍽️' },
  { id: 'eco', name: 'Eco Lodges', color: 'ceylon-green', icon: '🌿' },
  { id: 'wellness', name: 'Wellness', color: 'ceylon-purple', icon: '🧘' },
  { id: 'transport', name: 'Train Stations', color: 'ceylon-blue', icon: '🚂' },
  { id: 'beach', name: 'Beaches', color: 'blue-500', icon: '🏖️' }
];

export const getPlacesByCategory = (categoryId) => {
  if (!categoryId) return places;
  return places.filter(place => place.category === categoryId);
};

export const getCategoryInfo = (categoryId) => {
  return categories.find(cat => cat.id === categoryId);
}; 