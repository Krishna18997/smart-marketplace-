import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePriceScore,
  calculateAgeScore,
  calculateConditionScore,
  calculateProductRank,
  rankProducts,
  PRIORITY_PRESETS
} from './ranking';
import {
  calculatePriceRatioAndDiscount,
  calculateCategoryMedian,
  evaluatePriceAnomaly
} from './priceIntelligence';
import { parseCSV, parseJSON, normalizeProductRecord } from './validation';
import { Product } from '../types';

test('Price Score calculation strictly matches prompt specifications', () => {
  const budget = 23000;
  // Laptop A: price 22000 -> ((23000 - 22000)/23000)*100 = 4.3478%
  const scoreA = calculatePriceScore(budget, 22000);
  assert.equal(Number(scoreA.toFixed(2)), 4.35);

  // Laptop B: price 18000 -> ((23000 - 18000)/23000)*100 = 21.739%
  const scoreB = calculatePriceScore(budget, 18000);
  assert.equal(Number(scoreB.toFixed(2)), 21.74);

  // Price equal to budget must receive 0
  const scoreEqual = calculatePriceScore(budget, 23000);
  assert.equal(scoreEqual, 0);

  // Price higher than budget
  const scoreOver = calculatePriceScore(budget, 25000);
  assert.equal(scoreOver, 0);
});

test('Age Score calculation adheres to configurable reference age', () => {
  const maxRefAge = 5;
  // Laptop A: age 2 -> ((5 - 2)/5)*100 = 60
  const scoreA = calculateAgeScore(2, maxRefAge);
  assert.equal(scoreA, 60);

  // Laptop C: age 1 -> ((5 - 1)/5)*100 = 80
  const scoreC = calculateAgeScore(1, maxRefAge);
  assert.equal(scoreC, 80);

  // Age exceeding reference age receives 0
  const scoreOld = calculateAgeScore(6, maxRefAge);
  assert.equal(scoreOld, 0);

  // Missing or negative age returns null (handled separately)
  assert.equal(calculateAgeScore(undefined, maxRefAge), null);
  assert.equal(calculateAgeScore(null, maxRefAge), null);
});

test('Condition Score mapping handles casing and whitespace', () => {
  assert.equal(calculateConditionScore('Excellent'), 100);
  assert.equal(calculateConditionScore(' good '), 75);
  assert.equal(calculateConditionScore('AVERAGE'), 50);
  assert.equal(calculateConditionScore('Poor'), 25);
  assert.equal(calculateConditionScore(''), null);
  assert.equal(calculateConditionScore('unknown'), null);
});

test('Sample 5 Laptops ranked against Budget ₹23,000 matches specification', () => {
  const sampleProducts: Product[] = [
    { id: 'P01', title: 'Laptop A', category: 'Electronics', price: 22000, age: 2, condition: 'Good', originalPrice: 45000 },
    { id: 'P02', title: 'Laptop B', category: 'Electronics', price: 18000, age: 3, condition: 'Average', originalPrice: 42000 },
    { id: 'P03', title: 'Laptop C', category: 'Electronics', price: 25000, age: 1, condition: 'Excellent', originalPrice: 48000 },
    { id: 'P04', title: 'Laptop D', category: 'Electronics', price: 20000, age: 2, condition: 'Good', originalPrice: 40000 },
    { id: 'P05', title: 'Laptop E', category: 'Electronics', price: 15000, age: 4, condition: 'Average', originalPrice: 38000 }
  ];

  const budget = 23000;
  const { ranked, ineligible } = rankProducts(sampleProducts, budget, PRIORITY_PRESETS.balanced);

  // Laptop C (₹25,000) must be ineligible
  assert.equal(ineligible.length, 1);
  assert.equal(ineligible[0].product.id, 'P03');
  assert.equal(ineligible[0].isEligible, false);

  // Eligible products count
  assert.equal(ranked.length, 4);

  // Ranked order under Balanced (Price 50%, Age 20%, Condition 30%):
  // Laptop D: Price=13.04, Age=60, Cond=75 -> 41.02 -> Rank 1
  // Laptop A: Price=4.35, Age=60, Cond=75 -> 36.68 -> Rank 2
  // Laptop E: Price=34.78, Age=20, Cond=50 -> 36.39 -> Rank 3
  // Laptop B: Price=21.74, Age=40, Cond=50 -> 33.87 -> Rank 4
  assert.equal(ranked[0].product.id, 'P04'); // Laptop D
  assert.equal(ranked[1].product.id, 'P01'); // Laptop A
  assert.equal(ranked[2].product.id, 'P05'); // Laptop E
  assert.equal(ranked[3].product.id, 'P02'); // Laptop B

  // Verify Top 3 picks
  const top3 = ranked.slice(0, 3).map((r) => r.product.id);
  assert.deepEqual(top3, ['P04', 'P01', 'P05']);
});

test('Dynamic Buyer Preferences alter product rankings', () => {
  const sampleProducts: Product[] = [
    { id: 'P01', title: 'Laptop A', category: 'Electronics', price: 22000, age: 2, condition: 'Good' },
    { id: 'P04', title: 'Laptop D', category: 'Electronics', price: 20000, age: 2, condition: 'Good' },
    { id: 'P05', title: 'Laptop E', category: 'Electronics', price: 15000, age: 4, condition: 'Average' }
  ];
  const budget = 23000;

  // Under Affordability First (Price 70%, Age 10%, Condition 20%):
  // Laptop E (cheapest at 15000) has Price Score 34.78 * 0.70 = 24.35 + 2 + 10 = 36.35
  const { ranked: affRanked } = rankProducts(sampleProducts, budget, PRIORITY_PRESETS.affordability);
  assert.equal(affRanked[0].product.id, 'P05'); // Laptop E jumps to Rank 1!
});

