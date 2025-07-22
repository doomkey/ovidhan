<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>{{ t("aboutApp") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <div class="logo-container">
        <ion-icon :icon="book" class="app-logo"></ion-icon>
        <h3 class="app-title">{{ t("appName") }}</h3>
        <p class="app-version">{{ t("version") }} {{ appVersion }}</p>
      </div>

      <ion-list>
        <ion-list-header>
          <ion-label>{{ t("information") }}</ion-label>
        </ion-list-header>
        <ion-item>
          <ion-label>
            <h2>{{ t("developer") }}</h2>
            <p>Imran Molla Joy</p>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <h2>{{ t("publisher") }}</h2>
            <p>Doomkey</p>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <h2>{{ t("dataCredits") }}</h2>
            <p>
              {{ t("credit") }}
              https://github.com/MinhasKamal/BengaliDictionary
            </p>
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-list>
        <ion-list-header>
          <ion-label>{{ t("links") }}</ion-label>
        </ion-list-header>
        <ion-item button :detail="false" @click="openGitHub">
          <ion-icon :icon="logoGithub" slot="start"></ion-icon>
          <ion-label>{{ t("sourceCode") }}</ion-label>
        </ion-item>
        <ion-item button :detail="false" @click="handleUpdateCheck">
          <ion-icon :icon="cloudDownload" slot="start"></ion-icon>
          <ion-label>{{ t("checkForUpdate") }}</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonIcon,
  loadingController,
  alertController,
} from "@ionic/vue";
import { book, logoGithub, cloudDownload } from "ionicons/icons";

import { useLanguage } from "@/composables/useLanguage";
const { t } = useLanguage();

import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { onMounted, ref } from "vue";
import { useUpdater } from "@/composables/useUpdater";
const { checkForUpdate, presentUpdateAlert } = useUpdater();

const openGitHub = async () => {
  await Browser.open({ url: "https://github.com/doomkey/ovidhan" });
};

const appVersion = ref("");

onMounted(async () => {
  try {
    const info = await App.getInfo();
    appVersion.value = info.version;
  } catch (e) {
    console.error("Could not get app version", e);
    appVersion.value = "1.1.0"; // Fallback version
  }
});

const handleUpdateCheck = async () => {
  const updateInfo = await checkForUpdate(true);
  await presentUpdateAlert(updateInfo);
};
</script>

<style scoped>
.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  text-align: center;
}
.app-logo {
  font-size: 80px;
  color: var(--ion-color-primary);
  margin-bottom: 8px;
}
.app-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}
.app-version {
  font-size: 0.9rem;
  margin-top: 4px;
}
ion-list {
  margin-top: 0;
}
h2 {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 2px;
}
p {
  font-size: 0.9rem;
}
</style>
