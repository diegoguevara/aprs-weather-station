export interface OWDataItemWeather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface OWDataHourlyItem {
  dt: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust: number;
  weather: [OWDataItemWeather];
  pop: number;
  rain: {
    '1h': number;
  };
}

export interface OWDataItem {
  dt: number;
  sunrise: number;
  sunset: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust: number;
  pop: number;
  rain: {
    '1h': number;
  };
  weather: [OWDataItemWeather];
}

export interface OWDataDailyItem {
  dt: number;
  sunrise: number;
  sunset: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust: number;
  weather: [OWDataItemWeather];
}

export interface OWData {
  current: OWDataItem;
  hourly: [OWDataHourlyItem];
  daily: [
    OWDataDailyItem,
    // {
    //   dt: 1731969056,
    //   sunrise: 1731926692,
    //   sunset: 1731969511,
    //   temp: {
    //     day: 61.03,
    //     min: 60.46,
    //     max: 61.03,
    //     night: 60.46,
    //     eve: 61.03,
    //     morn: 60.46
    //   },
    //   feels_like: {
    //     day: 60.46,
    //     night: 60.46,
    //     eve: 60.46,
    //     morn: 60.46
    //   },
    //   pressure: 1013,
    //   humidity: 77,
    //   dew_point: 53.78,
    //   wind_speed: 13,
    //   wind_deg: 280,
    //   wind_gust: 0,
    //   weather: [
    //     OWDataItemWeather
    //   ],
    //   clouds: 40,
    //   pop: 0,
    //   rain: 0,
    //   uvi: 0
    // }
  ];
}
