import React from "react";
import { weatherIcons } from "./weatherIcons";
import { LocationIcon } from "../icons/LocationIcon";

interface CurrentWeather {
  city: string;
  date: string;
  time: string;
  temp: number;
  condition: string;
  code: string;
  WindSpeed: number;
  Pressure: number;
  Precip: number;
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
view: "12H" | "3D" | "5D";
setView: React.Dispatch<React.SetStateAction<"12H" | "3D" | "5D">>;
}

export const WeatherDashboard: React.FC<Props> = ({ current, forecast, view, setView }) => {
  return (
    <div className="weather-dashboard">
      {/* Top Section */}
      <div className="current-weather">
        <div className="current-left">
          <p className="city ">
            {<LocationIcon size={28} />}
            {current.city}
          </p>
          <p className="date">{current.date}</p>
          <p className="time">{current.time}</p>
          <p className="condition">{current.condition}</p>
        </div>

        <div className="current-center">
          <div className="main-icon">
            {weatherIcons[current.code]?.({ size: 300 })}
          </div>
        </div>

        <div className="current-right">
          <div className="metric">
            <span className="label">Pressure</span>
            <span className="value">
              {current.Pressure}
              <small>hPa</small>
            </span>
          </div>

          <div className="metric">
            <span className="label">Wind</span>
            <span className="value">
              {current.WindSpeed}
              <small>km/h</small>
            </span>
          </div>

          <div className="metric">
            <span className="label">Rain</span>
            <span className="value">
              {current.Precip}
              <small>mm</small>
            </span>
          </div>

          <div className="metric main-temp">
            <span className="value">{current.temp}°</span>
          </div>
        </div>
      </div>


<div className="forecast-header">
  {["5D", "3D", "12H"].map((v) => (
    <button
      key={v}
      className={`forecast-toggle ${view === v ? "active" : ""}`}
      onClick={() => setView(v as "12H" | "3D" | "5D")}
    >
      {v}
    </button>
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
            {
              view === "12H" && <p className="temp-max">{day.temp}°</p>
            }
            {view !== "12H" && <>
            <p className="temp-max">{day.max}°</p>
            <p className="temp-min">{day.min}°</p>
            </>}
          </div>
        ))}
      </div>
    </div>
  );
};
