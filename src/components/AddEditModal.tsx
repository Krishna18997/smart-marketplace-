import React, { useState, useEffect } from 'react';
import { Product, Condition, ListingType } from '../types';
import { X, Save, AlertCircle, Image as ImageIcon, Upload, Trash2, Tag, Calendar } from 'lucide-react';

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  initialProduct?: Product | null;
  categories: string[];
}

export const AddEditModal: React.FC<AddEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
  categories,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Laptops');
  const [customCategory, setCustomCategory] = useState('');
  const [listingType, setListingType] = useState<ListingType>('buy');
  const [rentDuration, setRentDuration] = useState('month');
  const [price, setPrice] = useState<string>('');
  const [originalPrice, setOriginalPrice] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [condition, setCondition] = useState<Condition>('Good');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string>('');
  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');
  const [specs, setSpecs] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Ensure 'Laptops' is in the category list
  const categoryOptions = React.useMemo(() => {
    const list = new Set(['Laptops', 'Electronics', 'Books', 'Bicycles', 'Gadgets', 'Accessories', ...categories]);
    return Array.from(list).filter((c) => c !== 'Other');
  }, [categories]);

  useEffect(() => {
    if (initialProduct) {
      setTitle(initialProduct.title || '');
      if (categoryOptions.includes(initialProduct.category)) {
        setCategory(initialProduct.category);
        setCustomCategory('');
      } else {
        setCategory('Other');
        setCustomCategory(initialProduct.category || '');
      }
      setListingType(initialProduct.listingType || 'buy');
      setRentDuration(initialProduct.rentDuration || 'month');
      setPrice(initialProduct.price !== undefined ? String(initialProduct.price) : '');
      setOriginalPrice(initialProduct.originalPrice !== undefined ? String(initialProduct.originalPrice) : '');
      setAge(initialProduct.age !== undefined ? String(initialProduct.age) : '');
      setCondition((initialProduct.condition as Condition) || 'Good');
      setDescription(initialProduct.description || '');
      setImage(initialProduct.image || '');
      setSpecs(initialProduct.specifications || {});
    } else {
      // Reset form
      setTitle('');
      setCategory('Laptops');
      setCustomCategory('');
      setListingType('buy');
      setRentDuration('month');
      setPrice('');
      setOriginalPrice('');
      setAge('');
      setCondition('Good');
      setDescription('');
      setImage('');
      setSpecs({});
    }
    setError(null);
  }, [initialProduct, isOpen, categoryOptions]);

  if (!isOpen) return null;

  // Handle local image file upload & convert to base64 Data URL
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP, etc.).');
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file is too large. Please upload an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result as string);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSpec = () => {
    if (!specKey.trim() || !specVal.trim()) return;
    setSpecs((prev) => ({ ...prev, [specKey.trim()]: specVal.trim() }));
    setSpecKey('');
    setSpecVal('');
  };

  const handleRemoveSpec = (key: string) => {
    setSpecs((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('Product title is mandatory.');
      return;
    }

    // Parsing price without stepping constraint
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Please enter a valid positive price (greater than ₹0). Any amount like ₹500, ₹23000, etc. is valid.');
      return;
    }

    let parsedOriginalPrice: number | undefined;
    if (originalPrice.trim() !== '') {
      parsedOriginalPrice = parseFloat(originalPrice);
      if (isNaN(parsedOriginalPrice) || parsedOriginalPrice <= 0) {
        setError('Original price must be greater than zero when provided.');
        return;
      }
    }

    let parsedAge: number | undefined;
    if (age.trim() !== '') {
      parsedAge = parseFloat(age);
      if (isNaN(parsedAge) || parsedAge < 0) {
        setError('Product age cannot be negative.');
        return;
      }
    }

    const finalCategory = category === 'Other' && customCategory.trim() ? customCategory.trim() : category;

    const newProduct: Product = {
      id: initialProduct ? initialProduct.id : `P-${Date.now().toString(36).toUpperCase()}`,
      title: cleanTitle,
      category: finalCategory,
      price: parsedPrice,
      originalPrice: parsedOriginalPrice,
      age: parsedAge,
      condition,
      listingType,
      rentDuration: listingType === 'rent' ? rentDuration : undefined,
      description: description.trim() || undefined,
      specifications: Object.keys(specs).length > 0 ? specs : undefined,
      image: image.trim() || undefined,
      isCustom: true,
      createdAt: initialProduct?.createdAt || new Date().toISOString(),
    };

    onSave(newProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#DEDCD4] rounded-2xl max-w-xl w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-[#DEDCD4] flex items-center justify-between bg-[#F7F5F0]">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#252722]">
              {initialProduct ? 'Edit Marketplace Listing' : 'Add New Marketplace Listing'}
            </h3>
            <p className="text-xs text-[#898980]">
              Persists to browser LocalStorage with flexible pricing, image upload, and buy/rent modes
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#EAE3D8] text-[#898980] hover:text-[#252722] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Listing Type: Buy vs Rent */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-[#42433E]">
              Listing Purpose
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F7F5F0] border border-[#DEDCD4] rounded-lg">
              <button
                type="button"
                onClick={() => setListingType('buy')}
                className={`py-2 px-3 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  listingType === 'buy'
                    ? 'bg-white text-[#252722] shadow-xs'
                    : 'text-[#898980] hover:text-[#252722]'
                }`}
              >
                <Tag className="w-3.5 h-3.5 text-[#426B55]" />
                <span>For Sale (Buy)</span>
              </button>
              <button
                type="button"
                onClick={() => setListingType('rent')}
                className={`py-2 px-3 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  listingType === 'rent'
                    ? 'bg-white text-[#252722] shadow-xs'
                    : 'text-[#898980] hover:text-[#252722]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-[#426B55]" />
                <span>For Rent (Campus Rental)</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-semibold text-[#42433E] mb-1">
              Product Title <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. MacBook Air M1 2020 or ThinkPad X1"
              className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#DEDCD4] rounded-lg text-sm text-[#252722] focus:outline-hidden focus:border-[#426B55]"
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#42433E] mb-1">
                Category <span className="text-rose-600">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#DEDCD4] rounded-lg text-xs text-[#252722] focus:outline-hidden focus:border-[#426B55]"
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="Other">Other (Custom category)</option>
              </select>
              {category === 'Other' && (
                <input
                  type="text"
                  placeholder="Specify custom category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full mt-2 px-3 py-1.5 bg-[#F7F5F0] border border-[#DEDCD4] rounded-lg text-xs text-[#252722]"
                />
              )}
            </div>

            <div>
              <label className="block font-semibold text-[#42433E] mb-1">
                Condition Grade <span className="text-rose-600">*</span>
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as Condition)}
                className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#DEDCD4] rounded-lg text-xs text-[#252722] focus:outline-hidden focus:border-[#426B55]"
              >
                <option value="Excellent">Excellent (Score: 100)</option>
                <option value="Good">Good (Score: 75)</option>
                <option value="Average">Average (Score: 50)</option>
                <option value="Poor">Poor (Score: 25)</option>
              </select>
            </div>
          </div>

          {/* Price & Original Price (with step="any" allowing any integer or decimal) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#42433E] mb-1">
                {listingType === 'rent' ? 'Rental Rate (₹)' : 'Listing Price (₹)'}{' '}
                <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#898980]">
                  ₹
                </span>
                <input
                  type="number"
                  required
                  step="any"
                  placeholder={listingType === 'rent' ? 'e.g. 500' : 'e.g. 500 or 22000'}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-6 pr-3 py-2 bg-[#F7F5F0] border border-[#DEDCD4] rounded-lg text-xs font-semibold tabular-nums text-[#252722] focus:outline-hidden focus:border-[#426B55]"
                />
              </div>
              <p className="text-[10px] text-[#898980] mt-0.5">
                Enter any exact price you wish (e.g. ₹500, ₹1200, ₹21500).
              </p>
            </div>

            {listingType === 'rent' ? (
              <div>
                <label className="block font-semibold text-[#42433E] mb-1">
                  Rental Billing Frequency
                </label>
                <select
                  value={rentDuration}
                  onChange={(e) => setRentDuration(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#DEDCD4] rounded-lg text-xs text-[#252722] focus:outline-hidden focus:border-[#426B55]"
                >
                  <option value="month">Per Month (/mo)</option>
                  <option value="semester">Per Semester (/sem)</option>
                  <option value="week">Per Week (/wk)</option>
                  <option value="day">Per Day (/day)</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block font-semibold text-[#42433E] mb-1">
                  Original Retail Price (₹){' '}
                  <span className="text-[#898980] font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#898980]">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 45000"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full pl-6 pr-3 py-2 bg-[#F7F5F0] border border-[#DEDCD4] rounded-lg text-xs tabular-nums text-[#252722] focus:outline-hidden focus:border-[#426B55]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Usage Age */}
          <div>
            <label className="block font-semibold text-[#42433E] mb-1">
              Usage Age in Years <span className="text-[#898980] font-normal">(Optional, 0 for new)</span>
            </label>
            <input
              type="number"
              step="any"
              min="0"
              max="20"
              placeholder="e.g. 2"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#DEDCD4] rounded-lg text-xs tabular-nums text-[#252722] focus:outline-hidden focus:border-[#426B55]"
            />
          </div>

          {/* Product Image Option (Upload from Device or Web URL) */}
          <div className="space-y-2 pt-2 border-t border-[#DEDCD4]">
            <label className="block font-semibold text-[#42433E]">
              Product Image (Upload or Web URL)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-6">
                <label className="flex items-center justify-center gap-2 px-3 py-2 bg-[#F7F5F0] hover:bg-[#EAE3D8] border border-[#DEDCD4] rounded-lg cursor-pointer text-xs font-medium text-[#252722] transition-colors">
                  <Upload className="w-3.5 h-3.5 text-[#426B55]" />
                  <span>Choose file from device...</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="sm:col-span-6">
                <input
                  type="url"
                  placeholder="Or paste image URL (https://...)"
                  value={image.startsWith('data:') ? '' : image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#DEDCD4] rounded-lg text-xs text-[#252722] placeholder:text-[#898980]"
                />
              </div>
            </div>

            {/* Image Preview Thumbnail */}
            {image && (
              <div className="flex items-center gap-3 p-2 bg-[#F7F5F0] border border-[#DEDCD4] rounded-lg">
                <div className="w-12 h-12 rounded bg-white overflow-hidden border border-[#DEDCD4] shrink-0">
                  <img
                    src={image}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 text-[11px] truncate text-[#42433E]">
                  {image.startsWith('data:') ? 'Local file uploaded successfully' : image}
                </div>
                <button
                  type="button"
                  onClick={() => setImage('')}
                  className="p-1.5 text-rose-700 hover:bg-rose-50 rounded"
                  title="Remove image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-[#42433E] mb-1">
              Item Details & Context
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Course context, semester usage, accessories included, cosmetic flaws..."
              className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#DEDCD4] rounded-lg text-xs text-[#252722] focus:outline-hidden focus:border-[#426B55]"
            />
          </div>

          {/* Key-Value Specifications */}
          <div className="space-y-2 pt-2 border-t border-[#DEDCD4]">
            <span className="block font-semibold text-[#42433E]">
              Custom Technical Specifications (Optional)
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Spec (e.g. RAM / Processor)"
                value={specKey}
                onChange={(e) => setSpecKey(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-[#F7F5F0] border border-[#DEDCD4] rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="Value (e.g. 16 GB SSD)"
                value={specVal}
                onChange={(e) => setSpecVal(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-[#F7F5F0] border border-[#DEDCD4] rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddSpec}
                className="px-3 py-1.5 bg-[#EAE3D8] hover:bg-[#DEDCD4] text-[#252722] rounded-lg text-xs font-medium"
              >
                Add Spec
              </button>
            </div>

            {Object.keys(specs).length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {Object.entries(specs).map(([k, v]) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1.5 bg-[#F7F5F0] border border-[#DEDCD4] px-2.5 py-1 rounded text-[11px]"
                  >
                    <strong>{k}:</strong> {v}
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(k)}
                      className="text-rose-600 hover:text-rose-800 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#DEDCD4] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#42433E] hover:bg-[#EAE3D8] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-[#426B55] hover:bg-[#294C3A] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{initialProduct ? 'Update Listing' : 'Publish Listing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
