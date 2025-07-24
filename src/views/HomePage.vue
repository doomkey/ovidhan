<template>
  <ion-page>
    <app-header :title="t('homeTitle')">
      <ion-buttons slot="end">
        <ion-button router-link="/settings" class="settings-button">
          <ion-icon :icon="settings" slot="icon-only"></ion-icon>
        </ion-button>
      </ion-buttons>
    </app-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <update-card
        v-if="updateInfo?.isUpdateAvailable"
        :version="updateInfo?.latestVersion"
        @update-click="handleUpdateClick"
      ></update-card>
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
        <word-of-the-day-card
          :word-data="wordOfTheDay"
          @word-clicked="handleWordClick"
        />
        <ion-grid>
          <ion-row class="ion-align-items-center">
            <ion-col size="8">
              <ion-card
                button
                router-link="/favorites"
                color="tertiary"
                class="md-filled"
              >
                <ion-card-content>
                  <ion-icon :icon="heart" />
                  <span>
                    {{ t("favoritesTitle") }}
                  </span>
                </ion-card-content>
              </ion-card>
            </ion-col>
            <ion-col>
              <ion-card
                button
                router-link="/quiz"
                color="success"
                class="md-filled"
              >
                <ion-card-content>
                  <ion-icon :icon="gameController" />
                  <span>
                    {{ t("quizTitle") }}
                  </span>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

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
  IonCard,
  IonCardContent,
  IonGrid,
  IonCol,
  IonRow,
  IonIcon,
  IonButton,
  IonButtons,
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
import { useAppUpdate } from "@/composables/useAppUpdate"; // Import the update state composable
import { useUpdater } from "@/composables/useUpdater";
import UpdateCard from "@/components/UpdateCard.vue";
import { gameController, settings, heart } from "ionicons/icons";
const router = useRouter();
const ionRouter = useIonRouter();
const { t } = useLanguage();
const { recentSearches, addRecent } = useRecents();
const { wordOfTheDay } = useWordOfTheDay();
const { searchWords, isLoading } = useDictionaryData();
const { presentUpdateAlert } = useUpdater();
const { updateInfo } = useAppUpdate(); // Get the shared update state
const searchQuery = ref("");
const filteredResults = ref<SearchResult[]>([]);

let lastBackPress = 0;

onIonViewWillEnter(() => {
  clearResults();

  App.addListener("backButton", () => {
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
const handleUpdateClick = () => {
  if (updateInfo.value) {
    presentUpdateAlert(updateInfo.value);
  }
};

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
ion-grid {
  padding-inline-start: 0;
  padding-inline-end: 0;
}

ion-card-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

/*  */
ion-spinner {
  margin-left: 16px;
}
.autocomplete-list {
  margin-top: 0;
}
</style>
