<script setup lang="ts">
import AppLayout from '@/components/AppLayout.vue'
import AppPanel from '@/components/AppPanel.vue'
import InvestmentsTable from '@/components/InvestmentsTable.vue'
import LoansTable from '@/components/LoansTable.vue'
import type { Investment } from '@/models/investments'
import type { Loan } from '@/models/loans'
import { getMonthlyInterestRatePercentage, getMonthlyLoanPayment } from '@/utils/maths'
import uniqueId from 'lodash-es/uniqueId'
import { InputGroup, InputGroupAddon, InputNumber, Message, ScrollTop } from 'primevue'
import { computed, ref } from 'vue'
import { useColumns } from './use-columns'
import { useGroupBy } from './use-group-by'
import { useBreakdown } from './use-breakdown'
import BreakdownTable from '@/components/BreakdownTable.vue'
import ColumnSelect from '@/components/ColumnSelect.vue'
import GroupBySelect from '@/components/GroupBySelect.vue'

const years = ref(5)

const investments = ref<Investment[]>([
  // {
  //   id: uniqueId(),
  //   name: 'ISA',
  //   initialValue: 20000,
  //   purchaseFeeType: 'flat',
  //   purchaseFeePercentage: 0,
  //   purchaseFeeAmount: 10,
  //   monthlyContribution: 400,
  //   annualGrowthRatePercentage: 4.02,
  //   growthRateType: 'nominal',
  //   monthlyGrowthRatePercentage: getMonthlyInterestRatePercentage(4.02, 'nominal'),
  //   annualMaintenanceCostPercentage: 0,
  //   monthlyMaintenanceCostPercentage: getMonthlyInterestRatePercentage(0, 'effective'),
  //   cashOutFeePercentage: 0,
  // },
  {
    id: uniqueId(),
    name: 'House',
    initialValue: 100000,
    purchaseFeeType: 'percentage',
    purchaseFeePercentage: 5,
    purchaseFeeAmount: 0,
    monthlyContribution: 0,
    annualGrowthRatePercentage: 5,
    growthRateType: 'effective',
    monthlyGrowthRatePercentage: getMonthlyInterestRatePercentage(5, 'effective'),
    annualMaintenanceCostPercentage: 1,
    monthlyMaintenanceCostPercentage: getMonthlyInterestRatePercentage(1, 'effective'),
    cashOutFeePercentage: 5,
  },
])

const loans = ref<Loan[]>([
  {
    id: uniqueId(),
    name: 'Mortgage',
    amount: 80000,
    annualInterestRatePercentage: 4.5,
    interestRateType: 'nominal',
    monthlyInterestRatePercentage: getMonthlyInterestRatePercentage(4.5, 'nominal'),
    term: 15,
    monthlyPayment: getMonthlyLoanPayment(80000, 4.5, 'nominal', 15),
  },
  // {
  //   name: 'Loan',
  //   amount: 2000,
  //   annualInterestRatePercentage: 10,
  //   monthlyInterestRatePercentage: getMonthlyInterestRatePercentage(10, 'effective'),
  //   interestRateType: 'effective',
  //   term: 3,
  //   monthlyPayment: getMonthlyLoanPayment(2000, 10, 'effective', 3),
  // },
])

const {
  columns,
  columnCounts,
  columnOptions,
  addInvestmentColumns,
  removeInvestmentColumns,
  addLoanColumns,
  removeLoanColumns,
} = useColumns(investments, loans)

const { value: groupBy, options: groupByOptions } = useGroupBy()

const { initialCashAvailable, items } = useBreakdown(years, investments, loans)

const rows = computed(() => {
  if (groupBy.value === 'years') {
    return items.value.filter((row) => row.months % 12 === 0)
  }

  return items.value
})
</script>

<template>
  <AppLayout>
    <main class="section space-y-4">
      <AppPanel heading="Settings">
        <div class="space-y-4">
          <div class="space-y-2">
            <label for="years">Period</label>
            <InputGroup>
              <InputNumber input-id="years" v-model="years" :min="1" :max-fraction-digits="0" />
              <InputGroupAddon>years</InputGroupAddon>
            </InputGroup>
            <Message size="small" severity="secondary" variant="simple">
              Enter how many years you want to show.
            </Message>
          </div>
        </div>
      </AppPanel>

      <InvestmentsTable
        v-model="investments"
        @add-investment="addInvestmentColumns"
        @remove-investment="removeInvestmentColumns"
      />

      <LoansTable v-model="loans" @add-loan="addLoanColumns" @remove-loan="removeLoanColumns" />

      <AppPanel heading="Initial Values">
        <div class="space-y-4">
          <div class="space-y-2">
            <label for="initial_cash_available">Cash Available</label>
            <InputGroup>
              <InputGroupAddon>£</InputGroupAddon>
              <InputNumber
                input-id="initial_cash_available"
                :model-value="initialCashAvailable"
                disabled
                :min-fraction-digits="2"
                :max-fraction-digits="2"
              />
            </InputGroup>
            <Message size="small" severity="secondary" variant="simple">
              The cash you'll need upfront need is the sum of the money that's missing each time you
              purchase an investment. For example, if you purchase a property worth £100,000 without
              taking a loan, then you'll need £100,000 in cash. If you purchase a property worth
              £100,000 using a loan of £80,000, then sell the property for a profit of £10,000 and
              buy another property for £20,000, then you'll need to start with £30,000 in cash.
            </Message>
          </div>
        </div>
      </AppPanel>

      <AppPanel heading="Results">
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-4">
            <div class="font-medium">Columns:</div>

            <ColumnSelect v-model="columns" :options="columnOptions" />
          </div>

          <div class="flex items-center gap-4">
            <div class="font-medium">Group By:</div>

            <GroupBySelect v-model="groupBy" :options="groupByOptions" />
          </div>
        </div>

        <BreakdownTable
          :investments="investments"
          :loans="loans"
          :rows="rows"
          :column-counts="columnCounts"
        />
      </AppPanel>
    </main>

    <ScrollTop />
  </AppLayout>
</template>
