import type { Fee } from '@/models/fees'
import type { Investment } from '@/models/investments'
import type { Loan } from '@/models/loans'
import { toGbp } from '@/utils/formatters'
import { addPercentage, percentageOf } from '@/utils/maths'
import sumBy from 'lodash-es/sumBy'
import { computed, type Ref } from 'vue'

type InvestmentBreakdownItem = {
  id: string
  name: string
  value: number
  initialPurchaseFee: number
  initialPurchasePrice: number
  monthlyContribution: number
  totalContributed: number
  interestAccrued: number
  monthlyGrowthRatePercentage: number
  maintenanceCashSpent: number
  monthlyMaintenanceCostPercentage: number
  monthlyMaintenanceCost: number
  cashOutFee: Fee
  cashOutFeeAmount: number
  cashOutValue: number
}

export type FormattedInvestmentBreakdownItem = {
  id: string
  name: string
  value: string
  initialPurchaseFee: string
  initialPurchasePrice: string
  totalContributed: string
  interestAccrued: string
  monthlyMaintenanceCost: string
  maintenanceCashSpent: string
  cashOutFeeAmount: string
  cashOutValue: string
}

const getInvestmentBreakdownItem = (investment: Investment): InvestmentBreakdownItem => {
  const initialPurchaseFee =
    investment.purchaseFee.type === 'percentage'
      ? percentageOf(investment.initialValue, investment.purchaseFee.value)
      : investment.purchaseFee.value

  const cashOutFeeAmount =
    investment.cashOutFee.type === 'percentage'
      ? percentageOf(investment.initialValue, investment.cashOutFee.value)
      : investment.cashOutFee.value

  return {
    id: investment.id,
    name: investment.name,
    value: investment.initialValue,
    initialPurchaseFee,
    initialPurchasePrice: investment.initialValue + initialPurchaseFee,
    monthlyContribution: investment.monthlyContribution,
    totalContributed: 0,
    interestAccrued: 0,
    monthlyGrowthRatePercentage: investment.growthRate.monthlyPercentage,
    maintenanceCashSpent: 0,
    monthlyMaintenanceCostPercentage: investment.maintenanceCost.monthlyPercentage,
    monthlyMaintenanceCost: percentageOf(
      investment.initialValue,
      investment.maintenanceCost.monthlyPercentage,
    ),
    cashOutFee: investment.cashOutFee,
    cashOutFeeAmount,
    cashOutValue: investment.initialValue - cashOutFeeAmount,
  }
}

const advanceInvestment = (investment: InvestmentBreakdownItem) => {
  investment.totalContributed += investment.monthlyContribution
  investment.value += investment.monthlyContribution
  investment.maintenanceCashSpent += investment.monthlyMaintenanceCost
  const interest = percentageOf(investment.value, investment.monthlyGrowthRatePercentage)
  investment.value += interest
  investment.interestAccrued += interest
  investment.monthlyMaintenanceCost = percentageOf(
    investment.value,
    investment.monthlyMaintenanceCostPercentage,
  )

  if (investment.cashOutFee.type === 'percentage') {
    investment.cashOutFeeAmount = percentageOf(investment.value, investment.cashOutFee.value)
  } else {
    investment.cashOutFeeAmount = addPercentage(
      investment.cashOutFeeAmount,
      investment.cashOutFee.growthRate?.monthlyPercentage ?? 0,
    )
  }

  investment.cashOutValue = investment.value - investment.cashOutFeeAmount
}

const formatInvestment = (
  investment: InvestmentBreakdownItem,
): FormattedInvestmentBreakdownItem => {
  return {
    id: investment.id,
    name: investment.name,
    value: toGbp(investment.value),
    initialPurchaseFee: toGbp(investment.initialPurchaseFee),
    initialPurchasePrice: toGbp(investment.initialPurchasePrice),
    totalContributed: toGbp(investment.totalContributed),
    interestAccrued: toGbp(investment.interestAccrued),
    monthlyMaintenanceCost: toGbp(investment.monthlyMaintenanceCost),
    maintenanceCashSpent: toGbp(investment.maintenanceCashSpent),
    cashOutFeeAmount: toGbp(investment.cashOutFeeAmount),
    cashOutValue: toGbp(investment.cashOutValue),
  }
}

