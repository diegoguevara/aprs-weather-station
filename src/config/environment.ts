function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function requireEnvNumber(name: string): number {
  const value = Number(requireEnv(name));
  if (isNaN(value)) {
    throw new Error(`Environment variable ${name} must be a valid number`);
  }
  return value;
}

function optionalEnvNumber(name: string, defaultValue: number): number {
  const raw = process.env[name];
  if (!raw) return defaultValue;
  const value = Number(raw);
  if (isNaN(value)) {
    throw new Error(`Environment variable ${name} must be a valid number`);
  }
  return value;
}

export const config = {
  aprs: {
    callsign: requireEnv('CALLSIGN'),
    ssid: requireEnv('SSID'),
    passcode: requireEnv('PASSCODE'),
    server: requireEnv('SERVER'),
    port: requireEnvNumber('PORT'),
  },
  location: {
    lat: requireEnvNumber('LAT'),
    lon: requireEnvNumber('LON'),
  },
  openweather: {
    apiKey: requireEnv('OPEN_WEATHER_API_KEY'),
    dailyLimit: optionalEnvNumber('DAILY_API_LIMIT', 900),
  },
  app: {
    comment: process.env.COMMENT ?? '',
    timezone: process.env.TIMEZONE ?? 'America/Bogota',
    intervalMs: optionalEnvNumber('INTERVAL_MINUTES', 10) * 60 * 1000,
  },
};
