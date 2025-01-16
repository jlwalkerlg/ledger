<script setup lang="ts">
import AppLayout from '@/components/AppLayout.vue'
</script>

<template>
  <AppLayout>
    <main class="section text-center">
      <h1 class="text-3xl font-medium">Page not found.</h1>

      <p class="mt-4">
        The page you're looking for doesn't exist. Try going back to the
        <RouterLink to="/" class="primary-link">home page</RouterLink>.
      </p>
    </main>
  </AppLayout>
</template>
