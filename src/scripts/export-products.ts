import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('📤 Mengambil data produk dari database...');
  
  const products = await prisma.product.findMany({
    select: { id: true, name: true },
    orderBy: { id: 'asc' },
  });

  console.log(`✅ Berhasil mengambil ${products.length} produk.`);

  // Format ke CSV (ID, Nama)
  // Kita hanya perlu Nama untuk AI, tapi ID diperlukan untuk update nanti
  const csvHeader = 'ID,Name\n';
  const csvRows = products.map((p) => `${p.id},"${p.name.replace(/"/g, '""')}"`).join('\n');
  const csvContent = csvHeader + csvRows;

  const outputPath = path.join(process.cwd(), 'data', 'products-to-generate.csv');
  
  // Pastikan folder data ada
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(outputPath, csvContent, 'utf-8');
  console.log(`\n💾 File CSV disimpan di: ${outputPath}`);
  console.log(`👉 Silakan buka file tersebut, copy isinya, dan kirim ke AI.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });