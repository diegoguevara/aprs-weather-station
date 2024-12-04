import { AprsWeatherDataType } from '../types/aprs-weather-data.type';

class BuildPackage {
  static async buildWeatherPacket({
    callsign,
    lat,
    lon,
    comment = '',
    weatherData,
  }: {
    callsign: string;
    lat: number;
    lon: number;
    comment?: string;
    weatherData?: AprsWeatherDataType;
  }) {
    try {
      // const {
      //   windDirection = 0, // en grados (0-360)
      //   windSpeed = 0, // en millas náuticas por hora
      //   windGust = 0, // ráfaga máxima de viento
      //   temperature = 0, // en grados Fahrenheit
      //   rainfallLastHour = 0, // en 1/100 pulgadas
      //   rainfall24Hours = 0, // en 1/100 pulgadas
      //   rainfallSinceMidnight = 0, // en 1/100 pulgadas
      //   humidity = 0, // en porcentaje
      //   pressure = 0, // en décimas de milibares
      // } = weatherData;

      const paddedCallsign = callsign.padEnd(9, ' ');

      // // Convertir latitud y longitud en formato APRS
      // const latDeg = Math.floor(Math.abs(lat));
      // const latMin = (Math.abs(lat) - latDeg) * 60;
      // const latHemisphere = lat >= 0 ? 'N' : 'S';
      // const latString = `${String(latDeg).padStart(2, '0')}${latMin.toFixed(2).padStart(5, '0')}${latHemisphere}`;

      // const lonDeg = Math.floor(Math.abs(lon));
      // const lonMin = (Math.abs(lon) - lonDeg) * 60;
      // const lonHemisphere = lon >= 0 ? 'E' : 'W';
      // const lonString = `${String(lonDeg).padStart(3, '0')}${lonMin.toFixed(2).padStart(5, '0')}${lonHemisphere}`;

      const { latString, lonString } = this.latLonToAprs(lat, lon);

      console.log(weatherData, paddedCallsign, latString, lonString, comment);
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

export default BuildPackage;
