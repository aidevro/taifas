import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en/translation.json";
import ro from "./locales/ro/translation.json";
import fr from "./locales/fr/translation.json";
import it from "./locales/it/translation.json";
import es from "./locales/es/translation.json";
import de from "./locales/de/translation.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ro: { translation: ro },
      fr: { translation: fr },
      it: { translation: it },
      es: { translation: es },
      de: { translation: de }
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
