<template>
  <ion-page>
    <app-header :title="t('quizResultsTitle')"></app-header>
    <ion-content :fullscreen="true" class="ion=padding">
      <div class="results-container">
        <ion-icon :icon="trophy" color="success" class="trophy-icon"></ion-icon>

        <h1 class="results-header">{{ t("quizComplete") }}</h1>

        <p class="score-text">
          {{ t("youScored") }}
          <strong class="score-emphasis">{{ score }} / {{ total }}</strong>
        </p>

        <div class="progress-wrapper">
          <ion-progress-bar
            :value="score / total"
            color="secondary"
          ></ion-progress-bar>
          <span class="percentage-text">{{ percentage }}%</span>
        </div>

        <div class="action-buttons">
          <ion-button @click="playAgain" color="primary">
            <ion-icon slot="start" :icon="refresh"></ion-icon>
            {{ t("playAgain") }}
          </ion-button>
          <ion-button
            expand="block"
            fill="clear"
            @click="goHome"
            color="tertiary"
          >
            {{ t("goHome") }}
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  IonPage,
  IonContent,
  IonIcon,
  IonProgressBar,
  IonButton,
} from "@ionic/vue";
import { trophy, refresh } from "ionicons/icons";
import AppHeader from "@/components/AppHeader.vue";
import { useLanguage } from "@/composables/useLanguage";

const { t } = useLanguage();
const route = useRoute();
const router = useRouter();

const score = ref(0);
const total = ref(10);

const percentage = computed(() => {
  if (total.value === 0) return 0;
  return Math.round((score.value / total.value) * 100);
});

onMounted(() => {
  score.value = parseInt(route.params.score as string, 10) || 0;
  total.value = parseInt(route.params.total as string, 10) || 10;
});

const playAgain = () => {
  router.replace("/quiz");
};

const goHome = () => {
  router.replace("/home");
};
</script>

<style scoped>
.results-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
}

.trophy-icon {
  font-size: 80px;
  margin-bottom: 16px;
}

.results-header {
  font-size: 2rem;
  font-weight: 700;
}

.score-text {
  font-size: 1.2rem;
  margin-bottom: 24px;
}

.score-emphasis {
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--md-sys-secondary);
}

.progress-wrapper {
  width: 100%;
  max-width: 300px;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 12px;
}

ion-progress-bar {
  flex-grow: 1;
  height: 16px;
  border-radius: 12px;
}

.percentage-text {
  font-weight: bold;
}
</style>
