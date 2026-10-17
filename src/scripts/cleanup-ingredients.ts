import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// ============================================================
// CONFIG — JUNK PATTERNS
// ============================================================

const JUNK_PATTERNS: RegExp[] = [
  /^["'\s]*\d+["'\s]*$/i,
  /^dan\s/i,
  /^dan\s+.*\.$/i,
  /^dll\.?$/i,
  /^recored$/i,
  /^water\)$/i,
  /^brightening extract$/i,
  /^brightening ingredients$/i,
  /^skin-conditioning ingredients$/i,
  /^skin-conditioning$/i,
  /^antioksidan$/i,
  /^antibacterial agent$/i,
  /^mineral$/i,
  /^micellar cleansing agents$/i,
  /^spf\d+/i,
  /^color correcting pigments\.?$/i,
  /^.*;\s.*;\s.*$/,
  /^.*;\s.*;.*$/,
  /^\d+%.*;.*$/,
];

// ============================================================
// CONFIG — MAPPING
// ============================================================

const INGREDIENT_MAPPING: Record<string, string[]> = {
  'Hyaluronic Acid': [
    'Sodium Hyaluronate', 'Hydrolyzed Hyaluronic Acid', 'Hydrolyzed Hyaluronate',
    'Sodium Acetyl Hyaluronate', 'Sodium Acetylated Hyaluronate',
    'Sodium Hyaluronate Crosspolymer', 'Hydroxypropyltrimonium Hyaluronate',
    'Hydroxy Trimonium Hyaluronate', 'Hydrolyzed Sodium Hyaluronate',
    'Bio Sodium Hyaluronate Powder', 'Bio hyaluronic', 'Sodium Hyaluranote',
    'Hyalucera', 'HyaluComplex-10', 'Hyalu-10', '5X Hyaluronic Acid', '5d hyaluronic acid',
  ],
  'Panthenol': [
    'Vitamin B5', 'Vit B5 Panthenol', 'Provitamin B5', 'Pro-vitamin B5',
    'D-Panthenol', 'Panthenol (B5)', 'Panthenol (Vitamin B5)', 'Panthenol.', 'Pathenol',
  ],
  'Glycerin': ['glycerin', 'Gliserin', 'Glycerol', 'Diglycerin'],
  'Niacinamide': [
    'Vitamin B3', 'Nicotinamide', 'Niasinamida', 'Niacinamide (2%)',
    'Niacinamide (B3)', 'Niacinamide (Vitamin B3)', 'Niacinamide 10%',
    'Niacinamide 2%', 'Niacinamide 3%', 'Niacinamide 4%', 'Niacinamide 5%',
    '% Concentrated Niacinamide', 'Vitamin B3 (Niacinamide)',
    'Nicotinamide (Niacinamide)', 'dan vitamin B3 (niacinamide)',
  ],
  'Vitamin C': [
    'Ascorbic Acid', 'L-Ascorbic Acid', 'Ascorbid Acid', '3-O-Ethyl Ascorbic Acid',
    'Tetrahexyldecyl Ascorbate', 'Sodium Ascorbyl Phosphate', 'Sodium Ascorbyl Phospate',
    'Magnesium Ascorbyl Phosphate', 'Magnesium Ascorbyl Phospate',
    'Ethyl Ascorbic Acid', 'Ascorbyl Glucoside', 'VC-IP', '10% THD Ascorbate',
    '30x Vitamin C (Ascorbyl Glucoside)', 'Dual Luxury Vitamin C (THDA + EAA)',
    'THDA + EAA', 'Vitamin C Derivative', 'Pure Lemon Essence',
  ],
  'Alpha-Arbutin': ['Arbutin', 'ARBUTIN', 'Alpha Arbutin', 'Alpa-Arbutin'],
  'Tranexamic Acid': [
    'TRANEXAMIC ACID', 'TXA', 'tranexamad acid', 'Trenexamic Acid 3%', '1% Tranexamic Acid',
  ],
  'Licorice Root Extract': [
    'Licorice Extract', 'licorice', 'Licorice', 'Glycyrrhiza Glabra Extract',
    'Glycyrrhiza Glabra (Licorice) Extract', 'Glycyrrhiza Glabra (Licorice) Root Extract',
    'Glycyrrhiza Glabra Licorice Root Extract', 'Glycyrrhiza Glabra Root Extract',
    'Glycyrrhiza Glabra Root Exctract', 'Organic Licorice Extract',
    'Kanzo Extract (Licorice)', 'Dipotassium Glycyrrhizinate',
  ],
  'Kojic Acid': [],
  'SymWhite 377': [],
  'Centella Asiatica': [
    'Cica', 'CICAPRO', 'Centella', 'cantella asiatica', 'cenetela asiatica',
    'Centella Asiatica Extract', 'Centella Asiatica Leaf', 'Centella Asiatica Leaf Extract',
    'centella asiatica leaf water', 'Centella Asiatica (Cica) Extract',
    'Centella Asiatica (Cica)', 'Centella Extract', 'Centtela Asiatica Extract',
    'Centtela Asiatica Leaf Water', 'centella acid', 'Madecassoside',
    'Cica (Centella asiatica)', '4D Centella',
  ],
  'Aloe Vera': [
    'Aloe Vera Extract', 'Aloe Vera Leaf Extract', 'Aloe Barbadensis Leaf Extract',
    'Aloe Barbadensis (Aloe Vera) Leaf Extract', 'Aloe Barbadensis Juice Extract',
    'Aloe Barbadensis Leaf Juice Powder', 'Aloevera', 'Aloe Leaf Water',
  ],
  'Mugwort': [
    'Mugwort Extract', 'Artemisia Vulgaris Extract', 'Artemisia Vulgaris (Mugwort) Extract',
    'Japanese Mugwort', 'Artemisia Capillaris Extract',
    'RAYKAMI (ekstrak bunga Artemisia capillaris)',
  ],
  'Houttuynia Cordata': [
    'Houttuynia Cordata Extract', 'Houttuynia Cordata)', 'Hearleaf Extract',
    'Heartleaf Extract', 'Heartleaf', 'Korean Heartleaf',
  ],
  'Allantoin': ['Allantoin.'],
  'Bisabolol': ['bisabolol'],
  'Chamomile': ['Chamomile Extract', 'Chamomilla Recutita', 'Anthemis Nobilis Flower Extract'],
  'Calendula': ['Calendula officinalis', 'Calendula Officinalis Flower Extract', 'Celendula'],
  'Salicylic Acid': [
    'Salicylic Acid (BHA)', 'Salicylic Acid 0.2%', 'Salicylic Acid 2%',
    'Salycilic Acid (BHA)', 'BHA', 'BHA 1%', 'BHA 2%', 'BHA/Salicylic Acid',
    'Encapsulated Salicylic Acid', 'Low-Dose Salicylic Acid',
    'Capryloyl Salicylic Acid', '2% Salicylic Acid',
  ],
  'Tea Tree': [
    'Tea Tree Oil', 'Tea tree oil', 'Tea tree leaf extract',
    'Melaleuca Alternifolia', 'Melaleuca Alternifolia Leaf Oil', 'Tree tea',
  ],
  'Zinc': ['Zinc Oxide', 'Zinc PCA', 'Zinc Pca', 'Zinc Gluconate', 'Zinc Gluconate 1%'],
  'Retinol': [
    'Retinoid', '1% Liporetinol', '3% actosome retinol', 'Hydroxypinacolone Retinoate',
    'Encapsulated Retinol', 'Granactive Retinoid', 'Actosome Retinol', 'Retinal (Retinaldehyde)',
  ],
  'Peptides': [
    '10+ Peptide', 'Peptide Complex', 'Palmitoyl Tripeptide', 'Palmitoyl Tripeptide-1',
    'Palmitoyl Tripeptide-38', 'Palmitoyl Tetrapeptide-7', 'Palmitoyl Oligopeptide',
    'Palmitoyl Pentapeptide-4', 'Acetyl Hexapeptide-8', 'Matrixyl 3000',
    '5X Growth Factor Peptides', 'Polypeptide', 'Bio-Highlighter Peptide',
    'Copper Tripeptide-1', 'Avocado Peptide', 'gold peptide', 'Golden Chlorella Peptide',
  ],
  'Ceramide': [
    'Ceramide NP', 'Ceramide AP', 'Ceramide AS', 'Ceramide EOP', 'Ceramide NS',
    'Ceramides', '5X Ceramide', '5X Ceramides', '6X Ceramide', '6-Ceramide Complex',
    '8+ Ceramide', '8+ Ceramides', 'Ceramide Complex', 'Glucosyl Ceramide', 'ceramaid',
  ],
  'Collagen': [
    'Marine Collagen', 'Hydrolyzed Collagen', 'Hydromarine Collagen',
    'Collagen Water', 'Collagen Ferment Filtrate', 'Caviar Collagen',
  ],
  'Glycolic Acid': [
    'Glycolic Acid (AHA)', 'Glycolid Acid (AHA)', 'AHA', 'AHA 3%', 'AHA 7%', 'AHA/Glycolic Acid',
  ],
  'Lactic Acid': ['l-lactic acid', 'lactic acid', 'Lactic Acid (AHA)'],
  'Gluconolactone': ['Gluconolactone (PHA)', 'PHA', 'PHA 3%', '5% pha'],
  'Aqua': [
    'Aqua (Water)', 'Water', 'water', 'Water)', 'Onsen-Sui',
    'Maris Aqua', 'Maris Aqua (Sea Water)', 'Thermal Water', 'Thermal Spring Water',
  ],
  'Butylene Glycol': ['butylene glycol', 'BUTYLENE GLYCO', 'butylene glucol'],
  'Propanediol': ['propanediol', 'Methylpropanediol'],
  'Propylene Glycol': ['propylene glycol', 'Dipropylene Glycol', 'DIPROPYLENE GLYCOL'],
  'Phenoxyethanol': ['phenoxyetha'],
  'Methylparaben': ['methyl paraben'],
  'Tocopherol': [
    'Vitamin E', 'Tocopheryl Acetate', 'Tokoferil Asetat', 'Vitamin E (Tocopheryl Acetate)',
  ],
  'Squalane': ['Olive Squalane', 'Squalene'],
  'Shea Butter': ['Butyrospermum Parkii Butter'],
  'Probiotic': [
    'Probiotics', 'Bifida Ferment Lysate', 'Bifida Ferment Filtrate',
    'Bifida Ferment Filtrate (probiotic)', 'Bifidalacto Probiotics',
    'Lactobacillus Ferment', 'Lactobacillus Ferment Lysate', 'Lactococcus Ferment Lysate',
    'Saccharomyces Ferment', 'Saccharomyces Ferment Filtrate', 'Galactomyces',
    'Galactomyces Ferment Filtrate', 'multi probiome', 'Tumbuhan Based probiotics',
    '50% Bifida Ferment', 'bifida', 'lactobacillus', 'Phylobioma', 'Neurosensine',
    'Oxybiome', 'Procerad', 'Pitera', 'Pitera™', 'Pitera™ (Galactomyces Ferment Filtrate)',
  ],
  'Betaine': ['Betane'],
};

