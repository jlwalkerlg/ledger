export const aerToMonthly = (aer: number) => (Math.pow(1 + aer / 100, 1 / 12) - 1) * 100
export const aerToQuarterly = (aer: number) => (Math.pow(1 + aer / 100, 1 / 4) - 1) * 100
export const aerToDaily = (aer: number) => (Math.pow(1 + aer / 100, 1 / 360) - 1) * 100

export const addPercentage = (value: number, percentage: number) => value * (1 + percentage / 100)
export const subtractPercentage = (value: number, percentage: number) => value * (1 + percentage / 100)
export const percentageOf = (value: number, percentage: number) => value * percentage / 100
