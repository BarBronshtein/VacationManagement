import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { bootstrap } from './composables/storage.helper'

bootstrap()
createApp(App).use(router).mount('#app')