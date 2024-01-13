import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import commonEn from './src/locales/en/common.json';
import commonZh from './src/locales/zh/common.json';

i18n.use(LanguageDetector).use(initReactI18next).init({
  lng: navigator.language,
  resources: {
    en: {
      translation: commonEn,
    },
    zh: {
      translation: commonZh,
    },
  },
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
  supportedLngs: ['en', 'pt', 'es', 'zh'],
  fallbackLng: 'en',
  detection: {
    order: ['navigator'],
  },
});

export { i18n };
