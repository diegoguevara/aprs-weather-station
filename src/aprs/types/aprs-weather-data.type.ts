export interface AprsWeatherDataType {
  windDirection: number;
  windSpeed: number;
  windGust: number;
  temperature: number;
  rainfallLastHour: number;
  rainfall24Hours: number;
  rainfallSinceMidnight: number;
  humidity: number;
  pressure: number;
  uvi: number;
  clouds: number;
  visibility: number;
  weather: string;
  rainDesc: string;
  rainfallLastHourMm: number;
}
