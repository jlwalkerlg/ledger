import type { Investment } from '@/models/investments'
import type { Loan } from '@/models/loans'
import { toGbp } from '@/utils/formatters'
import { addPercentage, percentageOf } from '@/utils/maths'
import { computed, type Ref } from 'vue'

type InvestmentBreakdownItem = {
  id: string
  name: string
  value: number
  initialPurchaseFee: number
  initialPurchasePrice: number
  monthlyContribution: number
  totalContributions: number
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
  investment.value = addPercentage(investment.value, investment.monthlyGrowthRatePercentage)
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
  term: number
  monthlyPayment: number
}

export type FormattedLoanBreakdownItem = {
  id: string
  name: string
  debt: string
  paid: string
}

const getLoanBreakdownItem = (loan: Loan): LoanBreakdownItem => {
  return {
    id: loan.id,
    name: loan.name,
    debt: loan.amount,
    paid: 0,
    annualInterestRatePercentage: loan.annualInterestRatePercentage,
    monthlyInterestRatePercentage: loan.monthlyInterestRatePercentage,
    term: loan.term,
    monthlyPayment: loan.monthlyPayment,
  }
}

const advanceLoan = (loan: LoanBreakdownItem) => {
  loan.debt *= 1 + loan.monthlyInterestRatePercentage / 100

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
  }
}

export type FormattedBreakdownItem = {
  months: number
  years: number
  month: number
  year: number
  investments: FormattedInvestmentBreakdownItem[]
  loans: FormattedLoanBreakdownItem[]
  cashOutValue: string
  remainingDebt: string
  cashAvailable: string
  cashInvested: string
  cashProfit: string
}

export const useBreakdown = (
  years: Ref<number>,
  investments: Ref<Investment[]>,
  loans: Ref<Loan[]>,
) => {
  const totalInvestmentsInitialPurchasePrice = computed(() =>
    investments.value.reduce(
      (total, investment) =>
        total + investment.purchaseFeeType === 'percentage'
          ? addPercentage(investment.initialValue, investment.purchaseFeePercentage)
          : investment.initialValue + investment.purchaseFeeAmount,
      0,
    ),
  )

  const totalInitialLoanAmount = computed(() =>
    loans.value.reduce((prev, curr) => prev + curr.amount, 0),
  )

  const initialCashAvailable = computed(() =>
    Math.max(0, totalInvestmentsInitialPurchasePrice.value - totalInitialLoanAmount.value),
  )

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

      const cashOutValue = investmentItems.reduce((prev, curr) => prev + curr.cashOutValue, 0)

      const totalInvestmentsContributions = investmentItems.reduce(
        (prev, curr) => prev + curr.totalContributions,
        0,
      )

      const totalMaintenanceCashSpent = investmentItems.reduce(
        (prev, curr) => prev + curr.maintenanceCashSpent,
        0,
      )

      const remainingDebt = loanItems.reduce((prev, curr) => prev + curr.debt, 0)

      const totalLoanPayments = loanItems.reduce((prev, curr) => prev + curr.paid, 0)

      const cashInvested = Math.max(
        0,
        totalInvestmentsInitialPurchasePrice.value +
          totalInvestmentsContributions +
          totalMaintenanceCashSpent +
          totalLoanPayments -
          totalInitialLoanAmount.value,
      )

      const cashAvailable = cashOutValue - remainingDebt

      const cashProfit = cashAvailable - cashInvested

      return {
        months,
        years,
        month,
        year,
        investments: investmentItems.map(formatInvestment),
        loans: loanItems.map(formatLoan),
        cashOutValue: toGbp(cashOutValue),
        remainingDebt: toGbp(remainingDebt),
        cashAvailable: toGbp(cashAvailable),
        cashInvested: toGbp(cashInvested),
        cashProfit: toGbp(cashProfit),
      }
    })
  })

  return {
    initialCashAvailable,
    items,
  }
}
