import {
  OWData,
  OWDataHourlyItem,
  OWDataItem,
} from '../../weather-data/openweathermap/types/openweather-data.type';

import { AprsWeatherDataType } from '../../aprs/types/aprs-weather-data.type';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import logger from '../../utils/logger';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isToday);

function oneDecimal(value: number): number {
  return parseFloat(value.toFixed(1));
}

export function transformToAprsData(weatherData: OWData): AprsWeatherDataType {
  try {
    const orderedItems = weatherData.hourly.sort(
      (a: { dt: number }, b: { dt: number }) => a.dt - b.dt,
    );

    let rainfallLastHourAcc = 0;
    let rainfall24HoursAcc = 0;
    let rainfallSinceMidnightAcc = 0;

    let nextRainItem: Partial<OWDataItem> | undefined = undefined;

    orderedItems.forEach((itm: OWDataHourlyItem) => {
      const itemDate = dayjs.unix(itm.dt).tz('America/Bogota');

      rainfall24HoursAcc += itm.rain?.['1h'] ?? 0;

      if (itemDate.isBefore(dayjs().tz('America/Bogota'))) {
        if (
          itemDate.isAfter(dayjs().tz('America/Bogota').subtract(2, 'hour'))
        ) {
          rainfallLastHourAcc += itm.rain?.['1h'] ?? 0;
        }
        rainfallSinceMidnightAcc += itm.rain?.['1h'] ?? 0;
      }

      if (itemDate.isAfter(dayjs().tz('America/Bogota').subtract(1, 'hour'))) {
        if (itm.pop! > 0.2 && itm.rain?.['1h']) {
          if (!nextRainItem) {
            nextRainItem = itm;
          }
        }
      }
    });

    logger.debug('Rainfall accumulation', {
      lastHour: rainfallLastHourAcc,
      last24h: rainfall24HoursAcc,
      sinceMidnight: rainfallSinceMidnightAcc,
    });

    const windDirection = Math.round(weatherData.current.wind_deg ?? 0);
    const weather = weatherData.current?.weather?.[0].description ?? '';
    const windSpeed = Math.round(weatherData.current.wind_speed ?? 0);
    const windGust = Math.round(weatherData.current.wind_gust ?? 0);
    const temperature = Math.round(weatherData.current.temp ?? 0);
    const rainfallLastHour = Math.round(rainfallLastHourAcc);
    const rainfall24Hours = oneDecimal(rainfall24HoursAcc);
    const rainfallSinceMidnight = Math.round(rainfallSinceMidnightAcc);
    const humidity = Math.round(weatherData.current.humidity ?? 0);
    const pressure = Math.round(weatherData.current.pressure ?? 0);
    const uvi = Math.round(weatherData.current.uvi ?? 0);
    const clouds = Math.round(weatherData.current.clouds ?? 0);
    const visibility = Math.round(weatherData.current.visibility ?? 0);

    let rainDesc = '';
    if (nextRainItem) {
      rainDesc = '- ';
      rainDesc += (nextRainItem as OWDataItem).weather?.[0].description ?? '';
      const dd = nextRainItem as OWDataItem;
      const rainTime = dayjs.unix(dd?.dt ?? 0).tz('America/Bogota');
      if (rainTime.isToday()) {
        rainDesc += ' hoy ';
      } else {
        rainDesc += ' mañana ';
      }
      rainDesc += rainTime.format('h:mma');
      rainDesc += ` (~${dd.rain?.['1h']}mm/h)`;
    }

    return {
      windDirection,
      windSpeed,
      windGust,
      temperature,
      rainfallLastHour,
      rainfall24Hours,
      rainfallSinceMidnight,
      humidity,
      pressure: pressure * 10,
      uvi,
      clouds,
      visibility,
      weather,
      rainDesc,
    };
  } catch (error) {
    logger.error('Error transforming weather data to aprs weather data', error);
    throw error;
  }
}
