<template>
  <div class="recent-searches-container">
    <!-- <ion-button
    fill="clear"
    size="small"
    v-if="searches.length > 0"
    @click="onClearClick"
      >
        Clear
      </ion-button> -->

    <ion-list v-if="searches.length > 0">
      <ion-list-header>{{ t("recentSearches") }}</ion-list-header>
      <word-list-item
        v-for="term in searches"
        :key="term"
        :word="term"
      ></word-list-item>
    </ion-list>

    <div v-else class="empty-state">
      <p>{{ t("recentSearchesEmpty") }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonList, IonListHeader } from "@ionic/vue";
import WordListItem from "./WordListItem.vue";
import { useLanguage } from "@/composables/useLanguage";
const { t } = useLanguage();

defineProps<{
  searches: readonly string[];
}>();
</script>

<style scoped>
.recent-searches-container {
  /* padding: 0 16px; */
  margin-top: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
}

ion-list {
  margin-top: 8px;
}

ion-item ion-label {
  color: var(--ion-text-color);
}

.empty-state {
  text-align: center;
  /* color: #888; */
  padding: 20px 0;
  font-size: 0.9rem;
}

ion-button {
  --color: var(--ion-color-primary, #3880ff);
}
</style>
