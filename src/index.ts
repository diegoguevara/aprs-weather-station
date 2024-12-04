import WeatherData from "./weater-data/openweathermap";
import WeatherDataAdapter from "./adapters/openweathermap/weather-data.adapter";

// const callsign = process.env.HJ3DAG;
// const ssid = process.env.SSID;
// const passcode = process.env.PASSCODE;
// const lat = process.env.LAT;
// const lon = process.env.LON;

// Get weater data
// Adapter for OpenWeather API - transform data to aprs format
// build aprs packet
// send packet
// if any error log it and try again

(async () => {
  try {
    const weatherData = await WeatherData.getWeatherData();
    const aprsWeatherData = WeatherDataAdapter.getAprsData(weatherData);
    console.log(aprsWeatherData);
    // console.log(weatherData);
  } catch (error) {
    // try again
    console.log('try again...');
  }
})();