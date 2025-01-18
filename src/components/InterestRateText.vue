<script setup lang="ts">
import { NAMED_INTEREST_RATE_TYPES_MAP, type InterestRateType } from '@/models/interest-rates'
import { computed } from 'vue'

const { annualRatePercentage, type } = defineProps<{
  annualRatePercentage: number
  type: InterestRateType
}>()

const text = computed(
  () =>
    `${NAMED_INTEREST_RATE_TYPES_MAP[type]} ${annualRatePercentage}% per year compounded monthly`,
)
</script>

<template>
  {{ text }}
</template>
