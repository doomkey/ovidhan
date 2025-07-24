<template>
  <ion-page>
    <app-header :title="`${t('quizTitle')} - Seed: ${quizSeed}`">
      <ion-buttons slot="start">
        <ion-button @click="confirmClose">
          <ion-icon slot="icon-only" :icon="close"></ion-icon>
        </ion-button>
      </ion-buttons>
    </app-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <div v-if="isLoading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>{{ t("quizLoading") }}</p>
      </div>

      <div v-else-if="currentQuestion" class="quiz-container">
        <div class="progress-header ion-padding">
          <ion-text>
            {{ t("question") }} {{ currentQuestionIndex + 1 }} /
            {{ quizQuestions.length }}
          </ion-text>
          <ion-text color="primary">
            <strong>{{ t("score") }}: {{ score }}</strong>
          </ion-text>
        </div>

        <ion-card class="question-card" color="secondary">
          <ion-card-header>
            <ion-card-subtitle>{{ t("whichMeaning") }}</ion-card-subtitle>
            <ion-card-title class="english-word">{{
              currentQuestion.en
            }}</ion-card-title>
          </ion-card-header>
        </ion-card>

        <ion-list>
          <ion-item
            v-for="(option, index) in options"
            :key="index"
            button
            :disabled="isAnswered"
            :color="getOptionColor(option)"
            @click="handleAnswer(option)"
          >
            <ion-label>{{ option }}</ion-label>
          </ion-item>
        </ion-list>

        <div v-if="isAnswered">
          <ion-button expand="full" @click="nextQuestion">
            {{ isLastQuestion ? t("finishQuiz") : t("nextQuestion") }}
            <ion-icon slot="end" :icon="arrowForward"></ion-icon>
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import {
  IonPage,
  IonContent,
  IonSpinner,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonList,
  IonItem,
  IonLabel,
  IonButtons,
  IonButton,
  IonIcon,
  alertController,
} from "@ionic/vue";
import { arrowForward, close } from "ionicons/icons";
import AppHeader from "@/components/AppHeader.vue";
import { useLanguage } from "@/composables/useLanguage";
import { useQuiz, WordLocation } from "@/composables/useQuiz";
import { useDictionaryData, Word } from "@/composables/useDictionaryData";
import { useQuizStats } from "@/composables/useQuizStats";
import candidatesData from "../generated/wordOfTheDayCandidates.json";

const { t } = useLanguage();
const { quizQuestions, quizSeed } = useQuiz();
const { getWordByLocation } = useDictionaryData();
const { updateStats } = useQuizStats();
const router = useRouter();

const isLoading = ref(true);
const currentQuestionIndex = ref(0);
const score = ref(0);
const currentQuestion = ref<Word | null>(null);
const options = ref<string[]>([]);
const selectedAnswer = ref<string | null>(null);
const isAnswered = ref(false);

const isLastQuestion = computed(
  () => currentQuestionIndex.value === quizQuestions.value.length - 1
);

const confirmClose = async () => {
  const alert = await alertController.create({
    header: t("back"),
    message: t("closeQuizProgressMessage"),
    buttons: [
      { text: t("cancel"), role: "cancel" },
      {
        text: t("ok"),
        role: "destructive",
        handler: () => {
          router.replace("/quiz");
        },
      },
    ],
  });
  await alert.present();
};

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const loadQuestion = async (index: number) => {
  isLoading.value = true;
  isAnswered.value = false;
  selectedAnswer.value = null;

  const questionLocation = quizQuestions.value[index];
  const correctWord = await getWordByLocation(questionLocation);

  if (!correctWord) {
    console.error(
      "Could not load question word for location:",
      questionLocation
    );
    isLoading.value = false;
    return;
  }
  currentQuestion.value = correctWord;

  const allCandidateLocations = candidatesData.flatMap((group) =>
    group.indices.map((i) => ({ f: group.file, i }))
  );
  const distractorLocations: WordLocation[] = [];
  const usedIndices = new Set<string>([
    `${questionLocation.f}-${questionLocation.i}`,
  ]);

  while (distractorLocations.length < 3) {
    const randomIndex = Math.floor(
      Math.random() * allCandidateLocations.length
    );
    const randomLoc = allCandidateLocations[randomIndex];
    const locKey = `${randomLoc.f}-${randomLoc.i}`;
    if (usedIndices.has(locKey)) continue;
    usedIndices.add(locKey);
    distractorLocations.push(randomLoc);
  }

  const distractorWords = await Promise.all(
    distractorLocations.map((loc) => getWordByLocation(loc))
  );

  const tempOptions = [
    correctWord.bn,
    ...(distractorWords.map((w) => w?.bn).filter(Boolean) as string[]),
  ];
  shuffleArray(tempOptions);
  options.value = tempOptions;

  isLoading.value = false;
};

const handleAnswer = (option: string) => {
  if (isAnswered.value) return;
  isAnswered.value = true;
  selectedAnswer.value = option;
  if (option === currentQuestion.value?.bn) {
    score.value++;
  }
};

const nextQuestion = () => {
  if (isLastQuestion.value) {
    updateStats(score.value, quizQuestions.value.length);
    router.replace(
      `/quiz-results/${score.value}/${quizQuestions.value.length}`
    );
  } else {
    currentQuestionIndex.value++;
    loadQuestion(currentQuestionIndex.value);
  }
};

const getOptionColor = (option: string) => {
  if (!isAnswered.value) return ""; // No color before answering
  if (option === currentQuestion.value?.bn) return "success";
  if (option === selectedAnswer.value) return "danger";
  return "";
};

onMounted(() => {
  if (quizQuestions.value.length > 0) {
    loadQuestion(0);
  } else {
    router.replace("/quiz");
  }
});
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

ion-item[disabled] {
  opacity: 1;
}
.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.question-card {
  margin-bottom: 20px;
}
.english-word {
  font-size: 2rem;
  font-weight: bold;
}
</style>
