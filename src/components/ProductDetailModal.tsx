import React, { useState } from 'react';
import { Product, PriorityWeights } from '../types';
import { calculatePriceRatioAndDiscount, evaluatePriceAnomaly } from '../utils/priceIntelligence';
import { calculateProductRank } from '../utils/ranking';
import { X, AlertTriangle, Scale, Check, Trash2, Edit3, Tag, Calendar, Sparkles } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  allProducts: Product[];
  budget: number;
  weights: PriorityWeights;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  isCompared: boolean;
  onToggleCompare: (id: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  allProducts,
  budget,
  weights,
  onEdit,
  onDelete,
  isCompared,
  onToggleCompare,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!product) return null;

  const priceIntel = calculatePriceRatioAndDiscount(product.price, product.originalPrice);
  const anomaly = evaluatePriceAnomaly(product, allProducts);
  const rankResult = calculateProductRank(product, budget, weights);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#DEDCD4] rounded-2xl max-w-2xl w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 border-b border-[#DEDCD4] flex items-center justify-between bg-[#F7F5F0]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 bg-[#252722] text-white rounded">
              {product.id}
            </span>
            <span className="text-xs text-[#898980]">·</span>
            <span className="text-xs font-semibold text-[#426B55]">{product.category}</span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#EAE3D8] text-[#898980] hover:text-[#252722] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Main Title & Image Split */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
            {product.image && (
              <div className="sm:col-span-5 aspect-4/3 rounded-xl overflow-hidden bg-[#F7F5F0] border border-[#DEDCD4]">
                <img
                  src={product.image}
                  alt={product.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className={product.image ? 'sm:col-span-7 space-y-3' : 'sm:col-span-12 space-y-3'}>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                    product.listingType === 'rent'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-[#EAE3D8] text-[#252722] border border-[#DEDCD4]'
                  }`}
                >
                  {product.listingType === 'rent' ? `For Rent (${product.rentDuration || '/mo'})` : 'For Sale (Buy)'}
                </span>
              </div>

              <h3 className="text-2xl font-serif font-bold text-[#252722]">{product.title}</h3>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-sans text-[#252722] tabular-nums">
                  ₹{product.price.toLocaleString('en-IN')}
                  {product.listingType === 'rent' && (
                    <span className="text-sm font-normal text-[#898980] ml-1">
                      {product.rentDuration || '/mo'}
                    </span>
                  )}
                </span>
                {product.listingType !== 'rent' && product.originalPrice && (
                  <span className="text-sm text-[#898980] line-through tabular-nums">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {product.listingType !== 'rent' && priceIntel.discountPercent !== null && (
                  <span className="text-xs font-bold text-[#426B55] bg-[#EAE3D8] px-2 py-0.5 rounded tabular-nums">
                    {priceIntel.discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Unboxed Metadata list */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#DEDCD4]">
                <div>
                  <span className="text-[#898980]">Condition:</span>{' '}
                  <span className="font-semibold text-[#252722]">{product.condition || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-[#898980]">Usage Age:</span>{' '}
                  <span className="font-semibold text-[#252722]">
                    {product.age !== undefined ? `${product.age} year${product.age > 1 ? 's' : ''}` : 'Not provided'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#898980]">Description</span>
              <p className="text-sm text-[#42433E] leading-relaxed bg-[#F7F5F0] p-3 rounded-lg border border-[#DEDCD4]">
                {product.description}
              </p>
            </div>
          )}

          {/* Specifications Table (if provided in dataset) */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#898980]">Supplied Specifications</span>
              <div className="border border-[#DEDCD4] rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-[#DEDCD4]">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <tr key={key} className="hover:bg-[#F7F5F0]/50">
                        <td className="py-2 px-3 font-medium text-[#42433E] bg-[#F7F5F0]/70 w-1/3">{key}</td>
                        <td className="py-2 px-3 text-[#252722] font-semibold">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Analytical Value & Anomaly Diagnostics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Price Intelligence */}
            <div className="p-4 bg-[#F7F5F0] rounded-xl border border-[#DEDCD4] space-y-2 text-xs">
              <span className="font-bold text-[#252722] block">Price Intelligence Metrics</span>
              <div className="flex justify-between">
                <span className="text-[#898980]">Price-to-Original Ratio:</span>
                <span className="font-mono font-semibold tabular-nums">
                  {priceIntel.ratioPercent !== null ? `${priceIntel.ratioPercent}%` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#898980]">Absolute Savings:</span>
                <span className="font-mono font-semibold text-[#426B55] tabular-nums">
                  {priceIntel.discountAmount !== null ? `₹${priceIntel.discountAmount.toLocaleString('en-IN')}` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#898980]">Category Median:</span>
                <span className="font-mono tabular-nums">
                  {anomaly.categoryMedian ? `₹${anomaly.categoryMedian.toLocaleString('en-IN')}` : 'N/A'}
                </span>
              </div>
            </div>

            {/* Recommendation Score against Current Budget */}
            <div className="p-4 bg-[#F7F5F0] rounded-xl border border-[#DEDCD4] space-y-2 text-xs">
              <span className="font-bold text-[#252722] block">Algorithm Score (Budget ₹{budget.toLocaleString('en-IN')})</span>
              {rankResult.isEligible ? (
                <>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[#898980]">Weighted Final Score:</span>
                    <span className="text-xl font-serif font-bold text-[#426B55] tabular-nums">
                      {rankResult.finalScore} / 100
                    </span>
                  </div>
                  <div className="text-[11px] text-[#42433E]">
                    Affordability: {rankResult.factorScores.priceScore} · Age: {rankResult.factorScores.ageScore ?? 'N/A'} · Condition: {rankResult.factorScores.conditionScore ?? 'N/A'}
                  </div>
                </>
              ) : (
                <div className="text-rose-800 text-xs">
                  {rankResult.ineligibleReason}
                </div>
              )}
            </div>
          </div>

          {/* Anomaly Callout if flagged */}
          {anomaly.isAnomaly && (
            <div className="p-3 bg-[#F0E5D2] border border-amber-300 rounded-lg text-xs text-[#252722] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-900 font-semibold">Price Anomaly Flag ({anomaly.direction?.toUpperCase()})</strong>
                <p className="mt-0.5 text-[#42433E]">{anomaly.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-6 bg-[#F7F5F0] border-t border-[#DEDCD4] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onToggleCompare(product.id);
              }}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                isCompared
                  ? 'bg-[#426B55] text-white'
                  : 'bg-white border border-[#DEDCD4] text-[#42433E] hover:bg-[#EAE3D8]'
              }`}
            >
              {isCompared ? <Check className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
              <span>{isCompared ? 'In Compare List' : 'Add to Compare'}</span>
            </button>

            <button
              onClick={() => {
                onEdit(product);
                onClose();
              }}
              className="px-3 py-2 text-xs font-medium text-[#42433E] bg-white border border-[#DEDCD4] hover:bg-[#EAE3D8] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          </div>

          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-700 font-medium">Confirm deletion?</span>
              <button
                onClick={() => {
                  onDelete(product.id);
                  onClose();
                }}
                className="px-2.5 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2.5 py-1 text-xs font-medium text-[#42433E] bg-[#EAE3D8] hover:bg-[#DEDCD4] rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Listing</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
