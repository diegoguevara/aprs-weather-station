import GetWeatherDataApi from "./api/get-weather-data-api";

const lat = process.env.LAT;
const lon = process.env.LON;
const apikey = process.env.OPEN_WEATHER_API_KEY;

class WeatherData {
  constructor(private readonly data: any) {}

  static async getWeatherData() {
    return new GetWeatherDataApi(
      apikey as string,
      {
        units: "imperial", // imperial units are required for aprs service
        lang: "es", // language of the weather description text
      }
    ).getWeatherData(
        parseFloat(lat?.toString() ?? "0"),
        parseFloat(lon?.toString() ?? "0")
      );
  }
}

export default WeatherData;
