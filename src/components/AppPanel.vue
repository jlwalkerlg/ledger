<script setup lang="ts">
import { Column, DataTable } from 'primevue'
import { ref } from 'vue'

const props = defineProps<{
  heading: string
  expandable?: boolean
  expanded?: boolean
}>()

const expanded = ref(props.expanded)

const toggleExpanded = () => {
  expanded.value = !expanded.value
}
</script>

<template>
  <DataTable :value="[null]" :show-headers="false" class="app-panel" :data-expanded="expanded">
    <template #header>
      <div
        :class="'app-panel-header' + (expandable ? ' cursor-pointer' : '')"
        :role="expandable ? 'button' : undefined"
        @click="() => expandable && toggleExpanded()"
      >
        <div class="heading">{{ heading }}</div>
        <i v-if="expandable" :class="'pi' + (expanded ? ' pi-chevron-up' : ' pi-chevron-down')" />
      </div>
    </template>

    <Column>
      <template #body>
        <slot></slot>
      </template>
    </Column>
  </DataTable>
</template>

<style>
.app-panel .p-datatable-header {
  padding: 0;
}

.app-panel[data-expanded='false'] .p-datatable-header {
  border: none;
}

.app-panel[data-expanded='false'] .p-datatable-table-container {
  display: none;
}

.app-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--p-datatable-header-padding);
}
</style>
