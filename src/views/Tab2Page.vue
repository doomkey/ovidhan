<template>
  <ion-page>
    <app-header :title="t('favoritesTitle')"></app-header>
    <ion-content :fullscreen="true">
      <div v-if="favorites.length > 0">
        <ion-list>
          <ion-item-sliding v-for="word in favorites" :key="word">
            <word-list-item :word="word"></word-list-item>

            <ion-item-options slot="end">
              <ion-item-option color="danger" @click="handleRemove(word)">
                <ion-icon slot="icon-only" :icon="trash"></ion-icon>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
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
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonPage,
} from "@ionic/vue";
import { star, trash, sadOutline, heartDislike } from "ionicons/icons";
import { useRouter } from "vue-router";
import AppHeader from "@/components/AppHeader.vue";
import { useLanguage } from "@/composables/useLanguage";
const { t } = useLanguage();

const router = useRouter();

/**
 * Navigates to the detail page for the selected word.
 * @param word The word to view.
 */
const viewWord = (word: string) => {
  console.log(`Navigating to details for: ${word}`);
  router.push(`/word/${encodeURIComponent(word)}`);
};

import { useFavorites } from "@/composables/useFavorites";

const { favorites, removeFavorite } = useFavorites();

const handleRemove = (word: string) => {
  removeFavorite(word);
};
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 20px;
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
