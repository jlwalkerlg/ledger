<script setup lang="ts">
import type { Investment } from '@/models/investments'
import type { Loan } from '@/models/loans'
import type { FormattedBreakdownItem } from '@/pages/use-breakdown'
import { Column, ColumnGroup, DataTable, Row } from 'primevue'
import InfoIcon from './InfoIcon.vue'
import glossary from '@/glossary.json'

defineProps<{
  investments: Investment[]
  loans: Loan[]
  rows: FormattedBreakdownItem[]
  columnCounts: Record<string, number>
}>()
</script>

<template>
  <DataTable
    :value="rows"
    scrollable
    scrollHeight="500px"
    :virtual-scroller-options="{ itemSize: 46 }"
    class="mt-4"
  >
    <ColumnGroup type="header">
      <Row>
        <Column v-if="columnCounts['time.months']" header="Months" :rowspan="2" />
        <Column v-if="columnCounts['time.years']" header="Years" :rowspan="2" />
        <Column v-if="columnCounts['time.month']" header="Month" :rowspan="2" />
        <Column v-if="columnCounts['time.year']" header="Year" :rowspan="2" />
        <template v-for="investment of investments" :key="investment.id">
          <Column
            v-if="columnCounts[`investment.${investment.id}`]"
            :header="investment.name"
            :colspan="columnCounts[`investment.${investment.id}`]"
          />
        </template>
        <template v-for="loan of loans" :key="loan.id">
          <Column
            v-if="columnCounts[`loan.${loan.id}`]"
            :header="loan.name"
            :colspan="columnCounts[`loan.${loan.id}`]"
          />
        </template>
        <Column v-if="columnCounts['summary.equity']" :rowspan="2">
          <template #header>
            <div>
              <span class="p-datatable-column-title">Equity </span>
              <InfoIcon :tooltip="glossary.equity" />
            </div>
          </template>
        </Column>
        <Column v-if="columnCounts['summary.profit']" :rowspan="2">
          <template #header>
            <div>
              <span class="p-datatable-column-title">Profit </span>
              <InfoIcon :tooltip="glossary.profit" />
            </div>
          </template>
        </Column>
        <Column v-if="columnCounts['summary.cash_spent']" :rowspan="2">
          <template #header>
            <div>
              <span class="p-datatable-column-title">Cash Spent </span>
              <InfoIcon :tooltip="glossary.cash_spent" />
            </div>
          </template>
        </Column>
      </Row>
      <Row>
        <template v-for="investment of investments" :key="investment.id">
          <template v-if="columnCounts[`investment.${investment.id}`]">
            <Column v-if="columnCounts[`investment.${investment.id}.value`]" header="Value" />
            <Column
              v-if="columnCounts[`investment.${investment.id}.initial_purchase_fee`]"
              header="Initial Purchase Fee"
            />
            <Column
              v-if="columnCounts[`investment.${investment.id}.initial_purchase_price`]"
              header="Initial Purchase Price"
            />
            <Column
              v-if="columnCounts[`investment.${investment.id}.total_contributed`]"
              header="Total Contributed"
            />
            <Column
              v-if="columnCounts[`investment.${investment.id}.interest_accrued`]"
              header="Interest Accrued"
            />
            <Column
              v-if="columnCounts[`investment.${investment.id}.maintenance_cost`]"
              header="Maintenance Cost"
            />
            <Column
              v-if="columnCounts[`investment.${investment.id}.maintenance_cash_spent`]"
              header="Maintenance Cash Spent"
            />
            <Column
              v-if="columnCounts[`investment.${investment.id}.cash_out_fee`]"
              header="Cash Out Fee"
            />
            <Column
              v-if="columnCounts[`investment.${investment.id}.cash_out_value`]"
              header="Cash Out Value"
            />
          </template>
        </template>
        <template v-for="loan of loans" :key="loan.id">
          <template v-if="columnCounts[`loan.${loan.id}`]">
            <Column v-if="columnCounts[`loan.${loan.id}.debt`]" header="Debt" />
            <Column v-if="columnCounts[`loan.${loan.id}.paid`]" header="Paid" />
            <Column
              v-if="columnCounts[`loan.${loan.id}.interest_accrued`]"
              header="Interest Accrued"
            />
          </template>
        </template>
      </Row>
    </ColumnGroup>

    <Column
      v-if="columnCounts['time.months']"
      :field="(row: FormattedBreakdownItem) => row.months.toString()"
    />
    <Column
      v-if="columnCounts['time.years']"
      :field="(row: FormattedBreakdownItem) => row.years.toString()"
    />
    <Column
      v-if="columnCounts['time.month']"
      :field="(row: FormattedBreakdownItem) => row.month.toString()"
    />
    <Column
      v-if="columnCounts['time.year']"
      :field="(row: FormattedBreakdownItem) => row.year.toString()"
    />

    <template v-for="(investment, index) of investments" :key="investment.id">
      <template v-if="columnCounts[`investment.${investment.id}`]">
        <Column
          v-if="columnCounts[`investment.${investment.id}.value`]"
          :field="(row: FormattedBreakdownItem) => row.investments[index].value"
        />
        <Column
          v-if="columnCounts[`investment.${investment.id}.initial_purchase_fee`]"
          :field="(row: FormattedBreakdownItem) => row.investments[index].initialPurchaseFee"
        />
        <Column
          v-if="columnCounts[`investment.${investment.id}.initial_purchase_price`]"
          :field="(row: FormattedBreakdownItem) => row.investments[index].initialPurchasePrice"
        />
        <Column
          v-if="columnCounts[`investment.${investment.id}.total_contributed`]"
          :field="(row: FormattedBreakdownItem) => row.investments[index].totalContributed"
        />
        <Column
          v-if="columnCounts[`investment.${investment.id}.interest_accrued`]"
          :field="(row: FormattedBreakdownItem) => row.investments[index].interestAccrued"
        />
        <Column
          v-if="columnCounts[`investment.${investment.id}.maintenance_cost`]"
          :field="(row: FormattedBreakdownItem) => row.investments[index].monthlyMaintenanceCost"
        />
        <Column
          v-if="columnCounts[`investment.${investment.id}.maintenance_cash_spent`]"
          :field="(row: FormattedBreakdownItem) => row.investments[index].maintenanceCashSpent"
        />
        <Column
          v-if="columnCounts[`investment.${investment.id}.cash_out_fee`]"
          :field="(row: FormattedBreakdownItem) => row.investments[index].cashOutFeeAmount"
        />
        <Column
          v-if="columnCounts[`investment.${investment.id}.cash_out_value`]"
          :field="(row: FormattedBreakdownItem) => row.investments[index].cashOutValue"
        />
      </template>
    </template>

    <template v-for="(loan, index) of loans" :key="loan.id">
      <template v-if="columnCounts[`loan.${loan.id}`]">
        <Column
          v-if="columnCounts[`loan.${loan.id}.debt`]"
          :field="(row: FormattedBreakdownItem) => row.loans[index].debt"
        />
        <Column
          v-if="columnCounts[`loan.${loan.id}.paid`]"
          :field="(row: FormattedBreakdownItem) => row.loans[index].paid"
        />
        <Column
          v-if="columnCounts[`loan.${loan.id}.interest_accrued`]"
          :field="(row: FormattedBreakdownItem) => row.loans[index].interestAccrued"
        />
      </template>
    </template>

    <Column
      v-if="columnCounts['summary.equity']"
      :field="(row: FormattedBreakdownItem) => row.equity"
      class="whitespace-nowrap"
    />
    <Column
      v-if="columnCounts['summary.profit']"
      :field="(row: FormattedBreakdownItem) => row.profit"
      class="whitespace-nowrap"
    />
    <Column
      v-if="columnCounts['summary.cash_spent']"
      :field="(row: FormattedBreakdownItem) => row.cashSpent"
      class="whitespace-nowrap"
    />
  </DataTable>
</template>
