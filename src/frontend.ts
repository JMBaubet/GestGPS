/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Router
import router from '@/router/router'

// Composables
import { createApp } from 'vue'

const app = createApp(App)

registerPlugins(app)
app.use(router)
app.mount('#app')