type LoanBreakdownItem = {
  id: string
  name: string
  debt: number
  paid: number
  annualInterestRatePercentage: number
  monthlyInterestRatePercentage: number
  interestAccrued: number
  term: number
  monthlyPayment: number
}

export type FormattedLoanBreakdownItem = {
  id: string
  name: string
  debt: string
  paid: string
  interestAccrued: string
}

const getLoanBreakdownItem = (loan: Loan): LoanBreakdownItem => {
  return {
    id: loan.id,
    name: loan.name,
    debt: loan.amount,
    paid: 0,
    annualInterestRatePercentage: loan.interestRate.yearlyPercentage,
    monthlyInterestRatePercentage: loan.interestRate.monthlyPercentage,
    interestAccrued: 0,
    term: loan.term,
    monthlyPayment: loan.monthlyPayment,
  }
}

const advanceLoan = (loan: LoanBreakdownItem) => {
  const interest = (loan.debt * loan.monthlyInterestRatePercentage) / 100
  loan.debt += interest
  loan.interestAccrued += interest

  const loanPayment = Math.min(loan.debt, loan.monthlyPayment)
  loan.debt -= loanPayment
  loan.paid += loanPayment
}

const formatLoan = (loan: LoanBreakdownItem): FormattedLoanBreakdownItem => {
  return {
    id: loan.id,
    name: loan.name,
    debt: toGbp(loan.debt),
    paid: toGbp(loan.paid),
    interestAccrued: toGbp(loan.interestAccrued),
  }
}

export type FormattedBreakdownItem = {
  months: number
  years: number
  month: number
  year: number
  investments: FormattedInvestmentBreakdownItem[]
  loans: FormattedLoanBreakdownItem[]
  equity: string
  profit: string
  cashSpent: string
}

export const useBreakdown = (
  years: Ref<number>,
  investments: Ref<Investment[]>,
  loans: Ref<Loan[]>,
) => {
  const items = computed<FormattedBreakdownItem[]>(() => {
    const investmentItems = investments.value.map(getInvestmentBreakdownItem)
    const loanItems = loans.value.map(getLoanBreakdownItem)

    const initialDeposit = Math.max(
      0,
      sumBy(investmentItems, (investment) => investment.initialPurchasePrice) -
        sumBy(loanItems, (loan) => loan.debt),
    )

    return Array.from({ length: years.value * 12 + 1 }, (_, months) => {
      const years = Math.floor(months / 12)

      const month = months + 1
      const year = years + 1

      if (months > 0) {
        for (const investment of investmentItems) {
          advanceInvestment(investment)
        }

        for (const loan of loanItems) {
          if (years <= loan.term) {
            advanceLoan(loan)
          }
        }
      }

      const equity =
        sumBy(investmentItems, (investment) => investment.cashOutValue) -
        sumBy(loanItems, (loan) => loan.debt)

      const profit =
        sumBy(investmentItems, (investment) => {
          const expenses =
            investment.initialPurchaseFee +
            investment.cashOutFeeAmount +
            investment.maintenanceCashSpent

          return investment.interestAccrued - expenses
        }) - sumBy(loanItems, (loan) => loan.interestAccrued + loan.paid)

      const cashSpent =
        initialDeposit +
        sumBy(
          investmentItems,
          (investment) => investment.maintenanceCashSpent + investment.totalContributed,
        ) +
        sumBy(loanItems, (loan) => loan.paid)

      return {
        months,
        years,
        month,
        year,
        investments: investmentItems.map(formatInvestment),
        loans: loanItems.map(formatLoan),
        equity: toGbp(equity),
        profit: toGbp(profit),
        cashSpent: toGbp(cashSpent),
      }
    })
  })

  return {
    items,
  }
}
