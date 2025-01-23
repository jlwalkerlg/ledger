import type { NamedValue } from '@/utils/types'

export type InterestRate = {
  type: InterestRateType
  yearlyPercentage: number
  monthlyPercentage: number
}

export type InterestRateType = 'nominal' | 'effective'

export const NAMED_INTEREST_RATE_TYPES: NamedValue<InterestRateType>[] = [
  { name: 'Nominal', value: 'nominal' },
  { name: 'Effective', value: 'effective' },
]

export const NAMED_INTEREST_RATE_TYPES_MAP: Record<InterestRateType, string> = {
  nominal: 'Nominal',
  effective: 'Effective',
}
