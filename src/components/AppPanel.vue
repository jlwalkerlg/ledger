<script setup lang="ts">
import { DataTable } from 'primevue'

defineProps<{
  heading: string
}>()
</script>

<template>
  <DataTable :show-headers="false">
    <template #header>
      <div class="heading">{{ heading }}</div>
    </template>

    <template #empty>
      <slot></slot>
    </template>
  </DataTable>
</template>
