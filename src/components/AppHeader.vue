<script setup lang="ts">
import { Menubar } from 'primevue'
import { RouterLink } from 'vue-router'
</script>

<template>
  <Menubar>
    <template #start>
      <RouterLink aria-label="Home page" to="/">LEDGER</RouterLink>
    </template>

    <template #item="{ item, props }">
      <RouterLink v-if="item.url" v-ripple :to="item.url" v-bind="props.action">
        {{ item.label }}
      </RouterLink>
      <span v-else v-bind="props.action" class="cursor-default">
        {{ item.label }}
      </span>
    </template>
  </Menubar>
</template>
