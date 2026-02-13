import { OWData } from '../types/openweather-data.type';
import logger from '../../../utils/logger';

const API_URL = 'https://api.openweathermap.org/data/3.0/onecall';

/** Thrown when the OpenWeatherMap API returns 429. Includes the Retry-After value in seconds. */
export class RateLimitError extends Error {
  constructor(public readonly retryAfterSeconds: number) {
    super(`Rate limited. Retry after ${retryAfterSeconds}s`);
  }
}

/** Fetches current + hourly forecast data from the OpenWeatherMap One Call API 3.0. */
export async function getWeatherData(params: {
  lat: number;
  lon: number;
  apiKey: string;
  units?: string;
  lang?: string;
}): Promise<OWData> {
  const { lat, lon, apiKey, units = 'imperial', lang = 'en' } = params;

  if (!apiKey) {
    throw new Error('OpenWeatherMap API key is required');
  }
  if (lat == null || lon == null) {
    throw new Error('OpenWeatherMap API lat and lon are required');
  }

  const url = `${API_URL}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}&lang=${lang}`;
  const response = await fetch(url);

  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get('Retry-After') ?? '60');
    throw new RateLimitError(retryAfter);
  }

  if (!response.ok) {
    logger.error('OpenWeatherMap API error', {
      status: response.status,
      statusText: response.statusText,
    });
    throw new Error(
      `OpenWeatherMap API returned ${response.status}: ${response.statusText}`,
    );
  }

  return (await response.json()) as OWData;
}
