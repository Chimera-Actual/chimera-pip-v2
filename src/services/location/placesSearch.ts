// Google Places API Search Service
import type { LatLng } from './geolocation';

export interface PlaceSearchResult {
  description: string;
  placeId: string;
  latlng?: LatLng;
  types?: string[];
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  latlng: LatLng;
  types: string[];
}

// Search for places using Google Places API Text Search
export async function searchPlaces(
  query: string,
  apiKey: string,
  options: {
    location?: LatLng;
    radius?: number;
    types?: string;
    language?: string;
  } = {}
): Promise<PlaceSearchResult[]> {
  if (!apiKey) {
    throw new Error('Google Maps API key is required for places search');
  }

  if (!query.trim()) {
    return [];
  }

  // Use Find Place from Text API for better search results
  const baseUrl = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json';
  const params = new URLSearchParams({
    input: query,
    inputtype: 'textquery',
    fields: 'place_id,name,formatted_address,geometry,types',
    key: apiKey
  });

  // Add optional location bias
  if (options.location) {
    params.append('locationbias', `circle:${options.radius || 50000}@${options.location.lat},${options.location.lng}`);
  }

  if (options.language) {
    params.append('language', options.language);
  }

  try {
    const response = await fetch(`${baseUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Places API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Places search failed: ${data.status}`);
    }

    if (!data.candidates || data.candidates.length === 0) {
      return [];
    }

    // Convert results to our format
    return data.candidates.map((candidate: any): PlaceSearchResult => ({
      description: candidate.formatted_address || candidate.name,
      placeId: candidate.place_id,
      latlng: candidate.geometry?.location ? {
        lat: candidate.geometry.location.lat,
        lng: candidate.geometry.location.lng
      } : undefined,
      types: candidate.types || []
    }));

  } catch (error) {
    console.error('Places search error:', error);
    return [];
  }
}

// Get place details by place ID
export async function getPlaceDetails(
  placeId: string,
  apiKey: string,
  fields: string[] = ['place_id', 'name', 'formatted_address', 'geometry', 'types']
): Promise<PlaceDetails | null> {
  if (!apiKey) {
    throw new Error('Google Maps API key is required for place details');
  }

  const baseUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
  const params = new URLSearchParams({
    place_id: placeId,
    fields: fields.join(','),
    key: apiKey
  });

  try {
    const response = await fetch(`${baseUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Place Details API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Place details failed: ${data.status}`);
    }

    if (!data.result) {
      return null;
    }

    const result = data.result;
    return {
      placeId: result.place_id,
      name: result.name || '',
      formattedAddress: result.formatted_address || '',
      latlng: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng
      },
      types: result.types || []
    };

  } catch (error) {
    console.error('Place details error:', error);
    return null;
  }
}

// Autocomplete predictions using Google Places Autocomplete API
export async function getAutocompletePredictions(
  input: string,
  apiKey: string,
  options: {
    location?: LatLng;
    radius?: number;
    types?: string;
    components?: string;
    language?: string;
  } = {}
): Promise<PlaceSearchResult[]> {
  if (!apiKey) {
    throw new Error('Google Maps API key is required for autocomplete');
  }

  if (!input.trim()) {
    return [];
  }

  const baseUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
  const params = new URLSearchParams({
    input: input,
    key: apiKey
  });

  // Add optional parameters
  if (options.location) {
    params.append('location', `${options.location.lat},${options.location.lng}`);
    params.append('radius', (options.radius || 50000).toString());
  }

  if (options.types) {
    params.append('types', options.types);
  }

  if (options.components) {
    params.append('components', options.components);
  }

  if (options.language) {
    params.append('language', options.language);
  }

  try {
    const response = await fetch(`${baseUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Autocomplete API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Autocomplete failed: ${data.status}`);
    }

    if (!data.predictions || data.predictions.length === 0) {
      return [];
    }

    // Convert predictions to our format
    return data.predictions.map((prediction: any): PlaceSearchResult => ({
      description: prediction.description,
      placeId: prediction.place_id,
      types: prediction.types || []
    }));

  } catch (error) {
    console.error('Autocomplete error:', error);
    return [];
  }
}