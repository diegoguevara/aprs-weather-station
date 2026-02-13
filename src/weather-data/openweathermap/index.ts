import GetWeatherDataApi from './api/get-weather-data.api';

class WeatherData {
  constructor(
    private readonly params: {
      lat: number;
      lon: number;
      apikey: string;
      units?: string;
      lang?: string;
    },
  ) {}

  async getWeatherData() {
    const { lat, lon, apikey, units, lang } = this.params;
    return new GetWeatherDataApi(apikey, {
      units: units ?? 'imperial',
      lang: lang ?? 'en',
    }).getWeatherData(lat, lon);
  }
}

export default WeatherData;
