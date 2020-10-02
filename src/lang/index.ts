import Vue from "vue";
import VueI18n from "vue-i18n";

import en from "./translations/en.json";
import de from "./translations/de.json";
import fr from "./translations/fr.json";

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: "en",
  fallbackLocale: "en",
  messages: { en, de, fr },
  silentTranslationWarn: process.env.NODE_ENV === "production",
});

export default i18n;
