import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// AUTO-MAPPING NAMA (Bahan Teknis -> Bahan Edukasi/Katalog)
// ============================================================
const NAME_MAPPING: Record<string, string> = {
  // Niacinamide
  'Vitamin B3': 'Niacinamide',
  'Nicotinamide': 'Niacinamide',
  'Niacinamide 10%': 'Niacinamide',
  
  // Centella
  'Centella Asiatica Leaf': 'Centella Asiatica',
  'Centella Asiatica Extract': 'Centella Asiatica',
  'Centella Asiatica (Cica) Extract': 'Centella Asiatica',
  'Centella Asiatica Leaf Extract': 'Centella Asiatica',
  'Cica': 'Centella Asiatica',
  'Madecassoside': 'Centella Asiatica',
  
  // Hyaluronic Acid
  'Sodium Hyaluronate': 'Hyaluronic Acid',
  'Hydrolyzed Hyaluronic Acid': 'Hyaluronic Acid',
  'Sodium Acetyl Hyaluronate': 'Hyaluronic Acid',
  'Hydrolyzed Hyaluronate': 'Hyaluronic Acid',
  'Sodium Acetylated Hyaluronate': 'Hyaluronic Acid',
  'Sodium Hyaluronate Crosspolymer': 'Hyaluronic Acid',
  'Hydroxypropyltrimonium Hyaluronate': 'Hyaluronic Acid',
  'Hydrolyzed Sodium Hyaluronate': 'Hyaluronic Acid',
  'HyaluComplex-10': 'Hyaluronic Acid',
  
  // Vitamin C
  'Ascorbic Acid': 'Vitamin C',
  '3-O-Ethyl Ascorbic Acid': 'Vitamin C',
  'Tetrahexyldecyl Ascorbate': 'Vitamin C',
  'Sodium Ascorbyl Phosphate': 'Vitamin C',
  
  // Vitamin E & B5
  'Tocopherol': 'Vitamin E',
  'Tocopheryl Acetate': 'Vitamin E',
  'Panthenol': 'Vitamin B5',
  'Panthenol (Vitamin B5)': 'Vitamin B5',
  'Provitamin B5': 'Vitamin B5',
  
  // Aloe Vera
  'Aloe Vera Extract': 'Aloe Vera',
  'Aloe Vera Leaf Extract': 'Aloe Vera',
  'Aloe Barbadensis Leaf Extract': 'Aloe Vera',
  'Aloe Barbadensis Juice Extract': 'Aloe Vera',
  'Aloe Barbadensis (Aloe Vera) Leaf Extract': 'Aloe Vera',
  
  // Acids (BHA/AHA)
  'Salicylic Acid (BHA)': 'Salicylic Acid',
  'BHA': 'Salicylic Acid',
  'Salicylic Acid 0.2%': 'Salicylic Acid',
  'Capryloyl Salicylic Acid': 'Salicylic Acid',
  
  // Retinol
  'Retinoid': 'Retinol',
  'Hydroxypinacolone Retinoate': 'Retinol',
  '1% Liporetinol': 'Retinol',
  
  // Ceramide
  'Ceramide NP': 'Ceramide',
  'Ceramide EOP': 'Ceramide',
  'Ceramide NS': 'Ceramide',
  'Ceramide AS': 'Ceramide',
  'Ceramide AP': 'Ceramide',
  '5X Ceramide': 'Ceramide',
  'Ceramides': 'Ceramide',
  '8+ Ceramides': 'Ceramide',
  
  // Peptides
  'Matrixyl 3000': 'Peptides',
  'Acetyl Hexapeptide-8': 'Peptides',
  'Palmitoyl Tripeptide-1': 'Peptides',
  'Palmitoyl Tetrapeptide-7': 'Peptides',
  '5X Growth Factor Peptides': 'Peptides',
  'Bio-Highlighter Peptide': 'Peptides',
  'Polypeptide': 'Peptides',
  
  // Base / Ekstrak Alam Lainnya
  'Aqua (Water)': 'Aqua',
  'Water': 'Aqua',
  'Maris Aqua (Sea Water)': 'Aqua',
  'Glycerol': 'Glycerin',
  'Licorice Root Extract': 'Licorice Root Extract',
  'Licorice Extract': 'Licorice Root Extract',
  'Glycyrrhiza Glabra Extract': 'Licorice Root Extract',
  'Glycyrrhiza Glabra (Licorice) Root Extract': 'Licorice Root Extract',
  'Melaleuca Alternifolia': 'Tea Tree',
  'Tea Tree Oil': 'Tea Tree',
  'Melaleuca Alternifolia Leaf Oil': 'Tea Tree',
  'Camellia Sinensis Extract': 'Green Tea Extract',
  'Camellia Sinensis Leaf Extract': 'Green Tea Extract',
  'Camellia Sinensis Leaf Extract (Green Tea)': 'Green Tea Extract',
  'Butyrospermum Parkii Butter': 'Shea Butter',
  'Simmondsia Chinensis (Jojoba) Seed Oil': 'Jojoba Oil',
  'Jojoba Esters': 'Jojoba Oil',
};

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');

  console.log(`\n🔗 Link Ingredient -> Catalog`);
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'EXECUTE'}\n`);

  // Ambil semua ingredient yang BELUM terhubung ke katalog
  const ingredients = await prisma.ingredient.findMany({
    where: { catalogId: null },
  });

  console.log(`📊 Ingredients yang belum memiliki link katalog: ${ingredients.length}\n`);

  let linked = 0;
  let skipped = 0;

  for (const ing of ingredients) {
    // Gunakan nama dari mapping, kalau tidak ada, pakai nama aslinya
    const catalogName = NAME_MAPPING[ing.name] || ing.name;

    // Cari apakah bahan tersebut ada di database tabel katalog
    const catalog = await prisma.ingredientCatalog.findUnique({
      where: { name: catalogName },
    });

    // Jika tidak ditemukan di katalog, skip saja (biarkan statusnya null)
    if (!catalog) {
      skipped++;
      continue;
    }

    if (isDryRun) {
      console.log(`   [DRY] "${ing.name}" -> akan di-link ke katalog: "${catalogName}"`);
    } else {
      await prisma.ingredient.update({
        where: { id: ing.id },
        data: { catalogId: catalog.id },
      });
      // console.log(`   ✅ Linked "${ing.name}" -> "${catalogName}"`); // Buka komen ini jika ingin log tiap baris saat dieksekusi
    }

    linked++;
  }

  console.log(`\n✅ Selesai!`);
  console.log(`   ${isDryRun ? 'Akan di-link' : 'Berhasil di-link'}: ${linked}`);
  console.log(`   Dilewati (katalog tidak ditemukan): ${skipped}\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());