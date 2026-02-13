export function latLonToAprs(
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
