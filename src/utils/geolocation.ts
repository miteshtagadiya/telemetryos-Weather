/**
 * Reverse geocoding utility to convert coordinates to city name
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 */

export interface ReverseGeocodeResult {
  city: string;
  displayName: string;
  state?: string;
  country?: string;
}

/**
 * Converts latitude and longitude to a city name using reverse geocoding
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult> {
  try {
    // Use OpenStreetMap Nominatim API for reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Weather-Hexa-App/1.0', // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();
    const address = data.address || {};

    // Extract city name (try different fields)
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.county ||
      'Unknown Location';

    // Extract state/province
    const state =
      address.state ||
      address.province ||
      address.region ||
      undefined;

    // Extract country
    const country = address.country || undefined;

    // Build display name
    let displayName = city;
    if (state) {
      displayName += `, ${state}`;
    }
    if (country) {
      displayName += `, ${country}`;
    }

    // Build city string for weather API (format: "City, State, Country" or "City, Country")
    let cityString = city;
    if (state) {
      cityString = `${city}, ${state}`;
    } else if (country) {
      cityString = `${city}, ${country}`;
    }

    return {
      city: cityString,
      displayName,
      state,
      country,
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    // Fallback to coordinates if reverse geocoding fails
    return {
      city: `${latitude},${longitude}`,
      displayName: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
    };
  }
}

/**
 * Gets the current device location using browser geolocation API
 */
export function getCurrentLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => {
        let errorMessage = 'Failed to get location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission was denied.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // Cache for 1 minute
      }
    );
  });
}

