import { createApp } from "vue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import ToastService from "primevue/toastservice";
import Tooltip from "primevue/tooltip";
import Aura from "@primevue/themes/aura";
import router from "./router";
import App from "./App.vue";
import "./assets/styles/main.css";
import "primeicons/primeicons.css";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(ConfirmationService);
app.use(ToastService);
app.directive("tooltip", Tooltip);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
});
app.mount("#app");
