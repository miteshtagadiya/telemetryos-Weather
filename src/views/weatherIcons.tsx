import React from "react";
import { StromIcon } from "../icons/Strom";
import { OvercastIcon } from "../icons/OvercastCloudIcon";
import { HeavyRainIcon } from "../icons/HeadyRain";
import { ModeraterainIcon } from "../icons/ModerateRainIcon";
import { SnowIcon } from "../icons/SnowIcon";
import { BrokenCastIcon } from "../icons/BrokenCast";
import { ClearSkyIcon } from "../icons/ClearSkyIcon";

type WeatherIconProps = {
  size?: number;
};

// Updated SVG icons for forecast codes
export const weatherIcons: Record<
  string,
  (props?: WeatherIconProps) => React.ReactNode
> = {
  "1": ({ size = 100 } = {}) => (
    // Broken clouds
    <ClearSkyIcon size={size} />
  ),
  "4": ({ size = 100 } = {}) => (
    // Broken clouds
    <BrokenCastIcon size={size} />
  ),
  "8": ({ size = 100 } = {}) => (
    // Overcast clouds
    <OvercastIcon size={size} />
  ),
  "18": ({ size = 100 } = {}) => (
    // Light rain / Partly cloudy with rain
    <StromIcon size={size} />
  ),
  "19": ({ size = 100 } = {}) => (
    // Moderate rain / Cloudy
    <ModeraterainIcon size={size}/>
  ),
  "20": ({ size = 100 } = {}) => (
    // Heavy rain
    <HeavyRainIcon size={size} />
  ),
  "11": ({ size = 100 } = {}) => (
    // Thunderstorm
    <StromIcon size={size} />
  ),
  "13": ({ size = 100 } = {}) => (
    // Snow
   <SnowIcon size={size}/>
  ),
};