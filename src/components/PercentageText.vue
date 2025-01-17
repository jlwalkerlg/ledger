<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  value: number
  fractionDigits?: number
}>()

const text = computed(() => props.value.toFixed(props.fractionDigits ?? 2) + '%')
</script>

<template>
  {{ text }}
</template>
