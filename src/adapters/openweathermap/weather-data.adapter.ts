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

/** Conversion factor: multiply mm by this to get hundredths of an inch (APRS rainfall unit). */
const MM_TO_HUNDREDTHS_INCH = 100 / 25.4;

/**
 * Strips non-ASCII characters from text for APRS compatibility.
 * Uses NFD normalization to remove diacritics (e.g., "á" -> "a")
 * and drops any remaining non-printable-ASCII characters.
 */
function toAscii(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/Ñ/g, 'N')
    .replace(/[^\x20-\x7E]/g, '');
}

function oneDecimal(value: number): number {
  return parseFloat(value.toFixed(1));
}

/**
 * Transforms OpenWeatherMap API data into APRS weather data format.
 * Converts units (mm -> hundredths of inch), accumulates rainfall from hourly buckets,
 * and builds a next-rain forecast description for the APRS comment field.
 */
export function transformToAprsData(
  weatherData: OWData,
  tz: string,
): AprsWeatherDataType {
  try {
    const orderedItems = [...weatherData.hourly].sort(
      (a: { dt: number }, b: { dt: number }) => a.dt - b.dt,
    );

    let rainfallLastHourMm = 0;
    let rainfall24HoursMm = 0;
    let rainfallSinceMidnightMm = 0;

    let nextRainItem: Partial<OWDataItem> | undefined = undefined;

    orderedItems.forEach((itm: OWDataHourlyItem) => {
      const itemDate = dayjs.unix(itm.dt).tz(tz);

      rainfall24HoursMm += itm.rain?.['1h'] ?? 0;

      if (itemDate.isBefore(dayjs().tz(tz))) {
        if (itemDate.isAfter(dayjs().tz(tz).subtract(2, 'hour'))) {
          rainfallLastHourMm += itm.rain?.['1h'] ?? 0;
        }
        rainfallSinceMidnightMm += itm.rain?.['1h'] ?? 0;
      }

      if (itemDate.isAfter(dayjs().tz(tz).subtract(1, 'hour'))) {
        if (itm.pop > 0.2 && itm.rain?.['1h']) {
          if (!nextRainItem) {
            nextRainItem = itm;
          }
        }
      }
    });

    logger.debug('Rainfall accumulation (mm)', {
      lastHour: rainfallLastHourMm,
      last24h: rainfall24HoursMm,
      sinceMidnight: rainfallSinceMidnightMm,
    });

    const windDirection = Math.round(weatherData.current.wind_deg ?? 0);
    const weather = toAscii(
      weatherData.current?.weather?.[0]?.description ?? '',
    );
    const windSpeed = Math.round(weatherData.current.wind_speed ?? 0);
    const windGust = Math.round(weatherData.current.wind_gust ?? 0);
    const temperature = Math.round(weatherData.current.temp ?? 0);
    const rainfallLastHour = Math.round(
      rainfallLastHourMm * MM_TO_HUNDREDTHS_INCH,
    );
    const rainfall24Hours = oneDecimal(
      rainfall24HoursMm * MM_TO_HUNDREDTHS_INCH,
    );
    const rainfallSinceMidnight = Math.round(
      rainfallSinceMidnightMm * MM_TO_HUNDREDTHS_INCH,
    );
    const humidity = Math.round(weatherData.current.humidity ?? 0);
    const pressure = Math.round(weatherData.current.pressure ?? 0);
    const uvi = Math.round(weatherData.current.uvi ?? 0);
    const clouds = Math.round(weatherData.current.clouds ?? 0);
    const visibility = Math.round(weatherData.current.visibility ?? 0);

    let rainDesc = '';
    if (nextRainItem) {
      rainDesc = '- ';
      rainDesc += toAscii(
        (nextRainItem as OWDataItem).weather?.[0]?.description ?? '',
      );
      const dd = nextRainItem as OWDataItem;
      const rainTime = dayjs.unix(dd?.dt ?? 0).tz(tz);
      if (rainTime.isToday()) {
        rainDesc += ' hoy ';
      } else {
        rainDesc += ' manana ';
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
      rainfallLastHourMm: oneDecimal(rainfallLastHourMm),
    };
  } catch (error) {
    logger.error('Error transforming weather data to aprs weather data', error);
    throw error;
  }
}
