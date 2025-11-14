import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import az from './locales/az/translation.json';

const resources = {
  az: { translation: az }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'az',
  fallbackLng: 'az',
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
