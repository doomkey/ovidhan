import { ref, onMounted, onUnmounted, readonly } from "vue";

const TABLET_BREAKPOINT = 768;

export function useScreenSize() {
  const isDesktop = ref(window.innerWidth >= TABLET_BREAKPOINT);

  const onResize = () => {
    isDesktop.value = window.innerWidth >= TABLET_BREAKPOINT;
  };

  onMounted(() => {
    window.addEventListener("resize", onResize);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", onResize);
  });

  return {
    isDesktop: readonly(isDesktop),
  };
}