test('Missing value dynamic weight renormalization redistributes weights proportionally', () => {
  const productNoCond: Product = {
    id: 'PX',
    title: 'Item X',
    category: 'Electronics',
    price: 15000,
    age: 2,
    condition: undefined // Missing condition!
  };
  const budget = 20000;
  // Balanced: Price 0.50, Age 0.20, Condition 0.30
  // Available weights sum = 0.50 + 0.20 = 0.70
  // Price Score: ((20000 - 15000)/20000)*100 = 25
  // Age Score: ((5 - 2)/5)*100 = 60
  // Adjusted Score = (25 * 0.50 + 60 * 0.20) / 0.70 = (12.5 + 12) / 0.70 = 24.5 / 0.70 = 35.00
  const result = calculateProductRank(productNoCond, budget, PRIORITY_PRESETS.balanced);
  assert.equal(result.isScoreAdjusted, true);
  assert.ok(result.missingFactors.includes('Condition'));
  assert.equal(result.finalScore, 35.00);
  assert.equal(result.dataCompleteness, 67); // 2 of 3 factors
});

test('Price Intelligence formulas match prompt requirements', () => {
  // Laptop A: Current = 22000, Original = 45000
  // Price Ratio = (22000 / 45000) * 100 = 48.89%
  // Discount Amount = 45000 - 22000 = 23000
  // Discount Percent = ((45000 - 22000)/45000)*100 = 51.11%
  const report = calculatePriceRatioAndDiscount(22000, 45000);
  assert.equal(report.isValid, true);
  assert.equal(report.ratioPercent, 48.89);
  assert.equal(report.discountAmount, 23000);
  assert.equal(report.discountPercent, 51.11);

  // Missing or zero original price
  const invalidReport = calculatePriceRatioAndDiscount(22000, 0);
  assert.equal(invalidReport.isValid, false);
  assert.equal(invalidReport.ratioPercent, null);
});

test('Category Median and Price Anomaly Detection with >= 3 listings', () => {
  const books: Product[] = [
    { id: 'B1', title: 'Math Book', category: 'Books', price: 300 },
    { id: 'B2', title: 'Physics Book', category: 'Books', price: 400 },
    { id: 'B3', title: 'Chemistry Book', category: 'Books', price: 500 },
    { id: 'B4', title: 'Rare Antique Book', category: 'Books', price: 1200 } // Unusually high
  ];

  // Median for 4 books: sorted [300, 400, 500, 1200] -> avg(400, 500) = 450
  const { median, count } = calculateCategoryMedian(books, 'Books');
  assert.equal(count, 4);
  assert.equal(median, 450);

  // Evaluate B4 (1200): diff = |1200 - 450| = 750. Deviation = (750 / 450) * 100 = 166.67% > 50%
  const anomalyReport = evaluatePriceAnomaly(books[3], books, 50);
  assert.equal(anomalyReport.isAnomaly, true);
  assert.equal(anomalyReport.direction, 'high');
  assert.equal(anomalyReport.deviationPercent, 166.67);

  // Insufficient comparable listings check (< 3)
  const sparseListings: Product[] = [
    { id: 'G1', title: 'Gadget 1', category: 'Gadgets', price: 1000 },
    { id: 'G2', title: 'Gadget 2', category: 'Gadgets', price: 2000 }
  ];
  const sparseReport = evaluatePriceAnomaly(sparseListings[0], sparseListings, 50);
  assert.equal(sparseReport.status, 'insufficient_data');
  assert.equal(sparseReport.isAnomaly, false);
});

test('CSV & JSON parsers normalize column variations and report errors', () => {
  const csv = `item,currentPrice,original_price,ageYears,condition,category
"Mechanical Keyboard",2500,4000,1,"Good","Gadgets"
"Broken Item",-50,100,2,"Poor","Gadgets"`;

  const parsed = parseCSV(csv);
  assert.equal(parsed.validProducts.length, 1);
  assert.equal(parsed.validProducts[0].title, 'Mechanical Keyboard');
  assert.equal(parsed.validProducts[0].price, 2500);
  assert.equal(parsed.validProducts[0].age, 1);
  assert.equal(parsed.errors.length, 1); // Row 3 had negative price
});

test('Support for Laptops category, arbitrary price (e.g. 500), and Buy/Rent listing types', () => {
  // Test arbitrary price like 500
  const normalized = normalizeProductRecord({
    title: 'Calculus Textbook',
    price: 500,
    category: 'Books',
    condition: 'Good',
    listingType: 'buy'
  });
  assert.ok(normalized.product && !normalized.error);
  assert.equal(normalized.product?.price, 500);

  // Test Laptops category and Rent listing type
  const rentalLaptop = normalizeProductRecord({
    title: 'Dell Latitude Rental',
    price: 1200,
    category: 'Laptops',
    condition: 'Good',
    listingType: 'rent',
    rentDuration: '/month'
  });
  assert.ok(rentalLaptop.product && !rentalLaptop.error);
  assert.equal(rentalLaptop.product?.category, 'Laptops');
  assert.equal(rentalLaptop.product?.listingType, 'rent');
  assert.equal(rentalLaptop.product?.rentDuration, '/month');

  // Verify search tokenization across title, category, and listing type
  const searchCorpus = [
    rentalLaptop.product?.title,
    rentalLaptop.product?.category,
    rentalLaptop.product?.listingType === 'rent' ? 'rent rental campus rent' : 'buy sale'
  ].join(' ').toLowerCase();

  const query = 'dell rent laptop';
  const tokens = query.split(' ');
  const matches = tokens.every((token) => searchCorpus.includes(token));
  assert.equal(matches, true);
});

