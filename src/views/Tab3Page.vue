<template>
  <ion-page>
    <app-header :title="t('settings')"></app-header>
    <ion-content :fullscreen="true">
      <ion-list-header>{{ t("language") }}</ion-list-header>
      <div style="padding: 0 16px">
        <ion-segment
          :value="language"
          @ionChange="onLanguageChange($event)"
          class="full-width-segment"
        >
          <ion-segment-button value="en">
            <ion-label>{{ t("english") }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="bn">
            <ion-label>{{ t("bangla") }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>

      <ion-list :inset="false">
        <ion-list-header>{{ t("appearance") }}</ion-list-header>
        <!-- Dark Mode Toggle -->
        <ion-item>
          <ion-icon :icon="moon" slot="start" aria-hidden="true"></ion-icon>
          <ion-label>{{ t("darkMode") }}</ion-label>
          <ion-toggle
            :checked="isDarkMode"
            @ionChange="toggleTheme"
            slot="end"
            aria-label="Toggle Dark Mode"
          ></ion-toggle>
        </ion-item>

        <!-- Text Size Control -->

        <ion-item>
          <ion-icon :icon="text" slot="start" aria-hidden="true"></ion-icon>
          <ion-select
            :label="t('textSize')"
            :value="textSize"
            @ionChange="onTextSizeChange($event)"
          >
            <ion-select-option value="small">{{
              t("small")
            }}</ion-select-option>
            <ion-select-option value="medium">{{
              t("medium")
            }}</ion-select-option>
            <ion-select-option value="large">{{
              t("large")
            }}</ion-select-option>
          </ion-select>
        </ion-item>
      </ion-list>

      <ion-list :inset="false">
        <ion-list-header>{{ t("notifications") }}</ion-list-header>
        <ion-item>
          <ion-icon
            :icon="notifications"
            slot="start"
            aria-hidden="true"
          ></ion-icon>
          <ion-label>
            {{ t("dailyWord") }}
            <p>{{ t("dailyWordSub") }}</p>
          </ion-label>
          <ion-toggle
            :checked="notificationsEnabled"
            @ionChange="handleNotificationToggle"
            slot="end"
            aria-label="Toggle Daily Notifications"
          ></ion-toggle>
        </ion-item>
      </ion-list>

      <ion-list :inset="false">
        <ion-list-header>{{ t("dataManagement") }}</ion-list-header>
        <ion-item button @click="handleClearRecents" :detail="false">
          <ion-icon :icon="trashBin" slot="start" color="danger"></ion-icon>
          <ion-label color="danger">{{ t("clearRecents") }}</ion-label>
        </ion-item>
        <ion-item button @click="handleClearFavorites" :detail="false">
          <ion-icon :icon="trashBin" slot="start" color="danger"></ion-icon>
          <ion-label color="danger">{{ t("clearFavorites") }}</ion-label>
        </ion-item>
      </ion-list>

      <!-- FIX: Added navigation to the About Page -->
      <ion-list :inset="false">
        <ion-item button @click="goToAboutPage" :detail="true">
          <ion-icon :icon="informationCircle" slot="start"></ion-icon>
          <ion-label>{{ t("aboutApp") }}</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonListHeader,
  IonLabel,
  IonToggle,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  alertController,
  IonSelect,
  IonSelectOption,
} from "@ionic/vue";
import {
  moon,
  text,
  notifications,
  trashBin,
  informationCircle,
  languageSharp,
} from "ionicons/icons";
import { useRouter } from "vue-router"; // Import the router
import AppHeader from "@/components/AppHeader.vue";
import { useTheme } from "@/composables/useTheme";
import { useTextSize, TextSize } from "@/composables/useTextSize";
import { useNotifications } from "@/composables/useNotifications";
import { useRecents } from "@/composables/useRecents";
import { useFavorites } from "@/composables/useFavorites";
import { useLanguage } from "@/composables/useLanguage"; // Import the new composable
const { language, setLanguage, t } = useLanguage(); // Use the language composable

// Initialize router
const router = useRouter();

// --- Appearance Composables ---
const { isDarkMode, toggleTheme } = useTheme();
const { textSize, setTextSize } = useTextSize();
const onTextSizeChange = (event: CustomEvent) => {
  const newSize = event.detail.value as TextSize;
  if (newSize) {
    setTextSize(newSize);
  }
};

// --- Notifications Logic ---
const {
  requestPermission,
  scheduleDailyNotification,
  cancelDailyNotification,
  checkPermission,
} = useNotifications();
const notificationsEnabled = ref(false);
onMounted(async () => {
  const status = await checkPermission();
  notificationsEnabled.value = status === "granted";
});
const handleNotificationToggle = async (event: CustomEvent) => {
  const shouldEnable = event.detail.checked;
  if (shouldEnable) {
    const permission = await requestPermission();
    if (permission === "granted") {
      const success = await scheduleDailyNotification();
      notificationsEnabled.value = success;
    } else {
      notificationsEnabled.value = false;
    }
  } else {
    await cancelDailyNotification();
    notificationsEnabled.value = false;
  }
};

// --- Data Management Logic ---
const { clearRecents } = useRecents();
const { clearFavorites } = useFavorites();

const handleClearRecents = async () => {
  const alert = await alertController.create({
    header: t("clearHistoryHeader"),
    message: t("clearHistoryMessage"),
    buttons: [
      { text: t("cancel"), role: "cancel" },
      {
        text: t("clear"),
        role: "destructive",
        handler: () => {
          clearRecents();
        },
      },
    ],
  });
  await alert.present();
};

const handleClearFavorites = async () => {
  const alert = await alertController.create({
    header: t("clearFavoritesHeader"),
    message: t("clearFavoritesMessage"),
    buttons: [
      { text: t("cancel"), role: "cancel" },
      {
        text: t("clear"),
        role: "destructive",
        handler: () => {
          clearFavorites();
        },
      },
    ],
  });
  await alert.present();
};

// --- Navigation to About Page ---
const goToAboutPage = () => {
  router.push("/about");
};

// --- Language Logic (Placeholder) ---
const selectedLanguage = ref("en"); // Default to English
const onLanguageChange = (event: CustomEvent) => {
  const newLang = event.detail.value;
  if (newLang) {
    setLanguage(newLang);
  }
};
</script>

<style scoped>
ion-list {
  margin-top: 20px;
}
ion-label p {
  font-size: 0.8em;
  color: var(--ion-color-medium);
}
</style>
