const numberFormat = new Intl.NumberFormat();

export const toDisplayFormat = (number: number): string =>
  numberFormat.format(number);

export const formatCurrency = (number: number): string =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(number);
