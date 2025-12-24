import React, { useState } from "react";
import { useWeather } from "../hooks/useWeather";
import { WeatherDashboard } from "./WeatherDashboard";
import "../styles/weather.css";

export const Render: React.FC = () => {
  const { current, forecast, hourly, loading, error } =
    useWeather("Delhi, India");

  const [view, setView] = useState<"12H" | "3D" | "5D">("5D");

  if (loading) return <div className="skeleton">Loading...</div>;
  if (error) return <div className="error">Unable to fetch weather.</div>;
  if (!current || !forecast) return null;

  /* ------------------ TIME HANDLING ------------------ */

  // Convert UNIX timestamp (seconds → milliseconds)
  const currentDate = new Date(current.Timestamp * 1000);

  const formatDate = (date: Date, timeZone: string) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone,
    }).format(date);

  const formatTime = (date: Date, timeZone: string) =>
    new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone,
    }).format(date);

  /* ------------------ FORECAST HELPERS ------------------ */

  const parseTelemetryDate = (value: string) => {
    // Hourly format: YYYY-MM-DD:HH
    if (/^\d{4}-\d{2}-\d{2}:\d{2}$/.test(value)) {
      return new Date(value.replace(":", "T") + ":00");
    }

    // Daily format: YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return new Date(value + "T00:00:00");
    }

    return new Date(value);
  };

  const getDayFromDate = (dateString: string) => {
    const date = parseTelemetryDate(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const getHourFromDate = (dateString: string) => {
    const date = parseTelemetryDate(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ------------------ VISIBLE FORECAST ------------------ */

  const visibleForecast =
    view === "12H"
      ? hourly.slice(0, 12)
      : view === "3D"
      ? forecast.slice(0, 3)
      : forecast.slice(0, 5);

  /* ------------------ RENDER ------------------ */

  return (
    <WeatherDashboard
      current={{
        city: current.CityLocalized,
        State: current.State,
        date: formatDate(currentDate, current.Timezone),
        time: formatTime(currentDate, current.Timezone),
        temp: current.Temp,
        condition: current.WeatherText,
        code: current.WeatherCode,
        WindSpeed: current.WindSpeed,
        Pressure: current.Pressure,
        Precip: current.Precip,
      }}
      view={view}
      setView={setView}
      forecast={visibleForecast.map((item: any) => ({
        day:
          view === "12H"
            ? getHourFromDate(item.Datetime)
            : getDayFromDate(item.Datetime),
        condition: item.Label,
        max: item.MaxTemp ?? item.Temp,
        min: item.MinTemp ?? item.Temp,
        code: item.WeatherCode,
        temp: item.Temp,
      }))}
    />
  );
};
