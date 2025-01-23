import type { NamedValue } from '@/utils/types'
import type { InterestRate } from './interest-rates'

export type Investment = {
  id: string
  name: string
  initialValue: number
  purchaseFee: PurchaseFee
  monthlyContribution: number
  growthRate: InterestRate
  annualMaintenanceCostPercentage: number
  monthlyMaintenanceCostPercentage: number
  cashOutFeePercentage: number
}

export type PurchaseFee = {
  type: PurchaseFeeType
  value: number
}

export type PurchaseFeeType = 'percentage' | 'flat'

export const NAMED_PURCHASE_FEE_TYPES: NamedValue<PurchaseFeeType>[] = [
  { name: 'Percentage', value: 'percentage' },
  { name: 'Flat', value: 'flat' },
]
