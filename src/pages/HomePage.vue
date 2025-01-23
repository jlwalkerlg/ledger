<script setup lang="ts">
import AppLayout from '@/components/AppLayout.vue'
import AppPanel from '@/components/AppPanel.vue'
import InvestmentsTable from '@/components/InvestmentsTable.vue'
import LoansTable from '@/components/LoansTable.vue'
import type { Investment } from '@/models/investments'
import type { Loan } from '@/models/loans'
import { getMonthlyInterestRatePercentage } from '@/utils/maths'
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
  {
    id: uniqueId(),
    name: 'ISA',
    initialValue: 20000,
    purchaseFee: {
      type: 'flat',
      value: 0,
    },
    monthlyContribution: 0,
    growthRate: {
      type: 'nominal',
      yearlyPercentage: 4.02,
      monthlyPercentage: getMonthlyInterestRatePercentage(4.02, 'nominal'),
    },
    maintenanceCost: {
      yearlyPercentage: 0,
      monthlyPercentage: getMonthlyInterestRatePercentage(0, 'effective'),
    },
    cashOutFeePercentage: 0,
  },
  // {
  //   id: uniqueId(),
  //   name: 'House',
  //   initialValue: 100000,
  //   purchaseFeeType: 'percentage',
  //   purchaseFeePercentage: 0,
  //   purchaseFeeAmount: 0,
  //   monthlyContribution: 0,
  //   annualGrowthRatePercentage: 1,
  //   growthRateType: 'effective',
  //   monthlyGrowthRatePercentage: getMonthlyInterestRatePercentage(1, 'effective'),
  //   annualMaintenanceCostPercentage: 0,
  //   monthlyMaintenanceCostPercentage: getMonthlyInterestRatePercentage(0, 'effective'),
  //   cashOutFeePercentage: 0,
  // },
])

const loans = ref<Loan[]>([
  // {
  //   id: uniqueId(),
  //   name: 'Mortgage',
  //   amount: 80000,
  //   annualInterestRatePercentage: 4.5,
  //   interestRateType: 'nominal',
  //   monthlyInterestRatePercentage: getMonthlyInterestRatePercentage(4.5, 'nominal'),
  //   term: 15,
  //   monthlyPayment: getMonthlyLoanPayment(80000, 4.5, 'nominal', 15),
  // },
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

const { items } = useBreakdown(years, investments, loans)

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
