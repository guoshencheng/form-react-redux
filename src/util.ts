
export const toUnderscore = (origin: string): string => origin
  .replace(/\.?([A-Z])/g, (x, y) => `_${y.toLowerCase()}`)
  .replace(/^_/, '').toUpperCase();
