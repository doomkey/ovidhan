import { ref, readonly, computed } from "vue";

export interface QuizStats {
  quizzesTaken: number;
  totalCorrect: number;
  totalQuestions: number;
}

const stats = ref<QuizStats>({
  quizzesTaken: 0,
  totalCorrect: 0,
  totalQuestions: 0,
});

const STORAGE_KEY = "dictionary_app_quiz_stats";

const saveStats = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats.value));
};

const loadStats = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    stats.value = JSON.parse(stored);
  }
};

export function useQuizStats() {
  const correctRatio = computed(() => {
    if (stats.value.totalQuestions === 0) {
      return 0;
    }
    return Math.round(
      (stats.value.totalCorrect / stats.value.totalQuestions) * 100
    );
  });

  const updateStats = (correctAnswers: number, totalQuestions: number) => {
    stats.value.quizzesTaken += 1;
    stats.value.totalCorrect += correctAnswers;
    stats.value.totalQuestions += totalQuestions;
    saveStats();
  };

  return {
    stats: readonly(stats),
    correctRatio: readonly(correctRatio),
    updateStats,
  };
}

loadStats();
