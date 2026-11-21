import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('📤 Mulai mengekspor data produk ke CSV...\n');

  // Ambil data produk dari database
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      buyLink: true,
    },
    orderBy: { id: 'asc' },
  });

  console.log(`✅ Berhasil mengambil ${products.length} produk dari database.\n`);

  // Format ke CSV
  // Header: ID, Name, BuyLink
  const csvHeader = 'ID,Name,BuyLink\n';
  
  const csvRows = products.map((p) => {
    // Escape tanda kutip ganda di dalam nama (jika ada)
    const safeName = p.name.replace(/"/g, '""');
    const safeBuyLink = p.buyLink ? p.buyLink.replace(/"/g, '""') : '';
    
    return `${p.id},"${safeName}","${safeBuyLink}"`;
  }).join('\n');

  const csvContent = csvHeader + csvRows;

  // Tentukan path output
  const outputPath = path.join(process.cwd(), 'data', 'products-export.csv');

  // Pastikan folder data ada
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Tulis file
  fs.writeFileSync(outputPath, csvContent, 'utf-8');

  console.log(`💾 File CSV berhasil disimpan di: ${outputPath}`);
  console.log(`📊 Total baris: ${products.length}`);
  console.log(`\n👉 Silakan buka file tersebut untuk melihat hasilnya.`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });