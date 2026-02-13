/**
 * Weather data formatted for APRS packet transmission.
 * Units follow the APRS spec: temperature in Fahrenheit, wind in mph,
 * rainfall in hundredths of an inch, pressure in tenths of millibars.
 */
export interface AprsWeatherDataType {
  windDirection: number; // degrees (0-360)
  windSpeed: number; // mph
  windGust: number; // mph
  temperature: number; // Fahrenheit
  rainfallLastHour: number; // hundredths of an inch
  rainfall24Hours: number; // hundredths of an inch
  rainfallSinceMidnight: number; // hundredths of an inch
  humidity: number; // percent (0-100)
  pressure: number; // tenths of millibars
  uvi: number; // UV index
  clouds: number; // cloud cover percent (0-100)
  visibility: number; // meters
  weather: string; // current conditions description (ASCII-safe)
  rainDesc: string; // next rain forecast description (ASCII-safe)
  rainfallLastHourMm: number; // mm, used for display in APRS comment
}
