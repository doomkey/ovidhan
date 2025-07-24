<template>
  <ion-page>
    <app-header :title="t('quizTitle')">
      <ion-back-button slot="start" defaultHref="/"></ion-back-button>
    </app-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-card class="md-filled" color="secondary">
              <ion-card-header>
                <ion-card-title>{{ stats.quizzesTaken }}</ion-card-title>
              </ion-card-header>
              <ion-card-content> {{ t("quizzesTaken") }} </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col>
            <ion-card class="md-filled">
              <ion-card-header>
                <ion-card-title>{{ correctRatio }}%</ion-card-title>
              </ion-card-header>
              <ion-card-content> {{ t("correctRatio") }} </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-list>
        <ion-list-header>
          <ion-label>{{ t("newQuiz") }}</ion-label>
        </ion-list-header>
        <ion-item>
          <ion-input
            v-model="seedInput"
            :label="t('quizSeed')"
            label-placement="stacked"
            type="number"
            :placeholder="t('quizSeedPlaceholder')"
            @ionInput="seedInput = parseInt(String($event.target.value), 10)"
            :helper-text="t('seedHelper')"
          ></ion-input>
        </ion-item>
      </ion-list>
      <ion-button @click="startQuiz" color="primary">
        {{ t("startQuiz") }}
        <ion-icon slot="end" :icon="arrowForward"></ion-icon>
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonBackButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from "@ionic/vue";
import { arrowForward } from "ionicons/icons";
import AppHeader from "@/components/AppHeader.vue";
import { useLanguage } from "@/composables/useLanguage";
import { ref } from "vue";
import { useQuizStats } from "@/composables/useQuizStats";
import { useQuiz } from "@/composables/useQuiz";
const { t } = useLanguage();
const { stats, correctRatio } = useQuizStats();
const { generateAndStartQuiz } = useQuiz();
const seedInput = ref<number | null>(Math.floor(Math.random() * 1000));
const startQuiz = () => {
  const seed = seedInput.value || new Date().getTime();
  generateAndStartQuiz(seed);
};
</script>

<style scoped>
ion-grid {
  padding-inline-start: 0px;
  padding-inline-end: 0px;
}
ion-button {
  width: 100%;
}
</style>
