import React, { useState, useEffect, useRef } from "react";
import { useWeather } from "../hooks/useWeather";
import { WeatherDashboard } from "./WeatherDashboard";
import {
  useLocationsStoreState,
  useLocationModeStoreState,
  useSelectedLocationIdStoreState,
  useCycleDurationStoreState,
  useTransitionStyleStoreState,
  useForecastRangeStoreState,
  useBackgroundTypeStoreState,
  useBackgroundColorStoreState,
  useBackgroundImageStoreState,
  useBackgroundOpacityStoreState,
  useFontColorStoreState,
  useTemperatureUnitStoreState,
  useTimeFormatStoreState,
  useDateFormatStoreState,
  type LocationConfig,
} from "../hooks/store";
import { getCurrentLocation, reverseGeocode } from "../utils/geolocation";
import "../styles/weather.css";

const formatDate = (date: Date, timeZone: string, format: string): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  switch (format) {
    case 'MMM DD, YYYY':
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone,
      }).format(date);
    case 'MM/DD/YYYY':
      return `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}/${year}`;
    case 'DD/MM/YYYY':
      return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    default:
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone,
      }).format(date);
  }
};

const formatTime = (date: Date, timeZone: string, format: '12h' | '24h'): string => {
  if (format === '24h') {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone,
    }).format(date);
  } else {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone,
    }).format(date);
  }
};

const parseTelemetryDate = (value: string) => {
  if (/^\d{4}-\d{2}-\d{2}:\d{2}$/.test(value)) {
    return new Date(value.replace(":", "T") + ":00");
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(value + "T00:00:00");
  }
  return new Date(value);
};

const getDayFromDate = (dateString: string) => {
  const date = parseTelemetryDate(dateString);
  return date.toLocaleDateString("en-US", { weekday: "long" });
};

