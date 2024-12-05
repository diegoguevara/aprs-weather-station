class MessagePacket {
  static build({
    callsign,
    ssid,
    lat,
    lon,
    comment = '',
  }: {
    callsign: string;
    ssid: string;
    lat?: number;
    lon?: number;
    comment?: string;
  }) {
    try {
      const paddedCallsign = `${callsign}-${ssid}`.padEnd(9, ' ');

      let aprsMessage = `${paddedCallsign}>APRS,TCPIP*:>${comment}`;

      if (lat && lon) {
        // Position symbol
        const symbolTable = '/';
        const symbolCode = '#';

        const { latString, lonString } = this.latLonToAprs(lat, lon);
        aprsMessage = `${paddedCallsign}>APRS,TCPIP*:!${latString}${symbolTable}${lonString}${symbolCode}${comment}`;
      }

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

export default MessagePacket;
