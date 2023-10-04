import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import commonEn from './src/locales/en/common.json';

i18n.use(initReactI18next).init({
  lng: 'en',
  resources: {
    en: {
      translation: commonEn,
    },
  },
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
  supportedLngs: ['en', 'pt', 'es'],
  fallbackLng: 'en',
});

export {i18n};
