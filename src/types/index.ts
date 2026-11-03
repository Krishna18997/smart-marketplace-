export type Condition = 'Excellent' | 'Good' | 'Average' | 'Poor';

export type Category = 'Laptops' | 'Electronics' | 'Books' | 'Bicycles' | 'Gadgets' | 'Accessories' | 'Other' | string;

export type ListingType = 'buy' | 'rent';

export interface Product {
  id: string;
  title: string;
  category: Category;
  price: number; // Current Price in INR (₹) - For sale price or rental rate
  originalPrice?: number; // Optional original retail price
  age?: number; // Age in years (can be missing)
  condition?: Condition | string; // Condition rating (can be missing)
  listingType?: ListingType; // 'buy' (default) or 'rent'
  rentDuration?: string; // e.g. 'month', 'semester', 'day'
  specifications?: Record<string, string>; // Optional specifications
  description?: string;
  image?: string; // Image URL or Base64 data URL
  isCustom?: boolean; // Added by user in prototype
  createdAt?: string;
}

export type PriorityMode = 'balanced' | 'affordability' | 'condition' | 'custom';

export interface PriorityWeights {
  price: number; // 0 to 1
  age: number;   // 0 to 1
  condition: number; // 0 to 1
}

export interface FactorScores {
  priceScore: number | null; // 0-100 or null if missing
  ageScore: number | null;   // 0-100 or null if missing
  conditionScore: number | null; // 0-100 or null if missing
}

export interface RankedProduct {
  product: Product;
  rank: number;
  finalScore: number; // 0-100
  factorScores: FactorScores;
  effectiveWeights: PriorityWeights;
  isScoreAdjusted: boolean;
  missingFactors: string[];
  dataCompleteness: number; // 0 to 100 %
  isEligible: boolean;
  ineligibleReason?: string;
  explanation: string;
  dominantFactor: string;
  isTied?: boolean;
}

export interface AnomalyReport {
  isAnomaly: boolean;
  direction?: 'high' | 'low';
  deviationPercent?: number;
  categoryMedian?: number;
  comparableCount: number;
  status: 'normal' | 'unusually_high' | 'unusually_low' | 'insufficient_data' | 'invalid_median';
  message: string;
}

export interface PriceRatioReport {
  ratioPercent: number | null;
  discountAmount: number | null;
  discountPercent: number | null;
  isValid: boolean;
}
