<template>
  <ion-item button :detail="true" @click="navigateToDetail">
    <ion-label>
      <p>
        {{ word }}
      </p>
    </ion-label>

    <!-- <slot name="end"></slot> -->
  </ion-item>
</template>

<script setup lang="ts">
import { IonItem, IonLabel } from "@ionic/vue";
import { useRouter } from "vue-router";

const props = defineProps<{
  word: string;
}>();

const router = useRouter();

/**
 * Navigates to the detail page for the given word.
 */
const navigateToDetail = () => {
  if (props.word) {
    console.log(`WordListItem: Navigating to details for ${props.word}`);
    router.push(`/word/${encodeURIComponent(props.word)}`);
  }
};
</script>

<style scoped></style>
