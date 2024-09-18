import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import commonEn from './src/assets/locales/en/common.json';
import commonZh from './src/assets/locales/zh/common.json';

i18n.use(initReactI18next).init({
  lng: 'zh',
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
  fallbackLng: 'zh',
});
const changeLanguage = (lang: string | undefined) => {
  i18n.changeLanguage(lang);
};

export {i18n, changeLanguage};
