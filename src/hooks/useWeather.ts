import { useState, useEffect, useRef } from "react";
import { weather } from "@telemetryos/sdk";

type WeatherConditions = {
  CityLocalized: string;
  Temp: number;
  FeelsLike?: number;
  WeatherText: string;
  WindSpeed: number;
  WindDirection?: number;
  RelativeHumidity: number;
  WeatherCode: string;
  Pod: string;
  Pressure: number;
  Precip: number;
  PrecipChance?: number;
  State: string;
  Timezone: string;
  Timestamp: number;
};

type WeatherForecast = {
  Datetime: string;
  Temp: number;
  MinTemp: number;
  MaxTemp: number;
  Label: string;
  Pod: string;
  WeatherCode: string;
};

const REFRESH_INTERVAL = 1 * 60 * 1000; // 1 minute

export function useWeather(city: string) {
  const [current, setCurrent] = useState<WeatherConditions | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [hourly, setHourly] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  // 🔑 Used to ignore stale requests
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!city) return;

    const weatherInstance = weather();
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    async function fetchWeather() {
      try {
        setLoading(true);
        setError(false);

        const [currentData, forecastData, hourlyData] = await Promise.all([
          weatherInstance.getConditions({ city }),
          weatherInstance.getDailyForecast({ city, days: 7 }),
          weatherInstance.getHourlyForecast({ city, hours: 24 }),
        ]);

        // ❌ Ignore outdated responses
        if (requestId !== requestIdRef.current) return;

        setCurrent(currentData);
        setForecast(forecastData);
        setHourly(hourlyData);
      } catch (err) {
        if (requestId === requestIdRef.current) {
          console.error("Weather fetch error:", err);
          setError(true);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }

    // Initial fetch
    fetchWeather();

    // Polling
    const interval = setInterval(fetchWeather, REFRESH_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [city]);

  const retry = () => {
    if (city) {
      requestIdRef.current += 1;
      const requestId = requestIdRef.current;
      const weatherInstance = weather();
      
      async function fetchWeather() {
        try {
          setLoading(true);
          setError(false);

          const [currentData, forecastData, hourlyData] = await Promise.all([
            weatherInstance.getConditions({ city }),
            weatherInstance.getDailyForecast({ city, days: 7 }),
            weatherInstance.getHourlyForecast({ city, hours: 24 }),
          ]);

          if (requestId !== requestIdRef.current) return;

          setCurrent(currentData);
          setForecast(forecastData);
          setHourly(hourlyData);
        } catch (err) {
          if (requestId === requestIdRef.current) {
            console.error("Weather fetch error:", err);
            setError(true);
          }
        } finally {
          if (requestId === requestIdRef.current) {
            setLoading(false);
          }
        }
      }
      
      fetchWeather();
    }
  };

  return {
    current,
    forecast,
    hourly,
    loading,
    error,
    retry,
  };
}
