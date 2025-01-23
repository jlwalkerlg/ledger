import type { InterestRate } from './interest-rates'

export type Loan = {
  id: string
  name: string
  amount: number
  interestRate: InterestRate
  term: number
  monthlyPayment: number
}
