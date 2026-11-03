import { Product, PriorityMode, PriorityWeights, FactorScores, RankedProduct } from '../types';

export const DEFAULT_MAX_REF_AGE = 5;

export const PRIORITY_PRESETS: Record<Exclude<PriorityMode, 'custom'>, PriorityWeights> = {
  balanced: { price: 0.50, age: 0.20, condition: 0.30 },
  affordability: { price: 0.70, age: 0.10, condition: 0.20 },
  condition: { price: 0.20, age: 0.10, condition: 0.70 },
};

/**
 * Normalizes condition string to one of the canonical values
 */
export function normalizeCondition(condition?: string | null): 'Excellent' | 'Good' | 'Average' | 'Poor' | null {
  if (!condition || typeof condition !== 'string') return null;
  const clean = condition.trim().toLowerCase();
  if (clean === 'excellent') return 'Excellent';
  if (clean === 'good') return 'Good';
  if (clean === 'average') return 'Average';
  if (clean === 'poor') return 'Poor';
  return null;
}

/**
 * Condition Score Mapping:
 * Excellent = 100, Good = 75, Average = 50, Poor = 25
 * Returns null if missing or unrecognized (never assume Excellent)
 */
export function calculateConditionScore(condition?: string | null): number | null {
  const norm = normalizeCondition(condition);
  if (!norm) return null;
  switch (norm) {
    case 'Excellent': return 100;
    case 'Good': return 75;
    case 'Average': return 50;
    case 'Poor': return 25;
    default: return null;
  }
}

/**
 * Price Score (Affordability) formula:
 * Price Score = ((Budget - Current Price) / Budget) * 100
 * Clamped to [0, 100]. Returns 0 if price == budget.
 */
export function calculatePriceScore(budget: number, currentPrice: number): number {
  if (budget <= 0 || currentPrice < 0) return 0;
  if (currentPrice >= budget) return 0;
  const raw = ((budget - currentPrice) / budget) * 100;
  return Math.min(100, Math.max(0, raw));
}

/**
 * Age Score formula:
 * Age Score = ((Max Ref Age - Product Age) / Max Ref Age) * 100
 * Clamped to [0, 100]. Products older than Max Ref Age receive 0.
 * Returns null if age is missing or negative.
 */
export function calculateAgeScore(age: number | undefined | null, maxRefAge: number = DEFAULT_MAX_REF_AGE): number | null {
  if (age === undefined || age === null || isNaN(age) || age < 0) {
    return null; // Missing age handled separately
  }
  if (maxRefAge <= 0) return 0;
  if (age >= maxRefAge) return 0;
  const raw = ((maxRefAge - age) / maxRefAge) * 100;
  return Math.min(100, Math.max(0, raw));
}

/**
 * Calculates ranking score, dynamic weight renormalization, and data completeness
 */
