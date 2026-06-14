import DefaultTheme from "vitepress/theme";
import mediumZoom from "medium-zoom";
import { useRoute } from "vitepress";
import { onMounted, watch, nextTick } from "vue";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";
import "./custom.css";

export default {
  extends: DefaultTheme,
  setup() {
    const route = useRoute();
    // Click-to-fullscreen zoom for documentation images (screenshots, diagrams).
    const initZoom = () =>
      mediumZoom(".vp-doc :not(a) > img", {
        background: "rgba(13, 22, 38, 0.92)",
        margin: 24,
      });
    onMounted(() => nextTick(initZoom));
    watch(() => route.path, () => nextTick(initZoom));
  },
};
