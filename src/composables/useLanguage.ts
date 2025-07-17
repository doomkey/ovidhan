import { ref, readonly } from "vue";
import { translations } from "@/locales/translations";

export type Language = "en" | "bn";
export type TranslationKey = keyof typeof translations;

const currentLanguage = ref<Language>("en");
const STORAGE_KEY = "dictionary_app_language";

const applyLanguage = (lang: Language) => {
  document.documentElement.setAttribute("lang", lang);
  currentLanguage.value = lang;
};

const saveLanguageToStorage = (lang: Language) => {
  localStorage.setItem(STORAGE_KEY, lang);
};

export const loadLanguage = () => {
  const storedLang = localStorage.getItem(STORAGE_KEY) as Language | null;
  applyLanguage(storedLang || "en");
};

export function useLanguage() {
  const setLanguage = (lang: Language) => {
    if (lang) {
      applyLanguage(lang);
      saveLanguageToStorage(lang);
    }
  };

  const t = (key: TranslationKey): string => {
    const entry = translations[key];
    if (!entry) {
      console.warn(`Translation key "${key}" not found.`);
      return key; // fallback
    }
    return entry[currentLanguage.value];
  };

  return {
    language: readonly(currentLanguage),
    setLanguage,
    t,
  };
}
