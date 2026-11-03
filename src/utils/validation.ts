import { Product, Condition } from '../types';
import { normalizeCondition } from './ranking';

export interface ParseResult {
  validProducts: Product[];
  errors: { row: number; item?: string; reason: string }[];
}

/**
 * Normalizes an arbitrary object/record from CSV or JSON into a Product model
 */
export function normalizeProductRecord(record: Record<string, unknown>, rowNumber: number = 1): { product?: Product; error?: string } {
  // Map Title
  const rawTitle = record.title ?? record.item ?? record.name ?? record.productTitle ?? record.product_title ?? record.Title;
  const title = typeof rawTitle === 'string' ? rawTitle.trim() : (rawTitle ? String(rawTitle).trim() : '');
  if (!title) {
    return { error: `Row ${rowNumber}: Missing product title (expected 'title', 'item', or 'name').` };
  }

  // Map Price
  const rawPrice = record.price ?? record.currentPrice ?? record.current_price ?? record.Price ?? record.cost;
  const price = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice || '').replace(/[^\d.-]/g, ''));
  if (isNaN(price) || price <= 0) {
    return { error: `Row ${rowNumber} ("${title}"): Invalid or non-positive price "${rawPrice}".` };
  }

  // Map Category
  const rawCategory = record.category ?? record.Category ?? record.type;
  const category = (typeof rawCategory === 'string' && rawCategory.trim()) ? rawCategory.trim() : 'Other';

  // Map Listing Type (buy vs rent)
  const rawListingType = record.listingType ?? record.listing_type ?? record.type;
  const listingType = (typeof rawListingType === 'string' && rawListingType.toLowerCase().includes('rent')) ? 'rent' : 'buy';
  const rentDuration = typeof record.rentDuration === 'string' ? record.rentDuration : (record.rent_duration ? String(record.rent_duration) : undefined);

  // Map Image
  const rawImage = record.image ?? record.imageUrl ?? record.image_url;
  const image = typeof rawImage === 'string' && rawImage.trim() ? rawImage.trim() : undefined;

  // Map Original Price (optional)
  const rawOrigPrice = record.originalPrice ?? record.original_price ?? record.OriginalPrice ?? record.mrp;
  let originalPrice: number | undefined;
  if (rawOrigPrice !== undefined && rawOrigPrice !== null && rawOrigPrice !== '') {
    const parsed = typeof rawOrigPrice === 'number' ? rawOrigPrice : parseFloat(String(rawOrigPrice).replace(/[^\d.-]/g, ''));
    if (!isNaN(parsed) && parsed > 0) {
      originalPrice = parsed;
    }
  }

  // Map Age (optional)
  const rawAge = record.age ?? record.ageYears ?? record.age_years ?? record.Age;
  let age: number | undefined;
  if (rawAge !== undefined && rawAge !== null && rawAge !== '') {
    const parsed = typeof rawAge === 'number' ? rawAge : parseFloat(String(rawAge).replace(/[^\d.-]/g, ''));
    if (!isNaN(parsed) && parsed >= 0) {
      age = parsed;
    }
  }

  // Map Condition (optional)
  const rawCond = record.condition ?? record.Condition ?? record.state;
  let condition: Condition | undefined;
  if (rawCond && typeof rawCond === 'string') {
    const norm = normalizeCondition(rawCond);
    if (norm) condition = norm;
  }

  // Map ID
  const rawId = record.id ?? record.ID ?? record.productId ?? record.product_id;
  const id = rawId ? String(rawId).trim() : `IMP-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  // Optional description / specs
  const description = typeof record.description === 'string' ? record.description.trim() : undefined;
  const specs = typeof record.specifications === 'object' && record.specifications !== null ? (record.specifications as Record<string, string>) : undefined;

  const product: Product = {
    id,
    title,
    category,
    price,
    originalPrice,
    age,
    condition,
    description,
    image,
    listingType,
    rentDuration,
    specifications: specs,
    createdAt: new Date().toISOString()
  };

  return { product };
}

/**
 * Simple CSV parser handling quotes and headers
 */
export function parseCSV(csvText: string): ParseResult {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return {
      validProducts: [],
      errors: [{ row: 0, reason: 'CSV must contain at least a header row and one data row.' }]
    };
  }

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headers = parseRow(lines[0]).map((h) => h.replace(/^["']|["']$/g, '').trim());
  const validProducts: Product[] = [];
  const errors: { row: number; item?: string; reason: string }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]).map((v) => v.replace(/^["']|["']$/g, '').trim());
    if (values.every((v) => v === '')) continue; // Skip blank lines

    const record: Record<string, unknown> = {};
    headers.forEach((h, idx) => {
      record[h] = values[idx];
    });

    const { product, error } = normalizeProductRecord(record, i + 1);
    if (error) {
      errors.push({ row: i + 1, reason: error });
    } else if (product) {
      validProducts.push(product);
    }
  }

  return { validProducts, errors };
}

/**
 * JSON parser supporting array or object with items
 */
export function parseJSON(jsonText: string): ParseResult {
  const validProducts: Product[] = [];
  const errors: { row: number; item?: string; reason: string }[] = [];

  let data: unknown;
  try {
    data = JSON.parse(jsonText);
  } catch (err) {
    return {
      validProducts: [],
      errors: [{ row: 0, reason: `Invalid JSON syntax: ${(err as Error).message}` }]
    };
  }

  const items = Array.isArray(data) ? data : (data && typeof data === 'object' && Array.isArray((data as { products?: unknown[] }).products)) ? (data as { products: unknown[] }).products : null;

  if (!items) {
    return {
      validProducts: [],
      errors: [{ row: 0, reason: 'JSON root must be an array of products or an object with a "products" array.' }]
    };
  }

  items.forEach((item, idx) => {
    if (!item || typeof item !== 'object') {
      errors.push({ row: idx + 1, reason: `Item at index ${idx} is not a valid JSON object.` });
      return;
    }
    const { product, error } = normalizeProductRecord(item as Record<string, unknown>, idx + 1);
    if (error) {
      errors.push({ row: idx + 1, reason: error });
    } else if (product) {
      validProducts.push(product);
    }
  });

  return { validProducts, errors };
}

/**
 * Exports products to formatted JSON
 */
export function exportToJSON(products: Product[]): string {
  return JSON.stringify(products, null, 2);
}

/**
 * Exports products to CSV
 */
export function exportToCSV(products: Product[]): string {
  const headers = ['id', 'title', 'category', 'price', 'originalPrice', 'age', 'condition', 'description'];
  const rows = products.map((p) => {
    return [
      `"${p.id || ''}"`,
      `"${(p.title || '').replace(/"/g, '""')}"`,
      `"${p.category || 'Other'}"`,
      p.price ?? '',
      p.originalPrice ?? '',
      p.age ?? '',
      `"${p.condition || ''}"`,
      `"${(p.description || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
