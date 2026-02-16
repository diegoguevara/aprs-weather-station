const translations = {
  es: {
    today: 'hoy',
    tomorrow: 'manana',
    clouds: 'Nub',
    temp: 'T',
    rain: 'R',
  },
  en: {
    today: 'today',
    tomorrow: 'tomorrow',
    clouds: 'Cld',
    temp: 'T',
    rain: 'R',
  },
} as const;

export type Language = keyof typeof translations;

export function t(lang: Language) {
  return translations[lang];
}
