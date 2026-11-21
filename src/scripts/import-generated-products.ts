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

  console.log('📂 Mulai membaca file CSV...\n');

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
      console.warn(`⚠️ File tidak ditemukan: ${filePath}`);
    }
  }

  console.log(`\n📊 Total data yang akan diproses: ${allRecords.length} produk\n`);

  // 2. VALIDASI PENTING: Pastikan ada minimal 1 Brand dan 1 Category di database
  const defaultBrand = await prisma.brand.findFirst({ select: { id: true } });
  const defaultCategory = await prisma.category.findFirst({ select: { id: true } });
  
  if (!defaultBrand || !defaultCategory) {
    console.error('❌ GAGAL: Tabel "Brand" atau "Category" masih KOSONG di database!');
    console.error('💡 SOLUSI:');
    console.error('   1. Pastikan file .env Anda mengarah ke database yang BENAR (misal: database Production, bukan database "test" yang kosong).');
    console.error('   2. Atau, tambahkan minimal 1 data Brand dan 1 data Category ke database terlebih dahulu melalui Admin Panel atau script seed.');
    process.exit(1);
  }
  
  const fallbackBrandId = defaultBrand.id;
  const fallbackCategoryId = defaultCategory.id;
  
  console.log(`💡 Menggunakan fallback brandId: ${fallbackBrandId}, categoryId: ${fallbackCategoryId} untuk produk baru.\n`);

  let updatedCount = 0;
  let failedCount = 0;

  // 3. Looping dan upsert (Update atau Create) ke database
  for (const row of allRecords) {
    const id = parseInt(row['ID'], 10);
    if (isNaN(id)) continue;

    try {
      const rating = row['Rating'] ? parseFloat(row['Rating']) : null;
      const reviewCount = row['ReviewCount'] ? parseInt(row['ReviewCount'], 10) : null;
      
      const skinTypesRaw = row['SkinTypes'] ? row['SkinTypes'].trim() : '';
      const skinTypes = skinTypesRaw ? skinTypesRaw.split('|').map((s: string) => s.trim()) : undefined;
      
      const howToUse = row['HowToUse'] ? row['HowToUse'].trim() : null;
      const notes = row['Notes'] ? row['Notes'].trim() : null;
      const size = row['Size'] ? row['Size'].trim() : null;
      const halal = row['Halal'] ? (row['Halal'].trim().toLowerCase() === 'true') : true;
      const name = row['Name'] ? row['Name'].trim() : `Product ${id}`;

      await prisma.product.upsert({
        where: { id },
        update: {
          rating,
          reviewCount,
          skinTypes,
          howToUse,
          notes,
          size,
          halal,
        },
        create: {
          id,
          name,
          rating,
          reviewCount,
          skinTypes,
          howToUse,
          notes,
          size,
          halal,
          // Field wajib untuk create (dipastikan bernilai number, bukan undefined)
          brandId: fallbackBrandId,
          categoryId: fallbackCategoryId,
        },
      });

      updatedCount++;
      
      if (updatedCount % 50 === 0) {
        console.log(`   ⏳ Progress: ${updatedCount}/${allRecords.length} produk diproses...`);
      }
    } catch (error: any) {
      failedCount++;
      console.error(`   ❌ Gagal memproses ID ${id}:`, error.message);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 SUMMARY IMPORT DATA');
  console.log(`   ✅ Berhasil diproses (Update/Create): ${updatedCount}`);
  console.log(`   ❌ Gagal: ${failedCount}`);
  console.log('═══════════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Error fatal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });