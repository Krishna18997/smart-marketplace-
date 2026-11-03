import React, { useState, useEffect, useMemo } from 'react';
import { Product, PriorityMode, PriorityWeights } from './types';
import { loadStoredProducts, saveProducts, resetToInitialProducts } from './utils/storage';
import { PRIORITY_PRESETS, DEFAULT_MAX_REF_AGE } from './utils/ranking';
import { Navbar, ActiveTab } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MarketplaceView } from './components/MarketplaceView';
import { RecommendationsView } from './components/RecommendationsView';
import { PriceIntelligenceView } from './components/PriceIntelligenceView';
import { PriceVsConditionMatrix } from './components/PriceVsConditionMatrix';
import { MethodologyView } from './components/MethodologyView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AddEditModal } from './components/AddEditModal';
import { CompareModal } from './components/CompareModal';
import { ImportExportModal } from './components/ImportExportModal';

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => loadStoredProducts());
  const [activeTab, setActiveTab] = useState<ActiveTab>('discover');

  // Budget & Ranking State
  const [budget, setBudget] = useState<number>(23000); // Standard benchmark budget
  const [recommendCategory, setRecommendCategory] = useState<string>('All');
  const [priorityMode, setPriorityMode] = useState<PriorityMode>('balanced');
  const [weights, setWeights] = useState<PriorityWeights>(PRIORITY_PRESETS.balanced);
  const [maxRefAge, setMaxRefAge] = useState<number>(DEFAULT_MAX_REF_AGE);

  // Comparison State
  const [compareList, setCompareList] = useState<string[]>(['P01', 'P04']); // Default comparing Laptop A & D

  // Modal State
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    saveProducts(products);
  }, [products]);

  // Dynamically derive distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    return Array.from(set).sort();
  }, [products]);

  // Handlers
  const handleSaveProduct = (product: Product) => {
    setProducts((prev) => {
      const existsIndex = prev.findIndex((p) => p.id === product.id);
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = product;
        return copy;
      }
      return [product, ...prev];
    });
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCompareList((prev) => prev.filter((cId) => cId !== id));
  };

  const handleToggleCompare = (productId: string) => {
    setCompareList((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, productId];
    });
  };

  const handleQuickRecommend = (quickBudget: number, quickCategory: string) => {
    setBudget(quickBudget);
    setRecommendCategory(quickCategory);
    setActiveTab('recommendations');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImportProducts = (newProducts: Product[], mode: 'merge' | 'replace') => {
    setProducts((prev) => {
      if (mode === 'replace') {
        return newProducts;
      }
      // Merge: replace existing by ID or prepend
      const existingIds = new Set(newProducts.map((p) => p.id));
      const kept = prev.filter((p) => !existingIds.has(p.id));
      return [...newProducts, ...kept];
    });
  };

  const handleResetData = () => {
    const reset = resetToInitialProducts();
    setProducts(reset);
    setCompareList(['P01', 'P04']);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#252722]">
      {/* 1. Header / Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        compareCount={compareList.length}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        onOpenAddListing={() => {
          setEditingProduct(null);
          setIsAddEditModalOpen(true);
        }}
      />

      {/* 2. Main Content Body */}
      <main className="flex-1">
        {activeTab === 'discover' && (
          <>
            <HeroSection
              onNavigate={setActiveTab}
              onQuickRecommend={handleQuickRecommend}
              categories={categories}
              totalListings={products.length}
            />
            {/* Quick preview of marketplace on the Discover page */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex items-center justify-between pb-6 border-b border-[#DEDCD4]">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#426B55] font-semibold">Featured Inventory</span>
                  <h2 className="text-2xl font-serif font-bold text-[#252722]">Student Marketplace Essentials</h2>
                </div>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className="text-xs font-semibold text-[#426B55] hover:underline"
                >
                  View all {products.length} listings →
                </button>
              </div>

              <div className="mt-6">
                <MarketplaceView
                  products={products}
                  categories={categories}
                  activeBudget={budget}
                  setActiveBudget={setBudget}
                  weights={weights}
                  onSelectProduct={(p) => setDetailProduct(p)}
                  onEditProduct={(p) => {
                    setEditingProduct(p);
                    setIsAddEditModalOpen(true);
                  }}
                  compareList={compareList}
                  onToggleCompare={handleToggleCompare}
                  onOpenImportExport={() => setIsImportExportModalOpen(true)}
                  onResetData={handleResetData}
                  onOpenAddListing={() => {
                    setEditingProduct(null);
                    setIsAddEditModalOpen(true);
                  }}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'marketplace' && (
          <MarketplaceView
            products={products}
            categories={categories}
            activeBudget={budget}
            setActiveBudget={setBudget}
            weights={weights}
            onSelectProduct={(p) => setDetailProduct(p)}
            onEditProduct={(p) => {
              setEditingProduct(p);
              setIsAddEditModalOpen(true);
            }}
            compareList={compareList}
            onToggleCompare={handleToggleCompare}
            onOpenImportExport={() => setIsImportExportModalOpen(true)}
            onResetData={handleResetData}
            onOpenAddListing={() => {
              setEditingProduct(null);
              setIsAddEditModalOpen(true);
            }}
          />
        )}

        {activeTab === 'recommendations' && (
          <RecommendationsView
            products={products}
            categories={categories}
            budget={budget}
            setBudget={setBudget}
            category={recommendCategory}
            setCategory={setRecommendCategory}
            weights={weights}
            setWeights={setWeights}
            priorityMode={priorityMode}
            setPriorityMode={setPriorityMode}
            maxRefAge={maxRefAge}
            setMaxRefAge={setMaxRefAge}
            onSelectProduct={(p) => setDetailProduct(p)}
            compareList={compareList}
            onToggleCompare={handleToggleCompare}
          />
        )}

        {activeTab === 'insights' && (
          <PriceIntelligenceView
            products={products}
            categories={categories}
            onSelectProduct={(p) => setDetailProduct(p)}
          />
        )}

        {activeTab === 'matrix' && (
          <PriceVsConditionMatrix
            products={products}
            budget={budget}
            onSelectProduct={(p) => setDetailProduct(p)}
          />
        )}

        {activeTab === 'methodology' && <MethodologyView />}
      </main>

      {/* 3. Footer */}
      <footer className="border-t border-[#DEDCD4] bg-white text-[#42433E] py-8 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-sm bg-[#426B55]"></span>
            <span className="font-serif font-bold text-[#252722]">Smart Student Marketplace</span>
            <span className="text-[#898980]">·</span>
            <span className="text-[#898980]">Third-Year Computer Science Engineering Prototype</span>
          </div>

          <div className="flex items-center gap-6 text-[#898980]">
            <button onClick={() => setActiveTab('methodology')} className="hover:text-[#252722]">
              Mathematical Specifications
            </button>
            <button onClick={() => setIsImportExportModalOpen(true)} className="hover:text-[#252722]">
              Import Organizer Data
            </button>
            <span className="tabular-nums">LocalStorage Storage Tier</span>
          </div>
        </div>
      </footer>

      {/* 4. Modals */}
      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        allProducts={products}
        budget={budget}
        weights={weights}
        onEdit={(p) => {
          setEditingProduct(p);
          setIsAddEditModalOpen(true);
        }}
        onDelete={handleDeleteProduct}
        isCompared={detailProduct ? compareList.includes(detailProduct.id) : false}
        onToggleCompare={handleToggleCompare}
      />

      <AddEditModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
        categories={categories}
      />

      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        compareIds={compareList}
        allProducts={products}
        onRemoveFromCompare={(id) => setCompareList((prev) => prev.filter((cId) => cId !== id))}
        onClearCompare={() => setCompareList([])}
        budget={budget}
        weights={weights}
      />

      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        products={products}
        onImportProducts={handleImportProducts}
        onResetToSample={handleResetData}
      />
    </div>
  );
}
