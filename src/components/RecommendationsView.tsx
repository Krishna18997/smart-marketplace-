import React, { useState, useMemo } from 'react';
import { Product, PriorityMode, PriorityWeights, RankedProduct } from '../types';
import { rankProducts, PRIORITY_PRESETS, DEFAULT_MAX_REF_AGE } from '../utils/ranking';
import { evaluatePriceAnomaly, calculatePriceRatioAndDiscount } from '../utils/priceIntelligence';
import { Sliders, Award, AlertCircle, Info, Scale, Check, ChevronRight, HelpCircle, ArrowRight } from 'lucide-react';

interface RecommendationsViewProps {
  products: Product[];
  categories: string[];
  budget: number;
  setBudget: (budget: number) => void;
  category: string;
  setCategory: (category: string) => void;
  weights: PriorityWeights;
  setWeights: (weights: PriorityWeights) => void;
  priorityMode: PriorityMode;
  setPriorityMode: (mode: PriorityMode) => void;
  maxRefAge: number;
  setMaxRefAge: (age: number) => void;
  onSelectProduct: (product: Product) => void;
  compareList: string[];
  onToggleCompare: (productId: string) => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  products,
  categories,
  budget,
  setBudget,
  category,
  setCategory,
  weights,
  setWeights,
  priorityMode,
  setPriorityMode,
  maxRefAge,
  setMaxRefAge,
  onSelectProduct,
  compareList,
  onToggleCompare,
}) => {
  const [customPriceWeight, setCustomPriceWeight] = useState(50);
  const [customAgeWeight, setCustomAgeWeight] = useState(20);
  const [customConditionWeight, setCustomConditionWeight] = useState(30);

  // Filter products by selected category if not 'All'
  const categoryPool = useMemo(() => {
    if (category === 'All') return products;
    return products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }, [products, category]);

  // Handle preset selection
  const handlePresetSelect = (mode: PriorityMode) => {
    setPriorityMode(mode);
    if (mode === 'balanced') {
      setWeights(PRIORITY_PRESETS.balanced);
    } else if (mode === 'affordability') {
      setWeights(PRIORITY_PRESETS.affordability);
    } else if (mode === 'condition') {
      setWeights(PRIORITY_PRESETS.condition);
    } else if (mode === 'custom') {
      setWeights({
        price: customPriceWeight / 100,
        age: customAgeWeight / 100,
        condition: customConditionWeight / 100,
      });
    }
  };

  // Handle custom weight change with automatic normalization check
  const handleCustomChange = (priceVal: number, ageVal: number, condVal: number) => {
    setCustomPriceWeight(priceVal);
    setCustomAgeWeight(ageVal);
    setCustomConditionWeight(condVal);
    const sum = priceVal + ageVal + condVal;
    if (sum > 0) {
      setWeights({
        price: Number((priceVal / sum).toFixed(4)),
        age: Number((ageVal / sum).toFixed(4)),
        condition: Number((condVal / sum).toFixed(4)),
      });
    }
  };

  // Run Ranking Algorithm
  const { ranked, ineligible } = useMemo(() => {
    return rankProducts(categoryPool, budget, weights, maxRefAge);
  }, [categoryPool, budget, weights, maxRefAge]);

  const top3 = useMemo(() => ranked.slice(0, 3), [ranked]);

  const customSum = customPriceWeight + customAgeWeight + customConditionWeight;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title & Introduction */}
      <div className="space-y-2 pb-6 border-b border-[#DEDCD4]">
        <div className="text-xs uppercase tracking-wider text-[#426B55] font-semibold">
          Section 8 · Transparent Multi-Factor Decision Engine
        </div>
        <h2 className="text-3xl font-serif font-bold text-[#252722] tracking-tight">
          Smart Budget Recommendations
        </h2>
        <p className="text-sm text-[#42433E] max-w-3xl leading-relaxed">
          The recommendation algorithm excludes items exceeding your maximum budget, calculates affordability, product age decay, and condition scores (0–100), redistributes weights dynamically if data is missing, and breaks ties rigorously.
        </p>
      </div>

      {/* Control Cockpit Card */}
      <div className="bg-white border border-[#DEDCD4] rounded-xl p-6 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Budget Input */}
          <div className="md:col-span-4 space-y-2">
            <label htmlFor="budget-input" className="block text-xs font-semibold text-[#42433E]">
              1. Maximum Budget (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#898980]">₹</span>
              <input
                id="budget-input"
                type="number"
                min="0"
                step="any"
                value={budget}
                onChange={(e) => setBudget(Math.max(0, Number(e.target.value)))}
                className="w-full pl-8 pr-3 py-2.5 bg-[#F7F5F0] border border-[#DEDCD4] rounded-lg text-base font-bold tabular-nums text-[#252722] focus:outline-hidden focus:border-[#426B55]"
                placeholder="23000"
              />
            </div>
            <div className="flex gap-2">
              {[15000, 18000, 20000, 23000, 25000].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBudget(b)}
                  className={`text-[11px] px-2 py-0.5 rounded border ${
                    budget === b
                      ? 'bg-[#426B55] text-white border-[#426B55]'
                      : 'bg-[#F7F5F0] text-[#42433E] border-[#DEDCD4] hover:bg-[#EAE3D8]'
                  } tabular-nums`}
                >
                  ₹{b / 1000}k
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-4 space-y-2">
            <label htmlFor="category-select" className="block text-xs font-semibold text-[#42433E]">
              2. Target Category
            </label>
            <select
              id="category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#F7F5F0] border border-[#DEDCD4] rounded-lg text-sm text-[#252722] font-medium focus:outline-hidden focus:border-[#426B55]"
            >
              <option value="All">All Categories ({products.length} listings)</option>
              {categories.map((c) => {
                const count = products.filter((p) => p.category.toLowerCase() === c.toLowerCase()).length;
                return (
                  <option key={c} value={c}>
                    {c} ({count} items)
                  </option>
                );
              })}
            </select>
            <p className="text-[11px] text-[#898980]">
              Recommendations are evaluated within the selected category pool.
            </p>
          </div>

          {/* Max Reference Age Setting */}
          <div className="md:col-span-4 space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="max-ref-age" className="text-xs font-semibold text-[#42433E]">
                3. Reference Age Benchmark
              </label>
              <span className="text-xs font-mono tabular-nums text-[#426B55] font-semibold">
                {maxRefAge} Years Max
              </span>
            </div>
            <input
              id="max-ref-age"
              type="range"
              min="2"
              max="10"
              step="1"
              value={maxRefAge}
              onChange={(e) => setMaxRefAge(Number(e.target.value))}
              className="w-full accent-[#426B55] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#898980]">
              <span>2 Years</span>
              <span className="font-semibold text-[#42433E]">5 Yrs (Standard)</span>
              <span>10 Years</span>
            </div>
          </div>
        </div>

        {/* Priority Selector Tabs */}
        <div className="pt-4 border-t border-[#DEDCD4] space-y-3">
          <label className="block text-xs font-semibold text-[#42433E]">
            4. Buyer Priority Strategy
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => handlePresetSelect('balanced')}
              className={`p-3 text-left rounded-lg border transition-all ${
                priorityMode === 'balanced'
                  ? 'bg-[#EAE3D8] border-[#426B55] text-[#252722] shadow-xs'
                  : 'bg-[#F7F5F0] border-[#DEDCD4] text-[#42433E] hover:bg-[#EAE3D8]/60'
              }`}
            >
              <div className="text-xs font-bold">Balanced</div>
              <div className="text-[11px] text-[#898980] mt-0.5">Price 50% · Age 20% · Cond 30%</div>
            </button>

            <button
              onClick={() => handlePresetSelect('affordability')}
              className={`p-3 text-left rounded-lg border transition-all ${
                priorityMode === 'affordability'
                  ? 'bg-[#EAE3D8] border-[#426B55] text-[#252722] shadow-xs'
                  : 'bg-[#F7F5F0] border-[#DEDCD4] text-[#42433E] hover:bg-[#EAE3D8]/60'
              }`}
            >
              <div className="text-xs font-bold">Affordability First</div>
              <div className="text-[11px] text-[#898980] mt-0.5">Price 70% · Age 10% · Cond 20%</div>
            </button>

            <button
              onClick={() => handlePresetSelect('condition')}
              className={`p-3 text-left rounded-lg border transition-all ${
                priorityMode === 'condition'
                  ? 'bg-[#EAE3D8] border-[#426B55] text-[#252722] shadow-xs'
                  : 'bg-[#F7F5F0] border-[#DEDCD4] text-[#42433E] hover:bg-[#EAE3D8]/60'
              }`}
            >
              <div className="text-xs font-bold">Condition First</div>
              <div className="text-[11px] text-[#898980] mt-0.5">Price 20% · Age 10% · Cond 70%</div>
            </button>

            <button
              onClick={() => handlePresetSelect('custom')}
              className={`p-3 text-left rounded-lg border transition-all ${
                priorityMode === 'custom'
                  ? 'bg-[#EAE3D8] border-[#426B55] text-[#252722] shadow-xs'
                  : 'bg-[#F7F5F0] border-[#DEDCD4] text-[#42433E] hover:bg-[#EAE3D8]/60'
              }`}
            >
              <div className="text-xs font-bold">Custom Weights</div>
              <div className="text-[11px] text-[#898980] mt-0.5">Manual slider allocation</div>
            </button>
          </div>

          {/* Custom Weight Sliders (conditional) */}
          {priorityMode === 'custom' && (
            <div className="p-4 bg-[#F7F5F0] rounded-lg border border-[#DEDCD4] space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#252722]">Fine-tune Factor Weights</span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    customSum === 100 ? 'text-[#426B55]' : 'text-amber-800'
                  }`}
                >
                  Total Weight: {customSum}% {customSum !== 100 && '(Normalizing proportionally to 100%)'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[#42433E]">
                    <span>Affordability Weight</span>
                    <span className="font-mono tabular-nums font-semibold">{customPriceWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={customPriceWeight}
                    onChange={(e) =>
                      handleCustomChange(Number(e.target.value), customAgeWeight, customConditionWeight)
                    }
                    className="w-full accent-[#426B55]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[#42433E]">
                    <span>Product Age Weight</span>
                    <span className="font-mono tabular-nums font-semibold">{customAgeWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={customAgeWeight}
                    onChange={(e) =>
                      handleCustomChange(customPriceWeight, Number(e.target.value), customConditionWeight)
                    }
                    className="w-full accent-[#426B55]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[#42433E]">
                    <span>Condition Weight</span>
                    <span className="font-mono tabular-nums font-semibold">{customConditionWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={customConditionWeight}
                    onChange={(e) =>
                      handleCustomChange(customPriceWeight, customAgeWeight, Number(e.target.value))
                    }
                    className="w-full accent-[#426B55]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Status Bar */}
      <div className="bg-[#EAE3D8]/50 border border-[#DEDCD4] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-[#42433E]">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#426B55] shrink-0" />
          <span>
            Analyzed <strong className="text-[#252722] tabular-nums">{categoryPool.length}</strong> listings in{' '}
            <strong>{category}</strong>. Found{' '}
            <strong className="text-[#426B55] tabular-nums">{ranked.length}</strong> eligible within ₹{budget.toLocaleString('en-IN')}.
          </span>
        </div>

        {ineligible.length > 0 && (
          <div className="text-[#898980]">
            <span className="font-semibold tabular-nums">{ineligible.length}</span> listings excluded due to exceeding ₹{budget.toLocaleString('en-IN')} budget or missing prices.
          </div>
        )}
      </div>

      {/* TOP THREE PODIUM / SPOTLIGHT CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#898980]">Algorithm Selection</span>
            <h3 className="text-2xl font-serif font-bold text-[#252722]">Top 3 Eligible Recommendations</h3>
          </div>
          <span className="text-xs text-[#42433E] bg-white border border-[#DEDCD4] px-3 py-1 rounded-full tabular-nums">
            Priority: {priorityMode.toUpperCase()} ({Math.round(weights.price * 100)}% / {Math.round(weights.age * 100)}% / {Math.round(weights.condition * 100)}%)
          </span>
        </div>

        {top3.length === 0 ? (
          <div className="bg-white border border-[#DEDCD4] rounded-xl p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-[#898980] mx-auto" />
            <h4 className="text-base font-serif font-bold text-[#252722]">No Eligible Products Found Within Budget</h4>
            <p className="text-xs text-[#42433E] max-w-md mx-auto">
              Every item in this category exceeds your current budget of ₹{budget.toLocaleString('en-IN')}. Try increasing your budget or switching categories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {top3.map((item, idx) => {
              const { product, rank, finalScore, factorScores, isScoreAdjusted, missingFactors, dataCompleteness, explanation, dominantFactor, isTied } = item;
              const priceIntel = calculatePriceRatioAndDiscount(product.price, product.originalPrice);
              const anomaly = evaluatePriceAnomaly(product, products);
              const isCompared = compareList.includes(product.id);

              return (
                <div
                  key={product.id}
                  className={`bg-white border rounded-xl overflow-hidden shadow-xs flex flex-col justify-between transition-all relative ${
                    rank === 1
                      ? 'border-[#426B55] ring-1 ring-[#426B55]/20'
                      : 'border-[#DEDCD4] hover:border-[#898980]'
                  }`}
                >
                  {/* Top Rank Header */}
                  <div className="p-5 border-b border-[#DEDCD4] flex items-center justify-between bg-[#F7F5F0]/60">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-serif font-bold ${
                          rank === 1
                            ? 'bg-[#426B55] text-white'
                            : rank === 2
                            ? 'bg-[#EAE3D8] text-[#252722]'
                            : 'bg-[#DEDCD4] text-[#42433E]'
                        }`}
                      >
                        #{rank}
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-[#252722]">
                          {rank === 1 ? 'Best Match (#1)' : rank === 2 ? 'Strong Alternative (#2)' : 'Third Pick (#3)'}
                        </div>
                        {isTied && (
                          <span className="text-[10px] text-[#426B55] font-medium">Tied score (Broken by lower price/age)</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-serif font-bold text-[#252722] tabular-nums">
                        {finalScore}
                      </div>
                      <div className="text-[10px] text-[#898980] uppercase tracking-wider">
                        Score / 100
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4 flex-1">
                    {/* Metadata & Title */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-[#898980] mb-1">
                        <span className="text-[#42433E] font-medium">{product.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{product.condition || 'Condition missing'}</span>
                        <span aria-hidden="true">·</span>
                        <span>{product.age !== undefined ? `${product.age}y old` : 'Age missing'}</span>
                      </div>
                      <h4
                        onClick={() => onSelectProduct(product)}
                        className="text-lg font-serif font-bold text-[#252722] hover:text-[#426B55] cursor-pointer"
                      >
                        {product.title}
                      </h4>
                    </div>

                    {/* Price and Savings */}
                    <div className="p-3 bg-[#F7F5F0] rounded-lg border border-[#DEDCD4] flex items-baseline justify-between">
                      <div>
                        <div className="text-[11px] text-[#898980]">Listing Price</div>
                        <div className="text-xl font-bold text-[#252722] tabular-nums">
                          ₹{product.price.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-[#898980]">Under Budget By</div>
                        <div className="text-sm font-semibold text-[#426B55] tabular-nums">
                          ₹{(budget - product.price).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Factor Breakdown Bars */}
                    <div className="space-y-2 pt-2 border-t border-[#DEDCD4]">
                      <div className="text-xs font-semibold text-[#42433E] flex justify-between">
                        <span>Factor Score Breakdown</span>
                        <span className="text-[11px] text-[#898980]">Raw Score / 100</span>
                      </div>

                      {/* Price Score */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-[#42433E]">
                          <span>Affordability ({Math.round(weights.price * 100)}% weight)</span>
                          <span className="font-mono font-semibold tabular-nums">{factorScores.priceScore}</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#EAE3D8] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#426B55] transition-all duration-300"
                            style={{ width: `${factorScores.priceScore || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Age Score */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-[#42433E]">
                          <span>Product Age ({Math.round(weights.age * 100)}% weight)</span>
                          <span className="font-mono font-semibold tabular-nums">
                            {factorScores.ageScore !== null ? factorScores.ageScore : 'N/A (Excluded)'}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#EAE3D8] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#426B55] transition-all duration-300"
                            style={{ width: `${factorScores.ageScore || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Condition Score */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-[#42433E]">
                          <span>Condition ({Math.round(weights.condition * 100)}% weight)</span>
                          <span className="font-mono font-semibold tabular-nums">
                            {factorScores.conditionScore !== null ? factorScores.conditionScore : 'N/A (Excluded)'}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#EAE3D8] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#426B55] transition-all duration-300"
                            style={{ width: `${factorScores.conditionScore || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Data Completeness & Renormalization Warning */}
                    {isScoreAdjusted && (
                      <div className="text-[11px] text-amber-900 bg-[#F0E5D2] border border-[#DEDCD4] rounded p-2">
                        Dynamic Weight Renormalization applied: {missingFactors.join(', ')} omitted without penalty.
                      </div>
                    )}

                    {/* Explainable Recommendation Narrative */}
                    <div className="p-3 bg-[#F7F5F0] rounded-lg border border-[#DEDCD4] text-xs text-[#42433E] space-y-1">
                      <span className="font-semibold text-[#252722] block">Recommendation Rationale:</span>
                      <p className="leading-relaxed">{explanation}</p>
                    </div>

                    {/* Anomaly Flag if relevant */}
                    {anomaly.isAnomaly && (
                      <div className="text-[11px] text-amber-900 bg-[#F0E5D2] border border-[#DEDCD4] rounded p-2 flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>Price deviates {anomaly.deviationPercent}% from category median. Verify physically before purchase.</span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-4 bg-[#F7F5F0]/60 border-t border-[#DEDCD4] flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectProduct(product)}
                      className="flex-1 py-1.5 px-3 text-xs font-medium text-[#252722] bg-white border border-[#DEDCD4] hover:bg-[#EAE3D8] rounded-lg transition-colors text-center"
                    >
                      View Full Details
                    </button>

                    <button
                      onClick={() => onToggleCompare(product.id)}
                      className={`py-1.5 px-3 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                        isCompared
                          ? 'bg-[#426B55] text-white'
                          : 'bg-white border border-[#DEDCD4] text-[#42433E] hover:bg-[#EAE3D8]'
                      }`}
                    >
                      {isCompared ? <Check className="w-3.5 h-3.5" /> : <Scale className="w-3.5 h-3.5" />}
                      <span>{isCompared ? 'Comparing' : 'Compare'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FULL RANKED TABLE OF ALL ELIGIBLE PRODUCTS */}
      <div className="bg-white border border-[#DEDCD4] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-serif font-bold text-[#252722]">Full Eligible Ranking Table</h4>
            <p className="text-xs text-[#898980]">
              All items within ₹{budget.toLocaleString('en-IN')} ranked strictly by mathematical score and tie-break rules.
            </p>
          </div>
          <span className="text-xs text-[#426B55] font-semibold tabular-nums">
            {ranked.length} Eligible Listings
          </span>
        </div>

        <div className="overflow-x-auto border border-[#DEDCD4] rounded-lg">
          <table className="w-full text-left text-xs text-[#42433E]">
            <thead className="bg-[#F7F5F0] border-b border-[#DEDCD4] text-[#252722] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Price Score</th>
                <th className="py-3 px-4">Age Score</th>
                <th className="py-3 px-4">Condition Score</th>
                <th className="py-3 px-4 font-bold text-[#426B55]">Final Score</th>
                <th className="py-3 px-4">Completeness</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEDCD4]">
              {ranked.map((item) => (
                <tr key={item.product.id} className="hover:bg-[#F7F5F0]/60 transition-colors">
                  <td className="py-3 px-4 font-bold font-mono text-[#252722] tabular-nums">
                    #{item.rank} {item.isTied && <span className="text-[10px] text-[#426B55] font-normal">(tie)</span>}
                  </td>
                  <td className="py-3 px-4 font-medium text-[#252722]">
                    <button
                      onClick={() => onSelectProduct(item.product)}
                      className="hover:underline text-left"
                    >
                      {item.product.title}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-[#898980]">{item.product.category}</td>
                  <td className="py-3 px-4 font-semibold text-[#252722] tabular-nums">
                    ₹{item.product.price.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums">{item.factorScores.priceScore}</td>
                  <td className="py-3 px-4 font-mono tabular-nums">
                    {item.factorScores.ageScore !== null ? item.factorScores.ageScore : 'N/A'}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums">
                    {item.factorScores.conditionScore !== null ? item.factorScores.conditionScore : 'N/A'}
                  </td>
                  <td className="py-3 px-4 font-bold font-mono text-sm text-[#426B55] tabular-nums">
                    {item.finalScore}
                  </td>
                  <td className="py-3 px-4">
                    <span className="tabular-nums font-mono text-[11px] text-[#898980]">
                      {item.dataCompleteness}%
                    </span>
                    {item.isScoreAdjusted && (
                      <span className="block text-[10px] text-amber-800">renormalized</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectProduct(item.product)}
                      className="text-xs text-[#426B55] font-semibold hover:underline"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EXCLUDED PRODUCTS ACCORDION / LIST */}
      {ineligible.length > 0 && (
        <div className="bg-[#F7F5F0] border border-[#DEDCD4] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#898980]" />
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#42433E]">
                Budget Ineligible Listings ({ineligible.length} Items Excluded)
              </h5>
            </div>
            <span className="text-[11px] text-[#898980]">
              Strictly excluded: Cannot be recommended because price &gt; ₹{budget.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {ineligible.map((item) => (
              <div
                key={item.product.id}
                className="bg-white border border-[#DEDCD4] rounded-lg p-3 text-xs flex justify-between items-center"
              >
                <div>
                  <div className="font-medium text-[#252722]">{item.product.title}</div>
                  <div className="text-[11px] text-[#898980]">{item.ineligibleReason}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-rose-800 tabular-nums">
                    ₹{item.product.price?.toLocaleString('en-IN') ?? 'N/A'}
                  </div>
                  <div className="text-[10px] text-[#898980]">Exceeds Budget</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
