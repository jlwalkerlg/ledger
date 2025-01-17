<script setup lang="ts">
import { Column, DataTable } from 'primevue'

defineProps<{
  heading: string
}>()
</script>

<template>
  <DataTable :value="[null]" :show-headers="false">
    <template #header>
      <div class="heading">{{ heading }}</div>
    </template>

    <Column>
      <template #body>
        <slot></slot>
      </template>
    </Column>
  </DataTable>
</template>
