import React, { useState, useMemo } from 'react';
import { Product, PriorityWeights } from '../types';
import { calculateProductRank } from '../utils/ranking';
import { calculatePriceRatioAndDiscount, evaluatePriceAnomaly } from '../utils/priceIntelligence';
import { Search, Filter, ArrowUpDown, Plus, Download, Upload, RotateCcw, AlertTriangle, Eye, Scale, Check, Laptop, Book, Bike, Headphones, Package, Cpu } from 'lucide-react';

interface MarketplaceViewProps {
  products: Product[];
  categories: string[];
  activeBudget: number;
  setActiveBudget: (budget: number) => void;
  weights: PriorityWeights;
  onSelectProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  compareList: string[];
  onToggleCompare: (productId: string) => void;
  onOpenImportExport: () => void;
  onResetData: () => void;
  onOpenAddListing: () => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  products,
  categories,
  activeBudget,
  setActiveBudget,
  weights,
  onSelectProduct,
  onEditProduct,
  compareList,
  onToggleCompare,
  onOpenImportExport,
  onResetData,
  onOpenAddListing,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [listingTypeFilter, setListingTypeFilter] = useState<'all' | 'buy' | 'rent'>('all');
  const [budgetFilterEnabled, setBudgetFilterEnabled] = useState(false);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'age_asc' | 'condition_desc' | 'score_desc'>('score_desc');

