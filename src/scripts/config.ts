/**
 * Mapping Product Type (dari CSV) → Category (di database).
 */
export const PRODUCT_TYPE_MAPPING: Record<string, string> = {
  'cleanser': 'Cleanser',
  'face wash': 'Cleanser',
  'facial wash': 'Cleanser',
  'facial cleanser': 'Cleanser',
  'first cleanser': 'Cleanser',
  'micellar water': 'Micellar Water',
  'toner': 'Toner',
  'toner exfoliating': 'Toner',
  'essence': 'Essence',
  'serum': 'Serum',
  'ampoule': 'Serum',
  'moisturizer': 'Moisturizer',
  'moisturizer gel': 'Moisturizer',
  'day moisturizer': 'Moisturizer',
  'gel pelembab': 'Moisturizer',
  'cream': 'Moisturizer',
  'night cream': 'Moisturizer',
  'sunscreen': 'Sunscreen',
  'physical sunscreen': 'Sunscreen',
  'tinted sunscreen': 'Sunscreen',
  'mask': 'Mask',
  'clay mask': 'Mask',
  'sleeping mask': 'Mask',
  'exfoliant': 'Exfoliant',
  'exfoliating pad': 'Exfoliant',
  'exfoliation': 'Exfoliant',
  'peeling gel': 'Exfoliant',
  'eye cream': 'Eye Cream',
  'acne gel': 'Acne Care',
  'spot treatment': 'Acne Care',
  'acne lotion': 'Acne Care',
  'face mist': 'Face Mist',
  'facemist': 'Face Mist',
  'spray': 'Face Mist',
};

export const DEFAULT_CATEGORY = 'Uncategorized';

// Menggunakan nama file CSV asli yang Anda berikan
export const CSV_PATHS = {
  products: 'data/DataBase Skinora - Sheet 1 (1).csv',
  brands: 'data/DataBase Skinora - Sheet 4 (1).csv',
};

export const BACKUP_DIR = 'scripts/backups';
export const LOG_DIR = 'scripts/import-logs';