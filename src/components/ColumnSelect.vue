<script setup lang="ts">
import type { ColGroup, ColOption } from '@/pages/use-columns'
import { MultiSelect } from 'primevue'

const columns = defineModel<string[]>({
  required: true,
})

defineProps<{
  options: ColGroup[]
}>()
</script>

<template>
  <MultiSelect
    v-model="columns"
    :options="options"
    :option-label="(option: ColOption) => option.label"
    :option-value="(option: ColOption) => option.value"
    :option-group-label="(group: ColGroup) => group.label"
    :option-group-children="(group: ColGroup) => group.items"
    :show-toggle-all="false"
    placeholder="Select columns"
    class="w-full md:w-80"
  >
    <template #value="{ value }">{{ value.length }} selected</template>
  </MultiSelect>
</template>
