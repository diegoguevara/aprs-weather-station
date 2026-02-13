import { config } from './config/environment';
import { buildWeatherPacket, buildMessagePacket, AprsConnection } from './aprs';
import { transformToAprsData } from './adapters/openweathermap/weather-data.adapter';
import WeatherData from './weather-data/openweathermap';
import logger from './utils/logger';
import dayjs from 'dayjs';

const { aprs, location, openweather, app } = config;

const connection = new AprsConnection({
  callsign: aprs.callsign,
  ssid: aprs.ssid,
  passcode: aprs.passcode,
  server: aprs.server,
  port: aprs.port,
  lat: location.lat,
  lon: location.lon,
});

let intervalId: NodeJS.Timeout;

async function sendReport() {
  try {
    if (!connection.isConnected()) {
      logger.warn('Skipping report: not connected');
      return;
    }

    const weatherData = await new WeatherData({
      lat: location.lat,
      lon: location.lon,
      apikey: openweather.apiKey,
      units: 'imperial',
      lang: 'es',
    }).getWeatherData();

    const aprsWeatherData = transformToAprsData(weatherData, app.timezone);

    const tempCelsius = parseFloat(
      ((aprsWeatherData.temperature - 32) * (5 / 9)).toFixed(1),
    );

    const weatherPacket = buildWeatherPacket({
      callsign: aprs.callsign,
      ssid: aprs.ssid,
      lat: location.lat,
      lon: location.lon,
      weatherData: aprsWeatherData,
      comment: `Condiciones actuales: ${aprsWeatherData.weather} - UV: ${aprsWeatherData.uvi ?? 0} - Nubes: ${aprsWeatherData.clouds}% - Temperatura: ${tempCelsius}ºC - Precipitacion: ${aprsWeatherData.rainfallLastHourMm}mm/h - ${aprsWeatherData.rainDesc}`,
    });

    if (weatherPacket) {
      connection.send(weatherPacket);
    }

    if (app.comment) {
      const commentPacket = buildMessagePacket({
        callsign: aprs.callsign,
        ssid: aprs.ssid,
        comment: app.comment,
      });
      if (commentPacket) {
        connection.send(commentPacket);
      }
    }

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
  connection.disconnect();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

(async () => {
  try {
    await connection.connect();
    sendReport();
    intervalId = setInterval(() => {
      sendReport();
    }, app.intervalMs);
  } catch (error) {
    logger.error('Failed to start', { error: (error as Error).message });
    process.exit(1);
  }
})();
