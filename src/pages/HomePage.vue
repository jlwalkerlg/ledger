<script setup lang="ts">
import AppLayout from '@/components/AppLayout.vue'
import AppPanel from '@/components/AppPanel.vue'
import InvestmentsTable from '@/components/InvestmentsTable.vue'
import LoansTable from '@/components/LoansTable.vue'
import type { Investment } from '@/models/investments'
import type { Loan } from '@/models/loans'
import { getMonthlyInterestRatePercentage, getMonthlyLoanPayment } from '@/utils/maths'
import uniqueId from 'lodash-es/uniqueId'
import { InputGroup, InputGroupAddon, InputNumber, ScrollTop } from 'primevue'
import { computed, ref } from 'vue'
import { useColumns } from './use-columns'
import { useGroupBy } from './use-group-by'
import { useBreakdown } from './use-breakdown'
import BreakdownTable from '@/components/BreakdownTable.vue'
import ColumnSelect from '@/components/ColumnSelect.vue'
import GroupBySelect from '@/components/GroupBySelect.vue'

const years = ref(10)

const investments = ref<Investment[]>([
  {
    id: uniqueId(),
    name: 'House',
    initialValue: 100000,
    purchaseFee: {
      type: 'percentage',
      value: 5,
    },
    monthlyContribution: 0,
    growthRate: {
      type: 'nominal',
      yearlyPercentage: 5,
      monthlyPercentage: getMonthlyInterestRatePercentage(5, 'nominal'),
    },
    maintenanceCost: {
      yearlyPercentage: 1,
      monthlyPercentage: getMonthlyInterestRatePercentage(1, 'effective'),
    },
    cashOutFee: {
      type: 'percentage',
      value: 5,
    },
  },
])

const loans = ref<Loan[]>([
  {
    id: uniqueId(),
    name: 'Mortgage',
    amount: 60000,
    interestRate: {
      type: 'nominal',
      yearlyPercentage: 4.5,
      monthlyPercentage: getMonthlyInterestRatePercentage(4.5, 'nominal'),
    },
    term: 5,
    monthlyPayment: getMonthlyLoanPayment(60000, 4.5, 'nominal', 5),
  },
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
