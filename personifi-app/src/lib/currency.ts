const numberFormat = new Intl.NumberFormat();

export const toDisplayFormat = (number: number): string =>
  numberFormat.format(number);
