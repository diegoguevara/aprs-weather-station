import GetWeatherDataApi from './api/get-weather-data-api';

class WeatherData {
  constructor(
    private readonly params: {
      lat: number;
      lon: number;
      apikey: string;
    },
  ) {}

  async getWeatherData() {
    const { lat, lon, apikey } = this.params;
    return new GetWeatherDataApi(apikey as string, {
      units: 'imperial', // imperial units are required for aprs service
      lang: 'es', // language of the weather description text
    }).getWeatherData(lat, lon);
  }
}

export default WeatherData;
