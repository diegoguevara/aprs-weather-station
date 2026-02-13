import { config } from './config/environment';
import {
  buildWeatherPacket,
  buildMessagePacket,
  connectToAprs,
  sendPacket,
} from './aprs';
import { transformToAprsData } from './adapters/openweathermap/weather-data.adapter';
import WeatherData from './weather-data/openweathermap';
import { delay } from './utils/delay';
import logger from './utils/logger';
import dayjs from 'dayjs';

const { aprs, location, openweather, app } = config;

let intervalId: NodeJS.Timeout;

async function main() {
  try {
    const weatherData = await new WeatherData({
      lat: location.lat,
      lon: location.lon,
      apikey: openweather.apiKey,
      units: 'imperial',
      lang: 'es',
    }).getWeatherData();

    const aprsWeatherData = transformToAprsData(weatherData);

    const tempCelsius = parseFloat(
      ((aprsWeatherData.temperature - 32) * (5 / 9)).toFixed(1),
    );

    const weatherPacket = buildWeatherPacket({
      callsign: aprs.callsign,
      ssid: aprs.ssid,
      lat: location.lat,
      lon: location.lon,
      weatherData: aprsWeatherData,
      comment: `Condiciones actuales: ${aprsWeatherData.weather} - UV: ${aprsWeatherData.uvi ?? 0} - Nubes: ${aprsWeatherData.clouds}% - Temperatura: ${tempCelsius}ºC - Precipitación: ${aprsWeatherData.rainfallLastHour}mm/h - ${aprsWeatherData.rainDesc}`,
    });

    let commentPacket = '';
    if (app.comment) {
      commentPacket =
        buildMessagePacket({
          callsign: aprs.callsign,
          ssid: aprs.ssid,
          comment: app.comment,
        }) ?? '';
    }

    const conn = await connectToAprs({
      callsign: aprs.callsign,
      ssid: aprs.ssid,
      passcode: aprs.passcode,
      server: aprs.server,
      port: aprs.port,
      lat: location.lat,
      lon: location.lon,
    });

    conn.on('data', (data) => {
      logger.debug(`Received: ${data}`);
    });

    await delay(2000);

    if (weatherPacket) {
      sendPacket(conn, weatherPacket);
    }
    if (commentPacket) {
      sendPacket(conn, commentPacket);
    }

    conn.end();

    logger.info('Report sent', {
      temperature: tempCelsius,
      time: dayjs().format('MM.D, h:mm:ss a'),
    });
  } catch (error) {
    const err = error as Error;
    logger.error(err.message);
  }
}

function shutdown() {
  logger.info('Shutting down...');
  clearInterval(intervalId);
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

(() => {
  main();
  intervalId = setInterval(() => {
    main();
  }, app.intervalMs);
})();
