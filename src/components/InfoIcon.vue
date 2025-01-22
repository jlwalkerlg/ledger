<script setup lang="ts">
defineProps<{
  tooltip?: string
}>()
</script>

<template>
  <i class="pi pi-info-circle" v-tooltip="{ value: tooltip, autoHide: false }"></i>
</template>
