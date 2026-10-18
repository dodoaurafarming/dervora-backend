import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Logika AI sederhana: Menebak concerns berdasarkan nama produk
function generateConcerns(productName: string): string[] {
  const name = productName.toLowerCase();
  const concerns = new Set<string>();

  // Deteksi masalah kulit berdasarkan kata kunci di nama produk
  if (name.includes('acne') || name.includes('blemish') || name.includes('jerawat') || name.includes('salicylic') || name.includes('bha') || name.includes('tea tree') || name.includes('centella') || name.includes('cica')) {
    concerns.add('Acne');
    concerns.add('Excess Oil');
  }
  if (name.includes('bright') || name.includes('glow') || name.includes('whitening') || name.includes('niacinamide') || name.includes('vitamin c') || name.includes('tone up') || name.includes('dark spot')) {
    concerns.add('Dullness');
    concerns.add('Dark Spots');
  }
  if (name.includes('hydra') || name.includes('hyaluronic') || name.includes('moist') || name.includes('ceramide') || name.includes('barrier') || name.includes('b5') || name.includes('panthenol')) {
    concerns.add('Dryness');
    concerns.add('Dehydration');
  }
  if (name.includes('retinol') || name.includes('peptide') || name.includes('collagen') || name.includes('firming') || name.includes('lift')) {
    concerns.add('Anti-Aging');
  }
  if (name.includes('soothing') || name.includes('calm') || name.includes('sensitive') || name.includes('centella')) {
    concerns.add('Redness');
    concerns.add('Irritation');
  }
  if (name.includes('sunscreen') || name.includes('sun') || name.includes('spf') || name.includes('uv')) {
    concerns.add('Sun Protection');
  }
  if (name.includes('scrub') || name.includes('exfoliat') || name.includes('aha') || name.includes('pha') || name.includes('peeling')) {
    concerns.add('Uneven Texture');
  }

  // Jika tidak ada yang cocok, berikan default (misal: untuk produk bayi)
  if (concerns.size === 0) {
    concerns.add('Dryness'); // Default untuk pelembap
  }

  return Array.from(concerns);
}

async function main() {
  console.log('📤 Mengambil data produk dari database...');
  
  const products = await prisma.product.findMany({
    select: { id: true, name: true },
  });

  console.log(`✅ Berhasil mengambil ${products.length} produk. Mulai update concerns...\n`);

  let updatedCount = 0;

  for (const product of products) {
    const concerns = generateConcerns(product.name);

    await prisma.product.update({
      where: { id: product.id },
      data: { concerns },
    });
    updatedCount++;
    
    if (updatedCount % 50 === 0) {
      console.log(`   📊 Progress: ${updatedCount}/${products.length}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log(`✅ Selesai! Berhasil mengupdate concerns untuk ${updatedCount} produk.`);
  console.log('═══════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Error fatal:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());