import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Icon } from '@iconify/vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.component('Icon', Icon)
app.use(pinia)
app.use(router)
app.mount('#app')
