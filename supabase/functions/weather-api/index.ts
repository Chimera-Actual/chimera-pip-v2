// DEPRECATED: This edge function is deprecated in favor of N8N webhooks
// Use webhookService.callWeatherApi() instead of calling this function directly
// This function is kept temporarily for rollback compatibility

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openWeatherApiKey = Deno.env.get('OPENWEATHER_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, units = 'metric' } = await req.json();
    
    if (!location) {
      throw new Error('Location is required');
    }

    if (!openWeatherApiKey) {
      throw new Error('OpenWeather API key is not configured');
    }

    // Fetching weather data for location

    // Get current weather data
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${openWeatherApiKey}&units=${units}`
    );

    if (!weatherResponse.ok) {
      // Weather API HTTP error
      throw new Error(`Weather API error: ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();

    // Get air quality data
    const airQualityResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${openWeatherApiKey}`
    );

    let airQualityData = null;
    if (airQualityResponse.ok) {
      airQualityData = await airQualityResponse.json();
    }

    // Format the response
    const formattedWeatherData = {
      location: weatherData.name,
      country: weatherData.sys.country,
      temperature: Math.round(weatherData.main.temp),
      feelsLike: Math.round(weatherData.main.feels_like),
      humidity: weatherData.main.humidity,
      pressure: weatherData.main.pressure,
      windSpeed: weatherData.wind.speed,
      windDirection: weatherData.wind.deg,
      visibility: weatherData.visibility / 1000, // Convert to km
      uvIndex: 0, // Would need separate UV API call
      description: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
      radiation: 'Low', // Simulated for Fallout theme
      airQuality: airQualityData ? getAirQualityDescription(airQualityData.list[0].main.aqi) : 'Good',
      lastUpdated: new Date().toISOString(),
      units
    };

    // Weather data successfully fetched and formatted

    return new Response(JSON.stringify(formattedWeatherData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Error in weather-api function
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getAirQualityDescription(aqi: number): string {
  switch (aqi) {
    case 1: return 'Good';
    case 2: return 'Fair';
    case 3: return 'Moderate';
    case 4: return 'Poor';
    case 5: return 'Very Poor';
    default: return 'Unknown';
  }
}