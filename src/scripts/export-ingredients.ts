import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// --- ES Modules Fix untuk __dirname ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('📦 Mengekstrak data ingredients dari database...');
  
  const ingredients = await prisma.ingredient.findMany({
    orderBy: { name: 'asc' },
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const exportDir = path.join(__dirname, 'exports');

  // Buat folder exports jika belum ada
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  // 1. Export ke JSON
  const jsonPath = path.join(exportDir, `ingredients-export-${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(ingredients, null, 2), 'utf-8');

  // 2. Export ke CSV
  const csvPath = path.join(exportDir, `ingredients-export-${timestamp}.csv`);
  const csvHeader = 'id,name,description,function\n';
  
  const csvRows = ingredients.map(ing => {
    // Escape string untuk CSV (menghindari error jika ada koma/enter di dalam teks)
    const escapeCSV = (str: string | null | undefined) => {
      if (!str) return '""';
      return `"${str.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
    };
    
    // Asumsi field model Ingredient: id, name, description, function
    // Sesuaikan properti (seperti ing.description) jika nama field di schema Prisma Anda berbeda
    return `${ing.id},${escapeCSV(ing.name)},${escapeCSV((ing as any).description)},${escapeCSV((ing as any).function)}`;
  }).join('\n');

  fs.writeFileSync(csvPath, csvHeader + csvRows, 'utf-8');

  console.log(`\n✅ Export Berhasil!`);
  console.log(`📄 JSON tersimpan di: ${jsonPath}`);
  console.log(`📊 CSV tersimpan di: ${csvPath}`);
  console.log(`📈 Total diekstrak: ${ingredients.length} ingredients.\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error saat mengekstrak data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });