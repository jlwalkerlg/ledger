<script setup lang="ts">
import { Column, DataTable } from 'primevue'
import CurrencyText from './CurrencyText.vue'
import PercentageText from './PercentageText.vue'
import { ref } from 'vue'
import type { Loan } from './LoanModal.vue'
import LoanModal from './LoanModal.vue'

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

const onRemoveLoan = (index: number) => {
  loans.value = loans.value.filter((_, l) => l !== index)
  editLoan.value = undefined
}

const onSaveLoan = (loan: Loan) => {
  if (editLoan.value) {
    loans.value = loans.value.map((l) => (l === editLoan.value ? loan : l))
  } else {
    loans.value = [...loans.value, loan]
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

    <Column header="Name">
      <template #body="{ data: loan }: { data: Loan }">
        {{ loan.name }}
      </template>
    </Column>

    <Column header="Amount">
      <template #body="{ data: loan }: { data: Loan }">
        <CurrencyText :value="loan.amount" />
      </template>
    </Column>

    <Column header="Annual Interest Rate">
      <template #body="{ data: loan }: { data: Loan }">
        <PercentageText :value="loan.annualInterestRatePercentage" />
      </template>
    </Column>

    <Column header="Monthly Interest Rate">
      <template #body="{ data: loan }: { data: Loan }">
        <PercentageText :value="loan.monthlyInterestRatePercentage" />
      </template>
    </Column>

    <Column header="Term">
      <template #body="{ data: loan }: { data: Loan }">{{ loan.term }} years</template>
    </Column>

    <Column header="Monthly Payment">
      <template #body="{ data: loan }: { data: Loan }">
        <CurrencyText :value="loan.monthlyPayment" />
      </template>
    </Column>

    <Column body-class="text-right">
      <template #body="{ data: loan, index }: { data: Loan; index: number }">
        <div class="space-x-4">
          <button role="button" class="primary-link" @click="onEditLoan(loan)">Edit</button>

          <button role="button" class="primary-link" @click="onRemoveLoan(index)">Remove</button>
        </div>
      </template>
    </Column>
  </DataTable>

  <LoanModal :loan="editLoan" @update:loan="onSaveLoan" v-model:visible="showLoanModal" />
</template>
