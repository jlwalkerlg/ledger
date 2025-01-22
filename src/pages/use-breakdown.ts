import type { Investment } from '@/models/investments'
import type { Loan } from '@/models/loans'
import { toGbp } from '@/utils/formatters'
import { percentageOf } from '@/utils/maths'
import sumBy from 'lodash-es/sumBy'
import { computed, type Ref } from 'vue'

type InvestmentBreakdownItem = {
  id: string
  name: string
  value: number
  initialPurchaseFee: number
  initialPurchasePrice: number
  monthlyContribution: number
  totalContributions: number
  interestAccrued: number
  monthlyGrowthRatePercentage: number
  maintenanceCashSpent: number
  monthlyMaintenanceCostPercentage: number
  monthlyMaintenanceCost: number
  cashOutFeePercentage: number
  cashOutFee: number
  cashOutValue: number
}

export type FormattedInvestmentBreakdownItem = {
  id: string
  name: string
  value: string
  initialPurchaseFee: string
  initialPurchasePrice: string
  totalContributions: string
  interestAccrued: string
  monthlyMaintenanceCost: string
  maintenanceCashSpent: string
  cashOutFee: string
  cashOutValue: string
}

const getInvestmentBreakdownItem = (investment: Investment): InvestmentBreakdownItem => {
  const initialPurchaseFee =
    investment.purchaseFeeType === 'percentage'
      ? percentageOf(investment.initialValue, investment.purchaseFeePercentage)
      : investment.purchaseFeeAmount

  const cashOutFee = percentageOf(investment.initialValue, investment.cashOutFeePercentage)

  return {
    id: investment.id,
    name: investment.name,
    value: investment.initialValue,
    initialPurchaseFee,
    initialPurchasePrice: investment.initialValue + initialPurchaseFee,
    monthlyContribution: investment.monthlyContribution,
    totalContributions: 0,
    interestAccrued: 0,
    monthlyGrowthRatePercentage: investment.monthlyGrowthRatePercentage,
    maintenanceCashSpent: 0,
    monthlyMaintenanceCostPercentage: investment.monthlyMaintenanceCostPercentage,
    monthlyMaintenanceCost: percentageOf(
      investment.initialValue,
      investment.monthlyMaintenanceCostPercentage,
    ),
    cashOutFeePercentage: investment.cashOutFeePercentage,
    cashOutFee,
    cashOutValue: investment.initialValue - cashOutFee,
  }
}

const advanceInvestment = (investment: InvestmentBreakdownItem) => {
  investment.totalContributions += investment.monthlyContribution
  investment.value += investment.monthlyContribution
  investment.maintenanceCashSpent += investment.monthlyMaintenanceCost
  const interest = percentageOf(investment.value, investment.monthlyGrowthRatePercentage)
  investment.value += interest
  investment.interestAccrued += interest
  investment.monthlyMaintenanceCost = percentageOf(
    investment.value,
    investment.monthlyMaintenanceCostPercentage,
  )
  investment.cashOutFee = percentageOf(investment.value, investment.cashOutFeePercentage)
  investment.cashOutValue = investment.value - investment.cashOutFee
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
    totalContributions: toGbp(investment.totalContributions),
    interestAccrued: toGbp(investment.interestAccrued),
    monthlyMaintenanceCost: toGbp(investment.monthlyMaintenanceCost),
    maintenanceCashSpent: toGbp(investment.maintenanceCashSpent),
    cashOutFee: toGbp(investment.cashOutFee),
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
    annualInterestRatePercentage: loan.annualInterestRatePercentage,
    monthlyInterestRatePercentage: loan.monthlyInterestRatePercentage,
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
  cashAvailable: string
  cashProfit: string
}

export const useBreakdown = (
  years: Ref<number>,
  investments: Ref<Investment[]>,
  loans: Ref<Loan[]>,
) => {
  const items = computed<FormattedBreakdownItem[]>(() => {
    const investmentItems = investments.value.map(getInvestmentBreakdownItem)
    const loanItems = loans.value.map(getLoanBreakdownItem)

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

      const profit =
        sumBy(
          investmentItems,
          (investment) =>
            investment.interestAccrued -
            investment.initialPurchaseFee -
            investment.cashOutFee -
            investment.maintenanceCashSpent,
        ) - sumBy(loanItems, (loan) => loan.interestAccrued + loan.paid)

      return {
        months,
        years,
        month,
        year,
        investments: investmentItems.map(formatInvestment),
        loans: loanItems.map(formatLoan),
        cashAvailable: toGbp(0),
        cashProfit: toGbp(profit),
      }
    })
  })

  return {
    items,
  }
}