export function calculateProductRank(
  product: Product,
  budget: number,
  weights: PriorityWeights,
  maxRefAge: number = DEFAULT_MAX_REF_AGE
): RankedProduct {
  const missingFactors: string[] = [];

  // Check budget eligibility
  if (typeof product.price !== 'number' || isNaN(product.price) || product.price <= 0) {
    return {
      product,
      rank: 0,
      finalScore: 0,
      factorScores: { priceScore: null, ageScore: null, conditionScore: null },
      effectiveWeights: weights,
      isScoreAdjusted: false,
      missingFactors: ['Price missing or invalid'],
      dataCompleteness: 0,
      isEligible: false,
      ineligibleReason: 'Current price is missing, zero, or invalid.',
      explanation: 'Excluded: Product does not possess a valid listing price.',
      dominantFactor: 'None'
    };
  }

  if (product.price > budget) {
    return {
      product,
      rank: 0,
      finalScore: 0,
      factorScores: { priceScore: 0, ageScore: null, conditionScore: null },
      effectiveWeights: weights,
      isScoreAdjusted: false,
      missingFactors: [],
      dataCompleteness: 0,
      isEligible: false,
      ineligibleReason: `Price (₹${product.price.toLocaleString('en-IN')}) exceeds your budget of ₹${budget.toLocaleString('en-IN')}.`,
      explanation: `Excluded: Exceeds specified budget by ₹${(product.price - budget).toLocaleString('en-IN')}.`,
      dominantFactor: 'Budget Exceeded'
    };
  }

  // Calculate individual factor scores
  const priceScore = calculatePriceScore(budget, product.price);
  const ageScore = calculateAgeScore(product.age, maxRefAge);
  const conditionScore = calculateConditionScore(product.condition);

  if (ageScore === null) missingFactors.push('Age');
  if (conditionScore === null) missingFactors.push('Condition');

  // Dynamic weight renormalization
  let availableWeightSum = weights.price;
  let weightedScoreSum = priceScore * weights.price;

  if (ageScore !== null) {
    availableWeightSum += weights.age;
    weightedScoreSum += ageScore * weights.age;
  }

  if (conditionScore !== null) {
    availableWeightSum += weights.condition;
    weightedScoreSum += conditionScore * weights.condition;
  }

  const isScoreAdjusted = missingFactors.length > 0;
  const finalScore = availableWeightSum > 0 ? (weightedScoreSum / availableWeightSum) : 0;
  const clampedFinal = Math.min(100, Math.max(0, finalScore));

  // Data completeness based on 3 primary ranking parameters
  const totalFactors = 3;
  const availableFactorsCount = 1 + (ageScore !== null ? 1 : 0) + (conditionScore !== null ? 1 : 0);
  const dataCompleteness = Math.round((availableFactorsCount / totalFactors) * 100);

  // Determine dominant factor
  const factorMap: { name: string; score: number; weight: number }[] = [
    { name: 'Affordability', score: priceScore, weight: weights.price },
  ];
  if (ageScore !== null) {
    factorMap.push({ name: 'Product Age', score: ageScore, weight: weights.age });
  }
  if (conditionScore !== null) {
    factorMap.push({ name: 'Condition', score: conditionScore, weight: weights.condition });
  }

  // Sort by weighted contribution (score * weight)
  factorMap.sort((a, b) => (b.score * b.weight) - (a.score * a.weight));
  const dominantFactor = factorMap[0]?.name || 'Balanced';

  // Construct explainable recommendation narrative
  let explanation = '';
  const priceSavings = budget - product.price;
  const savingsPct = budget > 0 ? Math.round((priceSavings / budget) * 100) : 0;

  if (isScoreAdjusted) {
    explanation = `Recommended with dynamic weight renormalization (${missingFactors.join(', ')} not provided). `;
  }

  if (dominantFactor === 'Affordability' && savingsPct >= 20) {
    explanation += `Strongest value on affordability, saving ₹${priceSavings.toLocaleString('en-IN')} (${savingsPct}% below your ₹${budget.toLocaleString('en-IN')} budget).`;
  } else if (dominantFactor === 'Condition' && conditionScore && conditionScore >= 75) {
    explanation += `Selected primarily for superior condition (${product.condition || 'High grade'}), while comfortably fitting inside your budget.`;
  } else if (dominantFactor === 'Product Age' && ageScore && ageScore >= 60) {
    explanation += `Offers modern hardware relevance with low usage age (${product.age} year${(product.age || 0) > 1 ? 's' : ''} old) within budget.`;
  } else {
    explanation += `Offers a well-rounded balance of price (₹${product.price.toLocaleString('en-IN')}), condition (${product.condition || 'N/A'}), and age (${product.age !== undefined ? `${product.age}y` : 'N/A'}).`;
  }

  return {
    product,
    rank: 0,
    finalScore: Number(clampedFinal.toFixed(2)),
    factorScores: {
      priceScore: Number(priceScore.toFixed(2)),
      ageScore: ageScore !== null ? Number(ageScore.toFixed(2)) : null,
      conditionScore: conditionScore !== null ? Number(conditionScore.toFixed(2)) : null,
    },
    effectiveWeights: weights,
    isScoreAdjusted,
    missingFactors,
    dataCompleteness,
    isEligible: true,
    explanation,
    dominantFactor
  };
}

/**
 * Ranks all products for a given budget and weights, handling ties strictly:
 * 1. Higher finalScore
 * 2. Lower current price
 * 3. Younger product (lower age)
 * 4. Alphabetical title
 */
export function rankProducts(
  products: Product[],
  budget: number,
  weights: PriorityWeights,
  maxRefAge: number = DEFAULT_MAX_REF_AGE
): { ranked: RankedProduct[]; ineligible: RankedProduct[] } {
  const evaluated = products.map((p) => calculateProductRank(p, budget, weights, maxRefAge));

  const eligible = evaluated.filter((r) => r.isEligible);
  const ineligible = evaluated.filter((r) => !r.isEligible);

  // Strict tie-break sorting
  eligible.sort((a, b) => {
    // 1. Final score descending
    const scoreDiff = b.finalScore - a.finalScore;
    if (Math.abs(scoreDiff) > 0.001) return scoreDiff;

    // 2. Lower price
    const priceDiff = a.product.price - b.product.price;
    if (Math.abs(priceDiff) > 0.001) return priceDiff;

    // 3. Younger age (lower age preferred; handle undefined age as older)
    const ageA = a.product.age ?? 999;
    const ageB = b.product.age ?? 999;
    if (ageA !== ageB) return ageA - ageB;

    // 4. Alphabetical title
    return a.product.title.localeCompare(b.product.title);
  });

  // Assign ranks & detect ties
  eligible.forEach((item, index) => {
    item.rank = index + 1;
    // Check if score is identical to neighbor
    const prev = eligible[index - 1];
    const next = eligible[index + 1];
    const tiedWithPrev = prev && Math.abs(prev.finalScore - item.finalScore) < 0.001;
    const tiedWithNext = next && Math.abs(next.finalScore - item.finalScore) < 0.001;
    item.isTied = Boolean(tiedWithPrev || tiedWithNext);
  });

  return { ranked: eligible, ineligible };
}
