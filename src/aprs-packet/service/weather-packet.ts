import { AprsWeatherDataType } from '../types/aprs-weather-data.type';

class WeatherPacket {
  static build({
    callsign,
    ssid,
    lat,
    lon,
    weatherData,
    comment = '',
  }: {
    callsign: string;
    ssid: string;
    lat: number;
    lon: number;
    weatherData: AprsWeatherDataType;
    comment?: string;
  }) {
    try {
      const {
        windDirection = 0, // en grados (0-360)
        windSpeed = 0, // en millas náuticas por hora
        windGust = 0, // ráfaga máxima de viento
        temperature = 0, // en grados Fahrenheit
        rainfallLastHour = 0, // en 1/100 pulgadas
        // rainfall24Hours = 0, // en 1/100 pulgadas
        // rainfallSinceMidnight = 0, // en 1/100 pulgadas
        humidity = 0, // en porcentaje
        pressure = 0, // en décimas de milibares
      } = weatherData;

      const paddedCallsign = `${callsign}-${ssid}`.padEnd(9, ' ');

      // Position symbol (in this case the "_" indicates a weather report)
      const symbolTable = '/';
      const symbolCode = '_';

      // Datos meteorológicos formateados
      const windDir = String(windDirection).padStart(3, '0');
      const windSpd = String(windSpeed).padStart(3, '0');
      const windGst = String(windGust).padStart(3, '0');
      const temp = String(temperature).padStart(3, '0');
      const rainLastHour = String(rainfallLastHour).padStart(3, '0');
      // const rain24Hrs = String(rainfall24Hours).padStart(3, '0');
      // const rainMidnight = String(rainfallSinceMidnight).padStart(3, '0');
      const humid = String(humidity).padStart(2, '0');
      const baroPressure = String(pressure).padStart(5, '0');

      const { latString, lonString } = this.latLonToAprs(lat, lon);

      // const aprsMessage =
      //   `${paddedCallsign}>APRS,TCPIP*:!${latString}${symbolTable}${lonString}${symbolCode}` +
      //   `${windDir}/${windSpd}g${windGst}t${temp}r${rainLastHour}p${rain24Hrs}P${rainMidnight}` +
      //   `h${humid}b${baroPressure}${comment}`;

      // const aprsMessage =
      //   `${paddedCallsign}>APRS,TCPIP*:!${latString}${symbolTable}${lonString}${symbolCode}` +
      //   `${windDir}/${windSpd}g${windGst}t${temp}r${rainLastHour}` +
      //   `h${humid}b${baroPressure}${comment}`;
      const aprsMessage =
        `${paddedCallsign}>APRS,TCPIP*:!${latString}${symbolTable}${lonString}${symbolCode}` +
        `${windDir}/${windSpd}g${windGst}t${temp}r${rainLastHour}` +
        `h${humid}b${baroPressure}${comment}`;

      return aprsMessage;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Convert latitude and longitude to APRS format
   * @param {number} lat
   * @param {number} lon
   * @returns {{latString: string, lonString: string}}
   */
  private static latLonToAprs(
    lat: number,
    lon: number,
  ): { latString: string; lonString: string } {
    const latDeg = Math.floor(Math.abs(lat));
    const latMin = (Math.abs(lat) - latDeg) * 60;
    const latHemisphere = lat >= 0 ? 'N' : 'S';
    const latString = `${String(latDeg).padStart(2, '0')}${latMin.toFixed(2).padStart(5, '0')}${latHemisphere}`;

    const lonDeg = Math.floor(Math.abs(lon));
    const lonMin = (Math.abs(lon) - lonDeg) * 60;
    const lonHemisphere = lon >= 0 ? 'E' : 'W';
    const lonString = `${String(lonDeg).padStart(3, '0')}${lonMin.toFixed(2).padStart(5, '0')}${lonHemisphere}`;

    return { latString, lonString };
  }
}

export default WeatherPacket;
