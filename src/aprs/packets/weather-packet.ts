import { AprsWeatherDataType } from '../types/aprs-weather-data.type';
import { latLonToAprs } from '../../utils/lat-lon';
import logger from '../../utils/logger';

/**
 * Builds an APRS weather report packet string.
 * Format: CALL>APRS,TCPIP*:!LAT/LON_DIR/SPDgGSTtTMPrRNpR24PRMDhHUMbPRES
 * See APRS Protocol Reference Chapter 12 for field definitions.
 */
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

    const paddedCallsign = `${callsign}-${ssid}`.padEnd(9, ' ');
    const symbolTable = '/';
    const symbolCode = '_';

    const padSigned = (n: number, width: number) =>
      n < 0
        ? '-' + String(Math.abs(n)).padStart(width - 1, '0')
        : String(n).padStart(width, '0');

    const windDir = padSigned(windDirection, 3);
    const windSpd = padSigned(windSpeed, 3);
    const windGst = padSigned(windGust, 3);
    const temp = padSigned(temperature, 3);
    const rainLastHour = padSigned(rainfallLastHour, 3);
    const rain24Hrs = padSigned(Math.round(rainfall24Hours), 3);
    const rainMidnight = padSigned(rainfallSinceMidnight, 3);
    const humid = padSigned(humidity, 2);
    const baroPressure = padSigned(pressure, 5);

    const { latString, lonString } = latLonToAprs(lat, lon);

    return (
      `${paddedCallsign}>APZDGW,TCPIP*:!${latString}${symbolTable}${lonString}${symbolCode}` +
      `${windDir}/${windSpd}g${windGst}t${temp}r${rainLastHour}p${rain24Hrs}P${rainMidnight}` +
      `h${humid}b${baroPressure}${comment}`
    );
  } catch (error) {
    logger.error('Error building weather packet', { error });
  }
}
