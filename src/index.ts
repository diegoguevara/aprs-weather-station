import { MessagePacket, WeatherPacket } from './aprs-packet';

import WeatherData from './weater-data/openweathermap';
import WeatherDataAdapter from './adapters/openweathermap/weather-data.adapter';
import logger from './helper/logger.helper';

const callsign = process.env.CALLSIGN ?? '';
const ssid = process.env.SSID ?? '';
// const passcode = process.env.PASSCODE ?? '';
const lat = parseFloat(process.env.LAT?.toString() ?? '0');
const lon = parseFloat(process.env.LON?.toString() ?? '0');

const apikey = process.env.OPEN_WEATHER_API_KEY ?? '';

(async () => {
  try {
    // get weather data
    const weatherData = await new WeatherData({
      lat,
      lon,
      apikey,
    }).getWeatherData();

    // transform weather data to aprs format
    const aprsWeatherData = WeatherDataAdapter.getAprsData(weatherData);
    console.log(aprsWeatherData);

    // build aprs weather packet
    const weatherPacket = WeatherPacket.build({
      callsign,
      ssid,
      lat,
      lon,
      weatherData: aprsWeatherData,
      comment: 'Weather station',
    });

    const wetherCommentPacket1 = MessagePacket.build({
      callsign,
      ssid,
      lat,
      lon,
      comment: 'Weather station',
    });

    const wetherCommentPacket = MessagePacket.build({
      callsign,
      ssid,
      comment: 'Weather station',
    });

    console.log(weatherPacket);
    console.log(wetherCommentPacket1);
    console.log(wetherCommentPacket);
  } catch (error) {
    const err = error as Error;
    logger.error(err.message);
  }
})();
