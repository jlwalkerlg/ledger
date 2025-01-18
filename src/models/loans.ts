import type { InterestRateType } from './interest-rates'

export type Loan = {
  name: string
  amount: number
  annualInterestRatePercentage: number
  monthlyInterestRatePercentage: number
  interestRateType: InterestRateType
  term: number
  monthlyPayment: number
}
