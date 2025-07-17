import { ref, readonly } from "vue";

const isDarkMode = ref(false);

const STORAGE_KEY = "dictionary_app_theme";
const DARK_THEME_CLASS = "ion-palette-dark";
const applyTheme = (dark: boolean) => {
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  document.documentElement.classList.toggle(DARK_THEME_CLASS, dark);
  isDarkMode.value = dark;
};

const saveThemeToStorage = (theme: "dark" | "light") => {
  localStorage.setItem(STORAGE_KEY, theme);
};

export const loadTheme = () => {
  const storedTheme = localStorage.getItem(STORAGE_KEY);
  if (storedTheme) {
    applyTheme(storedTheme === "dark");
  } else {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    applyTheme(prefersDark);
  }
};

export function useTheme() {
  const toggleTheme = () => {
    const newThemeState = !isDarkMode.value;
    applyTheme(newThemeState);
    saveThemeToStorage(newThemeState ? "dark" : "light");
  };

  return {
    isDarkMode: readonly(isDarkMode), // Return a readonly ref to prevent direct modification
    toggleTheme,
  };
}
