import { config } from './config/environment';
import { buildWeatherPacket, buildMessagePacket, AprsConnection } from './aprs';
import { transformToAprsData } from './adapters/openweathermap/weather-data.adapter';
import { getWeatherData, RateLimitError } from './weather-data/openweathermap';
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

const startTime = Date.now();
let lastReportTime: string | null = null;

const apiTracker = {
  dailyCalls: 0,
  lastResetDate: dayjs().format('YYYY-MM-DD'),
  backoffUntil: 0,
  backoffMultiplier: 1,
};

function resetDailyCountIfNeeded() {
  const today = dayjs().format('YYYY-MM-DD');
  if (today !== apiTracker.lastResetDate) {
    logger.info('Daily API call counter reset', {
      previousCount: apiTracker.dailyCalls,
    });
    apiTracker.dailyCalls = 0;
    apiTracker.lastResetDate = today;
  }
}

function canMakeApiCall(): boolean {
  resetDailyCountIfNeeded();

  if (apiTracker.dailyCalls >= openweather.dailyLimit) {
    logger.warn(
      `Daily API limit reached (${apiTracker.dailyCalls}/${openweather.dailyLimit}). Skipping.`,
    );
    return false;
  }

  if (Date.now() < apiTracker.backoffUntil) {
    const remainingSec = Math.round(
      (apiTracker.backoffUntil - Date.now()) / 1000,
    );
    logger.warn(`API in backoff, ${remainingSec}s remaining. Skipping.`);
    return false;
  }

  return true;
}

let intervalId: NodeJS.Timeout;
let statusIntervalId: NodeJS.Timeout;

async function sendReport() {
  try {
    if (!connection.isConnected()) {
      logger.warn('Skipping report: not connected');
      return;
    }

    if (!canMakeApiCall()) {
      return;
    }

    const weatherData = await getWeatherData({
      lat: location.lat,
      lon: location.lon,
      apiKey: openweather.apiKey,
      units: 'imperial',
      lang: 'es',
    });

    apiTracker.dailyCalls++;
    apiTracker.backoffMultiplier = 1;

    logger.debug('API call count', {
      daily: apiTracker.dailyCalls,
      limit: openweather.dailyLimit,
    });

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
      comment: `Condiciones actuales: ${aprsWeatherData.weather} - UV: ${aprsWeatherData.uvi ?? 0} - Nubes: ${aprsWeatherData.clouds}% - Temperatura: ${tempCelsius}C - Precipitacion: ${aprsWeatherData.rainfallLastHourMm}mm/h - ${aprsWeatherData.rainDesc}`,
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

    lastReportTime = dayjs().format('YYYY-MM-DD HH:mm:ss');

    logger.info('Report sent', {
      temperature: tempCelsius,
      time: lastReportTime,
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      apiTracker.dailyCalls++;
      const backoffMs =
        error.retryAfterSeconds * 1000 * apiTracker.backoffMultiplier;
      apiTracker.backoffUntil = Date.now() + backoffMs;
      apiTracker.backoffMultiplier = Math.min(
        apiTracker.backoffMultiplier * 2,
        8,
      );
      logger.warn(
        `Rate limited by OpenWeatherMap. Backing off ${backoffMs / 1000}s`,
      );
      return;
    }

    const err = error as Error;
    logger.error(err.message);
  }
}

function logStatus() {
  const uptimeMs = Date.now() - startTime;
  const uptimeHours = (uptimeMs / 3_600_000).toFixed(1);

  resetDailyCountIfNeeded();

  logger.info('Station status', {
    uptime: `${uptimeHours}h`,
    connected: connection.isConnected(),
    apiCalls: `${apiTracker.dailyCalls}/${openweather.dailyLimit}`,
    lastReport: lastReportTime ?? 'none',
  });
}

function shutdown() {
  logger.info('Shutting down...', {
    dailyApiCalls: apiTracker.dailyCalls,
  });
  clearInterval(intervalId);
  clearInterval(statusIntervalId);
  connection.disconnect();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

(async () => {
  try {
    logger.info('Starting APRS Weather Station', {
      interval: `${app.intervalMs / 60_000}min`,
      dailyLimit: openweather.dailyLimit,
    });

    await connection.connect();

    await sendReport();

    intervalId = setInterval(() => {
      sendReport().catch((err) =>
        logger.error('Unexpected error in sendReport', { error: String(err) }),
      );
    }, app.intervalMs);

    statusIntervalId = setInterval(logStatus, 60 * 60 * 1000);
  } catch (error) {
    logger.error('Failed to start', { error: (error as Error).message });
    process.exit(1);
  }
})();
