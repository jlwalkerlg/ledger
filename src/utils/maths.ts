export const aerToMonthly = (aer: number) => (Math.pow(1 + aer / 100, 1 / 12) - 1) * 100
export const aerToQuarterly = (aer: number) => (Math.pow(1 + aer / 100, 1 / 4) - 1) * 100
export const aerToDaily = (aer: number) => (Math.pow(1 + aer / 100, 1 / 360) - 1) * 100
