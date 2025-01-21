import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import trim from 'lodash-es/trim'

const getBasePath = () => {
  if (!process.env.BASE_URL) {
    return '/'
  }

  return `/${trim(process.env.BASE_URL, '/')}/`
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: getBasePath(),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
