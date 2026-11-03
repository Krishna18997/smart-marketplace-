import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

const STORAGE_KEY = 'smart_student_marketplace_listings_v2';
const HAS_INITIALIZED_KEY = 'smart_student_marketplace_initialized_v2';

export function loadStoredProducts(): Product[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First load: seed with INITIAL_PRODUCTS
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem(HAS_INITIALIZED_KEY, 'true');
      return INITIAL_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_PRODUCTS;
  } catch (err) {
    console.warn('Error reading from localStorage, using fallback initial data:', err);
    return INITIAL_PRODUCTS;
  }
}

export function saveProducts(products: Product[]): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return true;
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
    return false;
  }
}

export function resetToInitialProducts(): Product[] {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    } catch (err) {
      console.warn('Error resetting localStorage:', err);
    }
  }
  return [...INITIAL_PRODUCTS];
}
