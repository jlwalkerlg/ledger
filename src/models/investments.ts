import type { Fee } from './fees'
import type { InterestRate } from './interest-rates'

export type Investment = {
  id: string
  name: string
  initialValue: number
  purchaseFee: Fee
  monthlyContribution: number
  growthRate: InterestRate
  annualMaintenanceCostPercentage: number
  monthlyMaintenanceCostPercentage: number
  cashOutFeePercentage: number
}
