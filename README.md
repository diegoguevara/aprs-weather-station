# aprs-weather-station

An APRS-IS weather station that fetches weather data from the OpenWeatherMap API and broadcasts it as APRS weather packets over TCP/IP. Designed to run as a long-lived service with automatic reconnection, rate limiting, and structured logging.

## How it works

1. Connects to an APRS-IS server via persistent TCP connection (auto-reconnects on disconnect)
2. Fetches weather data from OpenWeatherMap One Call API 3.0 on a configurable interval
3. Transforms the data into APRS weather packet format (wind, temperature, rainfall, humidity, pressure)
4. Sends the packet to APRS-IS, where it appears on the APRS network (e.g., aprs.fi)

## Setup

```bash
npm install
cp .env.template .env
# Edit .env with your callsign, passcode, coordinates, and API key
```

## Configuration

| Variable               | Required | Description                                               |
| ---------------------- | -------- | --------------------------------------------------------- |
| `CALLSIGN`             | Yes      | Your amateur radio callsign                               |
| `SSID`                 | Yes      | APRS SSID (typically `13` for weather stations)           |
| `PASSCODE`             | Yes      | APRS-IS passcode for your callsign                        |
| `SERVER`               | Yes      | APRS-IS server (e.g., `rotate.aprs2.net`)                 |
| `PORT`                 | Yes      | APRS-IS port (typically `14580`)                          |
| `LAT`                  | Yes      | Station latitude (decimal degrees)                        |
| `LON`                  | Yes      | Station longitude (decimal degrees)                       |
| `OPEN_WEATHER_API_KEY` | Yes      | OpenWeatherMap API key (One Call API 3.0)                 |
| `TIMEZONE`             | No       | IANA timezone (default: `America/Bogota`)                 |
| `INTERVAL_MINUTES`     | No       | Report interval in minutes (default: `10`)                |
| `DAILY_API_LIMIT`      | No       | Max API calls per day (default: `900`, free tier is 1000) |
| `COMMENT`              | No       | Optional status message broadcast alongside weather data  |

## Usage

```bash
# Production
npm run start

# Development (with hot reload)
npm run dev
```

## Project structure

```
src/
  index.ts                        # Main loop: connect, fetch, send, repeat
  config/environment.ts           # Env var loading and validation
  utils/
    logger.ts                     # Winston logger (console + file rotation)
    lat-lon.ts                    # Coordinate conversion to APRS format
  weather-data/openweathermap/    # OpenWeatherMap API client and types
  adapters/openweathermap/        # Transforms OWM data to APRS format
  aprs/
    connection/aprs-connection.ts # Persistent TCP connection with auto-reconnect
    packets/                      # APRS packet builders (weather + message)
    types/                        # APRS data type definitions
```

## Logs

Logs are written to `logs/error.log` and `logs/combined.log` with automatic rotation (5MB max, 3-5 files retained). Console output is also enabled.

## License

MIT &copy; [Diego Guevara](https://github.com/diegoguevara)
