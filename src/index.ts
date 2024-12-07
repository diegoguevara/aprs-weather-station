import { MessagePacket, WeatherPacket } from './aprs-packet';

import WeatherData from './weater-data/openweathermap';
import WeatherDataAdapter from './adapters/openweathermap/weather-data.adapter';
import logger from './helper/logger.helper';

const callsign = process.env.CALLSIGN ?? '';
const ssid = process.env.SSID ?? '';
// const passcode = process.env.PASSCODE ?? '';
const lat = parseFloat(process.env.LAT?.toString() ?? '0');
const lon = parseFloat(process.env.LON?.toString() ?? '0');
const comment = process.env.COMMENT ?? '';

const apikey = process.env.OPEN_WEATHER_API_KEY ?? '';

(async () => {
  try {
    // get weather data
    const weatherData = await new WeatherData({
      lat,
      lon,
      apikey,
      units: 'imperial', // mandatory for aprs service
      lang: 'es',
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
      comment: `UV: ${aprsWeatherData.uvi ?? 0} - Nubes: ${aprsWeatherData.clouds}% - Condiciones actuales: ${aprsWeatherData.weather} ${aprsWeatherData.rainDesc}`,
    });

    // const weatherCommentPacket = MessagePacket.build({
    //   callsign,
    //   ssid,
    //   lat,
    //   lon,
    //   comment,
    // });

    let commentPacket = '';
    if (comment) {
      commentPacket =
        MessagePacket.build({
          callsign,
          ssid,
          comment,
        }) ?? '';
    }

    console.log(weatherPacket);
    // console.log(weatherCommentPacket);
    console.log(commentPacket);
  } catch (error) {
    const err = error as Error;
    logger.error(err.message);
  }
})();
