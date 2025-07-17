<template>
  <ion-header :translucent="true">
    <ion-toolbar>
      <ion-title>{{ title }}</ion-title>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import { IonHeader, IonToolbar, IonTitle } from "@ionic/vue";
defineProps({
  title: String,
});
</script>

<style scoped>
ion-title {
  font-weight: 600;
}
</style>
