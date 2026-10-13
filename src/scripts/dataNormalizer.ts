import { PRODUCT_TYPE_MAPPING, DEFAULT_CATEGORY } from './config.js';

export function cleanString(str: string | undefined | null): string {
  if (!str) return '';
  return str.trim().replace(/\s+/g, ' ');
}

export function parsePrice(priceStr: string | undefined | null): number | null {
  if (!priceStr) return null;
  const cleaned = priceStr
    .replace(/Rp/gi, '')
    .replace(/\./g, '')
    .replace(/,/g, '')
    .replace(/\s/g, '')
    .trim();
  if (!cleaned) return null;
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

export function parseIngredients(ingStr: string | undefined | null): string[] {
  if (!ingStr) return [];
  return Array.from(
    new Set(
      ingStr
        .split(',')
        .map((s) => cleanString(s))
        .filter((s) => s.length > 0 && s.length < 100)
    )
  );
}

export function normalizeCategory(productType: string | undefined | null): { name: string; needsAutoCreate: boolean } {
  const cleaned = cleanString(productType).toLowerCase();
  if (!cleaned) return { name: DEFAULT_CATEGORY, needsAutoCreate: true };

  const mapped = PRODUCT_TYPE_MAPPING[cleaned];
  if (mapped) return { name: mapped, needsAutoCreate: false };

  const titleCase = cleaned
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return { name: titleCase, needsAutoCreate: true };
}

export function parseChecked(str: string | undefined | null): boolean {
  if (!str) return false;
  return str.toLowerCase().trim() === 'checked';
}

export function extractSkinTypes(row: Record<string, string>): string[] {
  const types: string[] = [];
  if (parseChecked(row['suitable for dry skin'])) types.push('Dry');
  if (parseChecked(row['suitable for oily skin'])) types.push('Oily');
  if (parseChecked(row['suitable for sensitive skin'])) types.push('Sensitive');
  if (parseChecked(row['suitable for acne-prone skin'])) types.push('Acne-prone');
  return types.length > 0 ? types : ['All'];
}

export function extractConcerns(aiSummary: string | undefined | null): string[] {
  if (!aiSummary) return [];
  const summary = aiSummary.toLowerCase();
  const possibleConcerns = [
    'acne', 'dark spots', 'dullness', 'dryness', 'excess oil',
    'redness', 'uneven texture', 'irritation', 'sensitivity', 'dehydration',
  ];
  return possibleConcerns.filter((c) => summary.includes(c));
}