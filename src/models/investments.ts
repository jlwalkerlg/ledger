import type { InterestRateType } from './interest-rates'

export type Investment = {
  name: string
  initialValue: number
  purchaseFeePercentage: number
  annualGrowthRatePercentage: number
  monthlyGrowthRatePercentage: number
  growthRateType: InterestRateType
  annualMaintenanceCostPercentage: number
  monthlyMaintenanceCostPercentage: number
  cashOutFeePercentage: number
}
