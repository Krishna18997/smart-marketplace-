import React, { useMemo } from 'react';
import { Product } from '../types';
import { rankProducts, PRIORITY_PRESETS } from '../utils/ranking';
import { ArrowUpRight, ArrowDownRight, Minus, Scale } from 'lucide-react';

interface PriceVsConditionMatrixProps {
  products: Product[];
  budget: number;
  onSelectProduct: (product: Product) => void;
}

export const PriceVsConditionMatrix: React.FC<PriceVsConditionMatrixProps> = ({
  products,
  budget,
  onSelectProduct,
}) => {
  // Rank across the three core modes
  const balancedRanked = useMemo(() => {
    return rankProducts(products, budget, PRIORITY_PRESETS.balanced).ranked;
  }, [products, budget]);

  const affordabilityRanked = useMemo(() => {
    return rankProducts(products, budget, PRIORITY_PRESETS.affordability).ranked;
  }, [products, budget]);

  const conditionRanked = useMemo(() => {
    return rankProducts(products, budget, PRIORITY_PRESETS.condition).ranked;
  }, [products, budget]);

  // Merge products for comparative table
  const comparativeRows = useMemo(() => {
    const map = new Map<
      string,
      {
        product: Product;
        balancedScore: number;
        balancedRank: number;
        affordabilityScore: number;
        affordabilityRank: number;
        conditionScore: number;
        conditionRank: number;
      }
    >();

    balancedRanked.forEach((r) => {
      map.set(r.product.id, {
        product: r.product,
        balancedScore: r.finalScore,
        balancedRank: r.rank,
        affordabilityScore: 0,
        affordabilityRank: 999,
        conditionScore: 0,
        conditionRank: 999,
      });
    });

    affordabilityRanked.forEach((r) => {
      const entry = map.get(r.product.id);
      if (entry) {
        entry.affordabilityScore = r.finalScore;
        entry.affordabilityRank = r.rank;
      }
    });

    conditionRanked.forEach((r) => {
      const entry = map.get(r.product.id);
      if (entry) {
        entry.conditionScore = r.finalScore;
        entry.conditionRank = r.rank;
      }
    });

    return Array.from(map.values()).sort((a, b) => a.balancedRank - b.balancedRank);
  }, [balancedRanked, affordabilityRanked, conditionRanked]);

  const renderRankShift = (baseRank: number, newRank: number) => {
    if (newRank < baseRank) {
      return (
        <span className="inline-flex items-center text-xs font-semibold text-[#426B55]">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>+{baseRank - newRank}</span>
        </span>
      );
    }
    if (newRank > baseRank) {
      return (
        <span className="inline-flex items-center text-xs font-semibold text-rose-700">
          <ArrowDownRight className="w-3.5 h-3.5" />
          <span>-{newRank - baseRank}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-xs text-[#898980]">
        <Minus className="w-3 h-3" />
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2 pb-6 border-b border-[#DEDCD4]">
        <div className="text-xs uppercase tracking-wider text-[#426B55] font-semibold">
          Section 12 · Sensitivity Analysis & Mathematical Dynamic Proof
        </div>
        <h2 className="text-3xl font-serif font-bold text-[#252722] tracking-tight">
          Price vs Condition Sensitivity Matrix
        </h2>
        <p className="text-sm text-[#42433E] max-w-3xl leading-relaxed">
          This matrix proves that recommendations are dynamically derived rather than hardcoded. Observe how items shift ranks when buyer priorities tilt toward Affordability (Price 70%) versus Condition (Condition 70%).
        </p>
      </div>

      {/* 3 Strategy Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#DEDCD4] rounded-xl p-5 shadow-xs space-y-3">
          <div className="text-xs uppercase tracking-wider text-[#898980]">Strategy Mode 1</div>
          <h3 className="text-lg font-serif font-bold text-[#252722]">Balanced Preference</h3>
          <div className="p-3 bg-[#F7F5F0] rounded-lg text-xs space-y-1 font-mono text-[#42433E]">
            <div>Price Weight: 50%</div>
            <div>Age Weight: 20%</div>
            <div>Condition Weight: 30%</div>
          </div>
          <p className="text-xs text-[#42433E] leading-relaxed">
            Standard baseline balancing economic savings, hardware wear, and cosmetic rating.
          </p>
        </div>

        <div className="bg-white border border-[#426B55] rounded-xl p-5 shadow-xs space-y-3 ring-1 ring-[#426B55]/15">
          <div className="text-xs uppercase tracking-wider text-[#426B55]">Strategy Mode 2</div>
          <h3 className="text-lg font-serif font-bold text-[#252722]">Affordability First</h3>
          <div className="p-3 bg-[#F7F5F0] rounded-lg text-xs space-y-1 font-mono text-[#426B55] font-semibold">
            <div>Price Weight: 70%</div>
            <div>Age Weight: 10%</div>
            <div>Condition Weight: 20%</div>
          </div>
          <p className="text-xs text-[#42433E] leading-relaxed">
            Prioritizes raw financial savings under budget. Heavily rewards lowest-priced listings like Laptop E.
          </p>
        </div>

        <div className="bg-white border border-[#DEDCD4] rounded-xl p-5 shadow-xs space-y-3">
          <div className="text-xs uppercase tracking-wider text-[#898980]">Strategy Mode 3</div>
          <h3 className="text-lg font-serif font-bold text-[#252722]">Condition First</h3>
          <div className="p-3 bg-[#F7F5F0] rounded-lg text-xs space-y-1 font-mono text-[#42433E]">
            <div>Price Weight: 20%</div>
            <div>Age Weight: 10%</div>
            <div>Condition Weight: 70%</div>
          </div>
          <p className="text-xs text-[#42433E] leading-relaxed">
            Demands pristine cosmetic and functional state. Elevates Excellent and Good items like Laptop C and D.
          </p>
        </div>
      </div>

      {/* Comparative Sensitivity Table */}
      <div className="bg-white border border-[#DEDCD4] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-serif font-bold text-[#252722]">Sensitivity Rank Shift Table</h4>
            <p className="text-xs text-[#898980]">
              Evaluation against Maximum Budget: ₹{budget.toLocaleString('en-IN')}
            </p>
          </div>
          <span className="text-xs text-[#426B55] font-semibold tabular-nums">
            {comparativeRows.length} Eligible Items Analyzed
          </span>
        </div>

        <div className="overflow-x-auto border border-[#DEDCD4] rounded-lg">
          <table className="w-full text-left text-xs text-[#42433E]">
            <thead className="bg-[#F7F5F0] border-b border-[#DEDCD4] text-[#252722] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4 bg-[#EAE3D8]/40">Balanced Score (Rank)</th>
                <th className="py-3 px-4">Affordability Score (Rank)</th>
                <th className="py-3 px-4">Shift vs Balanced</th>
                <th className="py-3 px-4">Condition Score (Rank)</th>
                <th className="py-3 px-4">Shift vs Balanced</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEDCD4]">
              {comparativeRows.map((row) => (
                <tr key={row.product.id} className="hover:bg-[#F7F5F0]/60 transition-colors">
                  <td className="py-3 px-4 font-medium text-[#252722]">
                    <button
                      onClick={() => onSelectProduct(row.product)}
                      className="hover:underline text-left font-bold"
                    >
                      {row.product.title}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-[#898980]">{row.product.category}</td>
                  <td className="py-3 px-4 font-semibold text-[#252722] tabular-nums">
                    ₹{row.product.price.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">{row.product.condition || 'N/A'}</td>

                  {/* Balanced */}
                  <td className="py-3 px-4 bg-[#EAE3D8]/30 font-mono font-bold text-[#252722] tabular-nums">
                    {row.balancedScore} <span className="text-[11px] font-normal text-[#898980]">(#{row.balancedRank})</span>
                  </td>

                  {/* Affordability */}
                  <td className="py-3 px-4 font-mono font-semibold text-[#426B55] tabular-nums">
                    {row.affordabilityScore} <span className="text-[11px] font-normal text-[#898980]">(#{row.affordabilityRank})</span>
                  </td>
                  <td className="py-3 px-4">
                    {renderRankShift(row.balancedRank, row.affordabilityRank)}
                  </td>

                  {/* Condition */}
                  <td className="py-3 px-4 font-mono font-semibold text-[#294C3A] tabular-nums">
                    {row.conditionScore} <span className="text-[11px] font-normal text-[#898980]">(#{row.conditionRank})</span>
                  </td>
                  <td className="py-3 px-4">
                    {renderRankShift(row.balancedRank, row.conditionRank)}
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
