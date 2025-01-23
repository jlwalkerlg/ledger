import type { NamedValue } from '@/utils/types'
import type { InterestRate } from './interest-rates'

export type Fee = {
  type: FeeType
  value: number
  growthRate?: InterestRate
}

export type FeeType = 'percentage' | 'flat'

export const NAMED_FEE_TYPES: NamedValue<FeeType>[] = [
  { name: 'Percentage', value: 'percentage' },
  { name: 'Flat', value: 'flat' },
]
