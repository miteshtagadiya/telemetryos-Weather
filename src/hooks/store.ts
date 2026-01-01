import { createUseInstanceStoreState } from '@telemetryos/sdk/react'
import { GLASS_GRADIENT } from '../views/WeatherDashboard';

// Location Configuration
export interface LocationConfig {
  id: string;
  city: string;
  displayName?: string;
  isAutoLocation: boolean;
  timezone?: string;
}

export const useLocationsStoreState = createUseInstanceStoreState<LocationConfig[]>('locations', [])
export const useLocationModeStoreState = createUseInstanceStoreState<'manual' | 'auto'>('location-mode', 'manual')
export const useSelectedLocationIdStoreState = createUseInstanceStoreState<string | null>('selected-location-id', null)
export const useCycleDurationStoreState = createUseInstanceStoreState<number>('cycle-duration', 30) // seconds
export const useTransitionStyleStoreState = createUseInstanceStoreState<'fade' | 'slide' | 'instant'>('transition-style', 'fade')

// Forecast Settings
export const useForecastRangeStoreState = createUseInstanceStoreState<'24H' | '3D' | '1W'>('forecast-range', '3D')

// Visual Customization
export const useBackgroundTypeStoreState = createUseInstanceStoreState<'solid' | 'weather' | 'image' | 'video'>('background-type', 'weather')
export const useBackgroundColorStoreState = createUseInstanceStoreState<string>('background-color', GLASS_GRADIENT)
export const useBackgroundImageStoreState = createUseInstanceStoreState<string>('background-image', '')
export const useBackgroundOpacityStoreState = createUseInstanceStoreState<number>('background-opacity', 100) // 0-100
export const useFontColorStoreState = createUseInstanceStoreState<string>('font-color', '#ffffff')
export const useTemperatureUnitStoreState = createUseInstanceStoreState<'C' | 'F'>('temperature-unit', 'C')

// Date & Time Formats
export const useTimeFormatStoreState = createUseInstanceStoreState<'12h' | '24h'>('time-format', '12h')
export const useDateFormatStoreState = createUseInstanceStoreState<'MMM DD, YYYY' | 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'>('date-format', 'MMM DD, YYYY')