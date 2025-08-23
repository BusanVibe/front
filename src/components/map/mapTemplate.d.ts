declare const createMapHTML: (config: {
  centerLat: number;
  centerLng: number;
  currentLocation?: { latitude: number; longitude: number } | null;
  shouldShowCurrentLocation?: boolean;
  placeMarkers: any[];
}) => string;

export { createMapHTML };
export default createMapHTML;


