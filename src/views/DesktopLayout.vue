<template>
  <ion-split-pane content-id="main-content" when="md">
    <ion-menu content-id="main-content">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>{{ t("appName") }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-list>
          <ion-menu-toggle :auto-hide="false">
            <router-link to="/home" v-slot="{ isActive, navigate }" custom>
              <ion-item
                button
                :class="{ 'item-active': isActive }"
                @click="navigate"
              >
                <ion-icon aria-hidden="true" :icon="home" slot="start" />
                <ion-label>{{ t("homeTitle") }}</ion-label>
              </ion-item>
            </router-link>

            <router-link to="/favorites" v-slot="{ isActive, navigate }" custom>
              <ion-item
                button
                :class="{ 'item-active': isActive }"
                @click="navigate"
              >
                <ion-icon aria-hidden="true" :icon="heart" slot="start" />
                <ion-label>{{ t("favoritesTitle") }}</ion-label>
              </ion-item>
            </router-link>

            <router-link to="/settings" v-slot="{ isActive, navigate }" custom>
              <ion-item
                button
                :class="{ 'item-active': isActive }"
                @click="navigate"
              >
                <ion-icon aria-hidden="true" :icon="settings" slot="start" />
                <ion-label>{{ t("settings") }}</ion-label>
              </ion-item>
            </router-link>
          </ion-menu-toggle>
        </ion-list>
      </ion-content>
    </ion-menu>

    <ion-router-outlet id="main-content"></ion-router-outlet>
  </ion-split-pane>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonTitle,
  IonToolbar,
  IonSplitPane,
} from "@ionic/vue";
import { settings, heart, home } from "ionicons/icons";
import { useLanguage } from "@/composables/useLanguage";
import { RouterLink } from "vue-router";
const { t } = useLanguage();
</script>

<style scoped>
ion-item.item-active {
  --background: var(--md-sys-tertiary) !important;
  --color: var(--md-sys-on-tertiary) !important;
  --font-weight: 600;
}
.item-active ion-icon {
  color: var(--md-sys-on-tertiary) !important;
}
</style>
