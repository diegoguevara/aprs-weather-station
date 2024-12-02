import logger from "../helper/logger.helper";

export interface GetWeatherDataOptions {
  units?: string;
  lang?: string;
}

class GetWeatherData {
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
      const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${key}&units=${units}&lang=${lang}&dt=${Date.now()}`;
  
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('Error getting weather data', error);
      throw error;
    }
  }
}

export default GetWeatherData;
