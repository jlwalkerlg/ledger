import type { Investment } from '@/models/investments'
import type { Loan } from '@/models/loans'
import flatten from 'lodash-es/flatten'
import { computed, ref, type Ref } from 'vue'

export type ColGroup = {
  label: string
  items: ColOption[]
}

export type ColOption = {
  label: string
  value: string
  group: string
}

const getDefaultInvestmentColumns = (investment: Investment) => {
  const group = `investment.${investment.id}`

  return [
    `${group}.value`,
    `${group}.total_contributed`,
    `${group}.interest_accrued`,
    `${group}.maintenance_cash_spent`,
    `${group}.cash_out_fee`,
  ]
}

const getDefaultLoanColumns = (loan: Loan) => {
  const group = `loan.${loan.id}`

  return [`${group}.debt`, `${group}.paid`, `${group}.interest_accrued`]
}

export const useColumns = (investments: Ref<Investment[]>, loans: Ref<Loan[]>) => {
  const columns = ref([
    'time.years',
    ...flatten(investments.value.map(getDefaultInvestmentColumns)),
    ...flatten(loans.value.map(getDefaultLoanColumns)),
    'summary.profit',
  ])

  const columnCounts = computed(() => {
    const result: Record<string, number> = {}

    for (const col of columns.value) {
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

  const columnOptions = computed<ColGroup[]>(() => [
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
            label: 'Total Contributed',
            value: `${group}.total_contributed`,
            group,
          },
          {
            label: 'Interest Accrued',
            value: `${group}.interest_accrued`,
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
          {
            label: 'Interest Accrued',
            value: `${group}.interest_accrued`,
            group,
          },
        ],
      }
    }),
    {
      label: 'Summary',
      items: [
        { label: 'Equity', value: 'summary.equity', group: 'summary' },
        { label: 'Profit', value: 'summary.profit', group: 'summary' },
      ],
    },
  ])

  const addInvestmentColumns = (investment: Investment) => {
    columns.value = [...columns.value, ...getDefaultInvestmentColumns(investment)]
  }

  const removeInvestmentColumns = (investment: Investment) => {
    columns.value = columns.value.filter((col) => {
      const group = col.slice(0, col.lastIndexOf('.'))
      return group !== `investment.${investment.id}`
    })
  }

  const addLoanColumns = (loan: Loan) => {
    columns.value = [...columns.value, ...getDefaultLoanColumns(loan)]
  }

  const removeLoanColumns = (loan: Loan) => {
    columns.value = columns.value.filter((col) => {
      const group = col.slice(0, col.lastIndexOf('.'))
      return group !== `loan.${loan.id}`
    })
  }

  return {
    columns,
    columnCounts,
    columnOptions,
    addInvestmentColumns,
    removeInvestmentColumns,
    addLoanColumns,
    removeLoanColumns,
  }
}