const getHourFromDate = (dateString: string, timeFormat: '12h' | '24h') => {
  const date = parseTelemetryDate(dateString);
  if (timeFormat === '24h') {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const convertTemp = (temp: number, unit: 'C' | 'F'): number => {
  if (unit === 'F') {
    return Math.round((temp * 9/5) + 32);
  }
  return Math.round(temp);
};

export const Render: React.FC = () => {
  // Get all settings from store
  const [isLoadingLocations, locations, setLocations] = useLocationsStoreState();
  const [isLoadingMode, locationMode, setLocationMode] = useLocationModeStoreState();
  const [isLoadingSelected, selectedLocationId, setSelectedLocationId] = useSelectedLocationIdStoreState();
  const [isLoadingCycle, cycleDuration] = useCycleDurationStoreState();
  const [isLoadingTransition, transitionStyle] = useTransitionStyleStoreState();
  const [isLoadingForecast, forecastRange, setForecastRange] = useForecastRangeStoreState();
  const [isLoadingBgType, backgroundType] = useBackgroundTypeStoreState();
  const [isLoadingBgColor, backgroundColor] = useBackgroundColorStoreState();
  const [isLoadingBgImage, backgroundImage] = useBackgroundImageStoreState();
  const [isLoadingBgOpacity, backgroundOpacity] = useBackgroundOpacityStoreState();
  const [isLoadingFontColor, fontColor] = useFontColorStoreState();
  const [isLoadingUnit, temperatureUnit] = useTemperatureUnitStoreState();
  const [isLoadingTimeFormat, timeFormat] = useTimeFormatStoreState();
  const [isLoadingDateFormat, dateFormat] = useDateFormatStoreState();

  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const cycleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filter locations based on mode
  // If auto mode is enabled but no auto locations exist, fall back to manual locations
  const filteredLocations = React.useMemo(() => {
    if (locationMode === 'auto') {
      const autoLocs = locations.filter(loc => loc.isAutoLocation);
      // If no auto locations, fall back to manual locations
      if (autoLocs.length === 0) {
        return locations.filter(loc => !loc.isAutoLocation);
      }
      return autoLocs;
    } else {
      return locations.filter(loc => !loc.isAutoLocation);
    }
  }, [locations, locationMode]);

  // Get current location - prioritize selected location, then filtered locations
  const currentLocation = React.useMemo(() => {
    // If there's a selected location and it matches the current mode, use it
    if (selectedLocationId) {
      const selected = locations.find(loc => loc.id === selectedLocationId);
      if (selected) {
        const matchesMode = (locationMode === 'auto' && selected.isAutoLocation) || 
                          (locationMode === 'manual' && !selected.isAutoLocation);
        if (matchesMode) {
          return selected;
        }
      }
    }
    
    // Otherwise, use the first location from filtered list
    if (filteredLocations.length > 0) {
      return filteredLocations[currentLocationIndex % filteredLocations.length];
    }
    
    // Fallback to any location
    if (locations.length > 0) {
      return locations[currentLocationIndex % locations.length];
    }
    
    return null;
  }, [selectedLocationId, locations, locationMode, filteredLocations, currentLocationIndex]);

  // Use current location, or fallback to default if no locations
  const cityToFetch = currentLocation?.city || "Delhi, India";

  const { current, forecast, hourly, loading, error, retry } = useWeather(cityToFetch);

  // Auto-select first location when locations are available and none is selected
  useEffect(() => {
    if (!isLoadingLocations && locations.length > 0 && !selectedLocationId) {
      // Select the first location by default
      const firstLocation = locations[0];
      setSelectedLocationId(firstLocation.id);
      setLocationMode(firstLocation.isAutoLocation ? 'auto' : 'manual');
    }
  }, [isLoadingLocations, locations, selectedLocationId, setSelectedLocationId, setLocationMode]);

  // Auto-select first location when mode changes and selected location doesn't match
  useEffect(() => {
    if (filteredLocations.length > 0) {
      const selected = locations.find(loc => loc.id === selectedLocationId);
      const matchesMode = selected && (
        (locationMode === 'auto' && selected.isAutoLocation) || 
        (locationMode === 'manual' && !selected.isAutoLocation)
      );
      
      if (!matchesMode) {
        // Select first location in filtered list
        const firstLocation = filteredLocations[0];
        if (firstLocation && selectedLocationId !== firstLocation.id) {
          setSelectedLocationId(firstLocation.id);
        }
      }
    }
  }, [locationMode, filteredLocations, selectedLocationId, locations, setSelectedLocationId]);

  // Automatic location detection on app load when auto mode is enabled
  useEffect(() => {
    if (isLoadingLocations || isLoadingMode) return;

    // Only auto-detect if:
    // 1. Location mode is set to 'auto'
    // 2. No auto location exists yet
    // 3. User hasn't explicitly selected a location (or selected location is not auto)
    if (locationMode === 'auto') {
      const hasAutoLocation = locations.some(loc => loc.isAutoLocation);
      const selected = locations.find(loc => loc.id === selectedLocationId);
      const needsAutoLocation = !hasAutoLocation || (selected && !selected.isAutoLocation);

      if (needsAutoLocation) {
        // Attempt to get location automatically
        getCurrentLocation()
          .then(async (position) => {
            const { latitude, longitude } = position.coords;
            const geocodeResult = await reverseGeocode(latitude, longitude);

            const autoLocation: LocationConfig = {
              id: 'auto-location',
              city: geocodeResult.city,
              displayName: geocodeResult.displayName || 'Current Location',
              isAutoLocation: true,
            };

            // Check if auto location already exists
            const existingAuto = locations.find(loc => loc.isAutoLocation);
            if (existingAuto) {
              // Update existing auto location
              const updatedLocations = locations.map(loc =>
                loc.id === existingAuto.id ? autoLocation : loc
              );
              setLocations(updatedLocations);
              setSelectedLocationId('auto-location');
            } else {
              // Add new auto location
              const updatedLocations = [...locations, autoLocation];
              setLocations(updatedLocations);
              setSelectedLocationId('auto-location');
            }
          })
          .catch((error) => {
            // If location permission denied or failed, switch to manual mode if manual locations exist
            console.log('Auto location detection failed:', error.message);
            const manualLocations = locations.filter(loc => !loc.isAutoLocation);
            if (manualLocations.length > 0) {
              // Switch to manual mode and select first manual location
              setLocationMode('manual');
              setSelectedLocationId(manualLocations[0].id);
            }
          });
      }
    }
  }, [isLoadingLocations, isLoadingMode, locationMode, locations, selectedLocationId, setSelectedLocationId, setLocations]);

  // City cycling logic - only cycle through filtered locations
  useEffect(() => {
    if (filteredLocations.length <= 1 || isLoadingCycle) {
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current);
        cycleIntervalRef.current = null;
      }
      return;
    }

    cycleIntervalRef.current = setInterval(() => {
      if (transitionStyle === 'fade') {
        setTransitioning(true);
        setTimeout(() => {
          setCurrentLocationIndex((prev) => (prev + 1) % filteredLocations.length);
          setTransitioning(false);
        }, 500);
      } else if (transitionStyle === 'slide') {
        setTransitioning(true);
        setTimeout(() => {
          setCurrentLocationIndex((prev) => (prev + 1) % filteredLocations.length);
          setTransitioning(false);
        }, 500);
      } else {
        setCurrentLocationIndex((prev) => (prev + 1) % filteredLocations.length);
      }
    }, cycleDuration * 1000);

    return () => {
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current);
      }
    };
  }, [filteredLocations.length, cycleDuration, transitionStyle, isLoadingCycle]);

  // Map forecast range to view
  const view = forecastRange === '24H' ? '24H' : forecastRange === '3D' ? '3D' : '1W';
  const setView = (newView: '24H' | '3D' | '1W' | ((prev: '24H' | '3D' | '1W') => '24H' | '3D' | '1W')) => {
    if (typeof newView === 'function') {
      setForecastRange(newView(forecastRange));
    } else {
      setForecastRange(newView);
    }
  };

  // Always show UI - use default location if no locations configured
  // Empty state removed - app will show default "Delhi, India" location

  // Loading state
  if (loading) {
    return (
      <div className="loading-state" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        color: fontColor || '#ffffff'
      }}>
        <div className="skeleton">Loading weather data...</div>
      </div>
    );
  }

  // Error state
  if (error || !current) {
    return (
      <div className="error-state" style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        color: fontColor || '#ffffff',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Unable to Fetch Weather</h2>
        <p style={{ fontSize: '1.2rem', opacity: 0.8, marginBottom: '2rem' }}>
          There was an error retrieving weather data for {currentLocation?.displayName || currentLocation?.city || 'this location'}.
        </p>
        <button
          onClick={retry}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: fontColor || '#ffffff',
            border: `2px solid ${fontColor || '#ffffff'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
          }}
        >
          Retry
        </button>
        <p style={{ fontSize: '1rem', opacity: 0.6, marginTop: '1rem' }}>
          Or check your settings to verify the location is correct.
        </p>
      </div>
    );
  }

  // Determine visible forecast based on range
  const visibleForecast =
    forecastRange === '24H'
      ? hourly.slice(0, 24)
      : forecastRange === '3D'
      ? forecast.slice(0, 3)
      : forecast.slice(0, 7);

  // Convert UNIX timestamp (seconds → milliseconds)
  const currentDate = new Date(current.Timestamp * 1000);
  const timezone = current.Timezone || 'UTC';

  const transitionClass = transitioning ? `transition-${transitionStyle}` : '';

  return (
    <div className={`weather-container ${transitionClass}`}>
      <WeatherDashboard
        current={{
          city: currentLocation?.displayName ?? current.CityLocalized,
          State: current.State,
          date: formatDate(currentDate, timezone, dateFormat),
          time: formatTime(currentDate, timezone, timeFormat),
          temp: current.Temp,
          feelsLike: current.FeelsLike,
          condition: current.WeatherText,
          code: current.WeatherCode,
          WindSpeed: current.WindSpeed,
          WindDirection: current.WindDirection,
          Pressure: current.Pressure,
          Precip: current.Precip,
          PrecipChance: current.PrecipChance,
          Humidity: current.RelativeHumidity,
        }}
        view={view}
        setView={setView}
        forecast={visibleForecast.map((item: any) => ({
          day:
            forecastRange === '24H'
              ? getHourFromDate(item.Datetime, timeFormat)
              : getDayFromDate(item.Datetime),
          condition: item.Label,
          max: item.MaxTemp ?? item.Temp,
          min: item.MinTemp ?? item.Temp,
          code: item.WeatherCode,
          temp: item.Temp,
        }))}
        backgroundType={backgroundType}
        backgroundColor={backgroundColor}
        backgroundImage={backgroundImage}
        backgroundOpacity={backgroundOpacity}
        fontColor={fontColor}
        temperatureUnit={temperatureUnit}
      />
    </div>
  );
};
