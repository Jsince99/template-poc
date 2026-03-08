import { createApp } from "vue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import Tooltip from "primevue/tooltip";
import Aura from "@primevue/themes/aura";
import router from "./router";
import App from "./App.vue";
import "primeicons/primeicons.css";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(ConfirmationService);
app.directive("tooltip", Tooltip);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
});
app.mount("#app");
