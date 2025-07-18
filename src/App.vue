<template>
  <ion-app>
    <ion-router-outlet />

    <!-- 
      This is the global loading indicator.
    -->
    <ion-loading :is-open="isLoadingWord" :duration="0"> </ion-loading>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, IonLoading } from "@ionic/vue";
import { useDictionaryData } from "./composables/useDictionaryData";
import { loadTheme } from "./composables/useTheme";
import { loadTextSize } from "./composables/useTextSize";
import { loadLanguage } from "./composables/useLanguage";

// Initialize all user preferences on startup
loadTheme();
loadTextSize();
loadLanguage();

const { isLoadingWord } = useDictionaryData();
</script>

<style>
ion-content {
  --padding-top: var(--ion-safe-area-top, 0);
  --padding-bottom: var(--ion-safe-area-bottom, 0);
  --padding-start: var(--ion-safe-area-left, 0);
  --padding-end: var(--ion-safe-area-right, 0);
}
</style>
