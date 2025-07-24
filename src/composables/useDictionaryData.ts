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

export interface SearchResult {
  word: Word;
  matchedBn: string; // The specific Bangla word that was matched
}

interface WordLocation {
  f: string; // file
  i: number; // index
}

// --- Singleton State (shared across the app) ---
const wordsByLetterCache = ref(new Map<string, Word[]>());
const isLoading = ref(false);
const isLoadingWord = ref(false);
let banglaIndex: Record<string, WordLocation> | null = null;

export function useDictionaryData() {
  /**
   * Loads a dictionary file into the cache if it hasn't been loaded already.
   */
  const loadWordsByLetter = async (letter: string) => {
    const lowerLetter = letter.toLowerCase();
    if (
      wordsByLetterCache.value.has(lowerLetter) ||
      !/^[a-z]$/.test(lowerLetter)
    )
      return;

    if (!isLoadingWord.value) {
      isLoading.value = true;
    }
    try {
      const module = await import(
        `../resources/BengaliDictionary-${lowerLetter}.json`
      );
      const words: Word[] = module.default || module;
      wordsByLetterCache.value.set(lowerLetter, words);
    } catch (error) {
      console.error(
        `Could not load dictionary for letter: ${lowerLetter}`,
        error
      );
    } finally {
      isLoading.value = false;
    }
  };

  const getWordByLocation = async (
    loc: WordLocation
  ): Promise<Word | undefined> => {
    await loadWordsByLetter(loc.f);
    const wordsInFile = wordsByLetterCache.value.get(loc.f);
    return wordsInFile ? wordsInFile[loc.i] : undefined;
  };

  const findWordByEnglish = async (
    englishWord: string
  ): Promise<Word | undefined> => {
    isLoadingWord.value = true;
    try {
      const firstLetter = englishWord.charAt(0).toLowerCase();
      await loadWordsByLetter(firstLetter);
      const wordsInFile = wordsByLetterCache.value.get(firstLetter);
      return wordsInFile?.find(
        (w) => w.en.toLowerCase() === englishWord.toLowerCase()
      );
    } finally {
      isLoadingWord.value = false;
    }
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
      banglaIndex = {};
    } finally {
      isLoading.value = false;
    }
  };

  const searchWords = async (
    query: string,
    language: "en" | "bn"
  ): Promise<SearchResult[]> => {
    if (language === "en") {
      const firstLetter = query.charAt(0).toLowerCase();
      await loadWordsByLetter(firstLetter);
      const wordsInFile = wordsByLetterCache.value.get(firstLetter) || [];
      const results = wordsInFile
        .filter((word) => word.en.toLowerCase().startsWith(query.toLowerCase()))
        .slice(0, 10);
      return results.map((word) => ({ word, matchedBn: word.bn }));
    } else {
      await loadBanglaIndex();
      if (!banglaIndex) return [];

      const matchingKeys = Object.keys(banglaIndex).filter((key) =>
        key.startsWith(query)
      );

      const locationsMap = new Map<
        string,
        { loc: WordLocation; matchedKey: string }
      >();
      matchingKeys.forEach((key) => {
        const loc = banglaIndex![key];
        const locationKey = `${loc.f}-${loc.i}`;
        if (!locationsMap.has(locationKey)) {
          locationsMap.set(locationKey, { loc, matchedKey: key });
        }
      });

      const uniqueLookups = Array.from(locationsMap.values()).slice(0, 10);

      const resultsWithNulls = await Promise.all(
        uniqueLookups.map(async (lookup) => {
          const wordObject = await getWordByLocation(lookup.loc);
          return wordObject
            ? { word: wordObject, matchedBn: lookup.matchedKey }
            : null;
        })
      );

      return resultsWithNulls.filter(
        (result): result is SearchResult => result !== null
      );
    }
  };

  const checkWordsExist = async (
    englishWords: string[]
  ): Promise<Set<string>> => {
    if (!englishWords || englishWords.length === 0) {
      return new Set<string>();
    }
    const lettersToLoad = new Set(
      englishWords.map((w) => w.charAt(0).toLowerCase())
    );
    await Promise.all(
      Array.from(lettersToLoad).map((letter) => loadWordsByLetter(letter))
    );

    const existingWords = new Set<string>();
    englishWords.forEach((word) => {
      const firstLetter = word.charAt(0).toLowerCase();
      const wordsInFile = wordsByLetterCache.value.get(firstLetter);
      if (wordsInFile?.some((w) => w.en.toLowerCase() === word.toLowerCase())) {
        existingWords.add(word);
      }
    });
    return existingWords;
  };

  const findEnglishEquivalents = async (
    banglaWords: string[]
  ): Promise<Map<string, string>> => {
    if (!banglaWords || banglaWords.length === 0) {
      return new Map<string, string>();
    }
    await loadBanglaIndex();
    const resultMap = new Map<string, string>();
    if (!banglaIndex) return resultMap;

    const lookups: { originalWord: string; loc: WordLocation }[] = [];
    banglaWords.forEach((word) => {
      const loc = banglaIndex![word];
      if (loc) {
        lookups.push({ originalWord: word, loc });
      }
    });

    const wordPromises = lookups.map(async (lookup) => {
      const wordObject = await getWordByLocation(lookup.loc);
      if (wordObject) {
        resultMap.set(lookup.originalWord, wordObject.en);
      }
    });
    await Promise.all(wordPromises);
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
    getWordByLocation,
  };
}
