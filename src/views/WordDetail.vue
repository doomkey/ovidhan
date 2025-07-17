<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :text="t('back')"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ wordData?.en }}</ion-title>
        <!-- Favorite button in the header -->
        <ion-buttons v-if="wordData" slot="end">
          <ion-button @click="toggleFavorite">
            <ion-icon
              slot="icon-only"
              :icon="isWordFavorite ? heart : heartOutline"
              color="secondary"
            ></ion-icon>
          </ion-button>
          <ion-button @click="goHome">
            <ion-icon slot="icon-only" :icon="home"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="isLoading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
      </div>
      <!-- v-if: Only show content if a word was successfully found -->
      <div v-else-if="wordData">
        <ion-card class="md-outlined">
          <ion-card-content class="main-word-card">
            <div class="pronunciation-wrapper">
              <h4 class="english-word">{{ wordData.en }}</h4>
              <!-- <ion-button fill="clear" @click="pronounceWord">
                <ion-icon
                  slot="icon-only"
                  :icon="volumeMediumOutline"
                ></ion-icon>
              </ion-button> -->
            </div>
            <p v-if="wordData.pron" class="pronunciation-text">
              / {{ wordData.pron[0] }} /
            </p>
            <div v-if="wordData.pos">
              <p v-for="pos in wordData.pos">
                {{ pos }}
              </p>
            </div>
            <h3 class="bangla-meaning">{{ wordData.bn }}</h3>
          </ion-card-content>
        </ion-card>

        <!-- Synonyms Section -->
        <ion-list
          v-if="
            (processedBanglaSynonyms || processedEnglishSynonyms) &&
            processedBanglaSynonyms.length > 0 &&
            processedEnglishSynonyms.length > 0
          "
        >
          <ion-list-header>
            <ion-label>{{ t("synonyms") }}</ion-label>
          </ion-list-header>

          <ion-item-group>
            <ion-item-divider
              v-if="processedBanglaSynonyms.length > 0"
              class="header"
            >
              <ion-label>{{ t("bangla") }}</ion-label>
            </ion-item-divider>
            <ion-item
              v-for="syn in processedBanglaSynonyms"
              :key="syn.word"
              :button="syn.exists && syn.englishEquivalent! !== syn.word"
              :detail="syn.exists"
              @click="syn.exists && goToSynonym(syn.englishEquivalent!)"
            >
              <ion-label>{{ syn.word }}</ion-label>
            </ion-item>
          </ion-item-group>

          <ion-item-group>
            <ion-item-divider
              v-if="processedEnglishSynonyms.length > 0"
              class="header"
            >
              <ion-label>{{ t("english") }}</ion-label>
            </ion-item-divider>
            <ion-item
              v-for="syn in processedEnglishSynonyms"
              :key="syn.word"
              :button="syn.exists"
              :detail="syn.exists"
              @click="syn.exists && goToSynonym(syn.word)"
            >
              <ion-label>{{ syn.word }}</ion-label>
            </ion-item>
          </ion-item-group>
        </ion-list>

        <!-- Antonyms Section -->
        <ion-list
          v-if="
            (processedBanglaAntonyms || processedEnglishAntonyms) &&
            processedBanglaAntonyms.length > 0 &&
            processedEnglishAntonyms.length > 0
          "
        >
          <ion-list-header>
            <ion-label>{{ t("antonyms") }}</ion-label>
          </ion-list-header>

          <ion-item-group>
            <ion-item-divider
              v-if="processedBanglaAntonyms.length > 0"
              class="header"
            >
              <ion-label>{{ t("bangla") }}</ion-label>
            </ion-item-divider>
            <ion-item
              v-for="syn in processedBanglaAntonyms"
              :key="syn.word"
              :button="syn.exists"
              :detail="syn.exists"
              @click="syn.exists && goToSynonym(syn.englishEquivalent!)"
            >
              <ion-label>{{ syn.word }}</ion-label>
            </ion-item>
          </ion-item-group>

          <ion-item-group>
            <ion-item-divider
              v-if="processedEnglishAntonyms.length > 0"
              class="header"
            >
              <ion-label>{{ t("english") }}</ion-label>
            </ion-item-divider>
            <ion-item
              v-for="syn in processedEnglishAntonyms"
              :key="syn.word"
              :button="syn.exists"
              :detail="syn.exists"
              @click="syn.exists && goToSynonym(syn.word)"
            >
              <ion-label>{{ syn.word }}</ion-label>
            </ion-item>
          </ion-item-group>
        </ion-list>

        <!-- Example Sentences Section -->
        <ion-list v-if="wordData.sents">
          <ion-list-header>
            <ion-label>{{ t("exampleSentences") }}</ion-label>
          </ion-list-header>
          <ion-item v-for="(sentence, index) in wordData.sents" :key="index">
            <ion-label class="ion-text-wrap">
              <p v-html="sentence" class="exmp"></p>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>

      <div v-else class="empty-state">
        <ion-icon :icon="sadOutline" class="empty-icon"></ion-icon>
        <h2 class="empty-title">Word Not Found</h2>
        <p class="empty-subtitle">
          The word you are looking for is not in the dictionary.
        </p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonButton,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonItemGroup,
  IonItemDivider,
  IonSpinner,
  onIonViewWillEnter,
} from "@ionic/vue";
import {
  star,
  starOutline,
  volumeMediumOutline,
  sadOutline,
  heart,
  heartOutline,
  home,
} from "ionicons/icons";
import { useDictionaryData, Word } from "@/composables/useDictionaryData";
import { useFavorites } from "@/composables/useFavorites";
import { useLanguage } from "@/composables/useLanguage";

