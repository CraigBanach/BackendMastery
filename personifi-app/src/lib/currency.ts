const numberFormat = new Intl.NumberFormat();

export const toDisplayFormat = (number: number): string =>
  numberFormat.format(number);

export const formatCurrency = (number: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(number);