// ============================================================
// MAIN
// ============================================================

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isSafeOnly = args.includes('--safe-only');
  const isConfirmed = args.includes('--confirm');

  console.log(`\n🧪 Ingredient Cleanup Script (GACOOR)`);
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : isConfirmed ? (isSafeOnly ? 'SAFE-ONLY' : 'FULL') : 'NEED --dry-run or --confirm'}\n`);

  if (!isDryRun && !isConfirmed) {
    console.log('❌ Usage:');
    console.log('   npm run cleanup:ingredients -- --dry-run');
    console.log('   npm run cleanup:ingredients -- --confirm --safe-only');
    console.log('   npm run cleanup:ingredients -- --confirm');
    return;
  }

  // FETCH
  const allIngredients = await prisma.ingredient.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  console.log(`📊 Total ingredient di DB: ${allIngredients.length}\n`);

  const ingredientMap = new Map(allIngredients.map((i) => [i.name, i]));

  // LAYER 1
  console.log('🗑️  LAYER 1 — Deteksi JUNK\n');
  const junkToDelete: Array<{ id: number; name: string; reason: string; productCount: number }> = [];
  for (const ing of allIngredients) {
    for (const pattern of JUNK_PATTERNS) {
      if (pattern.test(ing.name)) {
        junkToDelete.push({ id: ing.id, name: ing.name, reason: pattern.toString(), productCount: ing._count.products });
        break;
      }
    }
  }
  console.log(`   📊 Total junk: ${junkToDelete.length}`);
  for (const junk of junkToDelete.slice(0, 30)) {
    console.log(`   - "${junk.name}" (id: ${junk.id}, ${junk.productCount} produk)`);
  }
  if (junkToDelete.length > 30) console.log(`   ... dan ${junkToDelete.length - 30} lainnya`);

  // LAYER 2
  console.log('\n🔀 LAYER 2 — Merge Plan\n');
  const mergePlan: Array<{
    canonical: string;
    canonicalId: number;
    aliases: Array<{ name: string; id: number; count: number }>;
  }> = [];
  const processedIds = new Set<number>();

  for (const [canonicalName, aliasNames] of Object.entries(INGREDIENT_MAPPING)) {
    const canonical = ingredientMap.get(canonicalName);
    if (!canonical) {
      if (aliasNames.length > 0) {
        const firstAlias = ingredientMap.get(aliasNames[0]);
        if (firstAlias) {
          const aliases: Array<{ name: string; id: number; count: number }> = [];
          const seenIds = new Set<number>([firstAlias.id]);
          for (let i = 1; i < aliasNames.length; i++) {
            const a = ingredientMap.get(aliasNames[i]);
            if (!a || seenIds.has(a.id) || processedIds.has(a.id)) continue;
            seenIds.add(a.id);
            aliases.push({ name: aliasNames[i], id: a.id, count: a._count.products });
          }
          if (aliases.length > 0) {
            mergePlan.push({ canonical: aliasNames[0], canonicalId: firstAlias.id, aliases });
            aliases.forEach((a) => processedIds.add(a.id));
          }
        }
      }
      continue;
    }

    if (processedIds.has(canonical.id)) continue;

    const aliases: Array<{ name: string; id: number; count: number }> = [];
    const seenIds = new Set<number>([canonical.id]);

    for (const aliasName of aliasNames) {
      const alias = ingredientMap.get(aliasName);
      if (!alias) continue;
      if (seenIds.has(alias.id)) continue;
      if (processedIds.has(alias.id)) continue;
      seenIds.add(alias.id);
      aliases.push({ name: aliasName, id: alias.id, count: alias._count.products });
    }

    if (aliases.length > 0) {
      mergePlan.push({ canonical: canonicalName, canonicalId: canonical.id, aliases });
      aliases.forEach((a) => processedIds.add(a.id));
    }
  }

  const totalAliases = mergePlan.reduce((sum, item) => sum + item.aliases.length, 0);
  console.log(`   📊 Grup merge: ${mergePlan.length}`);
  console.log(`   📊 Total alias akan di-merge: ${totalAliases}\n`);
  for (const item of mergePlan) {
    console.log(`   → ${item.canonical} (id: ${item.canonicalId})`);
    for (const alias of item.aliases) {
      console.log(`      ← ${alias.name} (${alias.count} produk)`);
    }
  }

  // LAYER 3
  console.log('\n📋 LAYER 3 — Report\n');
  const unused = allIngredients.filter((i) => i._count.products === 0);
  const noFunction = allIngredients.filter((i) => !i.function);
  console.log(`   📊 Unused ingredient: ${unused.length}`);
  console.log(`   📊 Tanpa function: ${noFunction.length}\n`);

  // DRY RUN
  if (isDryRun) {
    console.log('✅ DRY RUN selesai. Tidak ada perubahan database.\n');
    console.log('   Untuk eksekusi:');
    console.log('   - Safe-only: npm run cleanup:ingredients -- --confirm --safe-only');
    console.log('   - Full:      npm run cleanup:ingredients -- --confirm\n');
    return;
  }

  // BACKUP
  const backupDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `ingredients-backup-${timestamp}.json`);
  console.log('📦 Backup database...');
  const productIngredients = await prisma.productIngredient.findMany();
  fs.writeFileSync(backupFile, JSON.stringify({ allIngredients, productIngredients, timestamp }, null, 2), 'utf-8');
  console.log(`   ✅ Backup: ${backupFile}\n`);

  // EXECUTE LAYER 1
  console.log('🚀 Eksekusi LAYER 1 (delete junk)...\n');
  let deletedCount = 0;
  for (const junk of junkToDelete) {
    try {
      await prisma.productIngredient.deleteMany({ where: { ingredientId: junk.id } });
      await prisma.ingredient.delete({ where: { id: junk.id } });
      deletedCount++;
    } catch (err) {
      console.log(`   ⚠️  Gagal hapus "${junk.name}": ${err}`);
    }
  }
  console.log(`   ✅ ${deletedCount} junk dihapus.\n`);

  if (isSafeOnly) {
    const afterCount = await prisma.ingredient.count();
    console.log('✅ SAFE-ONLY selesai. Layer 2 (merge) TIDAK dijalankan.\n');
    console.log(`📊 Sisa ingredient: ${afterCount}\n`);
    console.log(`💾 Backup: ${backupFile}\n`);
    return;
  }

  // EXECUTE LAYER 2 (TANPA TRANSACTION — LANGSUNG LOOP)
  console.log('🚀 Eksekusi LAYER 2 (merge aliases)...\n');
  let mergedCount = 0;
  let mergeFailed = 0;
  let mergeTotal = 0;
  for (const item of mergePlan) mergeTotal += item.aliases.length;

  for (const item of mergePlan) {
    for (const alias of item.aliases) {
      try {
        await prisma.productIngredient.updateMany({
          where: { ingredientId: alias.id },
          data: { ingredientId: item.canonicalId },
        });
        await prisma.ingredient.delete({ where: { id: alias.id } });
        mergedCount++;
        if (mergedCount % 10 === 0) {
          console.log(`   📊 Progress: ${mergedCount}/${mergeTotal}`);
        }
      } catch (err) {
        mergeFailed++;
        console.log(`   ⚠️  Gagal merge "${alias.name}": ${err}`);
      }
    }
  }
  console.log(`\n   ✅ Berhasil merge: ${mergedCount}`);
  if (mergeFailed > 0) console.log(`   ⚠️  Gagal merge: ${mergeFailed}`);

  // SUMMARY
  const finalCount = await prisma.ingredient.count();
  console.log('\n═══════════════════════════════════════════════');
  console.log(`📊 SUMMARY`);
  console.log(`   Sebelum: ${allIngredients.length}`);
  console.log(`   Junk dihapus: ${deletedCount}`);
  console.log(`   Alias di-merge: ${mergedCount}`);
  console.log(`   Setelah: ${finalCount}`);
  console.log('═══════════════════════════════════════════════\n');
  console.log(`💾 Backup: ${backupFile}\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());