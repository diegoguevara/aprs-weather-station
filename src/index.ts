import { MessagePacket, WeatherPacket } from './aprs-packet';

import AprsConnection from './aprs-packet/service/connect';
import SendPacket from './aprs-packet/service/send-packet';
import WeatherData from './weater-data/openweathermap';
import WeatherDataAdapter from './adapters/openweathermap/weather-data.adapter';
import logger from './helper/logger.helper';

const callsign = process.env.CALLSIGN ?? '';
const ssid = process.env.SSID ?? '';
const passcode = process.env.PASSCODE ?? '';
const server = process.env.SERVER ?? '';
const port = process.env.PORT ?? '';
const lat = parseFloat(process.env.LAT?.toString() ?? '0');
const lon = parseFloat(process.env.LON?.toString() ?? '0');
const comment = process.env.COMMENT ?? '';

const apikey = process.env.OPEN_WEATHER_API_KEY ?? '';

async function main() {
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

    const t = (aprsWeatherData.temperature - 32) * (5 / 9);
    const temperature = parseFloat(t.toFixed(1));

    // build aprs weather packet
    const weatherPacket = WeatherPacket.build({
      callsign,
      ssid,
      lat,
      lon,
      weatherData: aprsWeatherData,
      comment: `Condiciones actuales: ${aprsWeatherData.weather} - UV: ${aprsWeatherData.uvi ?? 0} - Nubes: ${aprsWeatherData.clouds}% - Temperatura: ${temperature}ºC - Precipitación: ${aprsWeatherData.rainfallLastHour}mm/h - ${aprsWeatherData.rainDesc}`,
    });

    let commentPacket = '';
    if (comment) {
      commentPacket =
        MessagePacket.build({
          callsign,
          ssid,
          comment,
        }) ?? '';
    }

    const aprsConn = await new AprsConnection({
      callsign,
      ssid,
      passcode,
      server,
      port,
      lat,
      lon,
    }).connect();

    aprsConn.on('data', (data) => {
      console.log(`Received: ${data}`);
    });

    if (weatherPacket) {
      await SendPacket.send(aprsConn, weatherPacket);
    }
    if (commentPacket) {
      await SendPacket.send(aprsConn, commentPacket);
    }

    aprsConn.end();
  } catch (error) {
    const err = error as Error;
    logger.error(err.message);
  }
}

(() => {
  main();
  setInterval(
    () => {
      main();
    },
    1000 * 60 * 5, // every 5 minutes
  );
})();
