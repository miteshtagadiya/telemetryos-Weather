import React from "react";
import { weatherIcons } from "./weatherIcons";
import { LocationIcon } from "../icons/LocationIcon";
import { WindIcon } from "../icons/WindIcon";
import { HumidityIcon } from "../icons/HumidityIcon";

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
  backgroundType?: "solid" | "weather" | "image";
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundOpacity?: number;
  fontColor?: string;
  temperatureUnit?: "C" | "F";
}

const convertTemp = (temp: number, unit: "C" | "F"): number => {
  if (unit === "F") {
    return Math.round((temp * 9) / 5 + 32);
  }
  return Math.round(temp);
};

const getWindDirection = (degrees?: number): string => {
  if (degrees === undefined) return "";
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

const getWeatherBackground = (
  code: string,
  type: "solid" | "weather" | "image"
): string => {
  if (type !== "weather") return "";

  // Weather-based background gradients
  const weatherGradients: Record<string, string> = {
    "4": "linear-gradient(180deg, #87CEEB, #B0C4DE)", // Broken clouds
    "8": "linear-gradient(180deg, #708090, #778899)", // Overcast
    "18": "linear-gradient(180deg, #4682B4, #5F9EA0)", // Light rain
    "19": "linear-gradient(180deg, #4169E1, #6495ED)", // Moderate rain
    "20": "linear-gradient(180deg, #191970, #000080)", // Heavy rain
    "11": "linear-gradient(180deg, #2F4F4F, #1C1C1C)", // Thunderstorm
    "13": "linear-gradient(180deg, #E0E0E0, #F5F5F5)", // Snow
  };

  return weatherGradients[code] || "linear-gradient(180deg, #2b6cb0, #63b3ed)";
};

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
  const getBackgroundStyle = () => {
    let bg = "";

    if (backgroundType === "image" && backgroundImage) {
      bg = `url(${backgroundImage})`;
    } else if (backgroundType === "weather") {
      bg = getWeatherBackground(current.code, "weather");
    } else {
      bg = backgroundColor;
    }

    return {
      background: bg,
      backgroundSize: backgroundType === "image" ? "cover" : "auto",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      color: fontColor,
      position: "relative" as const,
    };
  };

  const getGreeting = (time: string): string => {
    // expected format: "HH:MM" (24 hour)
    const hour = parseInt(time.split(":")[0], 10);

    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  };

  const getBackgroundOverlayStyle = () => {
    // Overlay to control opacity - darker overlay = less visible background
    const opacity = (100 - backgroundOpacity) / 100;
    return {
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: `rgba(0, 0, 0, ${Math.max(0, Math.min(1, opacity))})`,
      pointerEvents: "none" as const,
      zIndex: 0,
    };
  };

  const displayTemp = convertTemp(current.temp, temperatureUnit);
  const displayFeelsLike = current.feelsLike
    ? convertTemp(current.feelsLike, temperatureUnit)
    : undefined;

  return (
    <div className="weather-dashboard" style={getBackgroundStyle()}>
      <div style={getBackgroundOverlayStyle()}></div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="weather-top-bar">
          <div className="location-info">
            <LocationIcon size={32} />
            <span className="city-name">{current.city}</span>
          </div>

          <span className="current-date">{current.date}</span>

          <div className="date-time">
             <div className="greeting">{getGreeting(current.time)}</div>
            <span className="time">{current.time}</span>
          </div>
        </div>
        {/* Top Section */}
        <div className="current-weather">
          <div className="current-left">
            <div className="current-center">
              <div className="main-icon">
                {weatherIcons[current.code]?.({ size: 250 })}
              </div>
            </div>
          </div>

          <div className="current-center">
            <div className="temperature-section">
              <div className="temperature-content">
                <div className="temp-display">
                  <span className="main-temp-value">{displayTemp}</span>
                  <span className="temp-unit">°{temperatureUnit}</span>
                </div>
                <p className="condition-text">{current.condition}</p>
                {displayFeelsLike !== undefined && (
                  <p className="feels-like">
                    Feels like {displayFeelsLike}°{temperatureUnit}
                  </p>
                )}
              </div>
              <div className="weather-metrics-inline">
                <div className="metric-inline">
                  <WindIcon size={36} />
                  <span className="metric-value-inline">
                    {current.WindSpeed} <span className="metric-unit-inline">km/h</span>
                  </span>
                </div>
                {current.Humidity !== undefined && (
                  <div className="metric-inline">
                    <HumidityIcon size={36} />
                    <span className="metric-value-inline">
                      {current.Humidity} <span className="metric-unit-inline">%</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="current-right">
            {displayFeelsLike !== undefined && (
              <div className="metric">
                <span className="label">Feels Like</span>
                <span className="value">
                  {displayFeelsLike}°{temperatureUnit}
                </span>
              </div>
            )}

            {/* {current.Humidity !== undefined && (
              <div className="metric">
                <span className="label">Humidity</span>
                <span className="value">
                  {current.Humidity}
                  <span className="metric-unit">%</span>
                </span>
              </div>
            )}

            <div className="metric">
              <span className="label">Wind</span>
              <span className="value">
                {current.WindSpeed}
                <span className="metric-unit">km/h</span>
                {current.WindDirection !== undefined && (
                  <span className="metric-unit" style={{ marginLeft: "4px" }}>
                    {getWindDirection(current.WindDirection)}
                  </span>
                )}
              </span>
            </div> */}

            <div className="metric">
              <span className="label">Pressure</span>
              <span className="value">
                {current.Pressure}
                <span className="metric-unit">hPa</span>
              </span>
            </div>

            <div className="metric">
              <span className="label">Precipitation</span>
              <span className="value">
                {current.Precip}
                <span className="metric-unit">mm</span>
                {current.PrecipChance !== undefined && (
                  <span className="metric-unit" style={{ marginLeft: "4px" }}>
                    ({current.PrecipChance}%)
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="forecast-header">
          {["1W", "3D", "24H"].map((v) => (
            <div
              key={v}
              className={`forecast-toggle ${view === v ? "active" : ""}`}
              onClick={() => setView(v as "24H" | "3D" | "1W")}
            >
              {v}
            </div>
          ))}
        </div>

        <div className="forecast-row">
          {forecast.map((day, i) => (
            <div key={i} className="forecast-card">
              <p className="day">{day.day}</p>
              <p className="forecast-condition">{day.condition}</p>
              <div className="icon">
                {weatherIcons[day.code]?.({ size: 100 })}
              </div>
              {view === "24H" && (
                <p className="temp-max">
                  {convertTemp(day.temp, temperatureUnit)}°{temperatureUnit}
                </p>
              )}
              {view !== "24H" && (
                <>
                  <p className="temp-max">
                    {convertTemp(day.max, temperatureUnit)}°{temperatureUnit}
                  </p>
                  <p className="temp-min">
                    {convertTemp(day.min, temperatureUnit)}°{temperatureUnit}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
