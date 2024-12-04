export interface GetWeatherDataOptions {
  units?: string;
  lang?: string;
}

// OpenWeather API URL
const API_URL = "https://api.openweathermap.org/data/3.0/onecall";

class GetWeatherDataApi {
  constructor(
    private readonly apiKey: string,
    private readonly options: GetWeatherDataOptions
  ) {}

  async getWeatherData(lat: number, lon: number) {
    if (!this.apiKey) {
      throw new Error("OpenWeatherMap API key is required");
    }
    if (!lat || !lon) {
      throw new Error("OpenWeatherMap API lat and lon are required");
    }

    try {
      const key = this.apiKey;
      const { units = "imperial", lang = "en" } = this.options;
      const url = `${API_URL}?lat=${lat}&lon=${lon}&appid=${key}&units=${units}&lang=${lang}`;
  
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Error getting OpenWeatherMap data');
    }
  }
}

export default GetWeatherDataApi;
