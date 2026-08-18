import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { router } from './router'
import App from './App.vue'

import './styles/main.css'

const app = createApp(App)
const pinia = createPinia()

app.config.errorHandler = (err, instance, info) => {
  console.error('[Vue App Error]', err, info)
}

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', event.reason)
})

app.use(pinia)
app.use(router)

app.mount('#app')
