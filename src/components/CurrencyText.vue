<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  value: number
  locale?: Intl.LocalesArgument
  currency?: string
}>()

const intl = computed(() => new Intl.NumberFormat(props.locale ?? 'en-GB', {
  style: 'currency',
  currency: props.currency ?? 'GBP'
}))

const text = computed(() => intl.value.format(props.value))
</script>

<template>
  {{ text }}
</template>
