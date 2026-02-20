import { AprsWeatherDataType } from '../types/aprs-weather-data.type';
import { latLonToAprs } from '../../utils/lat-lon';
import logger from '../../utils/logger';

/**
 * Formats a number to a fixed-width string for APRS fields.
 * Supports negative values (e.g. temperature). Values that exceed
 * the field width are replaced with '.' repeated (spec: no data).
 */
function formatField(n: number, width: number): string {
  const noData = '.'.repeat(width);
  if (n < 0) {
    const maxNeg = -(Math.pow(10, width - 1) - 1); // e.g. width=3 -> -99
    if (n < maxNeg) return noData;
    return '-' + String(Math.abs(n)).padStart(width - 1, '0');
  }
  const maxPos = Math.pow(10, width) - 1; // e.g. width=3 -> 999
  if (n > maxPos) return noData;
  return String(n).padStart(width, '0');
}

export function buildWeatherPacket({
  callsign,
  ssid,
  lat,
  lon,
  weatherData,
  comment = '',
}: {
  callsign: string;
  ssid: string;
  lat: number;
  lon: number;
  weatherData: AprsWeatherDataType;
  comment?: string;
}): string | undefined {
  try {
    const {
      windDirection = 0,
      windSpeed = 0,
      windGust = 0,
      temperature = 0,
      rainfallLastHour = 0,
      rainfall24Hours = 0,
      rainfallSinceMidnight = 0,
      humidity = 0,
      pressure = 0,
    } = weatherData;

    const paddedCallsign = `${callsign}-${ssid}`;
    const symbolTable = '/';
    const symbolCode = '_';

    const windDir = formatField(windDirection, 3);
    const windSpd = formatField(windSpeed, 3);
    const windGst = formatField(windGust, 3);
    const temp = formatField(temperature, 3);
    const rainLastHour = formatField(rainfallLastHour, 3);
    const rain24Hrs = formatField(Math.round(rainfall24Hours), 3);
    const rainMidnight = formatField(rainfallSinceMidnight, 3);
    // APRS spec: humidity is 2 digits, h00 = 100%
    const humid = formatField(humidity % 100, 2);
    const baroPressure = formatField(pressure, 5);

    const { latString, lonString } = latLonToAprs(lat, lon);

    return (
      `${paddedCallsign}>APDAGW,TCPIP*:!${latString}${symbolTable}${lonString}${symbolCode}` +
      `${windDir}/${windSpd}g${windGst}t${temp}r${rainLastHour}p${rain24Hrs}P${rainMidnight}` +
      `h${humid}b${baroPressure}${comment}`
    );
  } catch (error) {
    logger.error('Error building weather packet', { error });
  }
}