  // Condition numeric values for sorting
  const conditionRank: Record<string, number> = {
    excellent: 4,
    good: 3,
    average: 2,
    poor: 1
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Enhanced Tokenized Search Query (Search by name, specs, category, condition)
      if (searchQuery.trim()) {
        const tokens = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
        const specsText = p.specifications ? Object.entries(p.specifications).map(([k, v]) => `${k} ${v}`).join(' ') : '';
        const searchCorpus = [
          p.title,
          p.description || '',
          p.category,
          p.condition || '',
          p.listingType === 'rent' ? 'rent rental campus rent' : 'buy sale purchase',
          p.rentDuration || '',
          specsText
        ].join(' ').toLowerCase();

        const matchesAllTokens = tokens.every((token) => searchCorpus.includes(token));
        if (!matchesAllTokens) return false;
      }

      // 2. Buy vs Rent Filter
      if (listingTypeFilter !== 'all') {
        const itemType = p.listingType || 'buy';
        if (itemType !== listingTypeFilter) return false;
      }

      // 3. Category Filter
      if (selectedCategory !== 'All') {
        if (p.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      }

      // 4. Maximum Budget Filter
      if (budgetFilterEnabled) {
        if (typeof p.price !== 'number' || isNaN(p.price) || p.price > activeBudget) {
          return false;
        }
      }

      return true;
    });
  }, [products, searchQuery, listingTypeFilter, selectedCategory, budgetFilterEnabled, activeBudget]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    list.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return (a.price ?? 999999) - (b.price ?? 999999);
        case 'price_desc':
          return (b.price ?? 0) - (a.price ?? 0);
        case 'age_asc':
          return (a.age ?? 999) - (b.age ?? 999);
        case 'condition_desc': {
          const ca = conditionRank[(a.condition || '').toLowerCase()] || 0;
          const cb = conditionRank[(b.condition || '').toLowerCase()] || 0;
          return cb - ca;
        }
        case 'score_desc':
        default: {
          const scoreA = calculateProductRank(a, activeBudget, weights).finalScore;
          const scoreB = calculateProductRank(b, activeBudget, weights).finalScore;
          return scoreB - scoreA;
        }
      }
    });
    return list;
  }, [filteredProducts, sortBy, activeBudget, weights]);

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('laptop')) return <Laptop className="w-4 h-4" />;
    if (cat.includes('elect')) return <Cpu className="w-4 h-4" />;
    if (cat.includes('book')) return <Book className="w-4 h-4" />;
    if (cat.includes('bi')) return <Bike className="w-4 h-4" />;
    if (cat.includes('gadg') || cat.includes('audio')) return <Headphones className="w-4 h-4" />;
    return <Package className="w-4 h-4" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#DEDCD4]">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#898980] font-medium">Campus Catalog</span>
          <h2 className="text-3xl font-serif font-bold text-[#252722] tracking-tight">Marketplace Listings</h2>
          <p className="text-sm text-[#42433E] mt-1">
            Browse second-hand items with verified pricing, age transparency, and anomaly diagnostics.
          </p>
        </div>

        {/* Dataset Actions: Import / Export / Add */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenImportExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#42433E] bg-white border border-[#DEDCD4] hover:bg-[#EAE3D8] rounded-lg transition-colors"
            title="Import/Export CSV or JSON"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import / Export Data</span>
          </button>

          <button
            onClick={onResetData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#42433E] bg-white border border-[#DEDCD4] hover:bg-[#EAE3D8] rounded-lg transition-colors"
            title="Reset to default sample dataset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Dataset</span>
          </button>

          <button
            onClick={onOpenAddListing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#426B55] hover:bg-[#294C3A] rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Listing</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#DEDCD4] rounded-xl p-4 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[#898980] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, specs, or keyword..."
              className="w-full pl-9 pr-3 py-2 bg-[#F7F5F0] border border-[#DEDCD4] rounded-lg text-sm text-[#252722] placeholder:text-[#898980] focus:outline-hidden focus:border-[#426B55]"
            />
          </div>

          {/* Budget Filter Toggle & Input */}
          <div className="md:col-span-4 flex items-center gap-2 bg-[#F7F5F0] border border-[#DEDCD4] rounded-lg px-3 py-1.5">
            <label className="flex items-center gap-2 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={budgetFilterEnabled}
                onChange={(e) => setBudgetFilterEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#426B55] rounded"
              />
              <span className="text-xs font-medium text-[#42433E]">Max Budget:</span>
            </label>
            <div className="relative flex-1">
              <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#898980]">₹</span>
              <input
                type="number"
                min="0"
                step="any"
                value={activeBudget}
                onChange={(e) => setActiveBudget(Math.max(0, Number(e.target.value)))}
                disabled={!budgetFilterEnabled}
                className="w-full pl-5 pr-2 py-1 bg-white border border-[#DEDCD4] rounded text-xs font-semibold tabular-nums text-[#252722] disabled:opacity-50"
              />
            </div>
          </div>

          {/* Sort Select */}
          <div className="md:col-span-3 flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-[#898980] shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2 px-2.5 bg-[#F7F5F0] border border-[#DEDCD4] rounded-lg text-xs font-medium text-[#252722] focus:outline-hidden focus:border-[#426B55]"
            >
              <option value="score_desc">Sort: Best Recommendation Score</option>
              <option value="price_asc">Sort: Price (Low to High)</option>
              <option value="price_desc">Sort: Price (High to Low)</option>
              <option value="age_asc">Sort: Newest First (Lowest Age)</option>
              <option value="condition_desc">Sort: Best Condition</option>
            </select>
          </div>
        </div>

        {/* Listing Type (Buy vs Rent) and Category Filters */}
        <div className="pt-2 border-t border-[#DEDCD4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Buy vs Rent Segmented Control */}
          <div className="flex items-center gap-1 bg-[#F7F5F0] p-1 rounded-lg border border-[#DEDCD4] shrink-0">
            <button
              onClick={() => setListingTypeFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                listingTypeFilter === 'all'
                  ? 'bg-white text-[#252722] shadow-xs font-semibold'
                  : 'text-[#42433E] hover:text-[#252722]'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setListingTypeFilter('buy')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                listingTypeFilter === 'buy'
                  ? 'bg-[#426B55] text-white shadow-xs font-semibold'
                  : 'text-[#42433E] hover:text-[#252722]'
              }`}
            >
              Buy Only
            </button>
            <button
              onClick={() => setListingTypeFilter('rent')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                listingTypeFilter === 'rent'
                  ? 'bg-[#EAE3D8] text-[#252722] shadow-xs font-semibold'
                  : 'text-[#42433E] hover:text-[#252722]'
              }`}
            >
              Rent Only
            </button>
          </div>

          {/* Dynamic Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === 'All'
                  ? 'bg-[#426B55] text-white shadow-xs'
                  : 'text-[#42433E] hover:bg-[#EAE3D8]'
              }`}
            >
              All Categories ({products.length})
            </button>
            {categories.map((cat) => {
              const count = products.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-[#426B55] text-white shadow-xs'
                      : 'text-[#42433E] hover:bg-[#EAE3D8]'
                  }`}
                >
                  {getCategoryIcon(cat)}
                  <span>{cat}</span>
                  <span className="opacity-75 tabular-nums text-[11px]">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#898980] px-1">
        <div>
          Showing <span className="font-semibold text-[#252722] tabular-nums">{sortedProducts.length}</span> of{' '}
          <span className="tabular-nums">{products.length}</span> listings
          {budgetFilterEnabled && (
            <span className="ml-1 text-[#426B55]">
              (filtered to budget ≤ ₹{activeBudget.toLocaleString('en-IN')})
            </span>
          )}
        </div>
        {filteredProducts.length !== products.length && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setBudgetFilterEnabled(false);
            }}
            className="text-[#426B55] hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Product Cards Grid */}
      {sortedProducts.length === 0 ? (
        <div className="bg-white border border-[#DEDCD4] rounded-xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#EAE3D8] text-[#898980] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-[#252722]">No matching products found</h3>
          <p className="text-sm text-[#42433E] max-w-md mx-auto">
            Try adjusting your search terms, broadening the category filter, or raising your maximum budget.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setBudgetFilterEnabled(false);
            }}
            className="px-4 py-2 text-xs font-medium text-white bg-[#426B55] hover:bg-[#294C3A] rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProducts.map((product) => {
            const priceIntel = calculatePriceRatioAndDiscount(product.price, product.originalPrice);
            const anomaly = evaluatePriceAnomaly(product, products);
            const rankResult = calculateProductRank(product, activeBudget, weights);
            const isCompared = compareList.includes(product.id);

            return (
              <div
                key={product.id}
                className="bg-white border border-[#DEDCD4] rounded-xl overflow-hidden hover:border-[#898980] transition-all flex flex-col group shadow-xs"
              >
                {/* Product Image / Category Visual Slot */}
                <div className="relative aspect-4/3 bg-[#F7F5F0] border-b border-[#DEDCD4] overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#898980] p-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-[#EAE3D8] flex items-center justify-center mb-2">
                        {getCategoryIcon(product.category)}
                      </div>
                      <span className="text-xs font-medium text-[#42433E]">{product.category}</span>
                    </div>
                  )}

                  {/* ID Tag */}
                  <span className="absolute top-3 left-3 bg-[#252722]/80 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded">
                    {product.id}
                  </span>

                  {/* Buy / Rent Badge */}
                  <span
                    className={`absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs ${
                      product.listingType === 'rent'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-white/95 text-[#252722] border border-[#DEDCD4]'
                    }`}
                  >
                    {product.listingType === 'rent'
                      ? `Rent ${product.rentDuration ? (product.rentDuration.startsWith('/') ? product.rentDuration : `/${product.rentDuration}`) : '/mo'}`
                      : 'Buy'}
                  </span>

                  {/* Recommendation Score Badge */}
                  {rankResult.isEligible && (
                    <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs border border-[#DEDCD4] text-[#294C3A] text-xs font-semibold px-2 py-0.5 rounded tabular-nums shadow-xs">
                      Score: {rankResult.finalScore}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {/* Unboxed Metadata with typographic separators */}
                    <div className="flex items-center gap-1.5 text-xs text-[#898980]">
                      <span className="text-[#42433E] font-medium">{product.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{product.condition || 'Condition not specified'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{product.age !== undefined ? `${product.age} yr${product.age > 1 ? 's' : ''} old` : 'Age not provided'}</span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => onSelectProduct(product)}
                      className="text-base font-serif font-bold text-[#252722] hover:text-[#426B55] transition-colors cursor-pointer line-clamp-1"
                    >
                      {product.title}
                    </h3>

                    {/* Price & Discount */}
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-xl font-bold font-sans text-[#252722] tabular-nums">
                        ₹{product.price.toLocaleString('en-IN')}
                        {product.listingType === 'rent' && (
                          <span className="text-xs font-normal text-[#898980] ml-1">
                            {product.rentDuration ? (product.rentDuration.startsWith('/') ? product.rentDuration : `/${product.rentDuration}`) : '/mo'}
                          </span>
                        )}
                      </span>
                      {product.listingType !== 'rent' && product.originalPrice && product.originalPrice > product.price && (
                        <>
                          <span className="text-xs text-[#898980] line-through tabular-nums">
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs font-semibold text-[#426B55] tabular-nums">
                            {priceIntel.discountPercent}% off
                          </span>
                        </>
                      )}
                    </div>

                    {/* Price Ratio Analysis */}
                    {priceIntel.isValid && priceIntel.ratioPercent !== null && (
                      <div className="text-xs text-[#42433E]">
                        Listed at <span className="font-semibold tabular-nums">{priceIntel.ratioPercent}%</span> of original retail (₹{product.originalPrice?.toLocaleString('en-IN')})
                      </div>
                    )}

                    {/* Anomaly Warning Banner if deviation > 50% */}
                    {anomaly.isAnomaly && (
                      <div className="bg-[#F0E5D2] border border-[#DEDCD4] rounded-lg p-2.5 text-xs text-[#42433E] flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-amber-900">
                            Unusually Priced ({anomaly.direction === 'high' ? 'High' : 'Low'} · {anomaly.deviationPercent}%)
                          </span>
                          <p className="text-[11px] text-[#42433E] mt-0.5">
                            Category median: ₹{anomaly.categoryMedian?.toLocaleString('en-IN')}. Verify hardware condition.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-[#DEDCD4] flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectProduct(product)}
                      className="flex-1 py-1.5 px-3 text-xs font-medium text-[#252722] bg-[#F7F5F0] hover:bg-[#EAE3D8] rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>

                    <button
                      onClick={() => onToggleCompare(product.id)}
                      className={`py-1.5 px-3 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                        isCompared
                          ? 'bg-[#426B55] text-white'
                          : 'bg-white border border-[#DEDCD4] text-[#42433E] hover:bg-[#EAE3D8]'
                      }`}
                      title={isCompared ? 'Remove from comparison' : 'Add to side-by-side comparison'}
                    >
                      {isCompared ? <Check className="w-3.5 h-3.5" /> : <Scale className="w-3.5 h-3.5" />}
                      <span>{isCompared ? 'Comparing' : 'Compare'}</span>
                    </button>

                    <button
                      onClick={() => onEditProduct(product)}
                      className="py-1.5 px-2 text-xs font-medium text-[#898980] hover:text-[#252722] transition-colors"
                      title="Edit this listing"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
