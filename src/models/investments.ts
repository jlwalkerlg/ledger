import type { NamedValue } from '@/utils/types'
import type { InterestRateType } from './interest-rates'

export type Investment = {
  id: string
  name: string
  initialValue: number
  purchaseFeeType: PurchaseFeeType
  purchaseFeePercentage: number
  purchaseFeeAmount: number
  monthlyContribution: number
  annualGrowthRatePercentage: number
  monthlyGrowthRatePercentage: number
  growthRateType: InterestRateType
  annualMaintenanceCostPercentage: number
  monthlyMaintenanceCostPercentage: number
  cashOutFeePercentage: number
}

export type PurchaseFeeType = 'percentage' | 'flat'

export const NAMED_PURCHASE_FEE_TYPES: NamedValue<PurchaseFeeType>[] = [
  { name: 'Percentage', value: 'percentage' },
  { name: 'Flat', value: 'flat' },
]
