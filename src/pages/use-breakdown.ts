import type { Investment } from '@/models/investments'
import type { Loan } from '@/models/loans'
import { toGbp } from '@/utils/formatters'
import { addPercentage, percentageOf } from '@/utils/maths'
import { computed, type Ref } from 'vue'

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

  const initialCashAvailable = computed(
    () => totalInvestmentsInitialPurchasePrice.value - totalInitialLoanAmount.value,
  )

  const items = computed(() => {
    const investmentsBreakdown = investments.value.map((investment) => {
      const id = investment.id
      const name = investment.name
      const value = investment.initialValue
      const initialPurchaseFee =
        investment.purchaseFeeType === 'percentage'
          ? percentageOf(investment.initialValue, investment.purchaseFeePercentage)
          : investment.purchaseFeeAmount
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

      const cashOutValue = investmentsBreakdown.reduce((prev, curr) => prev + curr.cashOutValue, 0)

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

  return {
    initialCashAvailable,
    items,
  }
}
