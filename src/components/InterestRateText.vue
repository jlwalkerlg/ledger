<script setup lang="ts">
import { NAMED_INTEREST_RATE_TYPES_MAP, type InterestRate } from '@/models/interest-rates'
import { computed } from 'vue'

const { value } = defineProps<{
  value: InterestRate
}>()

const text = computed(
  () =>
    `${NAMED_INTEREST_RATE_TYPES_MAP[value.type]} ${value.yearlyPercentage.toFixed(2)}% per year compounded monthly at ${value.monthlyPercentage.toFixed(2)}%`,
)
</script>

<template>
  {{ text }}
</template>
