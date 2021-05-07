import { createApp } from 'vue'
import axios from 'axios'

import App from './App.vue'
import router from './router'
import store from './store'

axios.defaults.baseURL = '/api/'
axios.get('/columns').then((res) => {
  console.log(res.data)
})

const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')
