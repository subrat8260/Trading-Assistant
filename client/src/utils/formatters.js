/**
 * Currency symbol mapping for supported base currencies
 */
export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
};

/**
 * Get currency symbol based on currency code (defaults to '$')
 */
export const getCurrencySymbol = (currency = 'USD') => {
  if (!currency) return '$';
  return CURRENCY_SYMBOLS[currency.toUpperCase()] || '$';
};

/**
 * Format currency amount using the active currency symbol (defaults to '$')
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null) {
    return `${getCurrencySymbol(currency)} 0.00`;
  }
  const symbol = getCurrencySymbol(currency);
  const formattedNum = Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol} ${formattedNum}`;
};

/**
 * Format percentage value
 */
export const formatPercent = (value) => {
  if (value === undefined || value === null) return '0.00%';
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)}%`;
};

/**
 * Format ISO date string to localized readable date
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
