import type { NamedValue } from '@/utils/types'

export type Fee = {
  type: FeeType
  value: number
}

export type FeeType = 'percentage' | 'flat'

export const NAMED_FEE_TYPES: NamedValue<FeeType>[] = [
  { name: 'Percentage', value: 'percentage' },
  { name: 'Flat', value: 'flat' },
]
