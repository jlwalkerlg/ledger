<script setup lang="ts">
import { Column, DataTable } from 'primevue'
import CurrencyText from './CurrencyText.vue'
import { ref } from 'vue'
import InvestmentModal from './InvestmentModal.vue'
import PercentageText from './PercentageText.vue'
import type { Investment } from '@/models/investments'
import InterestRateText from './InterestRateText.vue'

const investments = defineModel<Investment[]>({
  required: true,
})

const editInvestment = ref<Investment>()
const showInvestmentModal = ref(false)

const onAddInvestment = () => {
  editInvestment.value = undefined
  showInvestmentModal.value = true
}

const onEditInvestment = (investment: Investment) => {
  editInvestment.value = investment
  showInvestmentModal.value = true
}

const onRemoveInvestment = (index: number) => {
  investments.value = investments.value.filter((_, i) => i !== index)
  editInvestment.value = undefined
}

const onSaveInvestment = (investment: Investment) => {
  if (editInvestment.value) {
    investments.value = investments.value.map((i) => (i === editInvestment.value ? investment : i))
  } else {
    investments.value = [...investments.value, investment]
  }
  showInvestmentModal.value = false
}
</script>

<template>
  <DataTable :value="investments" :show-headers="investments.length > 0">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="heading">Investments</div>
        <button type="button" @click="onAddInvestment" class="primary-link">Add</button>
      </div>
    </template>

    <template #empty> No investments to show. </template>

    <Column header="Name">
      <template #body="{ data: investment }: { data: Investment }">
        {{ investment.name }}
      </template>
    </Column>

    <Column header="Initial Value">
      <template #body="{ data: investment }: { data: Investment }">
        <CurrencyText :value="investment.initialValue" />
      </template>
    </Column>

    <Column header="Purchase Fee">
      <template #body="{ data: investment }: { data: Investment }">
        <PercentageText :value="investment.purchaseFeePercentage" />
      </template>
    </Column>

    <Column header="Growth Rate">
      <template #body="{ data: investment }: { data: Investment }">
        <InterestRateText
          :annual-rate-percentage="investment.annualGrowthRatePercentage"
          :type="investment.growthRateType"
        />
      </template>
    </Column>

    <Column header="Annual Growth Rate">
      <template #body="{ data: investment }: { data: Investment }">
        <PercentageText :value="investment.annualGrowthRatePercentage" />
        ({{ investment.growthRateType }})
      </template>
    </Column>

    <Column header="Monthly Growth Rate">
      <template #body="{ data: investment }: { data: Investment }">
        <PercentageText :value="investment.monthlyGrowthRatePercentage" />
      </template>
    </Column>

    <Column header="Annual Maintenance Cost">
      <template #body="{ data: investment }: { data: Investment }">
        <PercentageText :value="investment.annualMaintenanceCostPercentage" />
        (effective)
      </template>
    </Column>

    <Column header="Monthly Maintenance Cost">
      <template #body="{ data: investment }: { data: Investment }">
        <PercentageText :value="investment.monthlyMaintenanceCostPercentage" />
      </template>
    </Column>

    <Column header="Cash Out Fee">
      <template #body="{ data: investment }: { data: Investment }">
        <PercentageText :value="investment.cashOutFeePercentage" />
      </template>
    </Column>

    <Column body-class="text-right">
      <template #body="{ data: investment, index }: { data: Investment; index: number }">
        <div class="space-x-4">
          <button role="button" class="primary-link" @click="onEditInvestment(investment)">
            Edit
          </button>

          <button role="button" class="primary-link" @click="onRemoveInvestment(index)">
            Remove
          </button>
        </div>
      </template>
    </Column>
  </DataTable>

  <InvestmentModal
    :investment="editInvestment"
    @update:investment="onSaveInvestment"
    v-model:visible="showInvestmentModal"
  />
</template>
