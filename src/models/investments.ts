import type { InterestRateType } from './interest-rates'

export type Investment = {
  id: string
  name: string
  initialValue: number
  purchaseFeePercentage: number
  monthlyContribution: number
  annualGrowthRatePercentage: number
  monthlyGrowthRatePercentage: number
  growthRateType: InterestRateType
  annualMaintenanceCostPercentage: number
  monthlyMaintenanceCostPercentage: number
  cashOutFeePercentage: number
}
