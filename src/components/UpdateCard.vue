<template>
  <ion-card
    color="tertiary"
    :button="true"
    @click="$emit('updateClick')"
    class="md-filled"
  >
    <ion-card-header>
      <ion-card-title class="card-title">
        <ion-icon :icon="arrowUpCircle" class="title-icon"></ion-icon>
        {{ t("updateAvailable") }}
      </ion-card-title>
    </ion-card-header>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonCardHeader, IonCardTitle, IonIcon } from "@ionic/vue";
import { arrowUpCircle } from "ionicons/icons";
import { useLanguage } from "@/composables/useLanguage";

const { t } = useLanguage();

defineProps<{
  version?: string;
}>();

defineEmits(["updateClick"]);
</script>

<style scoped>
.card-title {
  display: flex;
  align-items: center;
  font-size: 1.2rem;
}
.title-icon {
  margin-right: 8px;
  font-size: 1.6rem;
}
ion-card-content {
  font-size: 0.9rem;
}
</style>
