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
import {
  Checkbox,
  Column,
  ColumnGroup,
  DataTable,
  InputGroup,
  InputGroupAddon,
  InputNumber,
  Message,
  RadioButton,
  Row,
  ScrollTop,
} from 'primevue'
import { computed, ref } from 'vue'

const years = ref(5)

const investments = ref<Investment[]>([
  {
    name: 'House',
    initialValue: 325000,
    purchaseFeePercentage: 5,
    annualGrowthRatePercentage: 5,
    monthlyGrowthRatePercentage: getMonthlyInterestRatePercentage(5, 'effective'),
    growthRateType: 'effective',
    annualMaintenanceCostPercentage: 1,
    monthlyMaintenanceCostPercentage: getMonthlyInterestRatePercentage(1, 'effective'),
    cashOutFeePercentage: 5,
  },
])

const loans = ref<Loan[]>([
  {
    name: 'Mortgage',
    amount: 130000,
    annualInterestRatePercentage: 4.5,
    monthlyInterestRatePercentage: getMonthlyInterestRatePercentage(4.5, 'nominal'),
    interestRateType: 'nominal',
    term: 10,
    monthlyPayment: getMonthlyLoanPayment(130000, 4.5, 'nominal', 10),
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

const intitialCashBalance = computed(
  () => totalInvestmentsInitialPurchasePrice.value - totalInitialLoanAmount.value,
)

const cols = ref({
  days: false,
  months: false,
  years: true,
  day: false,
  month: false,
  year: false,
  cashAvailable: false,
  cashSpent: false,
  cashProfit: false,
})

const groupBy = ref('years')

const breakdown = computed(() => {
  const investmentsBreakdown = investments.value.map((investment) => {
    const name = investment.name
    const value = investment.initialValue
    const purchaseFeePercentage = investment.purchaseFeePercentage
    const purchaseFee = percentageOf(investment.initialValue, investment.purchaseFeePercentage)
    const purchasePrice = value + purchaseFee
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
      name,
      value,
      purchaseFeePercentage,
      purchaseFee,
      purchasePrice,
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
    const name = loan.name
    const debt = loan.amount
    const paid = 0
    const annualInterestRatePercentage = loan.annualInterestRatePercentage
    const monthlyInterestRatePercentage = loan.monthlyInterestRatePercentage
    const term = loan.term
    const monthlyPayment = loan.monthlyPayment

    return {
      name,
      debt,
      paid,
      annualInterestRatePercentage,
      monthlyInterestRatePercentage,
      term,
      monthlyPayment,
    }
  })

  return Array.from({ length: years.value * 360 + 1 }, (_, i) => {
    const days = i
    const months = Math.floor(i / 30)
    const years = Math.floor(i / 360)

    const day = days + 1
    const month = months + 1
    const year = years + 1

    const isFirstDayOfMonth = day % 30 === 1

    if (isFirstDayOfMonth && months > 0) {
      for (const investment of investmentsBreakdown) {
        investment.maintenanceCashSpent += investment.monthlyMaintenanceCost
        investment.value = addPercentage(investment.value, investment.monthlyGrowthRatePercentage)
        investment.monthlyMaintenanceCost = percentageOf(
          investment.value,
          investment.monthlyMaintenanceCostPercentage,
        )
        investment.purchaseFee = percentageOf(investment.value, investment.purchaseFeePercentage)
        investment.purchasePrice = investment.value + investment.purchaseFee
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

    const totalInvestmentsCashOutValue = investmentsBreakdown.reduce(
      (prev, curr) => prev + curr.cashOutValue,
      0,
    )
    const totalInvestmentsMaintenanceCashSpent = investmentsBreakdown.reduce(
      (prev, curr) => prev + curr.maintenanceCashSpent,
      0,
    )

    const totalDebt = loansBreakdown.reduce((prev, curr) => prev + curr.debt, 0)

    const totalLoanPayments = loansBreakdown.reduce((prev, curr) => prev + curr.paid, 0)

    const cashAvailable = totalInvestmentsCashOutValue - totalDebt
    const cashSpent =
      totalInvestmentsInitialPurchasePrice.value -
      totalInitialLoanAmount.value +
      totalInvestmentsMaintenanceCashSpent +
      totalLoanPayments
    const cashProfit = cashAvailable - cashSpent

    return {
      days,
      months,
      years,
      day,
      month,
      year,
      investments: investmentsBreakdown.map((investment) => ({
        name: investment.name,
        value: toGbp(investment.value),
        purchaseFee: toGbp(investment.purchaseFee),
        purchasePrice: toGbp(investment.purchasePrice),
        monthlyMaintenanceCost: toGbp(investment.monthlyMaintenanceCost),
        maintenanceCashSpent: toGbp(investment.maintenanceCashSpent),
        cashOutFee: toGbp(investment.cashOutFee),
        cashOutValue: toGbp(investment.cashOutValue),
      })),
      loans: loansBreakdown.map((loan) => ({
        name: loan.name,
        debt: toGbp(loan.debt),
        paid: toGbp(loan.paid),
      })),
      cashAvailable: toGbp(cashAvailable),
      cashSpent: toGbp(Math.max(0, cashSpent)),
      cashProfit: toGbp(cashProfit),
    }
  })
})

const rows = computed(() => {
  if (groupBy.value === 'months') {
    return breakdown.value.filter((row) => row.days % 30 === 0)
  }

  if (groupBy.value === 'years') {
    return breakdown.value.filter((row) => row.days % 360 === 0)
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
            <label for="initial_cash_balance">Cash Balance</label>
            <InputGroup>
              <InputGroupAddon>£</InputGroupAddon>
              <InputNumber
                input-id="initial_cash_balance"
                :model-value="intitialCashBalance"
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
        <div class="space-y-4">
          <div class="flex items-top gap-4">
            <div class="font-medium">Columns:</div>

            <div class="flex items-center gap-x-2 gap-y-4 flex-wrap flex-1">
              <div class="flex items-center gap-2">
                <Checkbox v-model="cols.days" binary input-id="days_col" />
                <label for="days_col">Days</label>
              </div>

              <div class="flex items-center gap-2">
                <Checkbox v-model="cols.months" binary input-id="months_col" />
                <label for="months_col">Months</label>
              </div>

              <div class="flex items-center gap-2">
                <Checkbox v-model="cols.years" binary input-id="years_col" />
                <label for="years_col">Years</label>
              </div>

              <div class="flex items-center gap-2">
                <Checkbox v-model="cols.day" binary input-id="day_col" />
                <label for="day_col">Day</label>
              </div>

              <div class="flex items-center gap-2">
                <Checkbox v-model="cols.month" binary input-id="month_col" />
                <label for="month_col">Month</label>
              </div>

              <div class="flex items-center gap-2">
                <Checkbox v-model="cols.year" binary input-id="year_col" />
                <label for="year_col">Year</label>
              </div>

              <div class="flex items-center gap-2">
                <Checkbox v-model="cols.cashAvailable" binary input-id="cash_available_col" />
                <label for="cash_available_col">Cash Available</label>
              </div>

              <div class="flex items-center gap-2">
                <Checkbox v-model="cols.cashSpent" binary input-id="cash_spent_col" />
                <label for="cash_spent_col">Cash Spent</label>
              </div>

              <div class="flex items-center gap-2">
                <Checkbox v-model="cols.cashProfit" binary input-id="cash_profit_col" />
                <label for="cash_profit_col">Cash Profit</label>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="font-medium">Group By:</div>

            <div class="flex items-center gap-2">
              <RadioButton
                v-model="groupBy"
                input-id="group_by_days"
                name="group_by"
                value="days"
              />
              <label for="group_by_days">Days</label>
            </div>

            <div class="flex items-center gap-2">
              <RadioButton
                v-model="groupBy"
                input-id="group_by_months"
                name="group_by"
                value="months"
              />
              <label for="group_by_months">Months</label>
            </div>

            <div class="flex items-center gap-2">
              <RadioButton
                v-model="groupBy"
                input-id="group_by_years"
                name="group_by"
                value="years"
              />
              <label for="group_by_years">Years</label>
            </div>
          </div>
        </div>

        <DataTable
          :value="rows"
          scrollable
          scrollHeight="500px"
          :virtual-scroller-options="{ itemSize: 46 }"
        >
          <ColumnGroup type="header">
            <Row>
              <Column v-if="cols.days" header="Days" :rowspan="2" />
              <Column v-if="cols.months" header="Months" :rowspan="2" />
              <Column v-if="cols.years" header="Years" :rowspan="2" />
              <Column v-if="cols.day" header="Day" :rowspan="2" />
              <Column v-if="cols.month" header="Month" :rowspan="2" />
              <Column v-if="cols.year" header="Year" :rowspan="2" />
              <Column
                v-for="investment of investments"
                :key="investment.name"
                :header="investment.name"
                :colspan="6"
              />
              <Column v-for="loan of loans" :key="loan.name" :header="loan.name" :colspan="2" />
              <Column v-if="cols.cashAvailable" :rowspan="2">
                <template #header>
                  <span class="p-datatable-column-title align-middle">Cash Available </span>
                  <i
                    class="pi pi-info-circle align-middle ml-1"
                    v-tooltip="{
                      value:
                        'This is how much cash you have available to you if you cash out on all your properties and pay off all of your debts.',
                      autoHide: false,
                    }"
                  ></i>
                </template>
              </Column>
              <Column v-if="cols.cashSpent" :rowspan="2">
                <template #header>
                  <span class="p-datatable-column-title align-middle">Cash Spent </span>
                  <i
                    class="pi pi-info-circle align-middle ml-1"
                    v-tooltip="{
                      value:
                        'This is how much you have spent in cash so far from investment purchase fees, deposits, and maintenance costs.',
                      autoHide: false,
                    }"
                  ></i>
                </template>
              </Column>
              <Column v-if="cols.cashProfit" :rowspan="2">
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
              <template v-for="investment of investments" :key="investment.name">
                <Column header="Value" />
                <Column header="Purchase Fee" />
                <Column header="Maintenance Cost" />
                <Column header="Maintenance Cash Spent" />
                <Column header="Cash Out Fee" />
                <Column header="Cash Out Value" />
              </template>
              <template v-for="loan of loans" :key="loan.name">
                <Column header="Debt" />
                <Column header="Paid" />
              </template>
            </Row>
          </ColumnGroup>

          <Column v-if="cols.days" :field="(row) => row.days" />
          <Column v-if="cols.months" :field="(row) => row.months" />
          <Column v-if="cols.years" :field="(row) => row.years" />
          <Column v-if="cols.day" :field="(row) => row.day" />
          <Column v-if="cols.month" :field="(row) => row.month" />
          <Column v-if="cols.year" :field="(row) => row.year" />

          <template v-for="(investment, index) of investments" :key="investment.name">
            <Column :field="(row) => row.investments[index].value" />
            <Column :field="(row) => row.investments[index].purchaseFee" />
            <Column :field="(row) => row.investments[index].monthlyMaintenanceCost" />
            <Column :field="(row) => row.investments[index].maintenanceCashSpent" />
            <Column :field="(row) => row.investments[index].cashOutFee" />
            <Column :field="(row) => row.investments[index].cashOutValue" />
          </template>

          <template v-for="(loan, index) of loans" :key="loan.name">
            <Column :field="(row) => row.loans[index].debt" />
            <Column :field="(row) => row.loans[index].paid" />
          </template>

          <Column v-if="cols.cashAvailable" :field="(row) => row.cashAvailable" />
          <Column v-if="cols.cashSpent" :field="(row) => row.cashAvailable" />
          <Column v-if="cols.cashProfit" :field="(row) => row.cashAvailable" />
        </DataTable>

        <table class="hidden table-fixed border-separate border-spacing-4 mt-2">
          <thead class="text-left">
            <tr>
              <th v-if="cols.days">Days</th>
              <th v-if="cols.months">Months</th>
              <th v-if="cols.years">Years</th>
              <th v-if="cols.day">Day</th>
              <th v-if="cols.month">Month</th>
              <th v-if="cols.year">Year</th>
              <template v-for="investment of investments" :key="investment.name">
                <th>{{ investment.name }} Value</th>
                <th>{{ investment.name }} Purchase Fee</th>
                <th>{{ investment.name }} Purchase Price</th>
                <th>{{ investment.name }} Monthly Maintenance Cost</th>
                <th>{{ investment.name }} Maintenance Cash Spent</th>
                <th>{{ investment.name }} Cash Out Fee</th>
                <th>{{ investment.name }} Cash Out Value</th>
              </template>
              <template v-for="loan of loans" :key="loan.name">
                <th>{{ loan.name }} Debt</th>
                <th>{{ loan.name }} Paid</th>
              </template>
              <th v-if="cols.cashAvailable">
                <span class="align-middle">Cash Available </span>
                <i
                  class="pi pi-info-circle align-middle ml-1"
                  v-tooltip="{
                    value:
                      'This is how much cash you have available to you if you cash out on all your properties and pay off all of your debts.',
                    autoHide: false,
                  }"
                ></i>
              </th>
              <th v-if="cols.cashSpent">
                <span class="align-middle">Cash Spent </span>
                <i
                  class="pi pi-info-circle align-middle ml-1"
                  v-tooltip="{
                    value:
                      'This is how much you have spent in cash so far from investment purchase fees, deposits, and maintenance costs.',
                    autoHide: false,
                  }"
                ></i>
              </th>
              <th v-if="cols.cashProfit">
                <span class="align-middle">Cash Profit </span>
                <i
                  class="pi pi-info-circle align-middle ml-1"
                  v-tooltip="{
                    value:
                      'This is how much better off you\'d be if you cashed out on all your properties and paid off all of your debts versus never making any investments.',
                    autoHide: false,
                  }"
                ></i>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.day">
              <td v-if="cols.days">{{ row.days }}</td>
              <td v-if="cols.months">{{ row.months }}</td>
              <td v-if="cols.years">{{ row.years }}</td>
              <td v-if="cols.day">{{ row.day }}</td>
              <td v-if="cols.month">{{ row.month }}</td>
              <td v-if="cols.year">{{ row.year }}</td>
              <template v-for="investment of row.investments" :key="investment.name">
                <td>{{ investment.value }}</td>
                <td>{{ investment.purchaseFee }}</td>
                <td>{{ investment.purchasePrice }}</td>
                <td>
                  {{ investment.monthlyMaintenanceCost }}
                </td>
                <td>
                  {{ investment.maintenanceCashSpent }}
                </td>
                <td>{{ investment.cashOutFee }}</td>
                <td>{{ investment.cashOutValue }}</td>
              </template>
              <template v-for="loan of row.loans" :key="loan.name">
                <td>{{ loan.debt }}</td>
                <td>{{ loan.paid }}</td>
              </template>
              <td v-if="cols.cashAvailable">{{ row.cashAvailable }}</td>
              <td v-if="cols.cashSpent">{{ row.cashSpent }}</td>
              <td v-if="cols.cashProfit">{{ row.cashProfit }}</td>
            </tr>
          </tbody>
        </table>
      </AppPanel>
    </main>

    <ScrollTop />
  </AppLayout>
</template>
