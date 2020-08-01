import Vue from "vue";
import VueI18n from "vue-i18n";

import de from "./translations/de.json";
import en from "./translations/en.json";
import fr from "./translations/fr.json";

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: "en",
  fallbackLocale: "en",
  messages: { de, en, fr },
});

export default i18n;
