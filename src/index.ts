import GetWeatherData from "./api/get-weather-data";
import logger from "./helper/logger.helper";

const callsign = process.env.HJ3DAG;
const ssid = process.env.SSID;
const passcode = process.env.PASSCODE;
const lat = process.env.LAT;
const lon = process.env.LON;

// Get weater data
// Adaptor for OpenWeather API - transform data to aprs format
// build aprs packet
// send packet
// if any error log it and try again

(async () => {
  const weatherData = await new GetWeatherData(
    process.env.OPEN_WEATHER_API_KEY as string,
    {
      units: "imperial", // imperial units are required for aprs service
      lang: "es", // language of the weather description text
    }
  ).getWeatherData(
      parseFloat(lat?.toString() ?? "0"),
      parseFloat(lon?.toString() ?? "0")
    );

  console.log(weatherData);
})();