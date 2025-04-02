import './assets/main.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import VueApexCharts from 'vue3-apexcharts';
import inactivityPlugin from './plugins/inactivity';


// Import your API configuration
import '@/services/api';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(VueApexCharts);
app.use(inactivityPlugin);

app.mount('#app');