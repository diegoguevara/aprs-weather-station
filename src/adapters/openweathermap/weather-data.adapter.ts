import {
  OWData,
  OWDataHourlyItem,
  OWDataItem,
} from '../../weater-data/openweathermap/types/openweather-data.type';

import { AprsWeatherDataType } from '../../aprs-packet/types/aprs-weather-data.type';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import logger from '../../helper/logger.helper';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isToday);

class WeatherDataAdapter {
  static getAprsData(weatherData: OWData): AprsWeatherDataType {
    try {
      const orderedItems = weatherData.hourly.sort(
        (a: { dt: number }, b: { dt: number }) => a.dt - b.dt,
      );

      const rainfallLastHourAcc = 0;
      const rainfall24HoursAcc = 0;
      const rainfallSinceMidnightAcc = 0;

      let nextRainItem: Partial<OWDataItem> | undefined = undefined;
      // const nextRainItem: Partial<OWDataItem>[] = [
      //   { dt: 0, pop: 0 } as OWDataItem,
      // ];

      orderedItems.forEach((itm: OWDataHourlyItem) => {
        const itemDate = dayjs.unix(itm.dt).tz('America/Bogota');
        if (
          itemDate.isAfter(dayjs().tz('America/Bogota').subtract(1, 'hour'))
          // itemDate.isAfter(dayjs().tz('America/Bogota').subtract(1, 'hour')) &&
          // itemDate.isToday()
        ) {
          if (itm.pop! > 0.2 && itm.rain?.['1h']) {
            console.log('pop', itm.pop);
            console.log('rain', itm.rain?.['1h']);
            if (!nextRainItem) {
              nextRainItem = itm;
            }
          }
        }
      });

      console.log('nextRainItem', nextRainItem);

      const windDirection = Math.round(weatherData.current.wind_deg ?? 0); // en grados (0-360)
      const weather = weatherData.current?.weather?.[0].description ?? '';
      const windSpeed = Math.round(weatherData.current.wind_speed ?? 0); // en millas náuticas por hora
      const windGust = Math.round(weatherData.current.wind_gust ?? 0); // ráfaga máxima de viento
      const temperature = this.oneDecimal(weatherData.current.temp ?? 0); // en grados Fahrenheit
      const rainfallLastHour = Math.round(rainfallLastHourAcc); // en 1/100 pulgadas
      const rainfall24Hours = this.oneDecimal(rainfall24HoursAcc); // en 1/100 pulgadas
      const rainfallSinceMidnight = Math.round(rainfallSinceMidnightAcc); // en 1/100 pulgadas
      const humidity = Math.round(weatherData.current.humidity ?? 0); // en porcentaje
      const pressure = Math.round(weatherData.current.pressure ?? 0); // en decimas de milibares
      const uvi = Math.round(weatherData.current.uvi ?? 0); // en porcentaje
      const clouds = Math.round(weatherData.current.clouds ?? 0); // en porcentaje
      const visibility = Math.round(weatherData.current.visibility ?? 0); // en millas nauticas
      const weatherDesc = weather;
      // const rainDesc = weatherData.daily[0].weather[0].description;
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
        pressure,
        uvi,
        clouds,
        visibility,
        weather: weatherDesc,
        rainDesc,
      };
    } catch (error) {
      logger.error(
        'Error transforming weather data to aprs weather data',
        error,
      );
      throw error;
    }
  }

  static oneDecimal(number: number) {
    return parseFloat(number.toFixed(1));
  }
}

export default WeatherDataAdapter;
