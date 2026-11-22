import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const CSV_PATH = path.resolve('data/products-export.csv');
const TABLE_NAME = 'products';
const ID_COLUMN = 'id';
const BUYLINK_COLUMN = 'buy_link';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL tidak ditemukan di .env');
  process.exit(1);
}

const rawCsv = fs.readFileSync(CSV_PATH, 'utf8');
const records = parse(rawCsv, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
});

const validUpdates = [];
let skippedEmpty = 0;

for (const row of records) {
  const rawId = row.ID ?? row.id;
  const buyLink = (row.BuyLink ?? row.buylink ?? '').trim();

  if (!buyLink) {
    skippedEmpty += 1;
    continue;
  }

  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    console.warn(`Lewati baris dengan ID tidak valid: ${rawId}`);
    continue;
  }

  validUpdates.push({ id, buyLink });
}

console.log(`Total baris CSV : ${records.length}`);
console.log(`Siap di-update  : ${validUpdates.length}`);
console.log(`Kosong (dilewati): ${skippedEmpty}`);

const connection = await mysql.createConnection({
  uri: databaseUrl,
  ssl: { rejectUnauthorized: true },
});

let updatedCount = 0;
let unmatchedIds = 0;

try {
  await connection.beginTransaction();

  const sql = `UPDATE \`${TABLE_NAME}\` SET \`${BUYLINK_COLUMN}\` = ? WHERE \`${ID_COLUMN}\` = ?`;

  for (const item of validUpdates) {
    const [result] = await connection.execute(sql, [item.buyLink, item.id]);
    if (result.affectedRows > 0) {
      updatedCount += result.affectedRows;
    } else {
      unmatchedIds += 1;
      console.warn(`ID tidak ditemukan di tabel ${TABLE_NAME}: ${item.id}`);
    }
  }

  await connection.commit();
  console.log(`Selesai. Berhasil mengupdate ${updatedCount} baris di TiDB.`);
  if (unmatchedIds > 0) {
    console.log(`Catatan: ${unmatchedIds} ID di CSV tidak ditemukan di tabel ${TABLE_NAME}.`);
  }
} catch (error) {
  await connection.rollback();
  console.error('Gagal melakukan update, transaksi di-rollback:', error);
  process.exitCode = 1;
} finally {
  await connection.end();
}