import Vue from "vue";
import VueI18n from "vue-i18n";

import en from "./en.json";
import de from "./de.json";
import fr from "./fr.json";
import nl from "./nl.json";

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: "en",
  fallbackLocale: "en",
  messages: { en, de, fr, nl },
  silentTranslationWarn: import.meta.env.MODE === "production",
});

export async function getDateFnsLocale(locale: string) {
  switch (locale) {
    case "de":
      return import("date-fns/locale/de/index.js");
    case "fr":
      return import("date-fns/locale/fr/index.js");
    case "nl":
      return import("date-fns/locale/nl/index.js");
    default:
      throw new Error("unknown locale");
  }
}

export default i18n;
