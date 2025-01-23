<script setup lang="ts">
import { Column, DataTable } from 'primevue'
import CurrencyText from './CurrencyText.vue'
import PercentageText from './PercentageText.vue'
import { ref } from 'vue'
import LoanModal from './LoanModal.vue'
import InterestRateText from './InterestRateText.vue'
import type { Loan } from '@/models/loans'
import glossary from '@/glossary.json'
import InfoIcon from './InfoIcon.vue'

const emit = defineEmits<{
  (e: 'add-loan', loan: Loan): void
  (e: 'remove-loan', loan: Loan): void
}>()

const loans = defineModel<Loan[]>({
  required: true,
})

const editLoan = ref<Loan>()
const showLoanModal = ref(false)

const onAddLoan = () => {
  editLoan.value = undefined
  showLoanModal.value = true
}

const onEditLoan = (loan: Loan) => {
  editLoan.value = loan
  showLoanModal.value = true
}

const onRemoveLoan = (loan: Loan) => {
  loans.value = loans.value.filter((l) => l.id !== loan.id)
  editLoan.value = undefined
  emit('remove-loan', loan)
}

const onSaveLoan = (loan: Loan) => {
  if (editLoan.value) {
    loans.value = loans.value.map((l) => (l.id === editLoan.value?.id ? loan : l))
  } else {
    loans.value = [...loans.value, loan]
    emit('add-loan', loan)
  }
  showLoanModal.value = false
}
</script>

<template>
  <DataTable :value="loans" :show-headers="loans.length > 0">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="heading">Loans</div>
        <button type="button" @click="onAddLoan" class="primary-link">Add</button>
      </div>
    </template>

    <template #empty>No loans to show.</template>

    <Column header="Name">
      <template #body="{ data: loan }: { data: Loan }">
        {{ loan.name }}
      </template>
    </Column>

    <Column>
      <template #header>
        <div>
          <span class="p-datatable-column-title">Amount </span>
          <InfoIcon :tooltip="glossary.loans.amount" />
        </div>
      </template>

      <template #body="{ data: loan }: { data: Loan }">
        <CurrencyText :value="loan.amount" />
      </template>
    </Column>

    <Column>
      <template #header>
        <div>
          <span class="p-datatable-column-title">Interest Rate </span>
          <InfoIcon :tooltip="glossary.loans.interest_rate" />
        </div>
      </template>

      <template #body="{ data: loan }: { data: Loan }">
        <InterestRateText :value="loan.interestRate" />
      </template>
    </Column>

    <Column header="Annual Interest Rate">
      <template #body="{ data: loan }: { data: Loan }">
        <PercentageText :value="loan.interestRate.yearlyPercentage" />
        ({{ loan.interestRate.type }})
      </template>
    </Column>

    <Column header="Monthly Interest Rate">
      <template #body="{ data: loan }: { data: Loan }">
        <PercentageText :value="loan.interestRate.monthlyPercentage" />
      </template>
    </Column>

    <Column>
      <template #header>
        <div>
          <span class="p-datatable-column-title">Term </span>
          <InfoIcon :tooltip="glossary.loans.term" />
        </div>
      </template>

      <template #body="{ data: loan }: { data: Loan }">{{ loan.term }} years</template>
    </Column>

    <Column header="Monthly Payment">
      <template #body="{ data: loan }: { data: Loan }">
        <CurrencyText :value="loan.monthlyPayment" />
      </template>
    </Column>

    <Column body-class="text-right">
      <template #body="{ data: loan }: { data: Loan }">
        <div class="space-x-4">
          <button role="button" class="primary-link" @click="onEditLoan(loan)">Edit</button>

          <button role="button" class="primary-link" @click="onRemoveLoan(loan)">Remove</button>
        </div>
      </template>
    </Column>
  </DataTable>

  <LoanModal :loan="editLoan" @update:loan="onSaveLoan" v-model:visible="showLoanModal" />
</template>
