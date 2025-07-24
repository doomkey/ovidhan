<template>
  <ion-app>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="tab1" href="/home">
          <ion-icon aria-hidden="true" :icon="home" />
          <ion-label>{{ t("homeTitle") }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab2" href="/favorites">
          <ion-icon aria-hidden="true" :icon="heart" />
          <ion-label>{{ t("favoritesTitle") }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab3" href="/settings">
          <ion-icon aria-hidden="true" :icon="settings" />
          <ion-label>{{ t("settings") }}</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-app>
</template>

<script setup lang="ts">
import {
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonLabel,
  IonIcon,
  IonRouterOutlet,
  IonApp,
} from "@ionic/vue";
import { settings, heart, home } from "ionicons/icons";
import { useLanguage } from "@/composables/useLanguage"; // Import the new composable
const { t } = useLanguage(); // Use the language composable
</script>
