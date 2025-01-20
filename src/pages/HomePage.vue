<script setup lang="ts">
import AppLayout from '@/components/AppLayout.vue'
import AppPanel from '@/components/AppPanel.vue'
import InvestmentsTable from '@/components/InvestmentsTable.vue'
import LoansTable from '@/components/LoansTable.vue'
import type { Investment } from '@/models/investments'
import type { Loan } from '@/models/loans'
import { toGbp } from '@/utils/formatters'
import {
  addPercentage,
  getMonthlyInterestRatePercentage,
  getMonthlyLoanPayment,
  percentageOf,
} from '@/utils/maths'
import flatten from 'lodash-es/flatten'
import uniqueId from 'lodash-es/uniqueId'
import {
  Column,
  ColumnGroup,
  DataTable,
  InputGroup,
  InputGroupAddon,
  InputNumber,
  Message,
  MultiSelect,
  Row,
  ScrollTop,
  Select,
} from 'primevue'
import { computed, ref } from 'vue'

const years = ref(5)

const investments = ref<Investment[]>([
  // {
  //   id: uniqueId(),
  //   name: 'ISA',
  //   initialValue: 20000,
  //   purchaseFeePercentage: 0,
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
    purchaseFeePercentage: 5,
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

const totalInvestmentsInitialPurchasePrice = computed(() =>
  investments.value.reduce(
    (prev, curr) => prev + addPercentage(curr.initialValue, curr.purchaseFeePercentage),
    0,
  ),
)

const totalInitialLoanAmount = computed(() =>
  loans.value.reduce((prev, curr) => prev + curr.amount, 0),
)

const initialCashAvailable = computed(
  () => totalInvestmentsInitialPurchasePrice.value - totalInitialLoanAmount.value,
)

const cols = ref([
  'time.years',
  ...flatten(
    investments.value.map((investment) => {
      const group = `investment.${investment.id}`

      return [
        `${group}.value`,
        // `${group}.initial_purchase_fee`,
        // `${group}.initial_purchase_price`,
        `${group}.total_contributions`,
        // `${group}.maintenance_cost`,
        `${group}.maintenance_cash_spent`,
        // `${group}.cash_out_fee`,
        `${group}.cash_out_value`,
      ]
    }),
  ),
  ...flatten(
    loans.value.map((loan) => {
      const group = `loan.${loan.id}`

      return [`${group}.debt`, `${group}.paid`]
    }),
  ),
  'summary.cash_out_value',
  'summary.remaining_debt',
  'summary.cash_available',
  'summary.cash_invested',
  'summary.cash_profit',
])

const colspans = computed(() => {
  const result: Record<string, number> = {}

  for (const col of cols.value) {
    const group = col.slice(0, col.lastIndexOf('.'))

    if (!result[group]) {
      result[group] = 1
    } else {
      result[group]++
    }

    result[col] = 1
  }

  return result
})

type ColGroup = {
  label: string
  items: ColOption[]
}

type ColOption = {
  label: string
  value: string
  group: string
}

const COL_OPTIONS = computed<ColGroup[]>(() => [
  {
    label: 'Time',
    items: [
      { label: 'Months', value: 'time.months', group: 'time' },
      { label: 'Years', value: 'time.years', group: 'time' },
      { label: 'Month', value: 'time.month', group: 'time' },
      { label: 'Year', value: 'time.year', group: 'time' },
    ],
  },
  ...investments.value.map((investment) => {
    const group = `investment.${investment.id}`

    return {
      label: investment.name,
      items: [
        { label: 'Value', value: `${group}.value`, group },
        {
          label: 'Initial Purchase Fee',
          value: `${group}.initial_purchase_fee`,
          group,
        },
        {
          label: 'Initial Purchase Price',
          value: `${group}.initial_purchase_price`,
          group,
        },
        {
          label: 'Total Contributions',
          value: `${group}.total_contributions`,
          group,
        },
        {
          label: 'Maintenance Cost',
          value: `${group}.maintenance_cost`,
          group,
        },
        {
          label: 'Maintenance Cash Spent',
          value: `${group}.maintenance_cash_spent`,
          group,
        },
        {
          label: 'Cash Out Fee',
          value: `${group}.cash_out_fee`,
          group,
        },
        {
          label: 'Cash Out Value',
          value: `${group}.cash_out_value`,
          group,
        },
      ],
    }
  }),
  ...loans.value.map((loan) => {
    const group = `loan.${loan.id}`

    return {
      label: loan.name,
      items: [
        { label: 'Debt', value: `${group}.debt`, group },
        {
          label: 'Paid',
          value: `${group}.paid`,
          group,
        },
      ],
    }
  }),
  {
    label: 'Summary',
    items: [
      { label: 'Cash Out Value', value: 'summary.cash_out_value', group: 'summary' },
      { label: 'Remaining Debt', value: 'summary.remaining_debt', group: 'summary' },
      { label: 'Cash Available', value: 'summary.cash_available', group: 'summary' },
      { label: 'Cash Invested', value: 'summary.cash_invested', group: 'summary' },
      { label: 'Cash Profit', value: 'summary.cash_profit', group: 'summary' },
    ],
  },
])

const groupBy = ref('years')

const GROUP_BY_OPTIONS = [
  { name: 'Months', value: 'months' },
  { name: 'Years', value: 'years' },
]

const breakdown = computed(() => {
  const investmentsBreakdown = investments.value.map((investment) => {
    const id = investment.id
    const name = investment.name
    const value = investment.initialValue
    const initialPurchaseFee = percentageOf(
      investment.initialValue,
      investment.purchaseFeePercentage,
    )
    const initialPurchasePrice = value + initialPurchaseFee
    const monthlyContribution = investment.monthlyContribution
    const totalContributions = 0
    const monthlyGrowthRatePercentage = investment.monthlyGrowthRatePercentage
    const maintenanceCashSpent = 0
    const monthlyMaintenanceCostPercentage = investment.monthlyMaintenanceCostPercentage
    const monthlyMaintenanceCost = percentageOf(
      investment.initialValue,
      investment.monthlyMaintenanceCostPercentage,
    )
    const cashOutFeePercentage = investment.cashOutFeePercentage
    const cashOutFee = percentageOf(investment.initialValue, investment.cashOutFeePercentage)
    const cashOutValue = value - cashOutFee

    return {
      id,
      name,
      value,
      initialPurchaseFee,
      initialPurchasePrice,
      monthlyContribution,
      totalContributions,
      monthlyGrowthRatePercentage,
      maintenanceCashSpent,
      monthlyMaintenanceCostPercentage,
      monthlyMaintenanceCost,
      cashOutFeePercentage,
      cashOutFee,
      cashOutValue,
    }
  })

  const loansBreakdown = loans.value.map((loan) => {
    const id = loan.id
    const name = loan.name
    const debt = loan.amount
    const paid = 0
    const annualInterestRatePercentage = loan.annualInterestRatePercentage
    const monthlyInterestRatePercentage = loan.monthlyInterestRatePercentage
    const term = loan.term
    const monthlyPayment = loan.monthlyPayment

    return {
      id,
      name,
      debt,
      paid,
      annualInterestRatePercentage,
      monthlyInterestRatePercentage,
      term,
      monthlyPayment,
    }
  })

  return Array.from({ length: years.value * 12 + 1 }, (_, months) => {
    const years = Math.floor(months / 12)

    const month = months + 1
    const year = years + 1

    if (months > 0) {
      for (const investment of investmentsBreakdown) {
        investment.totalContributions += investment.monthlyContribution
        investment.value += investment.monthlyContribution
        investment.maintenanceCashSpent += investment.monthlyMaintenanceCost
        investment.value = addPercentage(investment.value, investment.monthlyGrowthRatePercentage)
        investment.monthlyMaintenanceCost = percentageOf(
          investment.value,
          investment.monthlyMaintenanceCostPercentage,
        )
        investment.cashOutFee = percentageOf(investment.value, investment.cashOutFeePercentage)
        investment.cashOutValue = investment.value - investment.cashOutFee
      }

      for (const loan of loansBreakdown) {
        if (years <= loan.term) {
          loan.debt *= 1 + loan.monthlyInterestRatePercentage / 100

          const loanPayment = Math.min(loan.debt, loan.monthlyPayment)
          loan.debt -= loanPayment
          loan.paid += loanPayment
        }
      }
    }

    const cashOutValue = investmentsBreakdown.reduce(
      (prev, curr) => prev + curr.cashOutValue,
      0,
    )

    const totalInvestmentsContributions = investmentsBreakdown.reduce(
      (prev, curr) => prev + curr.totalContributions,
      0,
    )

    const totalMaintenanceCashSpent = investmentsBreakdown.reduce(
      (prev, curr) => prev + curr.maintenanceCashSpent,
      0,
    )

    const remainingDebt = loansBreakdown.reduce((prev, curr) => prev + curr.debt, 0)

    const totalLoanPayments = loansBreakdown.reduce((prev, curr) => prev + curr.paid, 0)

    const cashInvested =
      totalInvestmentsInitialPurchasePrice.value +
      totalInvestmentsContributions +
      totalMaintenanceCashSpent +
      totalLoanPayments -
      totalInitialLoanAmount.value

    const cashAvailable = cashOutValue - remainingDebt

    const cashProfit = cashAvailable - cashInvested

    return {
      months,
      years,
      month,
      year,
      investments: investmentsBreakdown.map((investment) => ({
        id: investment.id,
        name: investment.name,
        value: toGbp(investment.value),
        initialPurchaseFee: toGbp(investment.initialPurchaseFee),
        initialPurchasePrice: toGbp(investment.initialPurchasePrice),
        totalContributions: toGbp(investment.totalContributions),
        monthlyMaintenanceCost: toGbp(investment.monthlyMaintenanceCost),
        maintenanceCashSpent: toGbp(investment.maintenanceCashSpent),
        cashOutFee: toGbp(investment.cashOutFee),
        cashOutValue: toGbp(investment.cashOutValue),
      })),
      loans: loansBreakdown.map((loan) => ({
        id: loan,
        name: loan.name,
        debt: toGbp(loan.debt),
        paid: toGbp(loan.paid),
      })),
      cashOutValue: toGbp(cashOutValue),
      remainingDebt: toGbp(remainingDebt),
      cashAvailable: toGbp(cashAvailable),
      cashInvested: toGbp(Math.max(0, cashInvested)),
      cashProfit: toGbp(cashProfit),
    }
  })
})

const rows = computed(() => {
  if (groupBy.value === 'years') {
    return breakdown.value.filter((row) => row.months % 12 === 0)
  }

  return breakdown.value
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

      <InvestmentsTable v-model="investments" />

      <LoansTable v-model="loans" />

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

            <MultiSelect
              v-model="cols"
              :options="COL_OPTIONS"
              :option-label="(option: ColOption) => option.label"
              :option-value="(option: ColOption) => option.value"
              :option-group-label="(group: ColGroup) => group.label"
              :option-group-children="(group: ColGroup) => group.items"
              :show-toggle-all="false"
              class="w-full md:w-80"
            >
              <template #value="{ value }">{{ value.length }} selected</template>
            </MultiSelect>
          </div>

          <div class="flex items-center gap-4">
            <div class="font-medium">Group By:</div>

            <Select
              v-model="groupBy"
              :options="GROUP_BY_OPTIONS"
              option-label="name"
              option-value="value"
              class="w-full md:w-80"
            />
          </div>
        </div>

        <DataTable
          :value="rows"
          scrollable
          scrollHeight="500px"
          :virtual-scroller-options="{ itemSize: 46 }"
          class="mt-4"
        >
          <ColumnGroup type="header">
            <Row>
              <template v-if="colspans['time']">
                <Column v-if="colspans['time.months']" header="Months" :rowspan="2" />
                <Column v-if="colspans['time.years']" header="Years" :rowspan="2" />
                <Column v-if="colspans['time.month']" header="Month" :rowspan="2" />
                <Column v-if="colspans['time.year']" header="Year" :rowspan="2" />
              </template>
              <template v-for="investment of investments" :key="investment.id">
                <Column
                  v-if="colspans[`investment.${investment.id}`]"
                  :header="investment.name"
                  :colspan="colspans[`investment.${investment.id}`]"
                />
              </template>
              <template v-for="loan of loans" :key="loan.id">
                <Column
                  v-if="colspans[`loan.${loan.id}`]"
                  :header="loan.name"
                  :colspan="colspans[`loan.${loan.id}`]"
                />
              </template>
              <template v-if="colspans['summary']">
                <Column v-if="colspans['summary.cash_out_value']" :rowspan="2">
                  <template #header>
                    <span class="p-datatable-column-title align-middle">Cash Out Value </span>
                    <i
                      class="pi pi-info-circle align-middle ml-1"
                      v-tooltip="{
                        value:
                          'This is the total cash out value from all of your investments.',
                        autoHide: false,
                      }"
                    ></i>
                  </template>
                </Column>
                <Column v-if="colspans['summary.remaining_debt']" :rowspan="2">
                  <template #header>
                    <span class="p-datatable-column-title align-middle">Remaining Debt </span>
                    <i
                      class="pi pi-info-circle align-middle ml-1"
                      v-tooltip="{
                        value:
                          'This is the total debt you still have to pay off.',
                        autoHide: false,
                      }"
                    ></i>
                  </template>
                </Column>
                <Column v-if="colspans['summary.cash_available']" :rowspan="2">
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
                <Column v-if="colspans['summary.cash_invested']" :rowspan="2">
                  <template #header>
                    <span class="p-datatable-column-title align-middle">Cash Invested </span>
                    <i
                      class="pi pi-info-circle align-middle ml-1"
                      v-tooltip="{
                        value:
                          'This is how much cash you\'ve invested so far out of your own pocket, including deposits, purchase fees, monthly contributions, maintenance fees, and monthly loan payments.',
                        autoHide: false,
                      }"
                    ></i>
                  </template>
                </Column>
                <Column v-if="colspans['summary.cash_profit']" :rowspan="2">
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
              </template>
            </Row>
            <Row>
              <template v-for="investment of investments" :key="investment.id">
                <template v-if="colspans[`investment.${investment.id}`]">
                  <Column v-if="colspans[`investment.${investment.id}.value`]" header="Value" />
                  <Column
                    v-if="colspans[`investment.${investment.id}.initial_purchase_fee`]"
                    header="Initial Purchase Fee"
                  />
                  <Column
                    v-if="colspans[`investment.${investment.id}.initial_purchase_price`]"
                    header="Initial Purchase Price"
                  />
                  <Column
                    v-if="colspans[`investment.${investment.id}.total_contributions`]"
                    header="Total Contributions"
                  />
                  <Column
                    v-if="colspans[`investment.${investment.id}.maintenance_cost`]"
                    header="Maintenance Cost"
                  />
                  <Column
                    v-if="colspans[`investment.${investment.id}.maintenance_cash_spent`]"
                    header="Maintenance Cash Spent"
                  />
                  <Column
                    v-if="colspans[`investment.${investment.id}.cash_out_fee`]"
                    header="Cash Out Fee"
                  />
                  <Column
                    v-if="colspans[`investment.${investment.id}.cash_out_value`]"
                    header="Cash Out Value"
                  />
                </template>
              </template>
              <template v-for="loan of loans" :key="loan.id">
                <template v-if="colspans[`loan.${loan.id}`]">
                  <Column v-if="colspans[`loan.${loan.id}.debt`]" header="Debt" />
                  <Column v-if="colspans[`loan.${loan.id}.paid`]" header="Paid" />
                </template>
              </template>
            </Row>
          </ColumnGroup>

          <template v-if="colspans['time']">
            <Column v-if="colspans['time.months']" :field="(row) => row.months" />
            <Column v-if="colspans['time.years']" :field="(row) => row.years" />
            <Column v-if="colspans['time.month']" :field="(row) => row.month" />
            <Column v-if="colspans['time.year']" :field="(row) => row.year" />
          </template>

          <template v-for="(investment, index) of investments" :key="investment.id">
            <template v-if="colspans[`investment.${investment.id}`]">
              <Column
                v-if="colspans[`investment.${investment.id}.value`]"
                :field="(row) => row.investments[index].value"
              />
              <Column
                v-if="colspans[`investment.${investment.id}.initial_purchase_fee`]"
                :field="(row) => row.investments[index].initialPurchaseFee"
              />
              <Column
                v-if="colspans[`investment.${investment.id}.initial_purchase_price`]"
                :field="(row) => row.investments[index].initialPurchasePrice"
              />
              <Column
                v-if="colspans[`investment.${investment.id}.total_contributions`]"
                :field="(row) => row.investments[index].totalContributions"
              />
              <Column
                v-if="colspans[`investment.${investment.id}.maintenance_cost`]"
                :field="(row) => row.investments[index].monthlyMaintenanceCost"
              />
              <Column
                v-if="colspans[`investment.${investment.id}.maintenance_cash_spent`]"
                :field="(row) => row.investments[index].maintenanceCashSpent"
              />
              <Column
                v-if="colspans[`investment.${investment.id}.cash_out_fee`]"
                :field="(row) => row.investments[index].cashOutFee"
              />
              <Column
                v-if="colspans[`investment.${investment.id}.cash_out_value`]"
                :field="(row) => row.investments[index].cashOutValue"
              />
            </template>
          </template>

          <template v-for="(loan, index) of loans" :key="loan.id">
            <template v-if="colspans[`loan.${loan.id}`]">
              <Column
                v-if="colspans[`loan.${loan.id}.debt`]"
                :field="(row) => row.loans[index].debt"
              />
              <Column
                v-if="colspans[`loan.${loan.id}.paid`]"
                :field="(row) => row.loans[index].paid"
              />
            </template>
          </template>

          <template v-if="colspans['summary']">
            <Column v-if="colspans['summary.cash_out_value']" :field="(row) => row.cashOutValue" />
            <Column v-if="colspans['summary.remaining_debt']" :field="(row) => row.remainingDebt" />
            <Column v-if="colspans['summary.cash_available']" :field="(row) => row.cashAvailable" />
            <Column v-if="colspans['summary.cash_invested']" :field="(row) => row.cashInvested" />
            <Column v-if="colspans['summary.cash_profit']" :field="(row) => row.cashProfit" />
          </template>
        </DataTable>
      </AppPanel>
    </main>

    <ScrollTop />
  </AppLayout>
</template>
