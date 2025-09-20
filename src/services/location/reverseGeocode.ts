// Google Maps Reverse Geocoding Service
import type { LatLng } from './geolocation';

export interface ReverseGeocodeResult {
  city: string;
  region?: string;
  country?: string;
  displayName?: string;
  formatted_address?: string;
}

export interface GoogleGeocodeResponse {
  results: Array<{
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    place_id: string;
    types: string[];
  }>;
  status: string;
}

export async function reverseGeocode(
  latlng: LatLng, 
  apiKey: string
): Promise<ReverseGeocodeResult> {
  if (!apiKey) {
    throw new Error('Google Maps API key is required for reverse geocoding');
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng.lat},${latlng.lng}&key=${apiKey}&result_type=locality|administrative_area_level_1|country`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`);
    }

    const data: GoogleGeocodeResponse = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Geocoding failed: ${data.status}`);
    }

    if (!data.results || data.results.length === 0) {
      throw new Error('No geocoding results found');
    }

    // Parse the first result for location components
    const result = data.results[0];
    let city = '';
    let region = '';
    let country = '';

    // Extract city, region, and country from address components
    for (const component of result.address_components) {
      const types = component.types;

      if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('sublocality') && !city) {
        // Use sublocality as backup for city
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        region = component.long_name;
      } else if (types.includes('country')) {
        country = component.long_name;
      }
    }

    // If no city found, try to extract from formatted address
    if (!city && result.formatted_address) {
      const parts = result.formatted_address.split(',');
      if (parts.length > 0) {
        city = parts[0].trim();
      }
    }

    // Create display name
    const displayParts = [city, region, country].filter(Boolean);
    const displayName = displayParts.join(', ');

    return {
      city: city || 'Unknown City',
      region,
      country,
      displayName: displayName || result.formatted_address || 'Unknown Location',
      formatted_address: result.formatted_address
    };

  } catch (error) {
    console.error('Reverse geocoding error:', error);
    
    // Return a fallback result
    return {
      city: 'Unknown City',
      region: undefined,
      country: undefined,
      displayName: `Location (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`,
      formatted_address: `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`
    };
  }
}

// Batch reverse geocode multiple locations
export async function batchReverseGeocode(
  locations: LatLng[],
  apiKey: string
): Promise<ReverseGeocodeResult[]> {
  const promises = locations.map(location => 
    reverseGeocode(location, apiKey).catch(error => {
      console.warn(`Failed to geocode ${location.lat}, ${location.lng}:`, error);
      return {
        city: 'Unknown City',
        displayName: `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
      };
    })
  );

  return Promise.all(promises);
}