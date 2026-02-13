function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  aprs: {
    callsign: requireEnv('CALLSIGN'),
    ssid: requireEnv('SSID'),
    passcode: requireEnv('PASSCODE'),
    server: requireEnv('SERVER'),
    port: requireEnv('PORT'),
  },
  location: {
    lat: parseFloat(requireEnv('LAT')),
    lon: parseFloat(requireEnv('LON')),
  },
  openweather: {
    apiKey: requireEnv('OPEN_WEATHER_API_KEY'),
  },
  app: {
    comment: process.env.COMMENT ?? '',
    timezone: process.env.TIMEZONE ?? 'America/Bogota',
    intervalMs: 1000 * 60 * 5,
  },
};
