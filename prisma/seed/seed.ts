import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Mulai seeding database...');

  // ==================== BRANDS ====================
  const brandsData = [
    { name: 'Skintific', country: 'Indonesia', website: 'https://skintific.com' },
    { name: 'Wardah', country: 'Indonesia', website: 'https://wardahbeauty.com' },
    { name: 'Azarine', country: 'Indonesia', website: 'https://azarinecosmetic.com' },
    { name: 'Hanasui', country: 'Indonesia', website: 'https://hanasui.id' },
    { name: 'Glad2Glow', country: 'Indonesia', website: 'https://glad2glow.com' },
    { name: 'Whitelab', country: 'Indonesia', website: 'https://www.whitelab.co.id' },
{ name: 'Somethinc', country: 'Indonesia', website: 'https://somethinc.com' },
{ name: 'Avoskin', country: 'Indonesia', website: 'https://www.avoskinbeauty.com' },
  ];

  const brands = await Promise.all(
    brandsData.map((brand) =>
      prisma.brand.upsert({
        where: { name: brand.name },
        update: {},
        create: brand,
      })
    )
  );
  console.log(`✅ ${brands.length} brands di-seed`);

  // ==================== CATEGORIES ====================
  const categoriesData = [
    { name: 'Cleanser', description: 'Pembersih wajah' },
    { name: 'Toner', description: 'Mengembalikan pH kulit' },
    { name: 'Serum', description: 'Konsentrat aktif' },
    { name: 'Moisturizer', description: 'Pelembap' },
    { name: 'Sunscreen', description: 'Tabir surya' },
    { name: 'Mask', description: 'Masker wajah' },
    { name: 'Exfoliant', description: 'Eksfoliasi' },
    { name: 'Essence', description: 'Essence' },
    { name: 'Micellar Water', description: 'Pembersih micellar' },
  ];

  const categories = await Promise.all(
    categoriesData.map((cat) =>
      prisma.category.upsert({
        where: { name: cat.name },
        update: {},
        create: cat,
      })
    )
  );
  console.log(`✅ ${categories.length} categories di-seed`);

  // ==================== INGREDIENTS ====================
  const ingredientsData = [
    {
      name: 'Niacinamide',
      function: 'Memperkuat skin barrier, mencerahkan, mengontrol minyak',
      description: 'Vitamin B3 yang larut air.',
      suitableSkin: ['Oily', 'Combination', 'Acne-prone'],
      concerns: ['Dullness', 'Acne', 'Excess Oil'],
    },
    {
      name: 'Salicylic Acid',
      function: 'Eksfoliasi, anti-inflamasi untuk jerawat',
      description: 'Beta Hydroxy Acid (BHA).',
      suitableSkin: ['Oily', 'Acne-prone'],
      concerns: ['Acne', 'Blackheads'],
    },
    {
      name: 'Hyaluronic Acid',
      function: 'Menarik dan mengikat kelembapan',
      description: 'Molekul gula besar (polisakarida).',
      suitableSkin: ['All'],
      concerns: ['Dryness', 'Dehydration'],
    },
    {
      name: 'Ceramide',
      function: 'Memperkuat skin barrier',
      description: 'Lipid alami kulit.',
      suitableSkin: ['Dry', 'Sensitive', 'Normal'],
      concerns: ['Dryness', 'Sensitivity'],
    },
    {
      name: 'Centella Asiatica',
      function: 'Menenangkan kulit, anti-inflamasi',
      description: 'Ekstrak tanaman Cica.',
      suitableSkin: ['Sensitive', 'Acne-prone'],
      concerns: ['Redness', 'Irritation'],
    },
    {
      name: 'Panthenol',
      function: 'Melembapkan, menenangkan',
      description: 'Provitamin B5.',
      suitableSkin: ['All'],
      concerns: ['Dryness', 'Sensitivity'],
    },
    {
  name: 'Hyaluronic Acid',
  function: 'Menarik dan mengikat kelembapan',
  description: 'Molekul gula besar (polisakarida) yang alami di kulit.',
  suitableSkin: ['All'],
  concerns: ['Dryness', 'Dehydration'],
},
  ];

  const ingredients = await Promise.all(
    ingredientsData.map((ing) =>
      prisma.ingredient.upsert({
        where: { name: ing.name },
        update: {},
        create: ing,
      })
    )
  );
  console.log(`✅ ${ingredients.length} ingredients di-seed`);

  // ==================== PRODUCTS ====================
  const productsData = [
    {
      name: '5X Ceramide Barrier Moisture Gel',
      brandName: 'Skintific',
      categoryName: 'Moisturizer',
      description: 'Pelembap ringan dengan Ceramide untuk kulit normal hingga berminyak.',
      price: 112000,
      imageUrl: 'https://id.skintific.com/cdn/shop/files/5X_Ceramide_Barrier_Moisture_Gel.jpg',
      bpom: 'NA11220100489',
      ingredientNames: ['Ceramide', 'Hyaluronic Acid', 'Centella Asiatica'],
      skinTypes: ['Oily', 'Combination'],
      concerns: ['Excess Oil', 'Dryness'],
    },
    {
      name: 'Wardah Renew You Ceramide Matrixyl 3000',
      brandName: 'Wardah',
      categoryName: 'Moisturizer',
      description: 'Pelembab dengan Ceramide dan Matrixyl 3000 untuk elastisitas kulit.',
      price: 121000,
      imageUrl: 'https://d2jlkn4m127vak.cloudfront.net/medias/products/variant-1728453239.webp',
      bpom: 'NA18150100507',
      ingredientNames: ['Ceramide', 'Niacinamide'],
      skinTypes: ['All'],
      concerns: ['Anti-aging', 'Dullness'],
    },
    {
      name: 'Azarine Intense Luminous Barrier Moisturizer',
      brandName: 'Azarine',
      categoryName: 'Moisturizer',
      description: 'Pelembab untuk mencerahkan kulit kusam dan meredakan kemerahan.',
      price: 54000,
      imageUrl: 'https://images.soco.id/bc128bcc-1d84-4dca-9330-36f7eafad610-.jpg',
      bpom: 'NA18230100932',
      ingredientNames: ['Niacinamide', 'Hyaluronic Acid'],
      skinTypes: ['Normal', 'Dry', 'Combination'],
      concerns: ['Dullness', 'Redness'],
    },
    {
      name: 'Hanasui Ceramide Probiotics Hydrating Moisturizer Gel',
      brandName: 'Hanasui',
      categoryName: 'Moisturizer',
      description: 'Pelembab yang memperkuat skin barrier dan melembapkan.',
      price: 51000,
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzmv3nURzgouAlcnYj3BUaB1HYopY2IUzSHuIIbnJ-9A',
      bpom: 'NA18230106332',
      ingredientNames: ['Ceramide', 'Panthenol'],
      skinTypes: ['All'],
      concerns: ['Dryness', 'Sensitivity'],
    },
    {
      name: 'Glad2Glow Blueberry Ceramide Moisturizer',
      brandName: 'Glad2Glow',
      categoryName: 'Moisturizer',
      description: 'Moisturizer dengan ekstrak blueberry dan Ceramide untuk kulit sensitif.',
      price: 42000,
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNhU91Q_DANMx2ioWhIfdFnBOxGcXjgNfcXUCa1-Ri4Q',
      bpom: 'NA11220100364',
      ingredientNames: ['Ceramide', 'Hyaluronic Acid'],
      skinTypes: ['All'],
      concerns: ['Redness', 'Sensitivity'],
    },
    {
  name: 'Whitelab Cera-Mug Barrier Moisturizing Gel',
  brandName: 'Whitelab',
  categoryName: 'Moisturizer',
  description: 'Moisturizer gel ringan dengan Ceramide dan Mugwort untuk kulit sensitif.',
  price: 84000,
  imageUrl: 'https://www.whitelab.co.id/img/product/cera-mug.jpg',
  bpom: 'NA18210109052',
  ingredientNames: ['Ceramide', 'Centella Asiatica', 'Hyaluronic Acid'],
  skinTypes: ['All', 'Sensitive'],
  concerns: ['Dryness', 'Redness'],
},
{
  name: 'Somethinc Calm Down Skinpair Barrier Serum',
  brandName: 'Somethinc',
  categoryName: 'Serum',
  description: 'Serum penenang kulit sensitif dengan Centella dan Peptide.',
  price: 124000,
  imageUrl: 'https://images.somethinc.com/uploads/products/calm-down-serum.jpg',
  bpom: 'NA18230102015',
  ingredientNames: ['Centella Asiatica', 'Panthenol'],
  skinTypes: ['Sensitive', 'All'],
  concerns: ['Redness', 'Irritation'],
},
{
  name: 'Avoskin Your Skin Bae Niacinamide Serum',
  brandName: 'Avoskin',
  categoryName: 'Serum',
  description: 'Serum pencerah dengan Niacinamide 12% untuk menyamarkan noda.',
  price: 113500,
  imageUrl: 'https://avoskin-2023.s3.ap-southeast-3.amazonaws.com/product-image/niacinamide.jpg',
  bpom: 'NA18212000457',
  ingredientNames: ['Niacinamide', 'Centella Asiatica'],
  skinTypes: ['All', 'Combination'],
  concerns: ['Dullness', 'Dark spots'],
},
{
  name: 'Azarine Hydrasoothe Sunscreen Gel SPF 45',
  brandName: 'Azarine',
  categoryName: 'Sunscreen',
  description: 'Tabir surya gel yang melembapkan dan menenangkan.',
  price: 49000,
  imageUrl: 'https://medias.watsons.co.id/publishing/WTCID-43670-front-zoom.jpg',
  bpom: 'NA18211700231',
  ingredientNames: ['Hyaluronic Acid', 'Centella Asiatica'],
  skinTypes: ['All', 'Oily'],
  concerns: ['Sun protection', 'Dryness'],
},
{
  name: 'Hanasui Power Serum Barrier Serum',
  brandName: 'Hanasui',
  categoryName: 'Serum',
  description: 'Serum dengan Hyaluron 11 Complex dan Ceramide untuk hidrasi maksimal.',
  price: 58000,
  imageUrl: 'https://down-id.img.susercontent.com/file/hanasui-barrier.jpg',
  bpom: 'NA18220104002',
  ingredientNames: ['Hyaluronic Acid', 'Ceramide', 'Niacinamide'],
  skinTypes: ['All', 'Dry'],
  concerns: ['Dryness', 'Sensitivity'],
},
  ];

  for (const p of productsData) {
    const brand = brands.find((b) => b.name === p.brandName);
    const category = categories.find((c) => c.name === p.categoryName);
    if (!brand || !category) continue;

    const product = await prisma.product.create({
      data: {
        name: p.name,
        brandId: brand.id,
        categoryId: category.id,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl,
        bpom: p.bpom,
        skinTypes: p.skinTypes,
        concerns: p.concerns,
        ingredients: {
          create: p.ingredientNames
            .map((ingName) => {
              const ing = ingredients.find((i) => i.name === ingName);
              return ing ? { ingredientId: ing.id } : null;
            })
            .filter((x): x is { ingredientId: number } => x !== null),
        },
      },
    });
    console.log(`   ➕ Produk: ${product.name}`);
  }
  console.log(`✅ ${productsData.length} produk di-seed`);

  console.log('🎉 Seeding selesai!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });