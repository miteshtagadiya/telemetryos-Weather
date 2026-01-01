import React, { useState, useEffect } from "react";
import { weatherIcons } from "./weatherIcons";
import { LocationIcon } from "../icons/LocationIcon";
import { WindIcon } from "../icons/WindIcon";
import { HumidityIcon } from "../icons/HumidityIcon";
import { PressureIcon } from "../icons/PressureIcon";
import { RainIcon } from "../icons/RainIcon";

interface CurrentWeather {
  city: string;
  date: string;
  time: string;
  temp: number;
  feelsLike?: number;
  condition: string;
  code: string;
  WindSpeed: number;
  WindDirection?: number;
  Pressure: number;
  Precip: number;
  PrecipChance?: number;
  Humidity?: number;
  State: string;
}

interface ForecastDay {
  day: string;
  max: number;
  min: number;
  code: string;
  condition: string;
  temp: number;
}

interface Props {
  current: CurrentWeather;
  forecast: ForecastDay[];
  view: "24H" | "3D" | "1W";
  setView: React.Dispatch<React.SetStateAction<"24H" | "3D" | "1W">>;
  backgroundType?: "solid" | "weather" | "image" | "video";
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundOpacity?: number;
  fontColor?: string;
  temperatureUnit?: "C" | "F";
}

const convertTemp = (temp: number, unit: "C" | "F"): number => {
  if (unit === "F") return Math.round((temp * 9) / 5 + 32);
  return Math.round(temp);
};

const getWeatherBackground = (
  code: string,
  type: "solid" | "weather" | "image"
): string => {
  if (type !== "weather") return "";
  const weatherGradients: Record<string, string> = {
    "4": "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)", // Broken clouds
    "8": "linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)", // Overcast clouds
    "18": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", // Light rain
    "19": "linear-gradient(135deg, #5c7cfa 0%, #3b5bdb 100%)", // Moderate rain
    "20": "linear-gradient(135deg, #364fc7 0%, #1e3a8a 100%)", // Heavy rain
    "11": "linear-gradient(135deg, #434343 0%, #000000 100%)", // Thunderstorm
    "13": "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)", // Snow
    default: "linear-gradient(135deg, #2b6cb0, #63b3ed)", // Default sky blue
  };
  return weatherGradients[code] || weatherGradients["default"];
};

export const GLASS_GRADIENT = `
  radial-gradient(circle at 50% 50%, rgba(79, 172, 254, 0.18) 0%, transparent 75%),
  radial-gradient(at 0% 0%, rgba(79, 172, 254, 0.12) 0px, transparent 50%),
  radial-gradient(at 100% 100%, rgba(255, 0, 128, 0.08) 0px, transparent 50%)
  `;

