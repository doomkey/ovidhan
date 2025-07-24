<template>
  <!-- If wordData has loaded, show the actual card content -->
  <div v-if="wordData" class="woty">
    <!-- <ion-list-header>{{ t("wordOfTheDay") }}</ion-list-header> -->
    <ion-card button @click="onCardClick" class="md-filled" color="primary">
      <ion-card-header>
        <ion-card-title>
          {{ wordData.en }}
          <!-- <ion-button
              fill="clear"
              size="small"
              @click.stop="onPronounceClick"
            >
              <ion-icon slot="icon-only" :icon="volumeMediumOutline"></ion-icon>
            </ion-button> -->
        </ion-card-title>
        <ion-card-subtitle v-if="wordData.pron"
          >/ {{ wordData.pron[0] }} /</ion-card-subtitle
        >
      </ion-card-header>
      <ion-card-content>
        <p class="bangla-meaning">{{ wordData.bn }}</p>
      </ion-card-content>
    </ion-card>
  </div>

  <!-- If wordData is null (i.e., loading), show this skeleton UI instead -->
  <div v-else>
    <h2 class="section-title">
      <ion-skeleton-text
        :animated="true"
        style="width: 45%"
      ></ion-skeleton-text>
    </h2>
    <ion-card>
      <ion-card-header>
        <ion-card-title>
          <ion-skeleton-text
            :animated="true"
            style="width: 60%"
          ></ion-skeleton-text>
        </ion-card-title>
        <ion-card-subtitle>
          <ion-skeleton-text
            :animated="true"
            style="width: 40%"
          ></ion-skeleton-text>
        </ion-card-subtitle>
      </ion-card-header>
      <ion-card-content>
        <p class="bangla-meaning">
          <ion-skeleton-text
            :animated="true"
            style="width: 80%"
          ></ion-skeleton-text>
        </p>
      </ion-card-content>
    </ion-card>
  </div>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonSkeletonText,
  IonListHeader,
} from "@ionic/vue";
import { volumeMediumOutline } from "ionicons/icons";
import { useRouter } from "vue-router";
import { Word } from "@/composables/useDictionaryData";
import { useLanguage } from "@/composables/useLanguage";
const { t } = useLanguage();

const props = defineProps<{
  wordData: Word | null;
}>();

const router = useRouter();
const emit = defineEmits<{ (e: "wordClicked", word: string): void }>();

const onCardClick = () => {
  if (props.wordData?.en) {
    emit("wordClicked", props.wordData.en);
    router.push(`/word/${encodeURIComponent(props.wordData.en)}`);
  }
};

const onPronounceClick = () => {
  if (props.wordData?.en) {
    alert(`Pronouncing: ${props.wordData.en}`);
  }
};
</script>

<style scoped>
ion-card-header {
  padding-bottom: 0;
}
.card-title-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

ion-card-title {
  font-weight: bold;
}

.bangla-meaning {
  margin-top: 0;
  font-size: 1.5rem;
  /* color: var(--ion-color-primary, #3880ff); */
  font-weight: 600;
}

ion-card-header ion-skeleton-text {
  margin-bottom: 6px;
}
</style>
