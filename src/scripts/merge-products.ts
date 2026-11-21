import * as fs from 'fs';
import * as path from 'path';

const files = [
  'products-generated-1.csv',
  'products-generated-2.csv',
  'products-generated-3.csv',
  'products-generated-4.csv',
  'products-generated-5.csv'
];

async function main() {
  console.log('🔄 Mulai menggabungkan file CSV...');
  
  const mergedData: { id: string; name: string }[] = [];

  for (const file of files) {
    const filePath = path.join(process.cwd(), 'data', file);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File tidak ditemukan: ${filePath}`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() !== '');

    // Lewati baris header (index 0), proses mulai dari index 1
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Regex untuk menangkap ID (angka) dan Name (string di dalam tanda kutip pertama)
      // Contoh match: 1,"5X Ceramide Barrier Moisture Gel"
      const match = line.match(/^(\d+),\s*"([^"]*)"/);
      
      if (match) {
        mergedData.push({
          id: match[1],
          name: match[2]
        });
      }
    }
  }

  // Urutkan berdasarkan ID secara numerik untuk kerapian
  mergedData.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));

  // Format kembali ke CSV (hanya ID dan Name)
  const csvHeader = 'ID,Name\n';
  const csvRows = mergedData.map((item) => {
    // Escape tanda kutip ganda di dalam nama jika ada
    const safeName = item.name.replace(/"/g, '""');
    return `${item.id},"${safeName}"`;
  }).join('\n');
  
  const csvContent = csvHeader + csvRows;

  // Pastikan folder data ada
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const outputPath = path.join(dataDir, 'products-id-name-merged.csv');
  fs.writeFileSync(outputPath, csvContent, 'utf-8');

  console.log(`✅ Berhasil menggabungkan ${mergedData.length} produk.`);
  console.log(`💾 File hasil gabungan disimpan di: ${outputPath}`);
  console.log(`👉 Silakan buka file tersebut, copy isinya, dan kirim ke AI untuk diproses lebih lanjut.`);
}

main().catch((e) => {
  console.error('❌ Terjadi kesalahan:', e);
  process.exit(1);
});