import { ref } from "vue";
import { Word } from "./useDictionaryData";
import candidatesData from "../generated/wordOfTheDayCandidates.json";

interface CandidateRef {
  file: string;
  indices: number[];
}

const candidates: CandidateRef[] = candidatesData;

const wordOfTheDay = ref<Word | null>(null);

const findAndSetWordOfTheDay = async () => {
  if (wordOfTheDay.value || candidates.length === 0) {
    return;
  }

  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth();
  const year = today.getFullYear();
  const groupIndex = (year * 365 + month * 31 + day) % candidates.length;

  const selectedGroup = candidates[groupIndex];

  if (!selectedGroup || selectedGroup.indices.length === 0) {
    console.error("[WordOfTheDay] Could not select a valid candidate group.");
    return;
  }

  const indexWithinGroup = (day + month) % selectedGroup.indices.length;
  const finalWordIndex = selectedGroup.indices[indexWithinGroup];

  try {
    const module = await import(
      `../resources/BengaliDictionary-${selectedGroup.file}.json`
    );
    const words: Word[] = module.default || module;

    const selectedWord = words[finalWordIndex];

    if (selectedWord) {
      wordOfTheDay.value = selectedWord;
    } else {
      console.error(
        `[WordOfTheDay] Word not found at index ${finalWordIndex} in file ${selectedGroup.file}.json`
      );
    }
  } catch (error) {
    console.error(
      `[WordOfTheDay] Failed to load dictionary file for candidate:`,
      error
    );
  }
};

export function useWordOfTheDay() {
  findAndSetWordOfTheDay();

  return {
    wordOfTheDay,
  };
}
