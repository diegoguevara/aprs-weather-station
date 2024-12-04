class SendPackage {
  constructor() {}

  async sendWeatherPackage({
    callsign,
    lat,
    lon,
    comment = "",
    weatherData = {}
  }: {
    callsign: string;
    lat: number;
    lon: number;  
    comment?: string;
    weatherData?: any;
  }) {
    try {
      // const weatherData = this.weatherData;
      console.log(weatherData);
    } catch (error) {
      console.log(error);
    }
  }
}

export default SendPackage;
