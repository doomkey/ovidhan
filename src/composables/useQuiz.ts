import { ref, readonly } from "vue";
import { useRouter } from "vue-router";
import candidatesData from "../generated/wordOfTheDayCandidates.json";

export interface WordLocation {
  f: string;
  i: number;
}

/**
 * A simple pseudo-random number generator that uses a seed to produce a
 * consistent sequence of numbers. This ensures the same seed always
 * generates the same quiz.
 */
function seededRandom(seed: number) {
  let state = seed;
  return function () {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

const quizQuestions = ref<WordLocation[]>([]);
const quizSeed = ref<number | null>(null);

export function useQuiz() {
  const router = useRouter();

  const generateAndStartQuiz = (seed: number) => {
    quizQuestions.value = [];
    quizSeed.value = seed;

    const random = seededRandom(seed);
    const usedIndices = new Set<number>();

    const allCandidateLocations = candidatesData.flatMap((group) =>
      group.indices.map((index) => ({ f: group.file, i: index }))
    );

    if (allCandidateLocations.length < 10) {
      console.error("Not enough candidate words to generate a quiz.");
      return;
    }

    const selectedLocations: WordLocation[] = [];
    while (selectedLocations.length < 10) {
      const randomIndex = Math.floor(random() * allCandidateLocations.length);
      if (usedIndices.has(randomIndex)) continue;
      usedIndices.add(randomIndex);
      selectedLocations.push(allCandidateLocations[randomIndex]);
    }

    quizQuestions.value = selectedLocations;

    router.push(`/quiz/${seed}`);
  };

  return {
    quizQuestions: readonly(quizQuestions),
    quizSeed: readonly(quizSeed),
    generateAndStartQuiz,
  };
}
