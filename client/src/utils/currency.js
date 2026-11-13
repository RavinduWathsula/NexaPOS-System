/**
 * Formats a number into Sri Lankan Rupee (LKR) currency string
 * e.g., 250000 -> "Rs. 250,000.00"
 */
export function formatLKR(amount, showDecimals = true) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showDecimals ? 'Rs. 0.00' : 'Rs. 0'
  }

  const num = Number(amount)
  const formatted = num.toLocaleString('en-LK', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  })

  return `Rs. ${formatted}`
}

/**
 * Compact currency format for badges and metric counters
 * e.g., 1500000 -> "Rs. 1.5M"
 */
export function formatCompactLKR(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Rs. 0'
  }
  const num = Number(amount)
  if (num >= 1000000) {
    return `Rs. ${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `Rs. ${(num / 1000).toFixed(1)}K`
  }
  return `Rs. ${num.toLocaleString('en-LK')}`
}

