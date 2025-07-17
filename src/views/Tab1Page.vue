<template>
  <ion-page>
    <app-header :title="t('homeTitle')"></app-header>
    <ion-content :fullscreen="true">
      <div class="search-container">
        <ion-searchbar
          :placeholder="t('searchPlaceholder')"
          :debounce="300"
          v-model="searchQuery"
          @ionInput="handleSearchInput"
          @ionClear="clearResults"
        ></ion-searchbar>
        <!-- Show a spinner when loading data -->
        <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
      </div>

      <ion-list v-if="filteredResults.length > 0" class="autocomplete-list">
        <ion-item
          v-for="word in filteredResults"
          :key="word.en"
          button
          @click="goToWordDetail(word.en)"
        >
          <ion-label>
            <h3>{{ word.en }}</h3>
            <p>{{ word.bn }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <div v-show="filteredResults.length === 0 && !isLoading">
        <!-- Word of the day and recents are hidden while searching -->
        <word-of-the-day-card
          :word-data="wordOfTheDay"
          @word-clicked="handleWordClick"
        />
        <recent-searches-list
          :searches="recentSearches"
          @clear-history="handleClearHistory"
        />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  IonPage,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
} from "@ionic/vue";
import { useDictionaryData, Word } from "@/composables/useDictionaryData";
import { useRecents } from "@/composables/useRecents";
import { useLanguage } from "@/composables/useLanguage";
import { useWordOfTheDay } from "@/composables/useWordOfTheDay";
import AppHeader from "@/components/AppHeader.vue";
import WordOfTheDayCard from "@/components/WordOfTheDayCard.vue";
import RecentSearchesList from "@/components/RecentSearchesList.vue";

const router = useRouter();
const { t } = useLanguage();
const { recentSearches, addRecent, clearRecents } = useRecents();
const { wordOfTheDay } = useWordOfTheDay();
const { searchWords, isLoading } = useDictionaryData();

const searchQuery = ref("");
const filteredResults = ref<Word[]>([]);

const detectLanguage = (text: string): "en" | "bn" => {
  return /[\u0980-\u09FF]/.test(text) ? "bn" : "en";
};

const handleSearchInput = async (event: CustomEvent) => {
  const query = event.detail.value;
  if (!query || query.trim().length === 0) {
    clearResults();
    return;
  }
  const language = detectLanguage(query);
  filteredResults.value = await searchWords(query, language);
};

const clearResults = () => {
  searchQuery.value = "";
  filteredResults.value = [];
};

const goToWordDetail = (wordName: string) => {
  addRecent(wordName);
  clearResults();
  router.push(`/word/${encodeURIComponent(wordName)}`);
};

const handleWordClick = (word: string) => addRecent(word);
const handleClearHistory = () => {
  if (confirm(t("clearHistoryMessage"))) clearRecents();
};
</script>

<style scoped>
.search-container {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--ion-background-color);
  padding: 8px 8px;
  display: flex;
  align-items: center;
}
ion-searchbar {
  flex-grow: 1;
}
ion-spinner {
  margin-left: 16px;
}
.autocomplete-list {
  margin-top: 0;
}
ion-label h3 {
  font-weight: 500;
}
ion-label p {
  font-size: 0.9em;
  color: var(--ion-color-medium-shade);
}
</style>
