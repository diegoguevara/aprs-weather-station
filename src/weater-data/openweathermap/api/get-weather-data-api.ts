import logger from "../../../helper/logger.helper";

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
    try {
      if (!this.apiKey) {
        throw new Error("API key is required");
      }
  
      const key = this.apiKey;
      const { units = "imperial", lang = "en" } = this.options;
      // const url = `${API_URL}?lat=${lat}&lon=${lon}&appid=${key}&units=${units}&lang=${lang}&dt=${Date.now()}`; 
      const url = `${API_URL}?lat=${lat}&lon=${lon}&appid=${key}&units=${units}&lang=${lang}`;
  
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('Error getting weather data', error);
      throw error;
    }
  }
}

export default GetWeatherDataApi;
