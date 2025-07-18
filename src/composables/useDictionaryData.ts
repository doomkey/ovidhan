import { ref, readonly } from "vue";

export interface Word {
  en: string;
  bn: string;
  pron: string[];
  bn_syns: string[];
  en_syns: string[];
  bn_antonyms: string[];
  en_antonyms: string[];
  sents: string[];
  pos: string;
}

interface WordLocation {
  f: string; // file
  i: number; // index
}

// --- Singleton (shared across the app) ---
const allLoadedWords = ref<Word[]>([]);
const loadedLetters = ref(new Set<string>());
const isLoading = ref(false);
const isLoadingWord = ref(false);
let banglaIndex: Record<string, WordLocation> | null = null;

export function useDictionaryData() {
  const loadWordsByLetter = async (letter: string) => {
    const lowerLetter = letter.toLowerCase();
    if (loadedLetters.value.has(lowerLetter) || !/^[a-z]$/.test(lowerLetter))
      return;
    // Don't show the main search spinner if we are already showing the word loading spinner
    if (!isLoadingWord.value) {
      isLoading.value = true;
    }
    try {
      const module = await import(
        `../resources/BengaliDictionary-${lowerLetter}.json`
      );
      allLoadedWords.value.push(...(module.default || module));
      loadedLetters.value.add(lowerLetter);
    } catch (error) {
      console.error(
        `Could not load dictionary for letter: ${lowerLetter}`,
        error
      );
    } finally {
      isLoading.value = false;
    }
  };

  const findWordByEnglish = async (
    englishWord: string
  ): Promise<Word | undefined> => {
    const firstLetter = englishWord.charAt(0).toLowerCase();
    await loadWordsByLetter(firstLetter);
    return allLoadedWords.value.find(
      (w) => w.en.toLowerCase() === englishWord.toLowerCase()
    );
  };
  const setWordLoading = (state: boolean) => {
    isLoadingWord.value = state;
  };
  const loadBanglaIndex = async () => {
    if (banglaIndex) return;
    isLoading.value = true;
    try {
      const indexModule = await import("../generated/bangla-index.json");
      banglaIndex = indexModule.default;
    } catch (e) {
      console.error("Failed to load bangla-index.json", e);
      banglaIndex = {}; // Avoid trying to load again
    } finally {
      isLoading.value = false;
    }
  };

  const searchWords = async (
    query: string,
    language: "en" | "bn"
  ): Promise<Word[]> => {
    if (language === "en") {
      const firstLetter = query.charAt(0).toLowerCase();
      await loadWordsByLetter(firstLetter);
      return allLoadedWords.value
        .filter((word) => word.en.toLowerCase().startsWith(query.toLowerCase()))
        .slice(0, 10);
    } else {
      await loadBanglaIndex();
      if (!banglaIndex) return [];

      const matchingKeys = Object.keys(banglaIndex).filter((key) =>
        key.startsWith(query)
      );

      const locationsMap = new Map<string, WordLocation>();
      matchingKeys.forEach((key) => {
        const loc = banglaIndex![key];
        locationsMap.set(`${loc.f}-${loc.i}`, loc);
      });

      const uniqueLocations = Array.from(locationsMap.values()).slice(0, 10);

      const wordPromises = uniqueLocations.map(async (loc) => {
        await loadWordsByLetter(loc.f);
        // This is a safe way to find the word after its file has been loaded into the global array
        return allLoadedWords.value.find(
          (w) =>
            w.en.charAt(0).toLowerCase() === loc.f &&
            allLoadedWords.value.indexOf(w) === loc.i
        );
      });

      const results = (await Promise.all(wordPromises)).filter(
        Boolean
      ) as Word[];
      return results;
    }
  };

  const checkWordsExist = async (
    englishWords: string[]
  ): Promise<Set<string>> => {
    const lettersToLoad = new Set(
      englishWords.map((w) => w.charAt(0).toLowerCase())
    );
    const promises = Array.from(lettersToLoad).map((letter) =>
      loadWordsByLetter(letter)
    );
    await Promise.all(promises);

    const existingWords = new Set<string>();
    const loadedWordSet = new Set(
      allLoadedWords.value.map((w) => w.en.toLowerCase())
    );
    englishWords.forEach((word) => {
      if (loadedWordSet.has(word.toLowerCase())) {
        existingWords.add(word);
      }
    });
    return existingWords;
  };

  const findEnglishEquivalents = async (
    banglaWords: string[]
  ): Promise<Map<string, string>> => {
    await loadBanglaIndex();
    const resultMap = new Map<string, string>();
    if (!banglaIndex) return resultMap;

    const lookupsByFile = new Map<
      string,
      { originalWord: string; index: number }[]
    >();
    banglaWords.forEach((word) => {
      const loc = banglaIndex![word];
      if (loc) {
        if (!lookupsByFile.has(loc.f)) {
          lookupsByFile.set(loc.f, []);
        }
        lookupsByFile.get(loc.f)!.push({ originalWord: word, index: loc.i });
      }
    });

    for (const [file, lookups] of lookupsByFile.entries()) {
      await loadWordsByLetter(file);
      lookups.forEach((lookup) => {
        const wordObject = allLoadedWords.value.find(
          (w) =>
            w.en.charAt(0).toLowerCase() === file &&
            allLoadedWords.value.indexOf(w) === lookup.index
        );
        if (wordObject) {
          resultMap.set(lookup.originalWord, wordObject.en);
        }
      });
    }
    return resultMap;
  };

  return {
    isLoading: readonly(isLoading),
    isLoadingWord: readonly(isLoadingWord),
    setWordLoading,
    findWordByEnglish,
    searchWords,
    checkWordsExist,
    findEnglishEquivalents,
  };
}
