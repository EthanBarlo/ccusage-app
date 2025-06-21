import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  resources: {
    en: {
      translation: {
        appName: "Claude Code Tracker",
        titleHomePage: "Usage Statistics",
        titleSecondPage: "Second Page",
      },
    },
    "pt-BR": {
      translation: {
        appName: "Claude Code Tracker",
        titleHomePage: "Estatísticas de Uso",
        titleSecondPage: "Segunda Página",
      },
    },
  },
});
