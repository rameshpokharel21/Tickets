import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
const store = pinia.state.value.scratchoff;
if (store) {
  store.initialize();
}

app.mount("#app");
