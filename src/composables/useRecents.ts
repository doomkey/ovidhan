import { ref, readonly } from "vue";

const recents = ref<string[]>([]);

const STORAGE_KEY = "dictionary_app_recents";
const MAX_RECENTS = 10; // Define the maximum number of recent items to store.

const saveRecentsToStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recents.value));
};

const loadRecentsFromStorage = () => {
  const storedRecents = localStorage.getItem(STORAGE_KEY);
  if (storedRecents) {
    recents.value = JSON.parse(storedRecents);
  }
};

export function useRecents() {
  const addRecent = (word: string) => {
    //Remove the word if it already exists to avoid duplicates and move it to the top
    const existingIndex = recents.value.findIndex(
      (item) => item.toLowerCase() === word.toLowerCase()
    );
    if (existingIndex > -1) {
      recents.value.splice(existingIndex, 1);
    }

    // Add the new word to the beginning of the array.
    recents.value.unshift(word);

    // Limit the list to the maximum number of recent searches
    if (recents.value.length > MAX_RECENTS) {
      recents.value = recents.value.slice(0, MAX_RECENTS);
    }

    // Save the updated list
    saveRecentsToStorage();
  };

  const clearRecents = () => {
    recents.value = [];
    saveRecentsToStorage();
  };

  return {
    recentSearches: readonly(recents),
    addRecent,
    clearRecents,
  };
}

loadRecentsFromStorage();
