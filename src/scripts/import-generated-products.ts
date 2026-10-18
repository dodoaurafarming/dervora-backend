import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function main() {
  const files = [
    'products-generated-1.csv',
    'products-generated-2.csv',
    'products-generated-3.csv',
    'products-generated-4.csv',
    'products-generated-5.csv',
  ];

  const dataDir = path.join(process.cwd(), 'data');
  let allRecords: any[] = [];

  // 1. Baca dan gabungkan semua file CSV
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        relaxColumnCount: true,
      });
      allRecords = allRecords.concat(records);
      console.log(`✅ Berhasil membaca ${records.length} baris dari ${file}`);
    } else {
      console.warn(`⚠️ File tidak ditemukan: ${file}`);
    }
  }

  console.log(`\n📊 Total data yang akan diproses: ${allRecords.length} produk\n`);

  let updatedCount = 0;
  let failedCount = 0;

  // 2. Looping dan update ke database
  for (const row of allRecords) {
    const id = parseInt(row['ID'], 10);
    if (isNaN(id)) continue;

    try {
      // Parse data dari CSV
      const rating = row['Rating'] ? parseFloat(row['Rating']) : null;
      const reviewCount = row['ReviewCount'] ? parseInt(row['ReviewCount'], 10) : null;
      
      // SkinTypes dipisah dengan tanda '|', kita ubah jadi array
      const skinTypes = row['SkinTypes'] ? row['SkinTypes'].split('|').map((s: string) => s.trim()) : null;
      
      const howToUse = row['HowToUse'] || null;
      const notes = row['Notes'] || null;
      const size = row['Size'] || null;
      const halal = row['Halal'] ? (row['Halal'].toLowerCase() === 'true') : true;

      await prisma.product.update({
        where: { id },
        data: {
          rating,
          reviewCount,
          skinTypes: skinTypes ? skinTypes : undefined,
          howToUse,
          notes,
          size,
          halal,
        },
      });
      updatedCount++;
      
      if (updatedCount % 50 === 0) {
        console.log(`   📊 Progress: ${updatedCount}/${allRecords.length}`);
      }
    } catch (error) {
      failedCount++;
      console.error(`   ❌ Gagal update ID ${id}:`, error);
    }
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log(`📊 SUMMARY`);
  console.log(`   Berhasil diupdate: ${updatedCount}`);
  console.log(`   Gagal: ${failedCount}`);
  console.log('═══════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Error fatal:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());