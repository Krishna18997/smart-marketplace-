import React from 'react';
import { ShoppingBag, Sliders, BarChart2, Scale, BookOpen, Plus, Layers } from 'lucide-react';

export type ActiveTab = 'discover' | 'marketplace' | 'recommendations' | 'insights' | 'matrix' | 'methodology';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  compareCount: number;
  onOpenCompare: () => void;
  onOpenAddListing: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  compareCount,
  onOpenCompare,
  onOpenAddListing,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#F7F5F0]/95 backdrop-blur-md border-b border-[#DEDCD4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <button
            onClick={() => setActiveTab('discover')}
            className="flex items-center gap-2 text-left text-lg font-serif font-bold tracking-tight text-[#252722] whitespace-nowrap shrink-0 hover:text-[#426B55] transition-colors"
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-[#426B55]"></span>
            <span>Smart Student Marketplace</span>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#42433E]">
            <button
              onClick={() => setActiveTab('discover')}
              className={`hover:text-[#252722] transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'discover' ? 'border-[#426B55] text-[#252722] font-semibold' : 'border-transparent'
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`hover:text-[#252722] transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'marketplace' ? 'border-[#426B55] text-[#252722] font-semibold' : 'border-transparent'
              }`}
            >
              Marketplace
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`hover:text-[#252722] transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'recommendations' ? 'border-[#426B55] text-[#252722] font-semibold' : 'border-transparent'
              }`}
            >
              Smart Recommendations
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`hover:text-[#252722] transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'insights' ? 'border-[#426B55] text-[#252722] font-semibold' : 'border-transparent'
              }`}
            >
              Price Intelligence
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`hover:text-[#252722] transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'matrix' ? 'border-[#426B55] text-[#252722] font-semibold' : 'border-transparent'
              }`}
            >
              Priorities Matrix
            </button>
            <button
              onClick={() => setActiveTab('methodology')}
              className={`hover:text-[#252722] transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'methodology' ? 'border-[#426B55] text-[#252722] font-semibold' : 'border-transparent'
              }`}
            >
              Methodology
            </button>
          </nav>

          {/* Zone 3: Primary Action Zone */}
          <div className="flex items-center gap-3 shrink-0">
            {compareCount > 0 && (
              <button
                onClick={onOpenCompare}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#294C3A] bg-[#EAE3D8] hover:bg-[#DEDCD4] rounded-lg transition-colors whitespace-nowrap shrink-0"
                title="Compare selected products"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Compare ({compareCount})</span>
              </button>
            )}

            <button
              onClick={onOpenAddListing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#426B55] hover:bg-[#294C3A] rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Listing</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary navigation scroll bar */}
        <div className="flex lg:hidden overflow-x-auto gap-4 py-2 border-t border-[#DEDCD4] text-xs font-medium scrollbar-none">
          <button
            onClick={() => setActiveTab('discover')}
            className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'discover' ? 'bg-[#EAE3D8] text-[#252722] font-semibold' : 'text-[#42433E]'}`}
          >
            Discover
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'marketplace' ? 'bg-[#EAE3D8] text-[#252722] font-semibold' : 'text-[#42433E]'}`}
          >
            Marketplace
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'recommendations' ? 'bg-[#EAE3D8] text-[#252722] font-semibold' : 'text-[#42433E]'}`}
          >
            Recommendations
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'insights' ? 'bg-[#EAE3D8] text-[#252722] font-semibold' : 'text-[#42433E]'}`}
          >
            Price Intelligence
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'matrix' ? 'bg-[#EAE3D8] text-[#252722] font-semibold' : 'text-[#42433E]'}`}
          >
            Matrix
          </button>
          <button
            onClick={() => setActiveTab('methodology')}
            className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'methodology' ? 'bg-[#EAE3D8] text-[#252722] font-semibold' : 'text-[#42433E]'}`}
          >
            Methodology
          </button>
        </div>
      </div>
    </header>
  );
};
