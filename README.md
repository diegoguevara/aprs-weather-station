# aprs-weather-station

A simple weather station using NodeJS and OpenWeather API.

## Installation

```bash
npm install
```

## Usage

```bash
node index.js
```

## License

MIT © [Diego Guevara](https://github.com/diegoguevara)


TODO:

- get weather data
- transform weather data to aprs format

- build aprs packet (weather data)
- send packet

- build aprs packet (additional data without position)
- send packet

- build aprs packet (additional data without position)
- send packet

- if any error log it and try again



```tsx
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

      let rainfallLastHourAcc = 0;
      let rainfall24HoursAcc = 0;
      let rainfallSinceMidnightAcc = 0;

      const currItem: Partial<OWDataItem>[] = [{ dt: 0, pop: 0 } as OWDataItem];

      orderedItems.forEach((itm: OWDataHourlyItem) => {
        const itemDate = dayjs.unix(itm.dt).tz('America/Bogota');
        rainfall24HoursAcc = rainfall24HoursAcc + (itm.rain?.['1h'] ?? 0);
        console.log(
          dayjs
            .unix(itm.dt ?? 0)
            .tz('America/Bogota')
            .local()
            .format(),
        );
        console.log(itm.rain?.['1h'] ?? 0);
        console.log(itm.pop ?? 0);

        if (itemDate.isBefore(dayjs().tz('America/Bogota'))) {
          if (
            itemDate.isAfter(dayjs().tz('America/Bogota').subtract(2, 'hour'))
          ) {
            rainfallLastHourAcc = rainfallLastHourAcc + (itm.rain?.['1h'] ?? 0);
          }
          rainfallSinceMidnightAcc =
            rainfallSinceMidnightAcc + (itm.rain?.['1h'] ?? 0);
        }

        if (itemDate.isToday()) {
          currItem.push(itm);
          // console.log(
          //   dayjs
          //     .unix(itm.dt ?? 0)
          //     .tz('America/Bogota')
          //     .local()
          //     .format(),
          //   // .toString(),
          // );
        }
        // if (
        //   itm.pop !== undefined &&
        //   itm.pop > (currItem?.pop ?? 0) &&
        //   itemDate.isToday()
        // ) {
        //   currItem = itm;
        // }
      });

      console.log('rainfallLastHourAcc', rainfallLastHourAcc);
      console.log('rainfall24Hours', rainfall24HoursAcc);
      console.log('rainfallSinceMidnightAcc', rainfallSinceMidnightAcc);

      // // console.log(currItem);
      // console.log(
      //   dayjs
      //     .unix(currItem?.[0].dt ?? 0)
      //     .tz('America/Bogota')
      //     .toString(),
      // );

      // const dd = weatherData.hourly[0];
      // console.log(dd.dt);
      // console.log(weatherData.hourly[0]);

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
      const rainDesc = weatherData.daily[0].weather[0].description;

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

```