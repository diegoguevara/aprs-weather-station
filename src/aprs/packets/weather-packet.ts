import { AprsWeatherDataType } from '../types/aprs-weather-data.type';
import { latLonToAprs } from '../../utils/lat-lon';
import logger from '../../utils/logger';

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
      humidity = 0,
      pressure = 0,
    } = weatherData;

    const paddedCallsign = `${callsign}-${ssid}`.padEnd(9, ' ');
    const symbolTable = '/';
    const symbolCode = '_';

    const windDir = String(windDirection).padStart(3, '0');
    const windSpd = String(windSpeed).padStart(3, '0');
    const windGst = String(windGust).padStart(3, '0');
    const temp = String(temperature).padStart(3, '0');
    const rainLastHour = String(rainfallLastHour).padStart(3, '0');
    const humid = String(humidity).padStart(2, '0');
    const baroPressure = String(pressure).padStart(5, '0');

    const { latString, lonString } = latLonToAprs(lat, lon);

    return (
      `${paddedCallsign}>APRS,TCPIP*:!${latString}${symbolTable}${lonString}${symbolCode}` +
      `${windDir}/${windSpd}g${windGst}t${temp}r${rainLastHour}` +
      `h${humid}b${baroPressure}${comment}`
    );
  } catch (error) {
    logger.error('Error building weather packet', { error });
  }
}
