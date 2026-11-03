import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { calculateCategoryMedian, evaluatePriceAnomaly, calculatePriceRatioAndDiscount } from '../utils/priceIntelligence';
import { AlertTriangle, Info, TrendingUp, TrendingDown, HelpCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface PriceIntelligenceViewProps {
  products: Product[];
  categories: string[];
  onSelectProduct: (product: Product) => void;
}

export const PriceIntelligenceView: React.FC<PriceIntelligenceViewProps> = ({
  products,
  categories,
  onSelectProduct,
}) => {
  const [anomalyThreshold, setAnomalyThreshold] = useState<number>(50); // Default 50%
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Compute category medians for all categories
  const categoryMedians = useMemo(() => {
    return categories.map((cat) => {
      const { median, count } = calculateCategoryMedian(products, cat);
      return { category: cat, median, count };
    });
  }, [products, categories]);

  // Evaluate anomalies across all products
  const evaluatedProducts = useMemo(() => {
    return products.map((p) => {
      const anomaly = evaluatePriceAnomaly(p, products, anomalyThreshold);
      const priceIntel = calculatePriceRatioAndDiscount(p.price, p.originalPrice);
      return { product: p, anomaly, priceIntel };
    });
  }, [products, anomalyThreshold]);

  // Filter products by selected category
  const filteredEvaluations = useMemo(() => {
    if (selectedCategory === 'All') return evaluatedProducts;
    return evaluatedProducts.filter((item) => item.product.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [evaluatedProducts, selectedCategory]);

  const anomalies = useMemo(() => {
    return filteredEvaluations.filter((item) => item.anomaly.isAnomaly);
  }, [filteredEvaluations]);

  const normalListings = useMemo(() => {
    return filteredEvaluations.filter((item) => !item.anomaly.isAnomaly && item.anomaly.status === 'normal');
  }, [filteredEvaluations]);

  const insufficientDataListings = useMemo(() => {
    return filteredEvaluations.filter((item) => item.anomaly.status === 'insufficient_data');
  }, [filteredEvaluations]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Title & Section Overview */}
      <div className="space-y-2 pb-6 border-b border-[#DEDCD4]">
        <div className="text-xs uppercase tracking-wider text-[#426B55] font-semibold">
          Section 7 & 11 · Analytical Valuation & Statistical Diagnostics
        </div>
        <h2 className="text-3xl font-serif font-bold text-[#252722] tracking-tight">
          Price Intelligence & Anomaly Detection
        </h2>
        <p className="text-sm text-[#42433E] max-w-3xl leading-relaxed">
          Evaluates true economic value using Price-to-Original Price Ratios, absolute discount computations, and category-wise median price deviation benchmarks.
        </p>
      </div>

      {/* Mandatory Educational Disclaimer Banner */}
      <div className="bg-[#F0E5D2] border border-[#DEDCD4] rounded-xl p-5 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-900 shrink-0 mt-0.5" />
        <div className="text-xs text-[#252722] space-y-1">
          <strong className="font-semibold block text-amber-950">Statistical Disclaimer (CSE Problem Statement §11):</strong>
          <p className="leading-relaxed text-[#42433E]">
            "An unusual price indicates a significant deviation from comparable listings in the same category. It is a signal for further checking, not evidence of fraud."
            Flagged items remain accessible for transparency and student discretion.
          </p>
        </div>
      </div>

      {/* Category Median Benchmarks Strip */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#898980]">Category Baselines</span>
            <h3 className="text-xl font-serif font-bold text-[#252722]">Within-Category Median Prices</h3>
          </div>
          <span className="text-xs text-[#898980]">
            Requires ≥3 valid listings per category
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categoryMedians.map(({ category, median, count }) => (
            <div
              key={category}
              onClick={() => setSelectedCategory(selectedCategory === category ? 'All' : category)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedCategory === category
                  ? 'bg-white border-[#426B55] ring-2 ring-[#426B55]/15 shadow-xs'
                  : 'bg-white border-[#DEDCD4] hover:border-[#898980]'
              }`}
            >
              <div className="text-xs text-[#898980] truncate font-medium">{category}</div>
              <div className="text-lg font-bold font-sans text-[#252722] mt-1 tabular-nums">
                {median !== null ? `₹${median.toLocaleString('en-IN')}` : 'N/A'}
              </div>
              <div className="text-[11px] text-[#426B55] mt-1">
                {count >= 3 ? `${count} comparable listings` : `${count} item(s) (Sparse)`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Anomaly Configuration Controls */}
      <div className="bg-white border border-[#DEDCD4] rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DEDCD4]">
          <div>
            <h4 className="text-base font-serif font-bold text-[#252722]">Anomaly Threshold Sensitivity</h4>
            <p className="text-xs text-[#898980]">
              Flag listings when price deviates from category median by more than the specified threshold (default: 50%).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#42433E]">Threshold:</span>
            <span className="text-sm font-mono font-bold text-[#426B55] tabular-nums bg-[#EAE3D8] px-2.5 py-1 rounded">
              ±{anomalyThreshold}%
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min="20"
            max="100"
            step="5"
            value={anomalyThreshold}
            onChange={(e) => setAnomalyThreshold(Number(e.target.value))}
            className="w-full accent-[#426B55] cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-[#898980]">
            <span>±20% (Strict)</span>
            <span className="font-semibold text-[#252722]">±50% (Standard Benchmark)</span>
            <span>±100% (Permissive)</span>
          </div>
        </div>

        {/* Category filter tabs for analysis */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 scrollbar-none">
          <span className="text-xs font-medium text-[#42433E] shrink-0">Filter by category:</span>
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === 'All' ? 'bg-[#426B55] text-white' : 'bg-[#F7F5F0] text-[#42433E] hover:bg-[#EAE3D8]'
            }`}
          >
            All Categories ({evaluatedProducts.length})
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === c ? 'bg-[#426B55] text-white' : 'bg-[#F7F5F0] text-[#42433E] hover:bg-[#EAE3D8]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Flagged Anomaly Listings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
            <h3 className="text-xl font-serif font-bold text-[#252722]">
              Detected Price Anomalies ({anomalies.length} Flagged)
            </h3>
          </div>
          <span className="text-xs text-[#898980]">
            Deviating &gt; {anomalyThreshold}% from respective category median
          </span>
        </div>

        {anomalies.length === 0 ? (
          <div className="bg-white border border-[#DEDCD4] rounded-xl p-8 text-center text-xs text-[#42433E]">
            <CheckCircle2 className="w-6 h-6 text-[#426B55] mx-auto mb-2" />
            <span>No price anomalies detected at the {anomalyThreshold}% threshold in the selected view.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {anomalies.map(({ product, anomaly, priceIntel }) => (
              <div
                key={product.id}
                className="bg-white border border-amber-300 rounded-xl p-5 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] text-[#898980] block">{product.category}</span>
                    <h4
                      onClick={() => onSelectProduct(product)}
                      className="text-base font-serif font-bold text-[#252722] hover:text-[#426B55] cursor-pointer"
                    >
                      {product.title}
                    </h4>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
                      anomaly.direction === 'high'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {anomaly.direction === 'high' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{anomaly.direction === 'high' ? 'High Anomaly' : 'Low Anomaly'}</span>
                  </span>
                </div>

                {/* Math Breakdown Box */}
                <div className="p-3 bg-[#F0E5D2]/50 border border-[#DEDCD4] rounded-lg text-xs space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[#898980]">Listed Price:</span>
                    <span className="text-base font-bold text-[#252722] tabular-nums">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[#898980]">Category Median:</span>
                    <span className="font-semibold text-[#42433E] tabular-nums">
                      ₹{anomaly.categoryMedian?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-1 border-t border-[#DEDCD4]">
                    <span className="font-semibold text-[#252722]">Statistical Deviation:</span>
                    <span className="font-mono font-bold text-amber-900 tabular-nums">
                      +{anomaly.deviationPercent}%
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-[#42433E] leading-relaxed">
                  {anomaly.message}
                </p>

                <button
                  onClick={() => onSelectProduct(product)}
                  className="w-full py-1.5 px-3 text-xs font-medium text-[#252722] bg-[#F7F5F0] hover:bg-[#EAE3D8] rounded-lg transition-colors"
                >
                  Inspect Specifications & Value
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Complete Price Intelligence Table */}
      <div className="bg-white border border-[#DEDCD4] rounded-xl p-6 shadow-xs space-y-4">
        <div>
          <h4 className="text-lg font-serif font-bold text-[#252722]">Price-to-Original Ratio & Discount Ledger</h4>
          <p className="text-xs text-[#898980]">
            Detailed analytical metrics for all products, demonstrating exact formulas required in Section 7.
          </p>
        </div>

        <div className="overflow-x-auto border border-[#DEDCD4] rounded-lg">
          <table className="w-full text-left text-xs text-[#42433E]">
            <thead className="bg-[#F7F5F0] border-b border-[#DEDCD4] text-[#252722] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Price</th>
                <th className="py-3 px-4">Original Price</th>
                <th className="py-3 px-4">Discount Amount</th>
                <th className="py-3 px-4">Discount %</th>
                <th className="py-3 px-4">Price Ratio %</th>
                <th className="py-3 px-4">Category Median</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEDCD4]">
              {filteredEvaluations.map(({ product, anomaly, priceIntel }) => (
                <tr key={product.id} className="hover:bg-[#F7F5F0]/60 transition-colors">
                  <td className="py-3 px-4 font-medium text-[#252722]">
                    <button
                      onClick={() => onSelectProduct(product)}
                      className="hover:underline text-left"
                    >
                      {product.title}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-[#898980]">{product.category}</td>
                  <td className="py-3 px-4 font-bold text-[#252722] tabular-nums">
                    ₹{product.price.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 tabular-nums">
                    {product.originalPrice ? `₹${product.originalPrice.toLocaleString('en-IN')}` : 'Not provided'}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums">
                    {priceIntel.discountAmount !== null ? `₹${priceIntel.discountAmount.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-[#426B55] tabular-nums">
                    {priceIntel.discountPercent !== null ? `${priceIntel.discountPercent}%` : '—'}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums">
                    {priceIntel.ratioPercent !== null ? `${priceIntel.ratioPercent}%` : '—'}
                  </td>
                  <td className="py-3 px-4 tabular-nums">
                    {anomaly.categoryMedian ? `₹${anomaly.categoryMedian.toLocaleString('en-IN')}` : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    {anomaly.isAnomaly ? (
                      <span className="text-[11px] font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                        Unusual ({anomaly.direction === 'high' ? '+' : '-'}{anomaly.deviationPercent}%)
                      </span>
                    ) : anomaly.status === 'insufficient_data' ? (
                      <span className="text-[11px] text-[#898980] italic">
                        &lt;3 listings
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#426B55]">
                        Normal
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
