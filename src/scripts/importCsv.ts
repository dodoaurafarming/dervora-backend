import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parseCsv } from './csvParser.js';
import {
  cleanString, parsePrice, parseIngredients,
  normalizeCategory, extractSkinTypes, extractConcerns,
} from './dataNormalizer.js';
import { backupDatabase, printMysqldumpInstruction } from './backupManager.js';
import { CSV_PATHS, LOG_DIR } from './config.js';

const prisma = new PrismaClient();

interface ProductRow {
    [key: string]: string;
  'product name': string;
  'brand': string;
  'product type': string;
  'ingredients': string;
  'waspada': string;
  'product photo': string;
  'analysis summary': string;
  'suitable for dry skin': string;
  'suitable for oily skin': string;
  'suitable for sensitive skin': string;
  'suitable for acne-prone skin': string;
  'ai skin type suitability summary': string;
  'link_shopee': string;
  'no. bpom': string;
  'harga': string;
}

interface BrandRow {
  'brand name': string;
  'logo photo': string;
  'country of origin': string;
  'official website': string;
  'products': string;
  'number of products': string;
  'brand reputation & safety insights (ai)': string;
}

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const limitArg = args.find((a) => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;
const skipBackup = args.includes('--skip-backup');

interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: unknown;
  timestamp: string;
}

const logs: LogEntry[] = [];

function log(level: LogEntry['level'], message: string, data?: unknown) {
  const entry = { level, message, data, timestamp: new Date().toISOString() };
  logs.push(entry);
  const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} ${message}`);
  if (data) console.log(`   →`, data);
}

function saveLogs() {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logPath = path.join(LOG_DIR, `import-${timestamp}.json`);
  fs.writeFileSync(logPath, JSON.stringify(logs, null, 2), 'utf-8');
}

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('🚀 DERVORA CSV IMPORT');
  console.log(`   Mode: ${isDryRun ? 'DRY RUN (no insert)' : 'INSERT'}`);
  console.log(`   Limit: ${limit === Infinity ? 'ALL' : limit}`);
  console.log('═══════════════════════════════════════════════\n');

  if (!isDryRun && !skipBackup) {
    await backupDatabase();
    printMysqldumpInstruction();
  }

  log('info', 'Membaca CSV files...');
  const productsRaw = parseCsv<ProductRow>(CSV_PATHS.products);
  const brandsRaw = parseCsv<BrandRow>(CSV_PATHS.brands);
  
  const productsToImport = limit === Infinity ? productsRaw : productsRaw.slice(0, limit);
  log('info', `Akan memproses ${productsToImport.length} produk dan ${brandsRaw.length} brand.`);

  const brandMap = new Map<string, number>();

  for (const bRow of brandsRaw) {
    const name = cleanString(bRow['brand name']);
    if (!name) continue;

    if (isDryRun) {
      brandMap.set(name.toLowerCase(), -1);
      continue;
    }

    try {
      const brand = await prisma.brand.upsert({
        where: { name },
        update: {
          logoUrl: cleanString(bRow['logo photo']) || undefined,
          country: cleanString(bRow['country of origin']) || undefined,
          website: cleanString(bRow['official website']) || undefined,
          reputation: cleanString(bRow['brand reputation & safety insights (ai)']) || undefined,
        },
        create: {
          name,
          logoUrl: cleanString(bRow['logo photo']) || undefined,
          country: cleanString(bRow['country of origin']) || undefined,
          website: cleanString(bRow['official website']) || undefined,
          reputation: cleanString(bRow['brand reputation & safety insights (ai)']) || undefined,
        },
      });
      brandMap.set(name.toLowerCase(), brand.id);
    } catch (err) {
      log('error', `Gagal upsert brand: ${name}`, err);
    }
  }

  let success = 0, skipped = 0, failed = 0;

  for (let i = 0; i < productsToImport.length; i++) {
    const row = productsToImport[i];
    const num = i + 1;

    try {
      const name = cleanString(row['product name']);
      const brandName = cleanString(row['brand']);
      const productType = cleanString(row['product type']);

      if (!name || !brandName) {
        log('warn', `[${num}] Skip: Nama atau brand kosong`);
        skipped++;
        continue;
      }

      let brandId = brandMap.get(brandName.toLowerCase());
      if (!brandId || brandId === -1) {
        if (isDryRun) {
          brandId = -1;
        } else {
          const brand = await prisma.brand.upsert({
            where: { name: brandName },
            update: {},
            create: { name: brandName },
          });
          brandId = brand.id;
          brandMap.set(brandName.toLowerCase(), brandId);
        }
      }

      const { name: catName, needsAutoCreate } = normalizeCategory(productType);
      let categoryId: number | null = null;

      if (!isDryRun) {
        const category = await prisma.category.upsert({
          where: { name: catName },
          update: {},
          create: {
            name: catName,
            description: needsAutoCreate ? `Auto-created: ${productType}` : undefined,
          },
        });
        categoryId = category.id;
      }

      const description = cleanString(row['analysis summary']) || null;
      const price = parsePrice(row['harga']);
      const imageUrl = cleanString(row['product photo']) || null;
      const bpom = cleanString(row['no. bpom']) || null;
      const skinTypes = extractSkinTypes(row);
      const concerns = extractConcerns(row['analysis summary']);
      const ingredientNames = parseIngredients(row['ingredients']);

      if (isDryRun) {
        log('info', `[DRY ${num}] ${name} | Harga: ${price} | Ingreds: ${ingredientNames.length}`);
        continue;
      }

      const existing = await prisma.product.findFirst({
        where: { name, brandId: brandId as number },
      });

      if (existing) {
        log('warn', `[${num}] Skip: Produk duplikat - ${name}`);
        skipped++;
        continue;
      }

      const product = await prisma.product.create({
        data: {
          name,
          brandId: brandId as number,
          categoryId,
          description,
          price,
          imageUrl,
          bpom,
          skinTypes,
          concerns: concerns.length > 0 ? concerns : undefined,
        },
      });

      for (const ingName of ingredientNames) {
        try {
          const ingredient = await prisma.ingredient.upsert({
            where: { name: ingName },
            update: {},
            create: { name: ingName },
          });
          await prisma.productIngredient.create({
            data: { productId: product.id, ingredientId: ingredient.id },
          });
        } catch (e) { /* Skip duplicate ingredient links */ }
      }

      log('info', `[${num}] ✅ Sukses: ${name}`);
      success++;
    } catch (err) {
      log('error', `[${num}] Gagal import: ${row['product name']}`, err);
      failed++;
    }
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log('📊 SUMMARY');
  console.log(`   ✅ Success: ${success} | ⏭️  Skipped: ${skipped} | ❌ Failed:  ${failed}`);
  console.log('═══════════════════════════════════════════════\n');
  saveLogs();
}

main()
  .catch((e) => { console.error('❌ FATAL ERROR:', e); saveLogs(); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });