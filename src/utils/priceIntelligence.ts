import { Product, AnomalyReport, PriceRatioReport } from '../types';

export const DEFAULT_ANOMALY_THRESHOLD = 50; // 50%
export const MIN_COMPARABLE_LISTINGS = 3;

/**
 * Calculates Price-to-Original-Price Ratio and Discount
 * Formula:
 * Price Ratio (%) = (Current Price / Original Price) * 100
 * Discount Amount = Original Price - Current Price
 * Discount Percentage = ((Original Price - Current Price) / Original Price) * 100
 */
export function calculatePriceRatioAndDiscount(currentPrice?: number | null, originalPrice?: number | null): PriceRatioReport {
  if (
    typeof currentPrice !== 'number' ||
    typeof originalPrice !== 'number' ||
    isNaN(currentPrice) ||
    isNaN(originalPrice) ||
    currentPrice <= 0 ||
    originalPrice <= 0
  ) {
    return {
      ratioPercent: null,
      discountAmount: null,
      discountPercent: null,
      isValid: false
    };
  }

  const ratioPercent = Number(((currentPrice / originalPrice) * 100).toFixed(2));
  const discountAmount = Number((originalPrice - currentPrice).toFixed(2));
  const discountPercent = Number((((originalPrice - currentPrice) / originalPrice) * 100).toFixed(2));

  return {
    ratioPercent,
    discountAmount,
    discountPercent,
    isValid: true
  };
}

/**
 * Computes category-wise median current price using mathematical definition:
 * - Odd n: middle sorted value
 * - Even n: average of two middle values
 * Only considers valid positive prices.
 */
export function calculateCategoryMedian(products: Product[], category: string): { median: number | null; count: number } {
  const normCat = (category || 'Other').trim().toLowerCase();

  const validPrices = products
    .filter((p) => {
      const pCat = (p.category || 'Other').trim().toLowerCase();
      return pCat === normCat && typeof p.price === 'number' && !isNaN(p.price) && p.price > 0;
    })
    .map((p) => p.price)
    .sort((a, b) => a - b);

  const count = validPrices.length;
  if (count === 0) return { median: null, count: 0 };

  const mid = Math.floor(count / 2);
  let median: number;

  if (count % 2 === 1) {
    median = validPrices[mid];
  } else {
    median = (validPrices[mid - 1] + validPrices[mid]) / 2;
  }

  return { median: Number(median.toFixed(2)), count };
}

/**
 * Price Anomaly Detection
 * Price Deviation (%) = (|Current Price - Category Median| / Category Median) * 100
 * Flags if deviation > threshold (default 50%).
 * Requires >= 3 comparable listings in the same category.
 */
export function evaluatePriceAnomaly(
  product: Product,
  allProducts: Product[],
  thresholdPercent: number = DEFAULT_ANOMALY_THRESHOLD
): AnomalyReport {
  if (typeof product.price !== 'number' || isNaN(product.price) || product.price <= 0) {
    return {
      isAnomaly: false,
      comparableCount: 0,
      status: 'insufficient_data',
      message: 'Listing does not have a valid positive price.'
    };
  }

  const category = product.category || 'Other';
  const { median, count } = calculateCategoryMedian(allProducts, category);

  if (count < MIN_COMPARABLE_LISTINGS) {
    return {
      isAnomaly: false,
      comparableCount: count,
      categoryMedian: median ?? undefined,
      status: 'insufficient_data',
      message: `Insufficient comparable listings in ${category} (${count} available, minimum ${MIN_COMPARABLE_LISTINGS} required).`
    };
  }

  if (median === null || median <= 0) {
    return {
      isAnomaly: false,
      comparableCount: count,
      status: 'invalid_median',
      message: `Invalid median price calculated for category "${category}".`
    };
  }

  const diff = Math.abs(product.price - median);
  const deviationPercent = Number(((diff / median) * 100).toFixed(2));
  const isAnomaly = deviationPercent > thresholdPercent;
  const direction: 'high' | 'low' = product.price > median ? 'high' : 'low';

  if (isAnomaly) {
    return {
      isAnomaly: true,
      direction,
      deviationPercent,
      categoryMedian: median,
      comparableCount: count,
      status: direction === 'high' ? 'unusually_high' : 'unusually_low',
      message: `Unusually ${direction === 'high' ? 'high' : 'low'} price: ₹${product.price.toLocaleString('en-IN')} is ${deviationPercent}% ${direction === 'high' ? 'above' : 'below'} the ${category} median (₹${median.toLocaleString('en-IN')}). An unusual price is a signal for further checking, not evidence of fraud.`
    };
  }

  return {
    isAnomaly: false,
    direction,
    deviationPercent,
    categoryMedian: median,
    comparableCount: count,
    status: 'normal',
    message: `Price aligns with category benchmark (deviation: ${deviationPercent}%, median: ₹${median.toLocaleString('en-IN')}).`
  };
}
