import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useData = defineStore('data', () => {
  const period = ref(0)

  return { period }
})
