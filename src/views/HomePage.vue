<template>
  <ion-page>
    <app-header :title="t('homeTitle')"></app-header>
    <ion-content :fullscreen="true" class="ion-padding">
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
          v-for="result in filteredResults"
          :key="result.word.en"
          :button="true"
          :detail="true"
          @click="goToWordDetail(result.word.en)"
        >
          <ion-label>
            <h3>{{ result.word.en }}</h3>
            <p>{{ result.matchedBn }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <div v-show="filteredResults.length === 0 && !isLoading">
        <!-- Word of the day and recents are hidden while searching -->
        <word-of-the-day-card
          :word-data="wordOfTheDay"
          @word-clicked="handleWordClick"
        />
        <recent-searches-list :searches="recentSearches" />
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
  onIonViewWillEnter,
  onIonViewDidLeave,
  toastController,
  useIonRouter,
} from "@ionic/vue";
import { App } from "@capacitor/app";
import {
  useDictionaryData,
  SearchResult,
} from "@/composables/useDictionaryData";
import { useRecents } from "@/composables/useRecents";
import { useLanguage } from "@/composables/useLanguage";
import { useWordOfTheDay } from "@/composables/useWordOfTheDay";
import AppHeader from "@/components/AppHeader.vue";
import WordOfTheDayCard from "@/components/WordOfTheDayCard.vue";
import RecentSearchesList from "@/components/RecentSearchesList.vue";

const router = useRouter();
const ionRouter = useIonRouter();
const { t } = useLanguage();
const { recentSearches, addRecent, clearRecents } = useRecents();
const { wordOfTheDay } = useWordOfTheDay();
const { searchWords, isLoading } = useDictionaryData();

const searchQuery = ref("");
const filteredResults = ref<SearchResult[]>([]);

let lastBackPress = 0;

onIonViewWillEnter(() => {
  clearResults();

  App.addListener("backButton", ({ canGoBack }) => {
    if (!ionRouter.canGoBack()) {
      const currentTime = new Date().getTime();
      // If the last press was less than 2 seconds ago, exit
      if (currentTime - lastBackPress < 2000) {
        App.exitApp();
      } else {
        // Otherwise, show a toast and update the last press time
        showExitToast();
        lastBackPress = currentTime;
      }
    }
  });
});

onIonViewDidLeave(() => {
  App.removeAllListeners();
});

const showExitToast = async () => {
  const toast = await toastController.create({
    message: "Press back again to exit",
    duration: 2000,
    position: "bottom",
    color: "dark",
  });
  await toast.present();
};

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
  // clearResults();
  router.push(`/word/${encodeURIComponent(wordName)}`);
};

const handleWordClick = (word: string) => addRecent(word);
</script>

<style scoped>
.search-container {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--ion-background-color);
  display: flex;
  align-items: center;
}
ion-searchbar {
  flex-grow: 1;
}

/*  */
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
