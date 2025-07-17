<template>
  <h2 class="section-title">{{ title }}</h2>
</template>

<style scoped>
.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  /* color: var(--ion-color-primary); */
  margin: 0;
}
</style>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>
