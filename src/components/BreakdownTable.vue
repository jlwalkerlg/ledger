<script setup lang="ts">
import type { Investment } from '@/models/investments'
import type { Loan } from '@/models/loans'
import type { FormattedBreakdownItem } from '@/pages/use-breakdown'
import { Column, ColumnGroup, DataTable, Row } from 'primevue'

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
        <Column v-if="columnCounts['summary.cash_available']" :rowspan="2">
          <template #header>
            <span class="p-datatable-column-title align-middle">Cash Available </span>
            <i
              class="pi pi-info-circle align-middle ml-1"
              v-tooltip="{
                value:
                  'This is how much cash you\'d have if you cashed out on all of your investments and payed off all of your remaining debt.',
                autoHide: false,
              }"
            ></i>
          </template>
        </Column>
        <Column v-if="columnCounts['summary.cash_profit']" :rowspan="2">
          <template #header>
            <span class="p-datatable-column-title align-middle">Cash Profit </span>
            <i
              class="pi pi-info-circle align-middle ml-1"
              v-tooltip="{
                value:
                  'This is how much better off you\'d be if you cashed out on all your properties and paid off all of your debts versus never making any investments.',
                autoHide: false,
              }"
            ></i>
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
              v-if="columnCounts[`investment.${investment.id}.total_contributions`]"
              header="Total Contributions"
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

    <Column v-if="columnCounts['time.months']" :field="(row) => row.months" />
    <Column v-if="columnCounts['time.years']" :field="(row) => row.years" />
    <Column v-if="columnCounts['time.month']" :field="(row) => row.month" />
    <Column v-if="columnCounts['time.year']" :field="(row) => row.year" />

    <template v-for="(investment, index) of investments" :key="investment.id">
      <template v-if="columnCounts[`investment.${investment.id}`]">
        <Column
          v-if="columnCounts[`investment.${investment.id}.value`]"
          :field="(row) => row.investments[index].value"
        />
        <Column
          v-if="columnCounts[`investment.${investment.id}.initial_purchase_fee`]"
          :field="(row) => row.investments[index].initialPurchaseFee"
        />
        <Column
          v-if="columnCounts[`investment.${investment.id}.initial_purchase_price`]"
          :field="(row) => row.investments[index].initialPurchasePrice"
        />
        <Column
          v-if="columnCounts[`investment.${investment.id}.total_contributions`]"
          :field="(row) => row.investments[index].totalContributions"
        />
        <Column
          v-if="columnCounts[`investment.${investment.id}.interest_accrued`]"
          :field="(row) => row.investments[index].interestAccrued"
        />
        <Column
          v-if="columnCounts[`investment.${investment.id}.maintenance_cost`]"
          :field="(row) => row.investments[index].monthlyMaintenanceCost"
        />
        <Column
          v-if="columnCounts[`investment.${investment.id}.maintenance_cash_spent`]"
          :field="(row) => row.investments[index].maintenanceCashSpent"
        />
        <Column
          v-if="columnCounts[`investment.${investment.id}.cash_out_fee`]"
          :field="(row) => row.investments[index].cashOutFee"
        />
        <Column
          v-if="columnCounts[`investment.${investment.id}.cash_out_value`]"
          :field="(row) => row.investments[index].cashOutValue"
        />
      </template>
    </template>

    <template v-for="(loan, index) of loans" :key="loan.id">
      <template v-if="columnCounts[`loan.${loan.id}`]">
        <Column
          v-if="columnCounts[`loan.${loan.id}.debt`]"
          :field="(row) => row.loans[index].debt"
        />
        <Column
          v-if="columnCounts[`loan.${loan.id}.paid`]"
          :field="(row) => row.loans[index].paid"
        />
        <Column
          v-if="columnCounts[`loan.${loan.id}.interest_accrued`]"
          :field="(row) => row.loans[index].interestAccrued"
        />
      </template>
    </template>

    <Column
      v-if="columnCounts['summary.cash_available']"
      :field="(row) => row.cashAvailable"
      class="whitespace-nowrap"
    />
    <Column
      v-if="columnCounts['summary.cash_profit']"
      :field="(row) => row.cashProfit"
      class="whitespace-nowrap"
    />
  </DataTable>
</template>