const route = useRoute();
const router = useRouter();
const { t } = useLanguage();
const {
  findWordByEnglish,
  isLoading,
  checkWordsExist,
  findEnglishEquivalents,
} = useDictionaryData();
const { addFavorite, removeFavorite, isFavorite } = useFavorites();

const wordData = ref<Word | null>(null);
const processedEnglishSynonyms = ref<{ word: string; exists: boolean }[]>([]);
const processedEnglishAntonyms = ref<{ word: string; exists: boolean }[]>([]);
const processedBanglaSynonyms = ref<
  { word: string; exists: boolean; englishEquivalent: string | null }[]
>([]);
const processedBanglaAntonyms = ref<
  { word: string; exists: boolean; englishEquivalent: string | null }[]
>([]);

const processSynonyms = async () => {
  if (!wordData.value) return;

  // Process English Synonyms
  const existingEnglishWords = await checkWordsExist(wordData.value.en_syns);
  processedEnglishSynonyms.value = wordData.value.en_syns
    .map((word) => ({ word, exists: existingEnglishWords.has(word) }))
    .sort((a, b) => (b.exists ? 1 : 0) - (a.exists ? 1 : 0));

  // Process Bangla Synonyms
  const equivalentMap = await findEnglishEquivalents(wordData.value.bn_syns);
  processedBanglaSynonyms.value = wordData.value.bn_syns
    .map((word) => {
      const englishEquivalent = equivalentMap.get(word) || null;
      return { word, exists: !!englishEquivalent, englishEquivalent };
    })
    .sort((a, b) => (b.exists ? 1 : 0) - (a.exists ? 1 : 0));
};
const processAntonyms = async () => {
  if (!wordData.value) return;

  // Process English Ant
  const existingEnglishWords = await checkWordsExist(
    wordData.value.en_antonyms
  );
  processedEnglishAntonyms.value = wordData.value?.en_antonyms
    ?.map((word) => ({ word, exists: existingEnglishWords.has(word) }))
    .sort((a, b) => (b.exists ? 1 : 0) - (a.exists ? 1 : 0));

  // Process Bangla Ant
  const equivalentMap = await findEnglishEquivalents(
    wordData.value.bn_antonyms
  );
  processedBanglaAntonyms.value = wordData.value.bn_antonyms
    ?.map((word) => {
      const englishEquivalent = equivalentMap.get(word) || null;
      return { word, exists: !!englishEquivalent, englishEquivalent };
    })
    .sort((a, b) => (b.exists ? 1 : 0) - (a.exists ? 1 : 0));
};

onIonViewWillEnter(async () => {
  const newWordName = route.params.wordName as string;
  if (newWordName) {
    // Reset state for the new page to ensure no old data flashes
    wordData.value = null;
    processedEnglishSynonyms.value = [];
    processedBanglaSynonyms.value = [];
    processedEnglishAntonyms.value = [];
    processedBanglaAntonyms.value = [];

    const foundWord = await findWordByEnglish(newWordName);
    wordData.value = foundWord || null;

    if (wordData.value) {
      await processSynonyms();
      await processAntonyms();
    }
  }
});

// --- Favorites Logic ---
const isWordFavorite = computed(() => {
  return wordData.value ? isFavorite(wordData.value.en) : false;
});

const toggleFavorite = () => {
  if (wordData.value) {
    isWordFavorite.value
      ? removeFavorite(wordData.value.en)
      : addFavorite(wordData.value.en);
  }
};

const goToSynonym = (englishWord: string) => {
  router.push(`/word/${encodeURIComponent(englishWord)}`);
};
const goHome = () => {
  router.push(`/`);
};
const pronounceWord = () => {
  if (wordData.value) alert(`Pronouncing: ${wordData.value.en}`);
};
</script>

<style scoped>
ion-card.md-outlined {
  background-color: var(--md-sys-primary);
}
ion-card.md-outlined * {
  color: var(--md-sys-on-primary);
}
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.header {
  background-color: var(--md-sys-secondary);
}
.header > ion-label {
  color: var(--md-sys-on-secondary) !important;
  font-weight: bold;
}
.main-word-card {
  text-align: center;
}
.english-word {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
}
.pronunciation-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}
.pronunciation-text {
  font-size: 1rem;
  margin: 4px 0 16px;
}
.bangla-meaning {
  font-size: 2rem;
  font-weight: 500;
  margin: 0;
}
:deep(b) {
  color: var(--md-sys-secondary);
  font-weight: 600;
}

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
</style>
