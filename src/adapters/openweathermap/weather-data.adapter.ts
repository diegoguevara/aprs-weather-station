import { AprsWeatherDataType } from "../../aprs-client/types/aprs-weather-data.type";
import { OWData } from "../../weater-data/openweathermap/types/openweather-data.type";
import logger from "../../helper/logger.helper";

class WeatherDataAdapter {

  static getAprsData(weatherData: OWData): AprsWeatherDataType {
    try {
      const windDirection = Math.round(weatherData.current.wind_deg ?? 0); // en grados (0-360)
      const weather = weatherData.current?.weather?.[0].description ?? "";
      const windSpeed = Math.round(weatherData.current.wind_speed ?? 0); // en millas náuticas por hora
      const windGust = Math.round(weatherData.current.wind_gust ?? 0); // ráfaga máxima de viento
      const temperature = Math.round(weatherData.current.temp ?? 0); // en grados Fahrenheit
      const rainfallLastHour = Math.round(
        weatherData.current.rain?.["1h"] ?? 0
      ); // en 1/100 pulgadas
      const rainfall24Hours = Math.round(
        weatherData.current.rain?.["1h"] ?? 0
      ); // en 1/100 pulgadas
      const rainfallSinceMidnight = Math.round(
        weatherData.current.rain?.["1h"] ?? 0
      ); // en 1/100 pulgadas
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
        "Error transforming weather data to aprs weather data",
        error
      );
      throw error;
    }
  }
}

export default WeatherDataAdapter;
