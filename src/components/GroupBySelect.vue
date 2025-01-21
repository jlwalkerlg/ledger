<script setup lang="ts">
import type { GroupByType } from '@/pages/use-group-by'
import type { NamedValue } from '@/utils/types'
import { Select } from 'primevue'

const value = defineModel<GroupByType>()

defineProps<{
  options: NamedValue<GroupByType>[]
}>()
</script>

<template>
  <Select
    v-model="value"
    :options="options"
    option-label="name"
    option-value="value"
    class="w-full md:w-80"
  />
</template>
