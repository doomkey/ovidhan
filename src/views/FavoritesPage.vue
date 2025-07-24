<template>
  <ion-page>
    <app-header :title="t('favoritesTitle')">
      <IonButtons slot="start">
        <IonBackButton></IonBackButton>
      </IonButtons>
    </app-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <div v-if="favorites.length > 0">
        <ion-list>
          <word-list-item
            :word="word"
            v-for="word in favorites"
            :key="word"
          ></word-list-item>
        </ion-list>
      </div>

      <div v-else class="empty-state">
        <ion-icon :icon="heartDislike" class="empty-icon"></ion-icon>
        <h4 class="empty-title">{{ t("favoritesEmptyHeader") }}</h4>
        <p class="empty-subtitle">
          {{ t("favoritesEmptySub") }}
        </p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import WordListItem from "@/components/WordListItem.vue";

import {
  IonContent,
  IonIcon,
  IonList,
  IonPage,
  IonButtons,
  IonBackButton,
} from "@ionic/vue";
import { heartDislike } from "ionicons/icons";
import AppHeader from "@/components/AppHeader.vue";
import { useLanguage } from "@/composables/useLanguage";
const { t } = useLanguage();

import { useFavorites } from "@/composables/useFavorites";

const { favorites } = useFavorites();
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: #c0c0c0;
}

.empty-title {
  margin-top: 16px;
  font-size: 1.4rem;
  font-weight: 600;
}

.empty-subtitle {
  color: #666666;
  max-width: 250px;
  margin-top: 8px;
}

ion-item ion-label {
  color: var(--ion-text-color);
  font-weight: 500;
}
</style>
