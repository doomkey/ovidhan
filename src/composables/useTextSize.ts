import { ref, readonly } from "vue";

export type TextSize = "small" | "medium" | "large";

const textSize = ref<TextSize>("medium");

const STORAGE_KEY = "dictionary_app_text_size";

const applyTextSize = (size: TextSize) => {
  console.log(`[TextSize] Applying size: ${size}`);
  document.documentElement.setAttribute("data-text-size", size);
  textSize.value = size;
};

const saveTextSizeToStorage = (size: TextSize) => {
  console.log(`[TextSize] Saving size to storage: ${size}`);
  localStorage.setItem(STORAGE_KEY, size);
};

export const loadTextSize = () => {
  const storedSize = localStorage.getItem(STORAGE_KEY) as TextSize | null;
  console.log(
    `[TextSize] Loading size from storage: ${storedSize || "medium"}`
  );
  applyTextSize(storedSize || "medium");
};

export function useTextSize() {
  const setTextSize = (size: TextSize) => {
    console.log(`[TextSize] setTextSize called with: ${size}`);
    if (!size || !["small", "medium", "large"].includes(size)) {
      console.error(`[TextSize] Invalid size value received: ${size}`);
      return;
    }
    applyTextSize(size);
    saveTextSizeToStorage(size);
  };

  return {
    textSize: readonly(textSize),
    setTextSize,
  };
}
