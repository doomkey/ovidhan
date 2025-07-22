import { ref, readonly } from "vue";
import { useUpdater } from "./useUpdater";

interface UpdateInfo {
  isUpdateAvailable: boolean;
  latestVersion?: string;
  releaseUrl?: string;
}

const updateInfo = ref<UpdateInfo | null>(null);
const isLoading = ref(false);

export async function runUpdateCheck() {
  if (isLoading.value || updateInfo.value !== null) return;

  isLoading.value = true;
  const { checkForUpdate } = useUpdater();
  updateInfo.value = await checkForUpdate(false);
  isLoading.value = false;
}

export function useAppUpdate() {
  return {
    updateInfo: readonly(updateInfo),
    isLoading: readonly(isLoading),
  };
}
