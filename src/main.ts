import { createApp } from 'vue'
import axios from 'axios'

import App from './App.vue'
import router from './router'
import store from './store'

axios.defaults.baseURL = '/api/'

const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')
