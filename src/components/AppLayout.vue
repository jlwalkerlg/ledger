<script setup lang="ts">
import { onMounted } from 'vue'
// import AppHeader from './AppHeader.vue'

const props = defineProps<{
  title?: string
}>()

onMounted(() => {
  if (props.title) {
    document.title = `${props.title} - Ledger`
  } else {
    document.title = 'Ledger'
  }
})
</script>

<template>
  <!-- <AppHeader /> -->
  <main class="section">
    <slot></slot>
  </main>
</template>
