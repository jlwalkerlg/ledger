<script setup lang="ts">
import { NAMED_INTEREST_RATE_TYPES, type InterestRateType } from '@/models/interest-rates'
import type { NamedValue } from '@/utils/types'
import { Select } from 'primevue'

const type = defineModel<InterestRateType>({
  required: true,
})
</script>

<template>
  <Select
    v-model="type"
    :options="NAMED_INTEREST_RATE_TYPES"
    :option-label="(option: NamedValue<InterestRateType>) => option.name"
    :option-value="(option: NamedValue<InterestRateType>) => option.value"
  />
</template>
