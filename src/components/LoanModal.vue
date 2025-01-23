<script setup lang="ts">
import { NAMED_INTEREST_RATE_TYPES, type InterestRateType } from '@/models/interest-rates'
import type { Loan } from '@/models/loans'
import { getMonthlyInterestRatePercentage, getMonthlyLoanPayment } from '@/utils/maths'
import uniqueId from 'lodash-es/uniqueId'
import {
  Button,
  Dialog,
  InputGroup,
  InputGroupAddon,
  InputNumber,
  InputText,
  Message,
  Select,
} from 'primevue'
import { computed, ref, watch } from 'vue'

const defaults = {
  name: 'Mortgage',
  amount: 130000,
  interestRate: {
    type: 'nominal' as InterestRateType,
    yearlyPercentage: 4.5,
  },
  term: 10,
}

const { loan } = defineProps<{
  loan?: Loan
}>()

const emit = defineEmits<{
  (e: 'update:loan', value: Loan): void
}>()

const visible = defineModel<boolean>('visible')

const name = ref(loan?.name ?? defaults.name)
const amount = ref(loan?.amount ?? defaults.amount)
const interestRate = ref({
  type: loan?.interestRate.type ?? defaults.interestRate.type,
  yearlyPercentage: loan?.interestRate.yearlyPercentage ?? defaults.interestRate.yearlyPercentage,
})
const term = ref(loan?.term ?? defaults.term)

const monthlyInterestRatePercentage = computed(() =>
  getMonthlyInterestRatePercentage(interestRate.value.yearlyPercentage, interestRate.value.type),
)

const monthlyPayment = computed(() =>
  getMonthlyLoanPayment(
    amount.value,
    interestRate.value.yearlyPercentage,
    interestRate.value.type,
    term.value,
  ),
)

const onCancel = () => {
  visible.value = false
}

const onSave = () => {
  emit('update:loan', {
    id: loan?.id ?? uniqueId(),
    name: name.value,
    amount: amount.value,
    interestRate: {
      type: interestRate.value.type,
      yearlyPercentage: interestRate.value.yearlyPercentage,
      monthlyPercentage: monthlyInterestRatePercentage.value,
    },
    term: term.value,
    monthlyPayment: monthlyPayment.value,
  })
  visible.value = false
}

watch(visible, (visible) => {
  if (visible) {
    name.value = loan?.name ?? defaults.name
    amount.value = loan?.amount ?? defaults.amount
    interestRate.value.type = loan?.interestRate.type ?? defaults.interestRate.type
    interestRate.value.yearlyPercentage =
      loan?.interestRate.yearlyPercentage ?? defaults.interestRate.yearlyPercentage
    term.value = loan?.term ?? defaults.term
  }
})
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="loan ? 'Edit Loan' : 'Add Loan'"
    :draggable="false"
    dismissableMask
  >
    <form class="space-y-4" @submit.prevent="onSave">
      <div class="space-y-2">
        <label for="loan_name">Name</label>
        <InputGroup>
          <InputText
            id="loan_name"
            v-model="name"
            placeholder="Mortgage"
            :pt="{ root: { autofocus: true } }"
          />
        </InputGroup>
        <Message size="small" severity="secondary" variant="simple">
          Enter a name for the loan.
        </Message>
      </div>

      <div class="space-y-2">
        <label for="amount">Amount</label>
        <InputGroup>
          <InputGroupAddon>£</InputGroupAddon>
          <InputNumber
            input-id="amount"
            v-model="amount"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
          />
        </InputGroup>
        <Message size="small" severity="secondary" variant="simple">
          Enter the loan amount.
        </Message>
      </div>

      <div class="space-y-2">
        <label for="interest_rate_type">Interest Rate Type</label>
        <InputGroup>
          <Select
            label-id="interest_rate_type"
            v-model="interestRate.type"
            :options="NAMED_INTEREST_RATE_TYPES"
            :option-label="(option) => option.name"
            :option-value="(option) => option.value"
          />
        </InputGroup>
        <Message size="small" severity="secondary" variant="simple">
          Select the type of interest rate.
        </Message>
      </div>

      <div class="space-y-2">
        <label for="annual_interest_rate_percentage">Annual Interest Rate</label>
        <InputGroup>
          <InputNumber
            input-id="annual_interest_rate_percentage"
            v-model="interestRate.yearlyPercentage"
            :min="0"
            :max="100"
            :max-fraction-digits="2"
          />
          <InputGroupAddon>%</InputGroupAddon>
        </InputGroup>
        <Message size="small" severity="secondary" variant="simple">
          Enter the annual interest rate for the loan.
        </Message>
      </div>

      <div class="space-y-2">
        <label for="monthly_interest_rate_percentage">Monthly Interest Rate</label>
        <InputGroup>
          <InputNumber
            input-id="monthly_interest_rate_percentage"
            :model-value="monthlyInterestRatePercentage"
            :max-fraction-digits="2"
            disabled
          />
          <InputGroupAddon>%</InputGroupAddon>
        </InputGroup>
        <Message size="small" severity="secondary" variant="simple">
          This is the monthly interest rate for the loan.
        </Message>
      </div>

      <div class="space-y-2">
        <label for="term">Term</label>
        <InputGroup>
          <InputNumber input-id="term" v-model="term" :max-fraction-digits="0" />
          <InputGroupAddon>years</InputGroupAddon>
        </InputGroup>
        <Message size="small" severity="secondary" variant="simple">
          Enter the term of the loan in years.
        </Message>
      </div>

      <div class="space-y-2">
        <label for="monthly_payment">Monthly Payment</label>
        <InputGroup>
          <InputGroupAddon>£</InputGroupAddon>
          <InputNumber
            input-id="monthly_payment"
            :model-value="monthlyPayment"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
            disabled
          />
        </InputGroup>
        <Message size="small" severity="secondary" variant="simple">
          This is how much you will pay back per month.
        </Message>
      </div>

      <div class="flex items-center justify-end gap-4">
        <Button type="button" variant="outlined" @click="onCancel">Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  </Dialog>
</template>
