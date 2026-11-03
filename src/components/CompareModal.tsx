import React from 'react';
import { Product, PriorityWeights } from '../types';
import { calculatePriceRatioAndDiscount, evaluatePriceAnomaly } from '../utils/priceIntelligence';
import { calculateProductRank } from '../utils/ranking';
import { X, Scale, AlertTriangle, Trash2 } from 'lucide-react';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  compareIds: string[];
  allProducts: Product[];
  onRemoveFromCompare: (id: string) => void;
  onClearCompare: () => void;
  budget: number;
  weights: PriorityWeights;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  compareIds,
  allProducts,
  onRemoveFromCompare,
  onClearCompare,
  budget,
  weights,
}) => {
  if (!isOpen) return null;

  const comparedProducts = allProducts.filter((p) => compareIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#DEDCD4] rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-[#DEDCD4] flex items-center justify-between bg-[#F7F5F0]">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#426B55]" />
            <div>
              <h3 className="text-lg font-serif font-bold text-[#252722]">
                Side-by-Side Product Comparison ({comparedProducts.length} of 3)
              </h3>
              <p className="text-xs text-[#898980]">
                Comparative analysis evaluated against maximum budget of ₹{budget.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {comparedProducts.length > 0 && (
              <button
                onClick={onClearCompare}
                className="text-xs text-[#898980] hover:text-rose-700 underline px-2 py-1"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-[#EAE3D8] text-[#898980] hover:text-[#252722] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {comparedProducts.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#42433E] space-y-2">
              <Scale className="w-8 h-8 text-[#898980] mx-auto" />
              <p className="font-semibold text-sm text-[#252722]">No products selected for comparison</p>
              <p className="text-[#898980]">
                Click the "Compare" button on any product card in the marketplace or recommendations view to compare up to 3 listings side-by-side.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#DEDCD4] rounded-lg">
                <thead className="bg-[#F7F5F0] border-b border-[#DEDCD4]">
                  <tr>
                    <th className="py-3 px-4 font-semibold text-[#898980] w-1/4">Metric</th>
                    {comparedProducts.map((p) => (
                      <th key={p.id} className="py-3 px-4 font-serif font-bold text-[#252722] text-sm">
                        <div className="flex items-center justify-between">
                          <span className="truncate">{p.title}</span>
                          <button
                            onClick={() => onRemoveFromCompare(p.id)}
                            className="text-rose-600 hover:text-rose-800 text-xs ml-2"
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                        <span className="text-[11px] font-sans font-normal text-[#898980]">{p.category}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DEDCD4]">
                  {/* Listing Type */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#42433E] bg-[#F7F5F0]/50">Listing Type</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="py-3 px-4">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                            p.listingType === 'rent'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-[#EAE3D8] text-[#252722] border border-[#DEDCD4]'
                          }`}
                        >
                          {p.listingType === 'rent' ? `Rent (${p.rentDuration || '/mo'})` : 'Buy'}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Current Price */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#42433E] bg-[#F7F5F0]/50">Price</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="py-3 px-4 font-bold text-base text-[#252722] tabular-nums">
                        ₹{p.price.toLocaleString('en-IN')}
                        {p.listingType === 'rent' && (
                          <span className="text-xs font-normal text-[#898980] ml-1">
                            {p.rentDuration || '/mo'}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Original Retail Price */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#42433E] bg-[#F7F5F0]/50">Original Retail Price</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="py-3 px-4 tabular-nums text-[#42433E]">
                        {p.originalPrice ? `₹${p.originalPrice.toLocaleString('en-IN')}` : 'Not provided'}
                      </td>
                    ))}
                  </tr>

                  {/* Discount & Savings */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#42433E] bg-[#F7F5F0]/50">Discount Amount & %</td>
                    {comparedProducts.map((p) => {
                      const intel = calculatePriceRatioAndDiscount(p.price, p.originalPrice);
                      return (
                        <td key={p.id} className="py-3 px-4 tabular-nums">
                          {intel.isValid ? (
                            <span className="text-[#426B55] font-semibold">
                              ₹{intel.discountAmount?.toLocaleString('en-IN')} ({intel.discountPercent}% OFF)
                            </span>
                          ) : (
                            <span className="text-[#898980]">N/A</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Price Ratio */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#42433E] bg-[#F7F5F0]/50">Price Ratio %</td>
                    {comparedProducts.map((p) => {
                      const intel = calculatePriceRatioAndDiscount(p.price, p.originalPrice);
                      return (
                        <td key={p.id} className="py-3 px-4 tabular-nums font-mono">
                          {intel.ratioPercent !== null ? `${intel.ratioPercent}% of retail` : 'N/A'}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Usage Age */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#42433E] bg-[#F7F5F0]/50">Usage Age</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="py-3 px-4 tabular-nums text-[#252722]">
                        {p.age !== undefined ? `${p.age} year${p.age > 1 ? 's' : ''}` : 'Age not provided'}
                      </td>
                    ))}
                  </tr>

                  {/* Condition Grade */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#42433E] bg-[#F7F5F0]/50">Condition Grade</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="py-3 px-4 font-medium text-[#252722]">
                        {p.condition || 'Condition not specified'}
                      </td>
                    ))}
                  </tr>

                  {/* Recommendation Score against Budget */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#42433E] bg-[#F7F5F0]/50">
                      Recommendation Score
                    </td>
                    {comparedProducts.map((p) => {
                      const rank = calculateProductRank(p, budget, weights);
                      return (
                        <td key={p.id} className="py-3 px-4">
                          {rank.isEligible ? (
                            <div>
                              <span className="text-base font-serif font-bold text-[#426B55] tabular-nums">
                                {rank.finalScore} / 100
                              </span>
                              <div className="text-[10px] text-[#898980]">
                                Price: {rank.factorScores.priceScore} · Age: {rank.factorScores.ageScore ?? 'N/A'} · Cond: {rank.factorScores.conditionScore ?? 'N/A'}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-rose-700">Ineligible: Exceeds budget</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Statistical Anomaly Status */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#42433E] bg-[#F7F5F0]/50">Anomaly Check</td>
                    {comparedProducts.map((p) => {
                      const anomaly = evaluatePriceAnomaly(p, allProducts);
                      return (
                        <td key={p.id} className="py-3 px-4">
                          {anomaly.isAnomaly ? (
                            <span className="text-[11px] font-semibold text-amber-900 bg-[#F0E5D2] px-2 py-0.5 rounded">
                              Unusual ({anomaly.direction === 'high' ? '+' : '-'}{anomaly.deviationPercent}%)
                            </span>
                          ) : (
                            <span className="text-[#426B55] text-xs">Category Normal</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="p-4 bg-[#F7F5F0] border-t border-[#DEDCD4] text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#252722] bg-white border border-[#DEDCD4] hover:bg-[#EAE3D8] rounded-lg transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
