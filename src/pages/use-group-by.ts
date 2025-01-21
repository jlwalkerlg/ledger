import type { NamedValue } from '@/utils/types'
import { ref } from 'vue'

export type GroupByType = 'months' | 'years'

export const useGroupBy = () => {
  const value = ref<GroupByType>('years')

  const options: NamedValue<GroupByType>[] = [
    { name: 'Months', value: 'months' },
    { name: 'Years', value: 'years' },
  ]

  return { value, options }
}
