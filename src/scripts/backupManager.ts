import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { BACKUP_DIR } from './config.js';

const prisma = new PrismaClient();

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function backupDatabase(): Promise<string> {
  ensureDir(BACKUP_DIR);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}.json`);

  console.log('💾 Membuat backup database...');

  const [products, brands, categories, ingredients, productIngredients] = await Promise.all([
    prisma.product.findMany(),
    prisma.brand.findMany(),
    prisma.category.findMany(),
    prisma.ingredient.findMany(),
    prisma.productIngredient.findMany(),
  ]);

  const backup = {
    timestamp: new Date().toISOString(),
    counts: {
      products: products.length,
      brands: brands.length,
      categories: categories.length,
      ingredients: ingredients.length,
      productIngredients: productIngredients.length,
    },
    data: { products, brands, categories, ingredients, productIngredients },
  };

  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf-8');
  console.log(`✅ Backup tersimpan: ${backupPath}`);
  return backupPath;
}

export function printMysqldumpInstruction() {
  console.log('\n📋 MANUAL BACKUP (mysqldump):');
  console.log('   Jalankan di Railway Console atau lokal:');
  console.log('   mysqldump -h <HOST> -u root -p<PASSWORD> <DATABASE> > backup-full.sql\n');
}