import { useState, useEffect, useRef } from "react";
import { weather } from "@telemetryos/sdk";

type WeatherConditions = {
  CityLocalized: string;
  Temp: number;
  WeatherText: string;
  WindSpeed: number;
  RelativeHumidity: number;
  WeatherCode: string;
  Pod: string;
  Pressure: number;
  Precip: number;
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

const REFRESH_INTERVAL = 1 * 60 * 1000; // 2 minutes

export function useWeather(city: string) {
  const [current, setCurrent] = useState<WeatherConditions | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [hourly, setHourly] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;
    const weatherInstance = weather();

    async function fetchWeather() {
      try {
        setLoading(true);
        setError(false);

        const currentData = await weatherInstance.getConditions({ city });
        const forecastData = await weatherInstance.getDailyForecast({
          city,
          days: 7,
        });
        const hourlyData = await weatherInstance.getHourlyForecast({
          city,
          hours: 12,
        });

        if (isMounted) {
          setCurrent(currentData);
          setForecast(forecastData);
          setHourly(hourlyData);
        }
      } catch (err) {
        console.error("Weather fetch error:", err);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    // Initial fetch
    fetchWeather();

    // Start polling
    intervalRef.current = setInterval(fetchWeather, REFRESH_INTERVAL);

    return () => {
      isMounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [city]);

  return { current, forecast, hourly, loading, error };
}
