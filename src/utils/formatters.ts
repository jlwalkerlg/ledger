const gbp = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

export const toGbp = (num: number): string => gbp.format(num)