export const WeatherDashboard: React.FC<Props> = ({
  current,
  forecast,
  view,
  setView,
  backgroundType = "weather",
  backgroundColor = "#2b6cb0",
  backgroundImage = "",
  backgroundOpacity = 100,
  fontColor = "#ffffff",
  temperatureUnit = "C",
}) => {
  // Calculate dynamic icon size based on window width
  const [iconSize, setIconSize] = useState(150);
  const [forecastIconSize, setForecastIconSize] = useState(50);

  useEffect(() => {
    const handleResize = () => {
      // Logic: If screen is small (mobile), make icon smaller. If Projector/Desktop, huge.
      const minDimension = Math.min(window.innerWidth, window.innerHeight);
      setIconSize(Math.max(100, minDimension * 0.25)); // 25% of screen minimum dimension
      setForecastIconSize(Math.max(40, minDimension * 0.08)); // 8% for forecast icons
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Init
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getBackgroundStyle = () => {
    let bg = "";
    if (backgroundType === "image" && backgroundImage) {
      bg = `url(${backgroundImage})`;
    } else if (backgroundType === "weather") {
      bg = getWeatherBackground(current.code, "weather");
    } else if (backgroundType === "solid") {
      bg = backgroundColor;
    }
    return {
      background: bg || "transparent",
      backgroundSize: "cover",
      backgroundPosition: "center",
      color: fontColor,
      position: "relative" as const,
    };
  };

  const getGreeting = (time: string): string => {
    let hour = 0;

    // Check if time contains AM/PM (12-hour format)
    if (
      time.toLowerCase().includes("am") ||
      time.toLowerCase().includes("pm")
    ) {
      const [timePart, modifier] = time.split(" ");
      let [h] = timePart.split(":");
      hour = parseInt(h, 10);

      if (modifier.toLowerCase() === "pm" && hour !== 12) {
        hour += 12;
      }
      if (modifier.toLowerCase() === "am" && hour === 12) {
        hour = 0;
      }
    }
    // Otherwise assume 24-hour format
    else {
      hour = parseInt(time.split(":")[0], 10);
    }

    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  };

  const overlayStyle = {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: `rgba(0,0,0, ${1 - backgroundOpacity / 100})`,
    zIndex: 1,
  };

  const displayTemp = convertTemp(current.temp, temperatureUnit);
  const displayPressure = current.Pressure;
  const displayForecast =
    view === "24H" ? [...forecast, ...forecast] : forecast;
  const marqueeDuration = `${forecast.length * 3}s`;

  const backgroundStyle = getBackgroundStyle();

  return (
    <div className="weather-dashboard" style={backgroundStyle}>
      {/* BACKGROUND MEDIA LAYER */}
      <div className="bg-media-container">
        {backgroundType === "image" && backgroundImage && (
          <img src={backgroundImage} className="bg-image" alt="bg" />
        )}
        {backgroundType === "video" && backgroundImage && (
          <video autoPlay loop muted playsInline className="bg-video">
            <source src={backgroundImage} type="video/mp4" />
          </video>
        )}
        {/* OPACITY OVERLAY - Show for all background types when opacity < 100 */}
        {backgroundOpacity < 100 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: `rgba(0,0,0, ${1 - backgroundOpacity / 100})`,
              zIndex: 1,
            }}
          />
        )}
      </div>
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        {/* HEADER SECTION */}
        <header className="weather-top-bar glass-panel">
          <div className="location-group">
            <div className="location-city-container">
              <LocationIcon size={32} />
              <span className="city-name">{current.city}</span>
              <span className="current-date-text">| {current.date}</span>
            </div>
          </div>
          {/* <div className="greeting">{getGreeting(current.time)}</div> */}
          <div className="time-group">
            <div className="time">{current.time}</div>
          </div>
        </header>

        {/* MAIN HERO SECTION */}
        <main className="hero-section">
          {/* ITEM 1: Temperature (Now Fixed to the Left) */}
          <div className="main-display">
            <div>
            <h1 className="main-temp-value">
              {displayTemp}°{temperatureUnit}
            </h1>
            <p className="condition-text">{current.condition}</p>
            </div>
            <div className="weather-icon-main" style={{ marginBottom: "1vh" }}>
              {weatherIcons[current.code]?.({ size: 140 })}
            </div>
          </div>

          {/* ITEM 2: Metrics Group (Fixed to the Right) */}
          <div className="metrics-container-right">
            {/* Left Column of Stats */}
            <div className="hero-left">
              <div className="metric-card glass-panel">
                <span className="metric-label">Wind Velocity</span>
                <p className="metric-value">
                <WindIcon size={30}/> 
                  {current.WindSpeed}
                  <span className="metric-unit">mph</span>
                </p>
              </div>

              <div className="metric-card glass-panel">
                <span className="metric-label">Humidity</span>
                <p className="metric-value">
                <HumidityIcon size={35}/>
                  {current.Humidity}
                  <span className="metric-unit">%</span>
                </p>
              </div>
            </div>

            {/* Right Column of Stats */}
            <div className="hero-right">
              <div className="metric-card glass-panel">
                <span className="metric-label">Pressure</span>
                <p className="metric-value">
                <PressureIcon size={30}/>
                  {displayPressure}
                  <span className="metric-unit">hPa</span>
                </p>
              </div>
              <div className="metric-card glass-panel">
                <span className="metric-label">Precipitation</span>
                <p className="metric-value">
                <RainIcon size={30} />
                  {current.Precip}
                  <span className="metric-unit">mm</span>
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* SCROLLABLE FORECAST SECTION */}
        <footer className="forecast-section glass-panel">
          <div className="forecast-header">
            <span>
              {view === "24H" ? "HOURLY FORECAST" : "EXTENDED OUTLOOK"}
            </span>
            <div
              className="toggle-group"
              style={{ display: "flex", gap: "0.9375rem" }}
            >
              {["24H", "3D", "1W"].map((v) => (
                <div
                  key={v}
                  className={`forecast-toggle ${view === v ? "active" : ""}`}
                  style={{
                    background: view === v ? "rgba(255,255,255,0.1)" : "none",
                    border: "none",
                    padding: "0.3125rem 0.9375rem",
                    borderRadius: "1.25rem",
                    cursor: "pointer",
                    fontSize: "2vmin",
                    fontWeight: "bold",
                    transition: "0.3s",
                  }}
                  onClick={() => setView(v as any)}
                >
                  {v}
                </div>
              ))}
            </div>
          </div>
          {/* Apply marquee classes conditionally */}
          <div
            className="forecast-row"
            style={{ overflow: view === "24H" ? "hidden" : "auto" }}
          >
            <div
              className={`marquee-container ${
                view === "24H" ? "marquee-active" : ""
              }`}
              style={{
                // @ts-ignore (Passing dynamic duration to CSS variable)
                "--MarqueeDuration": marqueeDuration,
              }}
            >
              {displayForecast.map((day, i) => (
                <div key={`${day.day}-${i}`} className="forecast-card">
                  <span className="forecast-day">{day.day}</span>
                  <span
                    className="forecast-condition"
                    style={{ fontSize: "2.3vmin" }}
                  >
                    {day.condition}
                  </span>
                  {weatherIcons[day.code]?.({ size: 70 })}
                  <div className="forecast-temps">
                    <span>
                      {convertTemp(
                        view === "24H" ? day.temp : day.max,
                        temperatureUnit
                      )}
                      °{temperatureUnit}
                    </span>
                    {view !== "24H" && (
                      <span
                        style={{
                          opacity: 0.4,
                          fontSize: "0.8em",
                          marginLeft: "0.375rem",
                        }}
                      >
                        {convertTemp(day.min, temperatureUnit)}°
                        {temperatureUnit}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
