import React, { useState } from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Calculator, ArrowDownRight } from 'lucide-react';
import { ActiveTab } from './Navbar';

interface HeroSectionProps {
  onNavigate: (tab: ActiveTab) => void;
  onQuickRecommend: (budget: number, category: string) => void;
  categories: string[];
  totalListings: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onNavigate,
  onQuickRecommend,
  categories,
  totalListings,
}) => {
  const [quickBudget, setQuickBudget] = useState<number>(23000);
  const [quickCategory, setQuickCategory] = useState<string>('All');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQuickRecommend(quickBudget, quickCategory);
  };

  return (
    <section className="relative overflow-hidden pt-10 pb-16 border-b border-[#DEDCD4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Editorial Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="text-xs uppercase tracking-widest text-[#426B55] font-semibold">
              Campus Commerce & Value Analytics · CSE Engineering Capstone
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#252722] tracking-tight leading-[1.1] max-w-2xl text-balance">
              Find better. Spend smarter.
            </h1>

            <p className="text-lg text-[#42433E] max-w-xl font-normal leading-relaxed">
              A smarter way for students to discover fairly priced second-hand essentials.
              Compare campus listings with explainable, budget-aware mathematical ranking and real-time price anomaly detection.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('marketplace')}
                className="px-5 py-3 text-sm font-medium text-white bg-[#426B55] hover:bg-[#294C3A] rounded-lg transition-colors shadow-xs inline-flex items-center gap-2"
              >
                <span>Explore Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('recommendations')}
                className="px-5 py-3 text-sm font-medium text-[#252722] bg-[#EAE3D8] hover:bg-[#DEDCD4] rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <span>Find My Best Deal</span>
                <ArrowDownRight className="w-4 h-4 text-[#426B55]" />
              </button>
            </div>
          </div>

          {/* Right Column: Quick Budget-Aware Recommendation Entry Point */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-[#DEDCD4] rounded-xl p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#DEDCD4]">
                <div>
                  <h2 className="text-base font-serif font-bold text-[#252722]">Instant Deal Finder</h2>
                  <p className="text-xs text-[#898980]">Rank listings against your budget in seconds</p>
                </div>
                <div className="text-xs text-[#426B55] font-medium bg-[#EAE3D8]/60 px-2.5 py-1 rounded">
                  Algorithm v1.0
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="quick-budget" className="block text-xs font-medium text-[#42433E] mb-1.5">
                    Your Maximum Budget (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#898980]">
                      ₹
                    </span>
                    <input
                      id="quick-budget"
                      type="number"
                      min="0"
                      step="any"
                      value={quickBudget}
                      onChange={(e) => setQuickBudget(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-8 pr-4 py-2.5 bg-[#F7F5F0] border border-[#DEDCD4] rounded-lg text-sm text-[#252722] font-semibold tabular-nums focus:outline-hidden focus:border-[#426B55]"
                      placeholder="e.g. 23000"
                      required
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[15000, 20000, 23000, 25000].map((quick) => (
                      <button
                        key={quick}
                        type="button"
                        onClick={() => setQuickBudget(quick)}
                        className={`text-xs px-2 py-0.5 rounded border ${
                          quickBudget === quick
                            ? 'bg-[#426B55] text-white border-[#426B55]'
                            : 'bg-[#F7F5F0] text-[#42433E] border-[#DEDCD4] hover:bg-[#EAE3D8]'
                        } tabular-nums`}
                      >
                        ₹{quick.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="quick-category" className="block text-xs font-medium text-[#42433E] mb-1.5">
                    Target Category
                  </label>
                  <select
                    id="quick-category"
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F7F5F0] border border-[#DEDCD4] rounded-lg text-sm text-[#252722] focus:outline-hidden focus:border-[#426B55]"
                  >
                    <option value="All">All Categories ({totalListings} items)</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-[#F7F5F0] rounded-lg border border-[#DEDCD4] text-xs text-[#42433E] space-y-1">
                  <div className="flex justify-between font-medium">
                    <span>Ranking weights:</span>
                    <span className="text-[#426B55]">Price 50% · Age 20% · Condition 30%</span>
                  </div>
                  <div className="text-[11px] text-[#898980]">
                    Strict budget cut-off: listings &gt; ₹{quickBudget.toLocaleString('en-IN')} will be eliminated.
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#426B55] hover:bg-[#294C3A] text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Calculate Top 3 Recommendations</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* 4-Item Proof Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-[#DEDCD4]">
          <div className="space-y-1">
            <span className="text-xs text-[#898980]">Mathematical Ranking</span>
            <div className="text-base font-serif font-bold text-[#252722]">Objective 0–100 Score</div>
            <p className="text-xs text-[#42433E]">Clamped affordability, age decay, & condition values.</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-[#898980]">Dynamic Buyer Modes</span>
            <div className="text-base font-serif font-bold text-[#252722]">3 Modes + Custom Sliders</div>
            <p className="text-xs text-[#42433E]">Balanced (50/20/30), Affordability (70/10/20), Condition (20/10/70).</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-[#898980]">Price Anomaly Rule</span>
            <div className="text-base font-serif font-bold text-[#252722]">Category Median ±50%</div>
            <p className="text-xs text-[#42433E]">Within-category median analysis requiring ≥3 comparables.</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-[#898980]">Missing Data Resiliency</span>
            <div className="text-base font-serif font-bold text-[#252722]">Weight Renormalization</div>
            <p className="text-xs text-[#42433E]">Fair score reallocation without silent zero assumptions.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
