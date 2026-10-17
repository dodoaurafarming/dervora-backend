import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

// ============================================================
// KATEGORI INGREDIENT (untuk grouping di UI)
// ============================================================
const INGREDIENT_CATEGORIES: Record<string, string[]> = {
  'Active': [
    'Niacinamide', 'Salicylic Acid', 'Hyaluronic Acid', 'Vitamin C',
    'Retinol', 'Glycolic Acid', 'Lactic Acid', 'Mandelic Acid',
    'Alpha-Arbutin', 'Tranexamic Acid', 'Kojic Acid', 'Azelaic Acid',
    'Benzoyl Peroxide', 'Adenosine', 'Peptides', 'Ceramide',
  ],
  'Botanical': [
    'Centella Asiatica', 'Aloe Vera', 'Mugwort', 'Tea Tree',
    'Licorice Root Extract', 'Green Tea Extract', 'Chamomile',
    'Witch Hazel', 'Houttuynia Cordata',
  ],
  'Base': [
    'Aqua', 'Glycerin', 'Butylene Glycol', 'Propylene Glycol',
    'Propanediol', 'Pentylene Glycol', 'Squalane', 'Dimethicone',
  ],
  'Preservative': [
    'Phenoxyethanol', 'Ethylhexylglycerin', 'Benzyl Alcohol',
    'Methylparaben', 'Sodium Benzoate',
  ],
  'Emollient': [
    'Shea Butter', 'Jojoba Oil', 'Sunflower Oil', 'Caprylic/Capric Triglyceride',
  ],
  'Surfactant': [
    'Cocamidopropyl Betaine', 'Sodium Laureth Sulfate', 'Decyl Glucoside',
  ],
  'UV Filter': [
    'Zinc Oxide', 'Titanium Dioxide', 'Ethylhexyl Methoxycinnamate',
    'Butyl Methoxydibenzoylmethane',
  ],
  'Fragrance': [
    'Geraniol', 'Limonene', 'Linalool', 'Citronellol', 'Rose Oil',
  ],
};

function getCategory(name: string): string {
  for (const [category, ingredients] of Object.entries(INGREDIENT_CATEGORIES)) {
    if (ingredients.some((ing) => name.toLowerCase().includes(ing.toLowerCase()))) {
      return category;
    }
  }
  return 'Other';
}

function parseCommonUses(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length < 100)
    .slice(0, 10);
}

// ============================================================
// MAIN IMPORT
// ============================================================
async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');

  console.log(`\n📤 Import Ingredient Catalog`);
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'EXECUTE'}\n`);

  // Sesuaikan path ini jika lokasi CSV Anda berbeda
  const csvPath = path.join(process.cwd(), 'data', 'ingredients-catalog.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ File tidak ditemukan: ${csvPath}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  // TAMBAHAN: Paksa TypeScript membaca records sebagai array of any
  const records: any[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relaxColumnCount: true,
  });

  const validRecords = records.filter((row: any) => {
    const name = row['Ingredient Name']?.trim();
    return name && name.length > 1 && !name.includes('POLYNIA') && !name.startsWith('"');
  });

  if (isDryRun) {
    console.log(`📊 Valid records: ${validRecords.length}`);
    console.log(`📋 Preview (10 baris pertama):\n`);
    validRecords.slice(0, 10).forEach((row: any, i: number) => {
      console.log(`   ${i + 1}. ${row['Ingredient Name']} (${getCategory(row['Ingredient Name'])})`);
    });
    console.log(`\n✅ DRY RUN selesai. Tidak ada perubahan di database.\n`);
    return;
  }

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  // TAMBAHAN: Casting validRecords ke any[] agar loop tidak error
  for (const row of validRecords as any[]) {
    const name = row['Ingredient Name']?.trim();
    if (!name) continue;

    try {
      const data = {
        name,
        photoUrl: row['Ingredient Photo']?.trim() || null,
        description: row['Description']?.trim() || null,
        sourceLink: row['Link sumber']?.trim() || null,
        commonUses: parseCommonUses(row['Common Uses']),
        allergyPotential: row['Potensi Alergi']?.trim() || null,
        skinTypeSummary: row['Skin Type Suitability Summary (AI)']?.trim() || null,
        riskBenefit: row['Ingredient Risk/Benefit Analysis (AI)']?.trim() || null,
        category: getCategory(name),
        isActive: true,
      };

      const existing = await prisma.ingredientCatalog.findUnique({ where: { name } });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.ingredientCatalog.create({ data });
      imported++;
    } catch (error) {
      errors++;
      console.error(`   ❌ Error saat memproses "${name}":`, error);
    }
  }

  console.log(`\n✅ Import selesai!`);
  console.log(`   Berhasil import: ${imported}`);
  console.log(`   Dilewati (sudah ada): ${skipped}`);
  console.log(`   Gagal/Error: ${errors}`);
  console.log(`   Total data di Catalog sekarang: ${await prisma.ingredientCatalog.count()}\n`);
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan fatal:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());