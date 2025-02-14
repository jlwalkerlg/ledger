<script setup lang="ts">
import { Column, DataTable } from 'primevue'
import CurrencyText from './CurrencyText.vue'
import { ref } from 'vue'
import InvestmentModal from './InvestmentModal.vue'
import PercentageText from './PercentageText.vue'
import type { Investment } from '@/models/investments'
import InterestRateText from './InterestRateText.vue'
import InfoIcon from './InfoIcon.vue'
import glossary from '@/glossary.json'

const emit = defineEmits<{
  (e: 'add-investment', investment: Investment): void
  (e: 'remove-investment', investment: Investment): void
}>()

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

const onRemoveInvestment = (investment: Investment) => {
  investments.value = investments.value.filter((i) => i.id !== investment.id)
  emit('remove-investment', investment)
  editInvestment.value = undefined
}

const onSaveInvestment = (investment: Investment) => {
  if (editInvestment.value) {
    investments.value = investments.value.map((i) =>
      i.id === editInvestment.value?.id ? investment : i,
    )
  } else {
    investments.value = [...investments.value, investment]
    emit('add-investment', investment)
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

    <template #empty>No investments to show.</template>

    <Column header="Name">
      <template #body="{ data: investment }: { data: Investment }">
        {{ investment.name }}
      </template>
    </Column>

    <Column>
      <template #header>
        <div>
          <span class="p-datatable-column-title">Initial Value </span>
          <InfoIcon :tooltip="glossary.investments.initial_value" />
        </div>
      </template>

      <template #body="{ data: investment }: { data: Investment }">
        <CurrencyText :value="investment.initialValue" />
      </template>
    </Column>

    <Column>
      <template #header>
        <div>
          <span class="p-datatable-column-title">Purchase Fee </span>
          <InfoIcon :tooltip="glossary.investments.purchase_fee" />
        </div>
      </template>

      <template #body="{ data: investment }: { data: Investment }">
        <PercentageText
          v-if="investment.purchaseFee.type === 'percentage'"
          :value="investment.purchaseFee.value"
        />
        <CurrencyText v-else :value="investment.purchaseFee.value" />
      </template>
    </Column>

    <Column>
      <template #header>
        <div>
          <span class="p-datatable-column-title">Monthly Contribution </span>
          <InfoIcon :tooltip="glossary.investments.monthly_contribution" />
        </div>
      </template>

      <template #body="{ data: investment }: { data: Investment }">
        <CurrencyText :value="investment.monthlyContribution" />
      </template>
    </Column>

    <Column>
      <template #header>
        <div>
          <span class="p-datatable-column-title">Growth Rate </span>
          <InfoIcon :tooltip="glossary.investments.growth_rate" />
        </div>
      </template>

      <template #body="{ data: investment }: { data: Investment }">
        <InterestRateText :value="investment.growthRate" />
      </template>
    </Column>

    <Column>
      <template #header>
        <div>
          <span class="p-datatable-column-title">Maintenance Cost </span>
          <InfoIcon :tooltip="glossary.investments.annual_maintenance_cost" />
        </div>
      </template>

      <template #body="{ data: investment }: { data: Investment }">
        <PercentageText :value="investment.maintenanceCost.yearlyPercentage" /> per year
        (<PercentageText :value="investment.maintenanceCost.monthlyPercentage" /> per month)
      </template>
    </Column>

    <Column>
      <template #header>
        <div>
          <span class="p-datatable-column-title">Cash Out Fee </span>
          <InfoIcon :tooltip="glossary.investments.cash_out_fee" />
        </div>
      </template>

      <template #body="{ data: investment }: { data: Investment }">
        <PercentageText
          v-if="investment.cashOutFee.type === 'percentage'"
          :value="investment.cashOutFee.value"
        />
        <template v-else>
          <CurrencyText :value="investment.cashOutFee.value" />
          <span v-if="investment.cashOutFee.growthRate" class="lowercase">
            +
            <InterestRateText :value="investment.cashOutFee.growthRate" />
          </span>
        </template>
      </template>
    </Column>

    <Column body-class="text-right">
      <template #body="{ data: investment }: { data: Investment }">
        <div class="space-x-4">
          <button role="button" class="primary-link" @click="onEditInvestment(investment)">
            Edit
          </button>

          <button role="button" class="primary-link" @click="onRemoveInvestment(investment)">
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
