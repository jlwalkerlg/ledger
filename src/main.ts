import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import Aura from '@primevue/themes/aura'
import PrimeVue, { type PrimeVueConfiguration, defaultOptions } from 'primevue/config'
import Ripple from 'primevue/ripple'
import App from './App.vue'
import router from './router'
import { Tooltip } from 'primevue'

const app = createApp(App)

app.use(createPinia())
app.use(router)

const primeVueConfig: PrimeVueConfiguration = {
  theme: {
    preset: Aura, // https://github.com/primefaces/primevue/blob/master/packages/themes/src/presets/aura/base/index.js
    options: {
      cssLayer: {
        name: 'primevue',
      },
    },
  },
  locale: {
    ...defaultOptions.locale!,
    dateFormat: 'dd M yy',
  },
  ripple: true,
}
app.use(PrimeVue, primeVueConfig)
app.directive('ripple', Ripple)
app.directive('tooltip', Tooltip)

app.mount('#app')
