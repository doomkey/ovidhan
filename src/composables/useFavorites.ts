import { ref, readonly } from "vue";

const favorites = ref<string[]>([]);

const STORAGE_KEY = "dictionary_app_favorites";

const saveFavoritesToStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites.value));
};

const loadFavoritesFromStorage = () => {
  const storedFavorites = localStorage.getItem(STORAGE_KEY);
  if (storedFavorites) {
    favorites.value = JSON.parse(storedFavorites);
  }
};

export function useFavorites() {
  const addFavorite = (word: string) => {
    if (!favorites.value.includes(word)) {
      favorites.value.unshift(word); // Add to the beginning for visibility
      saveFavoritesToStorage();
    }
  };

  const removeFavorite = (word: string) => {
    const index = favorites.value.indexOf(word);
    if (index > -1) {
      favorites.value.splice(index, 1);
      saveFavoritesToStorage();
    }
  };

  const isFavorite = (word: string): boolean => {
    return favorites.value.includes(word);
  };

  const clearFavorites = () => {
    favorites.value = [];
    saveFavoritesToStorage();
  };

  return {
    favorites: readonly(favorites),
    addFavorite,
    removeFavorite,
    isFavorite,
    clearFavorites,
  };
}

loadFavoritesFromStorage();
