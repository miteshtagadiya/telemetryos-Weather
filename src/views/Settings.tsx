import React, { useState } from "react";
import {
  SettingsContainer,
  SettingsDivider,
  SettingsField,
  SettingsInputFrame,
  SettingsLabel,
  SettingsSliderFrame,
} from "@telemetryos/sdk/react";
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
import { GLASS_GRADIENT } from "./WeatherDashboard";

export function Settings() {
  const [isLoadingLocations, locations, setLocations] =
    useLocationsStoreState();
  const [isLoadingMode, locationMode, setLocationMode] =
    useLocationModeStoreState();
  const [isLoadingSelected, selectedLocationId, setSelectedLocationId] =
    useSelectedLocationIdStoreState();
  const [isLoadingCycle, cycleDuration, setCycleDuration] =
    useCycleDurationStoreState();
  const [isLoadingTransition, transitionStyle, setTransitionStyle] =
    useTransitionStyleStoreState();
  const [isLoadingForecast, forecastRange, setForecastRange] =
    useForecastRangeStoreState();
  const [isLoadingBgType, backgroundType, setBackgroundType] =
    useBackgroundTypeStoreState();
  const [isLoadingBgColor, backgroundColor, setBackgroundColor] =
    useBackgroundColorStoreState();
  const [isLoadingBgImage, backgroundImage, setBackgroundImage] =
    useBackgroundImageStoreState();
  const [isLoadingBgOpacity, backgroundOpacity, setBackgroundOpacity] =
    useBackgroundOpacityStoreState();
  const [isLoadingFontColor, fontColor, setFontColor] =
    useFontColorStoreState();
  const [isLoadingUnit, temperatureUnit, setTemperatureUnit] =
    useTemperatureUnitStoreState();
  const [isLoadingTimeFormat, timeFormat, setTimeFormat] =
    useTimeFormatStoreState();
  const [isLoadingDateFormat, dateFormat, setDateFormat] =
    useDateFormatStoreState();

  const [newCityInput, setNewCityInput] = useState("");
  const [newDisplayNameInput, setNewDisplayNameInput] = useState("");

  const addLocation = () => {
    if (!newCityInput.trim()) return;

    const newLocation: LocationConfig = {
      id: Date.now().toString(),
      city: newCityInput.trim(),
      displayName: newDisplayNameInput.trim() || undefined,
      isAutoLocation: false,
    };

    setLocations([...locations, newLocation]);
    setSelectedLocationId(newLocation.id);
    setLocationMode("manual");
    setNewCityInput("");
    setNewDisplayNameInput("");
  };

  const removeLocation = (id: string) => {
    setLocations(locations.filter((loc) => loc.id !== id));
  };

  const updateLocation = (id: string, updates: Partial<LocationConfig>) => {
    setLocations(
      locations.map((loc) => (loc.id === id ? { ...loc, ...updates } : loc))
    );
  };

  const enableAutoLocation = async () => {
    try {
      // Get current position
      const position = await getCurrentLocation();
      const { latitude, longitude } = position.coords;

      // Convert coordinates to city name using reverse geocoding
      const geocodeResult = await reverseGeocode(latitude, longitude);

      const autoLocation: LocationConfig = {
        id: "auto-location",
        city: geocodeResult.city,
        displayName: geocodeResult.displayName || "Current Location",
        isAutoLocation: true,
      };

      // Check if auto location already exists
      const existingAuto = locations.find((loc) => loc.isAutoLocation);
      if (existingAuto) {
        updateLocation(existingAuto.id, autoLocation);
        setSelectedLocationId("auto-location");
      } else {
        setLocations([...locations, autoLocation]);
        setSelectedLocationId("auto-location");
      }
      setLocationMode("auto");
    } catch (error) {
      console.error("Auto location error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get location.";
      alert(errorMessage);
    }
  };

  return (
    <SettingsContainer>
      {/* Location Configuration */}
      <SettingsField>
        <SettingsLabel>Location Mode</SettingsLabel>
        <SettingsInputFrame>
          <select
            className="select"
            value={locationMode}
            onChange={(e) =>
              setLocationMode(e.target.value as "manual" | "auto")
            }
            disabled={isLoadingMode}
          >
            <option value="manual">Manual Entry</option>
            <option value="auto">Automatic (Geolocation)</option>
          </select>
        </SettingsInputFrame>
      </SettingsField>

      {locationMode === "auto" && (
        <SettingsField>
          <SettingsLabel>Enable Auto Location</SettingsLabel>
          <SettingsInputFrame>
            <button onClick={enableAutoLocation} type="button" className="btn">
              Detect Current Location
            </button>
          </SettingsInputFrame>
        </SettingsField>
      )}

      {locationMode === "manual" && (
        <>
          <SettingsField>
            <SettingsLabel>Add City</SettingsLabel>
            <SettingsInputFrame>
              <input
                type="text"
                className="input"
                placeholder="e.g., Vancouver, BC"
                value={newCityInput}
                onChange={(e) => setNewCityInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addLocation()}
              />
            </SettingsInputFrame>
          </SettingsField>

          <SettingsField>
            <SettingsLabel>Display Name (Optional)</SettingsLabel>
            <SettingsInputFrame>
              <input
                type="text"
                className="input"
                placeholder="Custom display name"
                value={newDisplayNameInput}
                onChange={(e) => setNewDisplayNameInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addLocation()}
              />
            </SettingsInputFrame>
          </SettingsField>

          <SettingsField>
            <SettingsLabel>Add Location</SettingsLabel>
            <SettingsInputFrame>
              <button onClick={addLocation} type="button" className="btn">
                Add
              </button>
            </SettingsInputFrame>
          </SettingsField>
        </>
      )}

      <SettingsDivider />

      {/* Locations List */}
      {locations.length > 0 && (
        <>
          <SettingsField>
            <SettingsLabel>
              Configured Locations ({locations.length})
            </SettingsLabel>
            <div className="flex flex-col gap-2">
              {locations.map((loc) => {
                const isSelected = selectedLocationId === loc.id;
                const matchesMode =
                  (locationMode === "auto" && loc.isAutoLocation) ||
                  (locationMode === "manual" && !loc.isAutoLocation);
                return (
                  <div
                    key={loc.id}
                    onClick={() => {
                      setSelectedLocationId(loc.id);
                      setLocationMode(loc.isAutoLocation ? "auto" : "manual");
                    }}
                    className={`card flex gap-2 items-center cursor-pointer transition-base ${
                      isSelected ? "border-2" : ""
                    }`}
                    style={{
                      borderColor: isSelected
                        ? "var(--color-primary)"
                        : "var(--color-border)",
                      backgroundColor: isSelected
                        ? "rgba(32, 96, 201, 0.1)"
                        : "transparent",
                    }}
                  >
                    <div className="flex-1">
                      <div
                        className="font-semibold"
                        style={{ fontSize: "1.4rem" }}
                      >
                        {loc.displayName || loc.city} {isSelected && "✓"}
                      </div>
                      {loc.displayName && (
                        <div
                          className="text-sm text-muted"
                          style={{ fontSize: "1.2rem" }}
                        >
                          {loc.city}
                        </div>
                      )}
                      {loc.isAutoLocation && (
                        <div
                          className="text-xs text-muted"
                          style={{ fontSize: "1rem" }}
                        >
                          Auto Location
                        </div>
                      )}
                      {!matchesMode && (
                        <div
                          className="text-xs"
                          style={{
                            color: "var(--color-warning)",
                            fontSize: "1rem",
                          }}
                        >
                          Not in current mode
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      className="input flex-1"
                      placeholder="Display name"
                      value={loc.displayName || ""}
                      onChange={(e) =>
                        updateLocation(loc.id, {
                          displayName: e.target.value || undefined,
                        })
                      }
                      onClick={(e) => e.stopPropagation()}
                      style={{ fontSize: "1.4rem" }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLocation(loc.id);
                        if (selectedLocationId === loc.id) {
                          const remaining = locations.filter(
                            (l) => l.id !== loc.id
                          );
                          if (remaining.length > 0) {
                            setSelectedLocationId(remaining[0].id);
                            setLocationMode(
                              remaining[0].isAutoLocation ? "auto" : "manual"
                            );
                          } else {
                            setSelectedLocationId(null);
                          }
                        }
                      }}
                      type="button"
                      className="btn btn--small btn--danger"
                      style={{ fontSize: "1.2rem" }}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          </SettingsField>
          <SettingsDivider />
        </>
      )}

      {/* City Cycling Settings */}
      {locations.length > 1 && (
        <>
          <SettingsField>
            <SettingsLabel>Cycle Duration (seconds)</SettingsLabel>
            <SettingsSliderFrame>
              <input
                type="range"
                min={5}
                max={300}
                step={5}
                disabled={isLoadingCycle}
                value={cycleDuration}
                onChange={(e) => setCycleDuration(parseInt(e.target.value))}
              />
              <span>{cycleDuration}s</span>
            </SettingsSliderFrame>
          </SettingsField>

          <SettingsField>
            <SettingsLabel>Transition Style</SettingsLabel>
            <SettingsInputFrame>
              <select
                className="select"
                value={transitionStyle}
                onChange={(e) =>
                  setTransitionStyle(
                    e.target.value as "fade" | "slide" | "instant"
                  )
                }
                disabled={isLoadingTransition}
              >
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
                <option value="instant">Instant</option>
              </select>
            </SettingsInputFrame>
          </SettingsField>
          <SettingsDivider />
        </>
      )}

      {/* Forecast Range */}
      <SettingsField>
        <SettingsLabel>Forecast Time Range</SettingsLabel>
        <SettingsInputFrame>
          <select
            className="select"
            value={forecastRange}
            onChange={(e) =>
              setForecastRange(e.target.value as "24H" | "3D" | "1W")
            }
            disabled={isLoadingForecast}
          >
            <option value="24H">24-Hour View (Hourly)</option>
            <option value="3D">3-Day View (Daily)</option>
            <option value="1W">1-Week View (Weekly)</option>
          </select>
        </SettingsInputFrame>
      </SettingsField>

      <SettingsDivider />

      {/* Visual Customization */}
      <SettingsField>
        <SettingsLabel>Background Type</SettingsLabel>
        <SettingsInputFrame>
          <select
            className="select"
            value={backgroundType}
            onChange={(e) => {
              setBackgroundImage("");
              setBackgroundType(
                e.target.value as "solid" | "weather" | "image" | "video"
              );
            }}
            disabled={isLoadingBgType}
          >
            <option value="solid">Gradient Color</option>
            <option value="weather">Match Weather Conditions</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </SettingsInputFrame>
      </SettingsField>

      {backgroundType === "solid" && (
        <>
          <SettingsField>
            <SettingsLabel>Background Gradient</SettingsLabel>
            <SettingsInputFrame>
              <select
                className="select"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                disabled={isLoadingBgColor}
              >
                <option value="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
                  Purple Gradient
                </option>
                <option value="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
                  Pink Gradient
                </option>
                <option value="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
                  Blue Gradient
                </option>
                <option value="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
                  Green Gradient
                </option>
                <option value="linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
                  Sunset Gradient
                </option>
                <option value="linear-gradient(135deg, #30cfd0 0%, #330867 100%)">
                  Dark Blue Gradient
                </option>
                <option value="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)">
                  Soft Gradient
                </option>
                <option value="linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)">
                  Rose Gradient
                </option>
                <option value="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)">
                  Peach Gradient
                </option>
                <option value="linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)">
                  Coral Gradient
                </option>
                <option value="linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)">
                  Lavender Gradient
                </option>
                <option value="linear-gradient(135deg, #fad961 0%, #f76b1c 100%)">
                  Orange Gradient
                </option>
                <option value="linear-gradient(135deg, #2b6cb0 0%, #63b3ed 100%)">
                  Sky Blue Gradient
                </option>
                <option value="linear-gradient(135deg, #434343 0%, #000000 100%)">
                  Dark Gradient
                </option>
                <option value="linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)">
                  Light Blue Gradient
                </option>
                <option value={GLASS_GRADIENT}>Glass Glow (Default)</option>
              </select>
            </SettingsInputFrame>
          </SettingsField>
          {/* {backgroundColor.startsWith("#") && (
            <SettingsField>
              <SettingsLabel>Custom Color</SettingsLabel>
              <SettingsInputFrame>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="input"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    disabled={isLoadingBgColor}
                    style={{ width: "3rem", height: "2.5rem", padding: "0" }}
                  />
                  <input
                    type="text"
                    className="input flex-1"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    disabled={isLoadingBgColor}
                    style={{ fontSize: "1.4rem" }}
                  />
                </div>
              </SettingsInputFrame>
            </SettingsField>
          )} */}
        </>
      )}

      {(backgroundType === "image" || backgroundType === "video") && (
        <SettingsField>
          <SettingsLabel>Background Video/Image URL</SettingsLabel>
          <SettingsInputFrame>
            <input
              type="text"
              className="input"
              placeholder="https://example.com/image.jpg"
              value={backgroundImage}
              onChange={(e) => {
                setBackgroundOpacity(50);
                setBackgroundImage(e.target.value);
              }}
              disabled={isLoadingBgImage}
            />
          </SettingsInputFrame>
        </SettingsField>
      )}

      <SettingsField>
        <SettingsLabel>Background Opacity (%)</SettingsLabel>
        <SettingsSliderFrame>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            disabled={isLoadingBgOpacity}
            value={backgroundOpacity}
            onChange={(e) => setBackgroundOpacity(parseInt(e.target.value))}
          />
          <span>{backgroundOpacity}%</span>
        </SettingsSliderFrame>
      </SettingsField>

      <SettingsField>
        <SettingsLabel>Font Color</SettingsLabel>
        <SettingsInputFrame>
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="input"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
              disabled={isLoadingFontColor}
              style={{ width: "3rem", height: "2.5rem", padding: "0" }}
            />
            <input
              type="text"
              className="input flex-1"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
              disabled={isLoadingFontColor}
              style={{ fontSize: "1.4rem" }}
            />
          </div>
        </SettingsInputFrame>
      </SettingsField>

      <SettingsField>
        <SettingsLabel>Temperature Unit</SettingsLabel>
        <SettingsInputFrame>
          <select
            className="select"
            value={temperatureUnit}
            onChange={(e) => setTemperatureUnit(e.target.value as "C" | "F")}
            disabled={isLoadingUnit}
          >
            <option value="C">Celsius (°C)</option>
            <option value="F">Fahrenheit (°F)</option>
          </select>
        </SettingsInputFrame>
      </SettingsField>

      <SettingsDivider />

      {/* Date & Time Formats */}
      <SettingsField>
        <SettingsLabel>Time Format</SettingsLabel>
        <SettingsInputFrame>
          <select
            className="select"
            value={timeFormat}
            onChange={(e) => setTimeFormat(e.target.value as "12h" | "24h")}
            disabled={isLoadingTimeFormat}
          >
            <option value="12h">12-Hour (AM/PM)</option>
            <option value="24h">24-Hour</option>
          </select>
        </SettingsInputFrame>
      </SettingsField>

      <SettingsField>
        <SettingsLabel>Date Format</SettingsLabel>
        <SettingsInputFrame>
          <select
            className="select"
            value={dateFormat}
            onChange={(e) =>
              setDateFormat(
                e.target.value as
                  | "MMM DD, YYYY"
                  | "MM/DD/YYYY"
                  | "DD/MM/YYYY"
                  | "YYYY-MM-DD"
              )
            }
            disabled={isLoadingDateFormat}
          >
            <option value="MMM DD, YYYY">
              MMM DD, YYYY (e.g., Jan 15, 2025)
            </option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (e.g., 01/15/2025)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY (e.g., 15/01/2025)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (e.g., 2025-01-15)</option>
          </select>
        </SettingsInputFrame>
      </SettingsField>
    </SettingsContainer>
  );
}
