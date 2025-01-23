<script setup lang="ts">
import { NAMED_FEE_TYPES, type FeeType } from '@/models/fees'
import type { NamedValue } from '@/utils/types'

const type = defineModel<FeeType>({
  required: true,
})
</script>

<template>
  <Select
    v-model="type"
    :options="NAMED_FEE_TYPES"
    :option-label="(option: NamedValue<FeeType>) => option.name"
    :option-value="(option: NamedValue<FeeType>) => option.value"
  />
</template>
